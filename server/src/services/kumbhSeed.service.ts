import mongoose from 'mongoose';
import { Cause } from '../models/Cause';
import { Event } from '../models/Event';
import { VolunteerRole } from '../models/VolunteerRole';
import { BlogPost } from '../models/BlogPost';
import { logger } from '../utils/logger';

export class KumbhSeedService {
  public static async seedKumbhDefaults(): Promise<void> {
    if (mongoose.connection.readyState !== 1) return;

    try {
      // 1. Seed Kumbh Causes if none exist
      const causeCount = await Cause.countDocuments({ isKumbhRelated: true });
      if (causeCount === 0) {
        await Cause.insertMany([
          {
            title: 'Godavari Ghat Cleanliness & Sanitation Drive 2027',
            slug: 'godavari-ghat-cleanliness-drive-2027',
            shortDescription:
              '[Demo / Planning Phase] Advance civic seva to deploy waste segregation bins, eco-friendly cleaners, and hygiene stewards along sacred riverbanks.',
            description:
              'Illustrative preparatory seva initiative for Nashik–Trimbakeshwar Simhastha 2027. Focused on preserving the sacred Godavari River through volunteer-led riverbank sanitation, non-toxic bio-enzyme water treatments, and continuous waste collection during peak pilgrim influx.',
            targetAmount: 500000,
            raisedAmount: 0,
            category: 'Kumbh Seva',
            imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=1000',
            status: 'ACTIVE',
            urgent: true,
            donorCount: 0,
            location: 'Ramkund & Godavari Ghats, Nashik',
            isKumbhRelated: true,
            allocationBreakdown: [
              { category: 'Sanitation Equipment & Bins', percentage: 40 },
              { category: 'Volunteer Safety Gear & Aprons', percentage: 25 },
              { category: 'Daily Eco-Waste Disposal Transport', percentage: 25 },
              { category: 'Emergency River Rescue Gear', percentage: 10 },
            ],
          },
          {
            title: 'Pilgrim Water & Annadan Seva Station',
            slug: 'pilgrim-water-annadan-seva-station',
            shortDescription:
              '[Demo / Planning Phase] Satvik nutritional prasad and clean filtered drinking water distribution kiosks for visiting sadhus and devotees.',
            description:
              'Illustrative preparatory community kitchen and hydration network. Siddhivinayak Trust aims to set up RO filtration water kiosks and satvik annadan facilities across transit routes leading to Nashik Sadhugram and Trimbakeshwar temple zones.',
            targetAmount: 750000,
            raisedAmount: 0,
            category: 'Kumbh Seva',
            imageUrl: 'https://images.unsplash.com/photo-1618245318763-a15156d6b23c?auto=format&fit=crop&q=80&w=1000',
            status: 'ACTIVE',
            urgent: false,
            donorCount: 0,
            location: 'Sadhugram Kitchen Camp, Nashik',
            isKumbhRelated: true,
            allocationBreakdown: [
              { category: 'Grain & Food Provision Procurement', percentage: 50 },
              { category: 'RO Drinking Water Plant Logistics', percentage: 30 },
              { category: 'Bio-Degradable Dining Plates', percentage: 15 },
              { category: 'Hygiene & Sanitizer Dispensers', percentage: 5 },
            ],
          },
          {
            title: 'First Aid & Pilgrim Medical Assistance Post',
            slug: 'first-aid-pilgrim-medical-camp',
            shortDescription:
              '[Demo / Planning Phase] Round-the-clock emergency medical response and paramedic triage for heat exhaustion, blisters, and basic care.',
            description:
              'Illustrative health outpost initiative. Intended to provide ambulatory medical help, emergency hydration packets, essential pain relief, and doctor consultations to elderly pilgrims walking long circumambulation routes.',
            targetAmount: 350000,
            raisedAmount: 0,
            category: 'Kumbh Seva',
            imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=1000',
            status: 'ACTIVE',
            urgent: true,
            donorCount: 0,
            location: 'Trimbakeshwar & Nashik Outer Ring',
            isKumbhRelated: true,
            allocationBreakdown: [
              { category: 'Essential Medicines & ORS Kits', percentage: 45 },
              { category: 'Paramedic Station Tents & Beds', percentage: 30 },
              { category: 'Emergency Wheelchairs & Stretchers', percentage: 25 },
            ],
          },
        ]);
        logger.info('Seeded default Kumbh Causes successfully.');
      }

      // 2. Seed Kumbh Events if none exist
      const eventCount = await Event.countDocuments({ isKumbhRelated: true });
      if (eventCount === 0) {
        await Event.insertMany([
          {
            title: 'Volunteer Orientation Workshop – Simhastha 2027',
            slug: 'volunteer-orientation-workshop-simhastha-2027',
            shortDescription:
              '[Demo / Planning Phase] Introductory training for registered volunteers on pilgrim facilitation, emergency coordination, and ghat safety protocols.',
            description:
              'A dedicated capacity-building workshop covering crowd management fundamentals, lost-and-found communication, basic first aid, and courteous communication in Marathi, Hindi, and Gujarati for incoming pilgrim streams.',
            location: 'Trust Hall, Panchavati, Nashik',
            startDate: new Date('2027-02-15T09:30:00.000Z'),
            endDate: new Date('2027-02-15T14:30:00.000Z'),
            category: 'Kumbh Seva',
            imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=1000',
            status: 'UPCOMING',
            isKumbhRelated: true,
            registrationRequired: true,
            registrationLimit: 150,
            registrationCount: 0,
            capacity: 150,
            galleryUrls: [
              'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=1000',
              'https://images.unsplash.com/photo-1618245318763-a15156d6b23c?auto=format&fit=crop&q=80&w=1000',
            ],
          },
          {
            title: 'Ghat Cleanliness & Sanitation Planning Meet',
            slug: 'ghat-cleanliness-sanitation-planning-meet',
            shortDescription:
              '[Demo / Planning Phase] Collaborative strategy session with local environmental volunteers on zero-waste protocols during Shahi Snan periods.',
            description:
              'Planning meet to finalize eco-friendly disposal routes, biodegradable bag distribution, and river water sample testing logistics alongside Godavari parikrama tracks.',
            location: 'Ramkund Ghat Pavilion, Nashik',
            startDate: new Date('2027-03-20T10:00:00.000Z'),
            endDate: new Date('2027-03-20T13:00:00.000Z'),
            category: 'Kumbh Seva',
            imageUrl: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&q=80&w=1000',
            status: 'UPCOMING',
            isKumbhRelated: true,
            registrationRequired: true,
            registrationLimit: 75,
            registrationCount: 0,
            capacity: 75,
            galleryUrls: [
              'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&q=80&w=1000',
            ],
          },
        ]);
        logger.info('Seeded default Kumbh Events successfully.');
      }

      // 3. Seed Kumbh Volunteer Roles if none exist
      const roleCount = await VolunteerRole.countDocuments({ isKumbhRelated: true });
      if (roleCount === 0) {
        await VolunteerRole.insertMany([
          {
            title: 'Ghat Hygiene & Riverbank Steward',
            department: 'Simhastha Kumbh Seva',
            commitment: 'Morning / Evening Shift (4 hrs)',
            location: 'Ramkund & Kapila Sangam, Nashik',
            description:
              'Guide pilgrims toward dedicated floral offering bins, dissuade single-use plastics, and assist municipal sanitation staff in keeping the river steps clean and safe.',
            requirements: [
              'Commitment to environmental river preservation',
              'Comfortable standing for 3-4 hours',
              'High civic awareness and courteous communication',
            ],
            spotsAvailable: 35,
            isKumbhRelated: true,
            isActive: true,
          },
          {
            title: 'Queue & Crowd Assistance Marshal',
            department: 'Simhastha Kumbh Seva',
            commitment: 'Peak Shahi Snan Dates & Weekends',
            location: 'Trimbakeshwar & Tapovan, Nashik',
            description:
              'Assist elderly pilgrims, expectant mothers, and disabled devotees with wheelchairs and queue navigation. Coordinate with lost-and-found public announcement booths.',
            requirements: [
              'Patient and empathetic temperament',
              'Working fluency in Marathi or Hindi',
              'Physical fitness for active movement across crowd corridors',
            ],
            spotsAvailable: 50,
            isKumbhRelated: true,
            isActive: true,
          },
          {
            title: 'First Aid Station Assistant',
            department: 'Simhastha Kumbh Seva',
            commitment: 'Rotational 6-hr Shifts',
            location: 'Nashik Central Pilgrim Transit Hub',
            description:
              'Support certified doctors and nurses in recording patient symptoms, administering ORS electrolyte drinks, and dressing minor blisters for walking pilgrims.',
            requirements: [
              'Basic first aid familiarity or nursing / pharmacy student background preferred',
              'Calm demeanor under pressure',
              'Strict adherence to sanitation protocols',
            ],
            spotsAvailable: 20,
            isKumbhRelated: true,
            isActive: true,
          },
        ]);
        logger.info('Seeded default Kumbh Volunteer Roles successfully.');
      }

      // 4. Seed Kumbh Blog Posts if none exist
      const blogCount = await BlogPost.countDocuments({ isKumbhRelated: true });
      if (blogCount === 0) {
        await BlogPost.insertMany([
          {
            title: 'Preparations for Simhastha Kumbh 2027: Siddhivinayak Trust Seva Roadmap',
            slug: 'preparations-for-simhastha-kumbh-2027-roadmap',
            excerpt:
              '[Demo / Preparatory Roadmap] An overview of Siddhivinayak Charitable Trust’s prospective community service initiatives, river hygiene vision, and volunteer mobilization for Nashik–Trimbakeshwar 2027.',
            content:
              'The Simhastha Kumbh Mela represents one of the largest spiritual and cultural gatherings on earth. In this preparatory document, Siddhivinayak Charitable Trust outlines its preliminary civic service framework focused on environmental hygiene along the holy Godavari, satvik annadan logistics, and volunteer assistance.\n\nDisclaimer: This is a preliminary planning and preparatory roadmap. Official schedules and ground operations will be conducted in coordination with and under the authorization of local municipal and administrative authorities.',
            coverImage:
              'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=1000',
            category: 'Kumbh Seva',
            author: 'Trust Research & Seva Council',
            publishedAt: new Date('2026-08-01T10:00:00.000Z'),
            readTime: '4 min read',
            isFeatured: true,
            isPublished: true,
            isKumbhRelated: true,
          },
          {
            title: 'Community Volunteerism along the Sacred Godavari: A Call for Sevadars',
            slug: 'community-volunteerism-godavari-call-for-sevadars',
            excerpt:
              '[Demo / Seva Call] Join our preparatory volunteer brigade for river cleanliness, lost-and-found coordination, and pilgrim hospitality.',
            content:
              'True spirituality manifests in selfless service (Nishkama Seva). As we prepare for the 2027 Simhastha Kumbh, our priority is ensuring that pilgrims experience a safe, clean, and compassionate environment in Nashik and Trimbakeshwar.',
            coverImage:
              'https://images.unsplash.com/photo-1618245318763-a15156d6b23c?auto=format&fit=crop&q=80&w=1000',
            category: 'Kumbh Seva',
            author: 'SCT Volunteer Coordinator',
            publishedAt: new Date('2026-08-15T11:00:00.000Z'),
            readTime: '3 min read',
            isFeatured: false,
            isPublished: true,
            isKumbhRelated: true,
          },
        ]);
        logger.info('Seeded default Kumbh Blog Posts successfully.');
      }
    } catch (err) {
      logger.error('Error seeding Kumbh defaults:', err);
    }
  }
}
