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
  Sparkles,
} from "lucide-react";
import { PageHeader } from "@/src/components/common/PageHeader";
import { SectionHeader } from "@/src/components/common/SectionHeader";
import { Button } from "@/src/components/common/Button";
import { useLanguage } from "@/src/context/LanguageContext";
import { useTrust } from "@/src/context/TrustContext";

export const About: React.FC = () => {
  const { t, language } = useLanguage();
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 space-y-12 sm:space-y-16">
      {/* 1. Page Header */}
      <PageHeader
        badge={language === "mr" ? "आमच्या संस्थेविषयी" : language === "hi" ? "संस्थान परिचय" : "About Our Institution"}
        badgeIcon={<ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />}
        title={
          language === "mr"
            ? "पारदर्शक समाजकार्याची सेवा परंपरा"
            : language === "hi"
            ? "पारदर्शी समाजसेवा की पावन परंपरा"
            : "Pioneering Transparency in Social Philanthropy"
        }
        description={
          language === "mr"
            ? `${trustName} ही संस्था नाशिक व महाराष्ट्रातील गरजूंसाठी समर्पित असून सर्व समाजकार्य पारदर्शकतेने व जबाबदारीने राबवते.`
            : language === "hi"
            ? `${trustName} सेवा, निष्ठा और पूर्ण पारदर्शिता के साथ जरूरतमंदों की सहायता हेतु समर्पित है।`
            : `${trustName} was established with a clear mandate: to serve our community with compassion, responsibility, and open verification of all public contributions across Nashik and Maharashtra.`
        }
      />

      {/* 2. Trust Governance & Transparency Charter */}
      <div className="bg-gradient-to-br from-emerald-50/90 via-emerald-50/40 to-amber-50/30 border border-emerald-200/80 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-[#14532d] text-amber-200 flex items-center justify-center shrink-0 border border-emerald-800 shadow-xs">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-serif font-bold text-stone-900">
                {language === "mr"
                  ? "विश्वस्त संस्था नियम व पारदर्शकता सनद"
                  : language === "hi"
                  ? "ट्रस्ट शासन एवं पारदर्शिता चार्टर"
                  : "Trust Governance & Transparency Charter"}
              </h3>
              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100/70 px-2.5 py-0.5 rounded-full border border-emerald-300/60">
                Reg. E-9389 / Nashik
              </span>
            </div>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
              Operating under statutory fiduciary standards in Nashik, Maharashtra, <strong>{trustName}</strong> guarantees:
            </p>
            <ul className="text-xs sm:text-sm text-stone-700 list-disc list-inside space-y-1 pl-1">
              <li>Statutory registration under Maharashtra Public Trusts Act. Dedicated civic & charitable governance.</li>
              <li>Every contribution is verified through the Impact Passport ledger: Donation → Allocation → Verification → Real-world Impact.</li>
              <li>Annual external audits, strict separation of administrative vs program funds, and zero private diversion policy.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 3. Mission & Governance Bento */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200/90 shadow-xs hover:shadow-md transition-shadow space-y-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#14532d] flex items-center justify-center border border-emerald-200">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-serif font-bold text-stone-900">
            {language === "mr" ? "ध्येय व उद्दिष्ट" : language === "hi" ? "हमारा पावन ध्येय" : "Our Core Mission"}
          </h3>
          <p className="text-stone-600 text-sm leading-relaxed">
            {missionText}
          </p>
          <div className="pt-3 text-xs text-stone-600 font-medium flex items-center gap-2 border-t border-stone-100">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>Zero-leakage objective via itemized purchase orders and direct vendor vouchers</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200/90 shadow-xs hover:shadow-md transition-shadow space-y-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center border border-amber-200">
            <Scale className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-serif font-bold text-stone-900">
            {language === "mr" ? "दृष्टी व नियमन" : language === "hi" ? "दृष्टिकोण एवं शासन" : "Governance & Vision"}
          </h3>
          <p className="text-stone-600 text-sm leading-relaxed">
            {visionText}
          </p>
          <div className="pt-3 text-xs text-stone-600 font-medium flex items-center gap-2 border-t border-stone-100">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>Independent field inspection and photography before final stage sign-off</span>
          </div>
        </div>
      </div>

      {/* 4. Core Pillars or Dynamic Objectives */}
      <div className="space-y-8">
        <SectionHeader
          tag="Intervention Focus"
          title={
            language === "mr"
              ? "प्रमुख सामाजिक व सेवा प्रकल्प"
              : language === "hi"
              ? "प्रमुख सामाजिक एवं सेवा क्षेत्र"
              : "Core Humanitarian & Social Welfare Objectives"
          }
          description="We concentrate our verified assistance across authentic community welfare sectors in Nashik and surrounding rural regions."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {trustProfile?.objectives && trustProfile.objectives.length > 0 ? (
            trustProfile.objectives.map((obj, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-stone-200/90 shadow-xs hover:border-emerald-700/30 hover:shadow-md transition-all space-y-3">
                <div className="text-[#14532d] font-bold text-xs uppercase tracking-wider flex items-center justify-between">
                  <span>{String(idx + 1).padStart(2, "0")}. {obj.category || "Strategic Area"}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                </div>
                <h4 className="text-base sm:text-lg font-serif font-bold text-stone-900">{obj.title}</h4>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">{obj.description}</p>
              </div>
            ))
          ) : (
            <>
              <div className="bg-white p-6 rounded-2xl border border-stone-200/90 shadow-xs hover:border-emerald-700/30 hover:shadow-md transition-all space-y-3">
                <div className="text-[#14532d] font-bold text-xs uppercase tracking-wider flex items-center justify-between">
                  <span>01. Education & Youth</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                </div>
                <h4 className="text-base sm:text-lg font-serif font-bold text-stone-900">Educational Support for Needy Children</h4>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  Providing notebooks, stationery kits, school uniforms, classroom infrastructure, and adoption support for underprivileged students.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-stone-200/90 shadow-xs hover:border-emerald-700/30 hover:shadow-md transition-all space-y-3">
                <div className="text-[#14532d] font-bold text-xs uppercase tracking-wider flex items-center justify-between">
                  <span>02. Health & Wellness</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                </div>
                <h4 className="text-base sm:text-lg font-serif font-bold text-stone-900">Community Healthcare & Medical Camps</h4>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  Organizing periodic free medical checkup camps, vision screenings, blood donation drives, health awareness, and medicine distribution.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-stone-200/90 shadow-xs hover:border-emerald-700/30 hover:shadow-md transition-all space-y-3">
                <div className="text-[#14532d] font-bold text-xs uppercase tracking-wider flex items-center justify-between">
                  <span>03. Community Relief</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                </div>
                <h4 className="text-base sm:text-lg font-serif font-bold text-stone-900">Food & Clothing Relief for Needy Families</h4>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  Distributing wholesome food grains, festive grocery packages, winter sweaters, and clothing to destitute families.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-stone-200/90 shadow-xs hover:border-emerald-700/30 hover:shadow-md transition-all space-y-3">
                <div className="text-[#14532d] font-bold text-xs uppercase tracking-wider flex items-center justify-between">
                  <span>04. Elderly Welfare</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                </div>
                <h4 className="text-base sm:text-lg font-serif font-bold text-stone-900">Senior Citizen Care (Jyeshtha Nagrik Sangh)</h4>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  Supporting senior citizens with walking sticks, medical aids, umbrellas, and social engagement through Jyeshtha Nagrik Sangh.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-stone-200/90 shadow-xs hover:border-emerald-700/30 hover:shadow-md transition-all space-y-3">
                <div className="text-[#14532d] font-bold text-xs uppercase tracking-wider flex items-center justify-between">
                  <span>05. Environment</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                </div>
                <h4 className="text-base sm:text-lg font-serif font-bold text-stone-900">Environmental Conservation & Tree Plantation</h4>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  Leading native tree plantation drives, environmental cleanliness, and water preservation initiatives across Nashik.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-stone-200/90 shadow-xs hover:border-emerald-700/30 hover:shadow-md transition-all space-y-3">
                <div className="text-[#14532d] font-bold text-xs uppercase tracking-wider flex items-center justify-between">
                  <span>06. Community Empowerment</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                </div>
                <h4 className="text-base sm:text-lg font-serif font-bold text-stone-900">Women Self-Employment & Vocational Training</h4>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  Conducting skill development and sewing / handicraft training to foster economic self-reliance for women.
                </p>
              </div>
            </>
          )}

          {/* Impact Passport Highlight Card */}
          <div className="bg-gradient-to-br from-[#14532d] to-[#0a2916] text-white p-6 rounded-2xl border border-emerald-800 shadow-md flex flex-col justify-between">
            <div>
              <div className="text-amber-300 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Audited Transparency</span>
              </div>
              <h4 className="text-lg font-serif font-bold text-white mt-2">The Impact Passport</h4>
              <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed mt-2">
                Every rupee in all pillars is tracked across: Donation → Allocation → Verification → Real-world Impact.
              </p>
            </div>
            <Link to="/impact-passport" className="mt-6">
              <Button size="sm" variant="secondary" className="w-full text-xs bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold border-0">
                Inspect Impact Passport
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 5. Board of Trustees & Advisory Council (Respectful, Non-Corporate Presentation) */}
      <div id="trustees" className="bg-stone-50/70 border border-stone-200/80 rounded-2xl p-6 sm:p-10 shadow-xs space-y-8">
        <SectionHeader
          tag="Governance & Fiduciary Council"
          title={
            language === "mr"
              ? "विश्वस्त मंडळ व सल्लागार समिती"
              : language === "hi"
              ? "न्यासी मंडल एवं सलाहकार परिषद"
              : "Board of Trustees & Advisory Council"
          }
          description="Respected civic guardians, community leaders, and fiduciary trustees guiding trust initiatives."
        />

        {loading ? (
          <div className="py-12 text-center space-y-3">
            <RefreshCw className="w-6 h-6 text-[#14532d] animate-spin mx-auto" />
            <p className="text-xs text-stone-500">Loading verified governance records from database...</p>
          </div>
        ) : error ? (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-5 text-center space-y-2 max-w-md mx-auto">
            <AlertCircle className="w-6 h-6 text-rose-600 mx-auto" />
            <p className="text-xs text-rose-800">{error}</p>
            <Button size="sm" variant="outline" onClick={refreshAll} className="text-xs">
              <RefreshCw className="w-3.5 h-3.5 mr-1" /> Retry Connection
            </Button>
          </div>
        ) : trustees.length === 0 ? (
          <div className="bg-white border border-dashed border-stone-300 rounded-2xl p-8 text-center max-w-xl mx-auto space-y-3">
            <UserCheck className="w-8 h-8 text-stone-400 mx-auto" />
            <h4 className="font-serif font-bold text-stone-800 text-sm">No Trustee Records Published Yet</h4>
            <p className="text-xs text-stone-500 leading-relaxed">
              Official trustee appointments and verified board credentials will appear here once entered in the administration governance console.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {trustees.map((trustee) => (
              <div
                key={trustee.id || trustee._id}
                className="bg-white p-6 rounded-2xl border border-stone-200/90 shadow-xs hover:border-amber-400/50 hover:shadow-md transition-all text-center space-y-3.5"
              >
                {trustee.photo ? (
                  <img
                    src={trustee.photo}
                    alt={trustee.name}
                    className="w-20 h-20 rounded-full mx-auto object-cover border-2 border-amber-400/50 shadow-xs ring-4 ring-emerald-50"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-18 h-18 rounded-full bg-gradient-to-br from-emerald-50 to-amber-50 mx-auto flex items-center justify-center text-[#14532d] font-serif font-bold text-lg border-2 border-amber-300/60 shadow-2xs">
                    {getInitials(trustee.name)}
                  </div>
                )}
                <div>
                  <h4 className="font-serif font-bold text-stone-900 text-base">{trustee.name}</h4>
                  <p className="text-xs font-semibold text-[#14532d] mt-0.5">{trustee.designation}</p>
                  {trustee.qualification && (
                    <p className="text-[11px] text-stone-500 italic mt-0.5">{trustee.qualification}</p>
                  )}
                  {trustee.role && trustee.role !== "Trustee" && (
                    <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider bg-amber-100/80 text-amber-900 border border-amber-300/60 px-2.5 py-0.5 rounded-full">
                      {trustee.role}
                    </span>
                  )}
                  {trustee.bio && (
                    <p className="text-xs text-stone-600 mt-2.5 leading-relaxed line-clamp-4 text-left bg-[#faf8f5] p-3 rounded-xl border border-stone-100">
                      {trustee.bio}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 6. Warm Bottom Banner */}
      <div className="bg-gradient-to-br from-[#14532d] to-[#0a2916] text-white rounded-2xl p-8 sm:p-12 text-center space-y-4 shadow-md border border-emerald-800">
        <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
          {language === "mr" ? "सेवा कार्यात सहभागी व्हा" : language === "hi" ? "सेवा कार्य में सहभागी बनें" : "Ready to Support Verified Causes?"}
        </h3>
        <p className="text-xs sm:text-sm text-emerald-100/90 max-w-xl mx-auto leading-relaxed">
          {language === "mr"
            ? "नाशिक व परिसरातील गरजूंसाठी सुरू असलेल्या विविध उपक्रमांना सहाय्य करा अथवा आमच्याशी थेट संपर्क साधा."
            : language === "hi"
            ? "नासिक एवं आसपास के सामाजिक उपक्रमों में सहयोग करें अथवा ट्रस्ट कार्यालय से संपर्क करें।"
            : "Explore our itemized drives or contribute directly through our verified donation pipeline."}
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link to="/causes">
            <Button size="sm" variant="secondary" className="bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold border-0">
              {language === "mr" ? "उपक्रम पहा" : language === "hi" ? "उपक्रम देखें" : "Explore Causes"}
            </Button>
          </Link>
          <Link to="/contact">
            <Button size="sm" variant="outline" className="text-white border-white/30 hover:bg-white/10">
              {language === "mr" ? "संपर्क साधा" : language === "hi" ? "संपर्क करें" : "Contact Trust Desk"}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

