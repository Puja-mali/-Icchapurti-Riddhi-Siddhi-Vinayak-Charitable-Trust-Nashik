import { api } from './api';

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

export interface DonationAllocationRequest {
  amount: number;
  preferredCauseId?: string;
  impactPreference?: string;
  includePassportHistory?: boolean;
}

export class AiService {
  /**
   * Generates a grounded donation allocation recommendation
   * using verified active trust campaigns from MongoDB.
   */
  public static async getDonationAllocation(
    request: DonationAllocationRequest
  ): Promise<DonationAllocationResponse> {
    return api.post<DonationAllocationResponse>('/ai/donation-allocation', request);
  }
}
