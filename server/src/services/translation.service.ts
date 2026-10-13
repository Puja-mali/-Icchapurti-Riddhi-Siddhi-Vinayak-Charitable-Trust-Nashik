import { env } from '../config/env';
import { logger } from '../utils/logger';
import { AppError } from '../utils/apiResponse';

export interface TranslateRequest {
  text: string;
  sourceLang?: string;
  targetLang: 'mr' | 'hi' | 'en';
  context?: string;
}

export interface TranslateResult {
  translatedText: string;
  provider: 'google_cloud' | 'gemini' | 'manual';
  isConfigured: boolean;
  message?: string;
}

export class TranslationService {
  /**
   * Character limit per translation request to guard against cost spikes and DoS
   */
  public static readonly MAX_CHAR_LIMIT = 5000;

  /**
   * Check if any automated translation backend is configured
   */
  public static isConfigured(): boolean {
    return Boolean(process.env.GOOGLE_TRANSLATE_API_KEY || env.GEMINI_API_KEY);
  }

  /**
   * Translates text into target language (Marathi 'mr', Hindi 'hi', or English 'en')
   * Strictly server-side; enforces timeout, input validation, and cost safety.
   */
  public static async translateDraft(req: TranslateRequest): Promise<TranslateResult> {
    const text = (req.text || '').trim();
    if (!text) {
      throw new AppError('Text to translate cannot be empty.', 400);
    }

    if (text.length > this.MAX_CHAR_LIMIT) {
      throw new AppError(
        `Text exceeds the maximum translation length of ${this.MAX_CHAR_LIMIT} characters. Please translate in smaller sections.`,
        400
      );
    }

    const targetLang = req.targetLang;
    if (!['mr', 'hi', 'en'].includes(targetLang)) {
      throw new AppError('Target language must be one of: mr (Marathi), hi (Hindi), en (English).', 400);
    }

    const sourceLang = req.sourceLang || 'en';
    if (sourceLang === targetLang) {
      return {
        translatedText: text,
        provider: 'manual',
        isConfigured: true,
      };
    }

    // 1. Google Cloud Translation API (Preferred Dedicated Service)
    const googleApiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
    if (googleApiKey) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000); // 8-second fail-safe timeout

        const response = await fetch(
          `https://translation.googleapis.com/language/translate/v2?key=${encodeURIComponent(googleApiKey)}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              q: text,
              source: sourceLang,
              target: targetLang,
              format: 'text',
            }),
            signal: controller.signal,
          }
        );

        clearTimeout(timeout);

        if (response.ok) {
          const data = (await response.json()) as any;
          const translated = data?.data?.translations?.[0]?.translatedText;
          if (translated) {
            return {
              translatedText: translated,
              provider: 'google_cloud',
              isConfigured: true,
            };
          }
        } else {
          const errData = await response.text();
          logger.warn(`[TranslationService] Google Cloud Translation API error: ${response.status} - ${errData}`);
        }
      } catch (err: any) {
        logger.warn(`[TranslationService] Google Cloud Translation request failed: ${err.message}`);
      }
    }

    // 2. Gemini Fallback (if Gemini SDK / GEMINI_API_KEY is provisioned)
    if (env.GEMINI_API_KEY) {
      try {
        const { GoogleGenAI } = await import('@google/genai');
        const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

        const langName = targetLang === 'mr' ? 'Marathi (मराठी)' : targetLang === 'hi' ? 'Hindi (हिन्दी)' : 'English';
        const prompt = `Translate the following community trust announcement or seva description from ${sourceLang} into natural, culturally accurate ${langName}.
CRITICAL RULES:
- Preserve all proper names, amounts, dates, and numbers exactly.
- Official Marathi Trust Name must be translated as: इच्छापूर्ती रिद्धी सिद्धी विनायक चॅरिटेबल ट्रस्ट, नाशिक (using रिद्धी).
- Do not add explanations, conversational comments, or Markdown formatting. Return ONLY the translation.

Text to translate:
"""
${text}
"""`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });

        const translated = response.text?.trim();
        if (translated) {
          return {
            translatedText: translated,
            provider: 'gemini',
            isConfigured: true,
          };
        }
      } catch (err: any) {
        logger.warn(`[TranslationService] Gemini translation fallback failed: ${err.message}`);
      }
    }

    // 3. Fallback when neither automated provider is provisioned
    return {
      translatedText: '',
      provider: 'manual',
      isConfigured: false,
      message:
        'No automated translation provider configured (GOOGLE_TRANSLATE_API_KEY or GEMINI_API_KEY). Please enter official translations manually.',
    };
  }
}
