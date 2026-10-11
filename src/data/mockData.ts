import {
  Cause,
  ImpactPassportRecord,
  EventItem,
  UserDonation,
  GalleryItem,
} from "../types";

export const TRUST_INFO = {
  name: "Icchapurti Riddhi Siddhi Vinayak Charitable Trust, Nashik",
  marathiName: "इच्छापूर्ती ऋद्धी सिद्धी विनायक चॅरिटेबल ट्रस्ट",
  shortName: "Icchapurti Vinayak Trust",
  subtitle: "Reg. No. E-9389 / Nashik • Dedicated to Grassroots Social Welfare",
  registrationNumber: "E-9389 / Nashik",
  establishedYear: "2019",
  email: "contact@siddhivinayaktrust.org",
  phone: "0253 6029200 / 0253 6018200",
  address: "7, Pokar Avenue, Nandanvan Garden Apartment, Nashik, Maharashtra, India, PIN 422004",
  officeHours: "Mon - Sat: 9:30 AM - 5:30 PM IST",
};

/**
 * Data Integrity:
 * Clean empty lists ensure the application renders honest empty states when no genuine campaigns
 * or records have been entered yet by Trust administrators. No fabricated public data.
 */
export const MOCK_CAUSES: Cause[] = [];
export const MOCK_IMPACT_PASSPORTS: ImpactPassportRecord[] = [];
export const MOCK_EVENTS: EventItem[] = [];
export const MOCK_USER_DONATIONS: UserDonation[] = [];
export const MOCK_GALLERY_ITEMS: GalleryItem[] = [];
