/**
 * ============================================================================
 * TRUST BRAND & LOGO CONFIGURATION
 * Icchapurti Riddhi Siddhi Vinayak Charitable Trust, Nashik
 * ============================================================================
 *
 * HOW TO UPDATE THE TRUST LOGO:
 * ----------------------------------------------------------------------------
 * This file is the SINGLE CENTRAL LOCATION to configure the Trust logo across
 * the entire website (Navbar, Mobile Drawer, Footer, Receipts, Loading Screens,
 * and Emblems).
 *
 * >>> PASTE YOUR LOGO URL OR PATH ON LINE 26 BELOW <<<
 *
 * OPTION 1: Hosted Image URL (Recommended for cloud storage / external links)
 *   Set TRUST_LOGO_PATH to your full HTTPS image URL:
 *   Example:
 *     export const TRUST_LOGO_PATH = "https://example.com/assets/trust-logo.png";
 *
 * OPTION 2: Local Static Image File
 *   1. Save your official logo file inside the project's "public/" folder:
 *      (e.g., save as `public/trust-logo.png` or `public/trust-logo.jpg`)
 *   2. Set TRUST_LOGO_PATH to the local path starting with a slash:
 *      Example:
 *     export const TRUST_LOGO_PATH = "/trust-logo.png";
 * ============================================================================
 */

// Line 26: Set your official logo URL or local path here:
export const TRUST_LOGO_PATH: string = "\image.png";

/**
 * Fallback image path used if the primary logo fails to load or is unconfigured.
 */
export const TRUST_LOGO_FALLBACK: string = "\image.png";

/**
 * Canonical brand metadata and verified statutory trust parameters.
 */
export const TRUST_BRAND = {
  // Official registered Trust Name & Registration Number
  name: "Icchapurti Riddhi Siddhi Vinayak Charitable Trust, Nashik",
  marathiName: "इच्छापूर्ती रिद्धी सिद्धी विनायक चॅरिटेबल ट्रस्ट, नाशिक",
  shortName: "Icchapurti Vinayak Trust",
  registrationNumber: "E/1341",
  altText: "श्री इच्छापूर्ती रिद्धी सिद्धी विनायक",

  // Neutral copyright ownership notice.
  // Note: Copyright registration application is submitted / pending confirmation.
  // We do NOT claim "Copyright Registered" or "Copyright Approved" until officially verified.
  copyrightNotice: `© ${new Date().getFullYear()} Icchapurti Riddhi Siddhi Vinayak Charitable Trust. All rights reserved.`,

  // Honest placeholder for unverified details (e.g. postal address, office hours)
  unverifiedContactPlaceholder: "Official contact details will be updated soon.",
  unverifiedAddressPlaceholder: "Official address will be updated soon.",

  // Contact details:
  contact: {
    email: "ichhapurtiriddhisiddhivinayak@gmail.com",
    phones: ["9922271777", "7588833127"],
    phoneDisplay: "9922271777 / 7588833127",
    whatsapp: "", // Pending confirmation whether these numbers have active WhatsApp accounts
    address: "", // Pending confirmation of full postal address
    officeHours: "", // Pending confirmation of official public desk timings
    website: "", // Pending confirmation of official website URL
    establishedYear: "", // Pending confirmation of establishment date
  },
} as const;
