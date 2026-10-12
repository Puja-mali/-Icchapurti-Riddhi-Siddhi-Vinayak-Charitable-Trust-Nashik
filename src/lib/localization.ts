import { SupportedLanguage } from "@/src/i18n/translations";
import { Cause, CauseCategory, EventItem, BlogPost } from "@/src/types";

/**
 * Returns a localized copy of a Cause based on selected language.
 * Preserves financial targets, counts, IDs, URLs, and status intact.
 * Falls back safely to original text if translation is pending/unavailable.
 */
export function getLocalizedCause(cause: Cause, language: SupportedLanguage): Cause {
  if (!cause) return cause;

  if (language === "mr" && cause.translations?.mr) {
    const mr = cause.translations.mr;
    return {
      ...cause,
      title: mr.title?.trim() || cause.title,
      tagline: mr.shortDescription?.trim() || mr.tagline?.trim() || cause.tagline,
      shortDescription: mr.shortDescription?.trim() || cause.shortDescription,
      description: mr.description?.trim() || cause.description,
    };
  }

  if (language === "hi" && cause.translations?.hi) {
    const hi = cause.translations.hi;
    return {
      ...cause,
      title: hi.title?.trim() || cause.title,
      tagline: hi.shortDescription?.trim() || hi.tagline?.trim() || cause.tagline,
      shortDescription: hi.shortDescription?.trim() || cause.shortDescription,
      description: hi.description?.trim() || cause.description,
    };
  }

  return cause;
}

/**
 * Translates cause category names across English, Marathi, and Hindi.
 */
export function getLocalizedCategory(
  category: CauseCategory | "All" | string,
  language: SupportedLanguage
): string {
  if (language === "mr") {
    switch (category) {
      case "All":
        return "सर्व उपक्रम";
      case "Education":
        return "शिक्षण सहाय्य";
      case "Medical Support":
        return "वैद्यकीय मदत";
      case "Food & Nutrition":
        return "अन्नदान व पोषण";
      case "Emergency Relief":
        return "आपत्ती निवारण";
      case "Environment":
        return "पर्यावरण व जलसंधारण";
      default:
        return category;
    }
  }

  if (language === "hi") {
    switch (category) {
      case "All":
        return "सभी सेवा प्रकल्प";
      case "Education":
        return "शिक्षा सहायता";
      case "Medical Support":
        return "चिकित्सा सहायता";
      case "Food & Nutrition":
        return "अन्नदान एवं पोषण";
      case "Emergency Relief":
        return "आपदा राहत";
      case "Environment":
        return "पर्यावरण एवं जल संरक्षण";
      default:
        return category;
    }
  }

  return category;
}

/**
 * Localizes Event title and description while keeping dates, IDs, and attendance intact.
 */
export function getLocalizedEvent(event: EventItem, language: SupportedLanguage): EventItem {
  if (!event) return event;

  if (language === "mr" && event.translations?.mr) {
    const mr = event.translations.mr;
    return {
      ...event,
      title: mr.title?.trim() || event.title,
      shortDescription: mr.shortDescription?.trim() || event.shortDescription,
      description: mr.description?.trim() || event.description,
    };
  }

  if (language === "hi" && event.translations?.hi) {
    const hi = event.translations.hi;
    return {
      ...event,
      title: hi.title?.trim() || event.title,
      shortDescription: hi.shortDescription?.trim() || event.shortDescription,
      description: hi.description?.trim() || event.description,
    };
  }

  return event;
}

/**
 * Localizes BlogPost while keeping author, dates, and images intact.
 */
export function getLocalizedBlogPost(blog: BlogPost, language: SupportedLanguage): BlogPost {
  if (!blog) return blog;

  if (language === "mr" && blog.translations?.mr) {
    const mr = blog.translations.mr;
    return {
      ...blog,
      title: mr.title?.trim() || blog.title,
      excerpt: mr.shortDescription?.trim() || blog.excerpt,
      content: mr.description?.trim() || blog.content,
    };
  }

  if (language === "hi" && blog.translations?.hi) {
    const hi = blog.translations.hi;
    return {
      ...blog,
      title: hi.title?.trim() || blog.title,
      excerpt: hi.shortDescription?.trim() || blog.excerpt,
      content: hi.description?.trim() || blog.content,
    };
  }

  return blog;
}
