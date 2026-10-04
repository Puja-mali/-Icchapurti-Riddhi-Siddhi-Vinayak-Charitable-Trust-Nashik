import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
  Clock,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { useLanguage } from "@/src/context/LanguageContext";
import { useTrust } from "@/src/context/TrustContext";

export const Footer: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();
  const { trustProfile } = useTrust();
  const [emailInput, setEmailInput] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const trustName = trustProfile?.trustName || "Icchapurti Riddhi Siddhi Vinayak Charitable Trust, Nashik";
  const regNumber = trustProfile?.registrationDetails?.registrationNumber || "E-9389 / Nashik";
  const address = trustProfile?.address || "7, Pokar Avenue, Nandanvan Garden Apartment, Nashik, Maharashtra, India, PIN 422004";
  const phone = trustProfile?.phone || "0253 6029200 / 0253 6018200";
  const email = trustProfile?.email || "contact@siddhivinayaktrust.org";
  const officeHours = trustProfile?.officeHours || "Mon - Sat: 9:30 AM - 5:30 PM IST";
  const trustCharterNotice = trustProfile?.academicNote || "Registered Public Charitable Trust. Committed to auditable social philanthropy, statutory compliance, and verified grassroots empowerment across Nashik and surrounding rural regions.";

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 3000);
      setEmailInput("");
    }
  };

  return (
    <footer className="bg-[#0f2418] text-stone-300 border-t border-emerald-950 pt-14 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-10 border-b border-emerald-900/50">
          {/* Trust Branding & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-[#14532d] text-white flex items-center justify-center border border-emerald-700/40">
                <Heart className="w-5 h-5 fill-current text-amber-300 stroke-none" />
              </div>
              <div>
                <span className="text-base font-serif font-bold text-white tracking-tight block">
                  {t.trustName}
                </span>
                <span className="text-xs text-amber-400 font-medium">
                  {t.trustShort} • Charitable Trust
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-stone-400 leading-relaxed max-w-md">
              {t.tagline}
            </p>

            {/* Statutory Compliance Notice */}
            <div className="p-3 rounded-md bg-stone-900/90 border border-stone-800 space-y-1">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="text-xs font-semibold text-amber-300">
                  {t.academicNotice}
                </span>
              </div>
              <p className="text-[11px] text-stone-400 leading-normal">
                {trustCharterNotice}
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-100 mb-3 font-serif">
              {t.navAbout}
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link to="/about" className="text-stone-400 hover:text-white transition-colors">
                  {t.navAbout}
                </Link>
              </li>
              <li>
                <Link to="/causes" className="text-stone-400 hover:text-white transition-colors">
                  {t.navCauses}
                </Link>
              </li>
              <li>
                <Link
                  to="/impact-passport"
                  className="text-stone-300 hover:text-amber-300 transition-colors flex items-center gap-1 font-medium"
                >
                  <span>{t.navPassport}</span>
                  <span className="text-[10px] bg-amber-950 text-amber-300 px-1 rounded border border-amber-800/60">
                    Audit
                  </span>
                </Link>
              </li>
              <li>
                <Link to="/volunteer" className="text-stone-400 hover:text-white transition-colors">
                  {t.navVolunteer}
                </Link>
              </li>
              <li>
                <Link to="/events" className="text-stone-400 hover:text-white transition-colors">
                  {t.navEvents}
                </Link>
              </li>
            </ul>
          </div>

          {/* Portals & Governance */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-100 mb-3 font-serif">
              {t.footer.governance}
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link to="/donate" className="text-stone-400 hover:text-white transition-colors">
                  {t.ctaDonate}
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-stone-400 hover:text-white transition-colors">
                  {t.navDashboard}
                </Link>
              </li>
              <li>
                <Link to="/admin" className="text-stone-400 hover:text-white transition-colors">
                  {t.footer.auditorDesk}
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-stone-400 hover:text-white transition-colors">
                  {t.navLogin}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-stone-400 hover:text-white transition-colors">
                  {t.footer.contactHelpdesk}
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust Office Coordinates */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-100 mb-3 font-serif">
              {t.footer.secretariat}
            </h4>
            <div className="text-xs text-stone-400 space-y-2">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{officeHours}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div className="flex items-center gap-2 flex-wrap">
            <span>© 2012–2025 {trustName}.</span>
            <span>•</span>
            <span>Reg. No: {regNumber}</span>
            <span>•</span>
            <span className="text-emerald-400/90 font-medium">Nashik, Maharashtra • Regd. Public Charitable Trust</span>
          </div>

          {/* Language selector in footer */}
          <div className="flex items-center gap-2">
            <span className="text-stone-400 text-[11px]">Language:</span>
            <div className="inline-flex rounded border border-stone-700 bg-stone-900/50 p-0.5 text-[11px]">
              <button
                type="button"
                onClick={() => setLanguage("en")}
                className={`px-1.5 py-0.5 rounded cursor-pointer ${
                  language === "en" ? "bg-[#14532d] text-white" : "text-stone-400 hover:text-white"
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLanguage("hi")}
                className={`px-1.5 py-0.5 rounded cursor-pointer ${
                  language === "hi" ? "bg-[#14532d] text-white" : "text-stone-400 hover:text-white"
                }`}
              >
                हिन्दी
              </button>
              <button
                type="button"
                onClick={() => setLanguage("mr")}
                className={`px-1.5 py-0.5 rounded cursor-pointer ${
                  language === "mr" ? "bg-[#14532d] text-white" : "text-stone-400 hover:text-white"
                }`}
              >
                मराठी
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
