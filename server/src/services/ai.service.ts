import mongoose from 'mongoose';
import { GoogleGenAI } from '@google/genai';
import { Cause, ICause } from '../models/Cause';
import { Donation, IDonation } from '../models/Donation';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { DonationAllocationInput } from '../validators/ai.validator';
import { AppError } from '../utils/apiResponse';

export interface CauseAllocationItem {
  causeId: string;
  causeTitle: string;
  category: string;
  allocatedAmount: number;
  percentage: number;
  urgent: boolean;
  rationale: string;
  verifiedAllocationBreakdown: Array<{ category: string; percentage: number }>;
}

export interface DonationAllocationResponse {
  isAiGenerated: boolean;
  provider: 'gemini-3.8-flash' | 'algorithmic-grounded';
  verifiedDataAvailable: boolean;
  proposedAmount: number;
  summaryRationale: string;
  allocations: CauseAllocationItem[];
  impactExplanation: string;
  donorHistoryContext?: {
    verifiedDonationsCount: number;
    verifiedTotalContributed: number;
    previouslySupportedCauses: string[];
    hasExistingPassport: boolean;
  };
  verifiedFoundationSummary: {
    activeCausesCount: number;
    databaseConnected: boolean;
  };
  disclaimer: string;
}

let geminiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY || env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({ apiKey: apiKey.trim() });
  }
  return geminiClient;
}

export class AiService {
  /**
   * Generates a grounded allocation recommendation using strictly verified MongoDB data
   * and the Gemini 3.8 Flash model (with algorithmic fallback if AI credentials are unset).
   */
  public static async generateDonationAllocation(
    input: DonationAllocationInput,
    authenticatedUserId: string
  ): Promise<DonationAllocationResponse> {
    const isDbConnected = mongoose.connection.readyState === 1;

    // 1. Check database connectivity
    if (!isDbConnected) {
      return {
        isAiGenerated: false,
        provider: 'algorithmic-grounded',
        verifiedDataAvailable: false,
        proposedAmount: input.amount,
        summaryRationale:
          'Verified trust registry is temporarily unavailable. Allocation recommendations require live database verification to guarantee authenticity.',
        allocations: [],
        impactExplanation:
          'Impact projections cannot be calculated without verified active campaign data from the trust ledger.',
        verifiedFoundationSummary: {
          activeCausesCount: 0,
          databaseConnected: false,
        },
        disclaimer:
          'No recommendations can be generated from unverified sources. Please ensure database connectivity is established.',
      };
    }

    // 2. Query verified active causes strictly from MongoDB
    const activeCauses: ICause[] = await Cause.find({ status: 'ACTIVE' })
      .select('title slug category targetAmount raisedAmount urgent allocationBreakdown impactMilestones location shortDescription')
      .lean();

    if (!activeCauses || activeCauses.length === 0) {
      return {
        isAiGenerated: false,
        provider: 'algorithmic-grounded',
        verifiedDataAvailable: false,
        proposedAmount: input.amount,
        summaryRationale:
          'No verified active campaigns currently open for public allocation in the trust registry.',
        allocations: [],
        impactExplanation:
          'All current trust drives are either fully funded or undergoing audit. Please check back when new drives are launched.',
        verifiedFoundationSummary: {
          activeCausesCount: 0,
          databaseConnected: true,
        },
        disclaimer:
          'Verified data unavailable: The trust currently has 0 active campaigns registered.',
      };
    }

    // 3. Query authenticated donor's verified donation and Impact Passport history
    let donorHistoryContext: DonationAllocationResponse['donorHistoryContext'];
    if (input.includePassportHistory !== false && authenticatedUserId) {
      try {
        const verifiedDonations = await Donation.find({
          donorId: new mongoose.Types.ObjectId(authenticatedUserId),
          $or: [{ status: { $in: ['PAID', 'SUCCESS'] } }, { paymentStatus: { $in: ['PAID', 'SUCCESS'] } }],
        })
          .populate('causeId', 'title category')
          .lean();

        const totalContributed = verifiedDonations.reduce((sum, d) => sum + (d.amount || 0), 0);
        const previouslySupportedCauses = Array.from(
          new Set(
            verifiedDonations
              .map((d: any) => d.causeId?.title || d.purpose)
              .filter((title: string | undefined): title is string => Boolean(title && title.trim()))
          )
        );

        donorHistoryContext = {
          verifiedDonationsCount: verifiedDonations.length,
          verifiedTotalContributed: totalContributed,
          previouslySupportedCauses,
          hasExistingPassport: verifiedDonations.length > 0,
        };
      } catch (err) {
        logger.warn('Failed to load donor history for AI allocation context:', err);
      }
    }

    // 4. Try Gemini 3.8 Flash model if configured
    const ai = getGeminiClient();
    if (ai) {
      try {
        const aiResult = await this.callGeminiAllocation(
          ai,
          input,
          activeCauses,
          donorHistoryContext
        );
        if (aiResult) {
          return aiResult;
        }
      } catch (err: any) {
        logger.error('Gemini allocation assistant encountered error, falling back to algorithmic model:', err?.message || err);
      }
    }

    // 5. Fallback: Authoritative rule-based allocation using verified MongoDB records
    return this.generateAlgorithmicAllocation(input, activeCauses, donorHistoryContext);
  }

  /**
   * Calls Gemini 3.8 Flash with strictly grounded verified data
   */
  private static async callGeminiAllocation(
    ai: GoogleGenAI,
    input: DonationAllocationInput,
    activeCauses: ICause[],
    donorHistory?: DonationAllocationResponse['donorHistoryContext']
  ): Promise<DonationAllocationResponse | null> {
    // Sanitize verified causes for prompt injection defense
    const causesContext = activeCauses.map((c) => ({
      id: c._id.toString(),
      title: c.title,
      category: c.category,
      targetAmount: c.targetAmount,
      raisedAmount: c.raisedAmount,
      deficit: Math.max(0, c.targetAmount - c.raisedAmount),
      percentFunded: c.targetAmount > 0 ? Math.round((c.raisedAmount / c.targetAmount) * 100) : 0,
      urgent: Boolean(c.urgent),
      shortDescription: c.shortDescription,
      officialBreakdown: (c.allocationBreakdown || []).map((b) => `${b.category}: ${b.percentage}%`),
      milestones: (c.impactMilestones || []).map((m) => `${m.title} (${m.status})`),
    }));

    // Find if donor specified a preferred cause
    const preferredCause = input.preferredCauseId
      ? activeCauses.find((c) => c._id.toString() === input.preferredCauseId)
      : null;

    const systemInstruction = `
You are the official Donation Allocation & Impact Planning Assistant for Shree Siddhivinayak Charitable Trust.
Your sole mission is to recommend how a donor's proposed gift can be distributed across verified trust campaigns.

STRICT INTEGRITY & ANTI-HALLUCINATION RULES:
1. You must ONLY recommend campaigns that are present in the VERIFIED ACTIVE CAUSES list provided below.
2. NEVER invent, hallucinate, or reference any beneficiaries, people names, numbers, campaigns, projects, financial balances, or Kumbh activities that are not in the verified data.
3. If the donor asks for a cause or purpose not in the list, clearly state that the specific cause is not currently active in trust records, and recommend from the available active campaigns.
4. The sum of all allocated amounts must EXACTLY equal the proposed donation amount of ₹${input.amount}.
5. Do NOT make up past history or personal details.
6. The output must be valid JSON conforming strictly to the requested schema.
`;

    const userPrompt = `
PROPOSED DONATION AMOUNT: ₹${input.amount}
PREFERRED CAUSE: ${preferredCause ? preferredCause.title : 'None specified (distribute based on urgency and impact)'}
IMPACT PREFERENCE: ${input.impactPreference || 'General corpus / maximum direct community benefit'}

DONOR VERIFIED HISTORY (From MongoDB Ledger):
- Verified Past Contributions: ${donorHistory?.verifiedDonationsCount ?? 0}
- Verified Total Given: ₹${donorHistory?.verifiedTotalContributed ?? 0}
- Previously Supported Drives: ${donorHistory?.previouslySupportedCauses.join(', ') || 'First-time contributor'}

VERIFIED ACTIVE CAUSES (Available for Allocation):
${JSON.stringify(causesContext, null, 2)}

Respond with a JSON object with this exact structure:
{
  "summaryRationale": "Clear 2-3 sentence explanation of the allocation strategy based strictly on active campaign funding needs and donor preference.",
  "allocations": [
    {
      "causeId": "exact MongoDB ID from verified list",
      "percentage": number (integer or 1 decimal place, must sum to 100),
      "rationale": "Direct rationale referencing urgency, deficit, or preference"
    }
  ],
  "impactExplanation": "Factual explanation of the specific verified milestones or programs supported.",
  "pastImpactReflection": "Brief respectful sentence connecting this gift to donor's past record or welcoming them."
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        { role: 'user', parts: [{ text: userPrompt }] },
      ],
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        temperature: 0.2, // Low temperature for high factual accuracy
      },
    });

    const text = response.text;
    if (!text) return null;

    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      logger.warn('Failed to parse Gemini JSON output:', text);
      return null;
    }

    if (!parsed || !Array.isArray(parsed.allocations) || parsed.allocations.length === 0) {
      return null;
    }

    // Validate and ground each allocation against real active causes
    const validatedAllocations: CauseAllocationItem[] = [];
    let allocatedTotal = 0;

    for (let i = 0; i < parsed.allocations.length; i++) {
      const item = parsed.allocations[i];
      const matchingCause = activeCauses.find(
        (c) => c._id.toString() === item.causeId || c.title.toLowerCase() === (item.causeTitle || '').toLowerCase()
      );

      if (!matchingCause) continue;

      const percentage = Math.max(1, Math.min(100, Number(item.percentage) || 0));
      // For the last item, balance exact rounding to match input.amount
      let itemAmount: number;
      if (i === parsed.allocations.length - 1) {
        itemAmount = Math.max(1, input.amount - allocatedTotal);
      } else {
        itemAmount = Math.round((input.amount * percentage) / 100);
        allocatedTotal += itemAmount;
      }

      validatedAllocations.push({
        causeId: matchingCause._id.toString(),
        causeTitle: matchingCause.title,
        category: matchingCause.category,
        allocatedAmount: itemAmount,
        percentage,
        urgent: Boolean(matchingCause.urgent),
        rationale: item.rationale || `Supports ${matchingCause.title} in the ${matchingCause.category} category.`,
        verifiedAllocationBreakdown: (matchingCause.allocationBreakdown || []).map((b) => ({
          category: b.category,
          percentage: b.percentage,
        })),
      });
    }

    if (validatedAllocations.length === 0) {
      return null;
    }

    // Normalize percentages to sum to 100
    const totalPct = validatedAllocations.reduce((sum, a) => sum + a.percentage, 0);
    if (totalPct !== 100 && totalPct > 0) {
      validatedAllocations.forEach((a) => {
        a.percentage = Math.round((a.allocatedAmount / input.amount) * 100);
      });
    }

    return {
      isAiGenerated: true,
      provider: 'gemini-3.8-flash',
      verifiedDataAvailable: true,
      proposedAmount: input.amount,
      summaryRationale: parsed.summaryRationale || 'Allocation recommended based on verified campaign requirements.',
      allocations: validatedAllocations,
      impactExplanation:
        parsed.impactExplanation ||
        'Your contribution directly advances the statutory programs and impact milestones tracked in the verified trust ledger.',
      donorHistoryContext: donorHistory,
      verifiedFoundationSummary: {
        activeCausesCount: activeCauses.length,
        databaseConnected: true,
      },
      disclaimer:
        'AI-Generated Recommendation: This allocation plan is generated by the Gemini assistant for planning purposes based on verified active trust campaigns. It does not commit funds or modify ledger records until you complete a verified contribution.',
    };
  }

  /**
   * Deterministic, grounded allocation algorithm when AI key is unset or as fallback
   */
  private static generateAlgorithmicAllocation(
    input: DonationAllocationInput,
    activeCauses: ICause[],
    donorHistory?: DonationAllocationResponse['donorHistoryContext']
  ): DonationAllocationResponse {
    const preferredCause = input.preferredCauseId
      ? activeCauses.find((c) => c._id.toString() === input.preferredCauseId)
      : null;

    // Filter causes matching impact preference if supplied
    let primaryPool = activeCauses;
    if (input.impactPreference && input.impactPreference.trim().length > 0) {
      const prefLower = input.impactPreference.toLowerCase();
      const matched = activeCauses.filter(
        (c) =>
          c.title.toLowerCase().includes(prefLower) ||
          c.category.toLowerCase().includes(prefLower) ||
          c.shortDescription.toLowerCase().includes(prefLower)
      );
      if (matched.length > 0) {
        primaryPool = matched;
      }
    }

    // Sort pool: urgent first, then highest funding deficit
    const sorted = [...primaryPool].sort((a, b) => {
      if (a.urgent && !b.urgent) return -1;
      if (!a.urgent && b.urgent) return 1;
      const deficitA = Math.max(0, a.targetAmount - a.raisedAmount);
      const deficitB = Math.max(0, b.targetAmount - b.raisedAmount);
      return deficitB - deficitA;
    });

    const selectedCauses = sorted.slice(0, 3);
    const allocations: CauseAllocationItem[] = [];

    if (preferredCause) {
      // Preferred cause gets 60%, remaining distributed among top 2 other causes
      const otherCauses = selectedCauses.filter((c) => c._id.toString() !== preferredCause._id.toString());
      const prefAmount = otherCauses.length > 0 ? Math.round(input.amount * 0.6) : input.amount;
      const prefPct = otherCauses.length > 0 ? 60 : 100;

      allocations.push({
        causeId: preferredCause._id.toString(),
        causeTitle: preferredCause.title,
        category: preferredCause.category,
        allocatedAmount: prefAmount,
        percentage: prefPct,
        urgent: Boolean(preferredCause.urgent),
        rationale: `Selected as your primary giving preference (${preferredCause.category}).`,
        verifiedAllocationBreakdown: (preferredCause.allocationBreakdown || []).map((b) => ({
          category: b.category,
          percentage: b.percentage,
        })),
      });

      if (otherCauses.length > 0) {
        const remAmount = input.amount - prefAmount;
        const eachPct = Math.round(40 / otherCauses.length);
        let distributed = 0;

        otherCauses.forEach((cause, idx) => {
          const isLast = idx === otherCauses.length - 1;
          const itemAmt = isLast ? remAmount - distributed : Math.round(remAmount / otherCauses.length);
          distributed += itemAmt;

          allocations.push({
            causeId: cause._id.toString(),
            causeTitle: cause.title,
            category: cause.category,
            allocatedAmount: itemAmt,
            percentage: isLast ? 100 - prefPct - (eachPct * (otherCauses.length - 1)) : eachPct,
            urgent: Boolean(cause.urgent),
            rationale: cause.urgent
              ? `High-priority allocation to meet urgent funding targets in ${cause.category}.`
              : `Balancing trust impact across active drives in ${cause.category}.`,
            verifiedAllocationBreakdown: (cause.allocationBreakdown || []).map((b) => ({
              category: b.category,
              percentage: b.percentage,
            })),
          });
        });
      }
    } else {
      // Distribute evenly/proportionally across top selected causes
      const count = Math.min(3, selectedCauses.length);
      const chosen = selectedCauses.slice(0, count);
      let distributed = 0;

      chosen.forEach((cause, idx) => {
        const isLast = idx === count - 1;
        const pct = count === 1 ? 100 : count === 2 ? (idx === 0 ? 60 : 40) : (idx === 0 ? 50 : idx === 1 ? 30 : 20);
        const itemAmt = isLast ? input.amount - distributed : Math.round((input.amount * pct) / 100);
        distributed += itemAmt;

        allocations.push({
          causeId: cause._id.toString(),
          causeTitle: cause.title,
          category: cause.category,
          allocatedAmount: itemAmt,
          percentage: pct,
          urgent: Boolean(cause.urgent),
          rationale: cause.urgent
            ? `Immediate allocation to support active urgent drive: ${cause.title}.`
            : `Fulfills community objectives in ${cause.category} with active verification milestones.`,
          verifiedAllocationBreakdown: (cause.allocationBreakdown || []).map((b) => ({
            category: b.category,
            percentage: b.percentage,
          })),
        });
      });
    }

    const summaryRationale = preferredCause
      ? `Allocated 60% of your ₹${input.amount.toLocaleString('en-IN')} contribution to your preferred drive (${preferredCause.title}), with remaining funds directed toward urgent verified community needs.`
      : `Distributed your ₹${input.amount.toLocaleString('en-IN')} contribution across ${allocations.length} verified active trust campaigns, prioritizing urgent initiatives and verified community impact.`;

    const impactExplanation =
      'Allocations map directly to statutory cause categories and established field milestones recorded in the trust registry.';

    return {
      isAiGenerated: false,
      provider: 'algorithmic-grounded',
      verifiedDataAvailable: true,
      proposedAmount: input.amount,
      summaryRationale,
      allocations,
      impactExplanation,
      donorHistoryContext: donorHistory,
      verifiedFoundationSummary: {
        activeCausesCount: activeCauses.length,
        databaseConnected: true,
      },
      disclaimer:
        'Allocation Strategy: This distribution is calculated using verified active campaign records in the trust registry. It serves as an advisory plan and does not constitute a financial transaction.',
    };
  }
}
