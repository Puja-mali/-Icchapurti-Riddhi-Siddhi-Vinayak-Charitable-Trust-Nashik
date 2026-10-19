import {
  Cause,
  ImpactPassportRecord,
  EventItem,
  UserDonation,
  GalleryItem,
} from "../types";

import { TRUST_BRAND } from "../config/trustBrand";

export const TRUST_INFO = {
  name: TRUST_BRAND.name,
  marathiName: TRUST_BRAND.marathiName,
  shortName: TRUST_BRAND.shortName,
  subtitle: `Reg. No. ${TRUST_BRAND.registrationNumber} • Dedicated to Grassroots Social Welfare`,
  registrationNumber: TRUST_BRAND.registrationNumber,
  establishedYear: "", // Awaiting official confirmation from Trust
  email: TRUST_BRAND.contact.email,
  phone: TRUST_BRAND.contact.phoneDisplay,
  phones: TRUST_BRAND.contact.phones,
  address: TRUST_BRAND.unverifiedAddressPlaceholder,
  officeHours: "Public desk timings will be updated soon.",
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
