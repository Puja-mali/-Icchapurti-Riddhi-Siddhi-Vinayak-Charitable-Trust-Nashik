import React from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  Award,
  BookOpen,
  Heart,
  Scale,
  Users,
  Building,
  CheckCircle2,
  FileText,
  Lock,
  RefreshCw,
  AlertCircle,
  UserCheck,
} from "lucide-react";
import { SectionHeader } from "@/src/components/common/SectionHeader";
import { Button } from "@/src/components/common/Button";
import { useLanguage } from "@/src/context/LanguageContext";
import { useTrust } from "@/src/context/TrustContext";

export const About: React.FC = () => {
  const { t } = useLanguage();
  const { trustProfile, trustees, loading, error, refreshAll } = useTrust();

  const trustName = trustProfile?.trustName || "Icchapurti Riddhi Siddhi Vinayak Charitable Trust, Nashik";
  const trustSubtitle = trustProfile?.subtitle || "Reg. No. E-9389 / Nashik • Dedicated to Grassroots Social Welfare";
  const missionText =
    trustProfile?.mission ||
    "To serve our community through verifiable social action — providing educational aid, healthcare camps, nutritious food distribution, skill development for women, senior citizen assistance, and environmental conservation with complete integrity and public accountability.";
  const visionText =
    trustProfile?.vision ||
    "To foster an empowered, compassionate, and self-reliant society through transparent social welfare, accessible education, community health, and dedicated grassroots assistance for those in need.";
  const academicNote = trustProfile?.academicNote || "";

  // Get initials helper
  const getInitials = (name: string): string => {
    if (!name) return "TR";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-14">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
            About Our Institution
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 tracking-tight">
          Pioneering Transparency in Social Philanthropy
        </h1>
        <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
          {trustName} was established with a clear mandate: to serve our community with
          compassion, responsibility, and open verification of all public contributions across Nashik and Maharashtra.
        </p>
      </div>

      {/* Trust Governance & Transparency Charter */}
      <div className="bg-emerald-50/90 border border-emerald-300 rounded-md p-5 sm:p-6 shadow-2xs">
        <div className="flex items-start gap-3.5">
          <div className="w-9 h-9 rounded bg-emerald-100 text-emerald-900 flex items-center justify-center shrink-0 border border-emerald-300">
            <ShieldCheck className="w-5 h-5 text-emerald-800" />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-emerald-950">
                Trust Governance & Transparency Charter
              </h3>
            </div>
            <p className="text-xs text-emerald-950/90 leading-relaxed">
              Operating under statutory fiduciary standards in Nashik, Maharashtra, <strong>{trustName}</strong> guarantees:
            </p>
            <ul className="text-xs text-emerald-900/90 list-disc list-inside space-y-0.5 pl-1">
              <li>Statutory registration under Maharashtra Public Trusts Act. Tax-exemption status: subject to verification of the Trust&apos;s current statutory documentation.</li>
              <li>Every contribution is verified through the Impact Passport ledger: Donation → Allocation → Verification → Real-world Impact.</li>
              <li>Annual external audits, strict separation of administrative vs program funds, and zero private diversion policy.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Mission & Governance Bento */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-md p-6 sm:p-7 border border-stone-200 shadow-2xs space-y-3">
          <div className="w-10 h-10 rounded bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-200">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-serif font-bold text-stone-900">Our Core Mission</h3>
          <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
            {missionText}
          </p>
          <div className="pt-2 text-xs text-stone-600 font-medium flex items-center gap-2 border-t border-stone-100">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            Zero-leakage objective via itemized purchase orders
          </div>
        </div>

        <div className="bg-white rounded-md p-6 sm:p-7 border border-stone-200 shadow-2xs space-y-3">
          <div className="w-10 h-10 rounded bg-stone-100 text-stone-800 flex items-center justify-center border border-stone-300">
            <Scale className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-serif font-bold text-stone-900">Governance & Vision</h3>
          <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
            {visionText}
          </p>
          <div className="pt-2 text-xs text-stone-600 font-medium flex items-center gap-2 border-t border-stone-100">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            Independent field inspection before stage sign-off
          </div>
        </div>
      </div>

      {/* 6 Core Pillars or Dynamic Objectives */}
      <div>
        <SectionHeader
          tag="Intervention Focus"
          title="Core Humanitarian & Social Welfare Objectives"
          description="We concentrate our verified assistance across authentic community welfare sectors in Nashik."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {trustProfile?.objectives && trustProfile.objectives.length > 0 ? (
            trustProfile.objectives.map((obj, idx) => (
              <div key={idx} className="bg-white p-5 rounded-md border border-stone-200 shadow-2xs space-y-2">
                <div className="text-emerald-800 font-bold text-xs uppercase tracking-wider">
                  {String(idx + 1).padStart(2, "0")}. {obj.category || "Strategic Area"}
                </div>
                <h4 className="text-base font-serif font-bold text-stone-900">{obj.title}</h4>
                <p className="text-xs text-stone-600 leading-relaxed">{obj.description}</p>
              </div>
            ))
          ) : (
            <>
              <div className="bg-white p-5 rounded-md border border-stone-200 shadow-2xs space-y-2">
                <div className="text-emerald-800 font-bold text-xs uppercase tracking-wider">01. Education & Youth</div>
                <h4 className="text-base font-serif font-bold text-stone-900">Educational Support for Needy & Orphan Children</h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Providing notebooks, stationery, school dress kits, school infrastructure, and educational adoption support for orphan and needy students.
                </p>
              </div>

              <div className="bg-white p-5 rounded-md border border-stone-200 shadow-2xs space-y-2">
                <div className="text-emerald-800 font-bold text-xs uppercase tracking-wider">02. Health & Wellness</div>
                <h4 className="text-base font-serif font-bold text-stone-900">Community Healthcare & Medical Camps</h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Organizing periodic free medical camps, health checkups, blood donation drives, vaccination awareness, and naturopathy guidance.
                </p>
              </div>

              <div className="bg-white p-5 rounded-md border border-stone-200 shadow-2xs space-y-2">
                <div className="text-emerald-800 font-bold text-xs uppercase tracking-wider">03. Community Relief</div>
                <h4 className="text-base font-serif font-bold text-stone-900">Food & Clothing Relief for Needy Families</h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Distributing wholesome food grains, festive Diwali Faral packets, seasonal sweaters, and free clothing to destitute individuals.
                </p>
              </div>

              <div className="bg-white p-5 rounded-md border border-stone-200 shadow-2xs space-y-2">
                <div className="text-emerald-800 font-bold text-xs uppercase tracking-wider">04. Elderly Welfare</div>
                <h4 className="text-base font-serif font-bold text-stone-900">Senior Citizen Care (Jyeshtha Nagrik Sangh)</h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Supporting elderly citizens with mobility walking sticks, umbrellas, welfare programs, and active engagement through Jyeshtha Nagrik Sangh.
                </p>
              </div>

              <div className="bg-white p-5 rounded-md border border-stone-200 shadow-2xs space-y-2">
                <div className="text-emerald-800 font-bold text-xs uppercase tracking-wider">05. Environment</div>
                <h4 className="text-base font-serif font-bold text-stone-900">Environmental Conservation & Tree Plantation</h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Leading native tree plantation drives, environmental cleanliness, and ecological conservation initiatives across Nashik.
                </p>
              </div>

              <div className="bg-white p-5 rounded-md border border-stone-200 shadow-2xs space-y-2">
                <div className="text-emerald-800 font-bold text-xs uppercase tracking-wider">06. Community Empowerment</div>
                <h4 className="text-base font-serif font-bold text-stone-900">Ladies Self-Employment & Vocational Training</h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Conducting skill development and self-employment training centers to foster economic self-reliance for women.
                </p>
              </div>
            </>
          )}

          <div className="bg-emerald-950 text-white p-5 rounded-md border border-emerald-900 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="text-emerald-300 font-bold text-xs uppercase tracking-wider">Audited Ledger</div>
              <h4 className="text-base font-serif font-bold text-white mt-1">The Impact Passport</h4>
              <p className="text-xs text-emerald-100/80 leading-relaxed mt-2">
                Every rupee in all pillars is tracked across: Donation → Allocation → Verification → Impact.
              </p>
            </div>
            <Link to="/impact-passport" className="mt-4">
              <Button size="sm" variant="primary" className="w-full text-xs bg-emerald-700 hover:bg-emerald-800 text-white">
                Inspect Impact Passport
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Board of Trustees & Advisory Council (MongoDB-Backed) */}
      <div className="bg-white border border-stone-200 rounded-md p-6 sm:p-8 shadow-2xs space-y-6">
        <SectionHeader
          tag="Governance Structure"
          title="Board of Trustees & Advisory Council"
          description="Verified governance and fiduciary leadership overseeing trust initiatives."
        />

        {loading ? (
          <div className="py-12 text-center space-y-3">
            <RefreshCw className="w-6 h-6 text-emerald-700 animate-spin mx-auto" />
            <p className="text-xs text-stone-500">Loading verified governance records from database...</p>
          </div>
        ) : error ? (
          <div className="bg-rose-50 border border-rose-200 rounded p-4 text-center space-y-2 max-w-md mx-auto">
            <AlertCircle className="w-6 h-6 text-rose-600 mx-auto" />
            <p className="text-xs text-rose-800">{error}</p>
            <Button size="sm" variant="outline" onClick={refreshAll} className="text-xs">
              <RefreshCw className="w-3.5 h-3.5 mr-1" /> Retry Connection
            </Button>
          </div>
        ) : trustees.length === 0 ? (
          <div className="bg-stone-50 border border-dashed border-stone-300 rounded-lg p-8 text-center max-w-xl mx-auto space-y-3">
            <UserCheck className="w-8 h-8 text-stone-400 mx-auto" />
            <h4 className="font-serif font-bold text-stone-800 text-sm">No Trustee Records Published Yet</h4>
            <p className="text-xs text-stone-500 leading-relaxed">
              Official trustee appointments and verified board credentials will appear here once entered in the administration governance console.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {trustees.map((trustee) => (
              <div
                key={trustee.id || trustee._id}
                className="bg-stone-50 p-5 rounded-md border border-stone-200 text-center space-y-3 hover:border-emerald-300 transition-colors"
              >
                {trustee.photo ? (
                  <img
                    src={trustee.photo}
                    alt={trustee.name}
                    className="w-16 h-16 rounded-full mx-auto object-cover border-2 border-emerald-700/20"
                    onError={(e) => {
                      // Fallback to initials if image link breaks
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-white mx-auto flex items-center justify-center text-emerald-800 font-serif font-bold text-base border border-stone-200 shadow-2xs">
                    {getInitials(trustee.name)}
                  </div>
                )}
                <div>
                  <h4 className="font-serif font-bold text-stone-900 text-sm">{trustee.name}</h4>
                  <p className="text-xs text-emerald-800 font-medium mt-0.5">{trustee.designation}</p>
                  {trustee.qualification && (
                    <p className="text-[11px] text-stone-500 italic mt-0.5">{trustee.qualification}</p>
                  )}
                  {trustee.role && trustee.role !== "Trustee" && (
                    <span className="inline-block mt-1 text-[10px] uppercase font-semibold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded">
                      {trustee.role}
                    </span>
                  )}
                  <p className="text-xs text-stone-600 mt-2 leading-relaxed line-clamp-4 text-left bg-white p-2.5 rounded border border-stone-200/60">
                    {trustee.bio}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="text-center space-y-3 pt-4">
        <h3 className="text-xl font-serif font-bold text-stone-900">
          Ready to Support Verified Causes?
        </h3>
        <p className="text-xs sm:text-sm text-stone-600 max-w-lg mx-auto">
          Explore our itemized drives or contribute directly through our verified donation pipeline.
        </p>
        <div className="flex justify-center gap-3 pt-1">
          <Link to="/causes">
            <Button size="sm" variant="primary">Explore Causes</Button>
          </Link>
          <Link to="/contact">
            <Button size="sm" variant="outline">Contact Trust Desk</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
