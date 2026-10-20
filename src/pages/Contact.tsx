import React, { useState } from "react";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  ChevronDown,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/src/components/common/Button";
import { useLanguage } from "@/src/context/LanguageContext";
import { useTrust } from "@/src/context/TrustContext";
import { TRUST_BRAND } from "@/src/config/trustBrand";

import { SEO } from "@/src/components/common/SEO";
import { api } from "@/src/services/api";

const FAQS = [
  {
    q: "What is the Impact Passport and how does it prevent fund leakage?",
    a: "The Impact Passport is our structured tracking mechanism. Rather than blending donations into an opaque general pool, each pledge is tagged with an indexed audit ID. Donors follow their funds through four stages: Donation receipt, vendor allocation, independent field audit, and monitored beneficiary outcome.",
  },
  {
    q: "Do donors receive an official donation receipt?",
    a: "Yes. Every verified contribution receives an official numbered Trust donation receipt referencing our registration number (E/1341). Note: The Trust does not claim Section 80G tax deductions; receipts confirm your voluntary contribution for personal and Trust accounting records.",
  },
  {
    q: "Can college students volunteer for NSS / academic credits?",
    a: "Yes. In our operational framework, students participating as field verifiers or weekend tutors receive verified certificates detailing logged hours and on-ground project impact.",
  },
  {
    q: "Who conducts the field verifications in Stage 3?",
    a: "Independent chartered accountants, empanelled educators, and certified public health inspectors conduct physical spot audits, inspecting procurement receipts, batch serial numbers, and beneficiary records.",
  },
];

export const Contact: React.FC = () => {
  const { t, language } = useLanguage();
  const { trustProfile } = useTrust();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("General Query");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [dbFaqs, setDbFaqs] = useState<any[]>([]);

  // Anti-spam states
  const [botTrap, setBotTrap] = useState("");
  const [formRenderTime] = useState<number>(() => Date.now());

  // Load published FAQs from backend
  React.useEffect(() => {
    let isMounted = true;
    api
    .get<{ faqs: any[] }>('/faqs')
  .then((res) => {
    if (isMounted && res?.faqs && res.faqs.length > 0) {
      setDbFaqs(res.faqs);
    }
  })
      .catch(() => {
        // Fall back gracefully to built-in FAQS
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Compute active FAQ items according to current language
  const activeFaqList = React.useMemo(() => {
    if (dbFaqs.length > 0) {
      return dbFaqs.map((f) => {
        let q = f.question;
        let a = f.answer;
        if (language === 'mr' && f.questionMr) {
          q = f.questionMr;
          a = f.answerMr || f.answer;
        } else if (language === 'hi' && f.questionHi) {
          q = f.questionHi;
          a = f.answerHi || f.answer;
        }
        return { q, a };
      });
    }
    return FAQS;
  }, [dbFaqs, language]);

  const regNumber = trustProfile?.registrationDetails?.registrationNumber || TRUST_BRAND.registrationNumber;
  const address =
    trustProfile?.address && trustProfile.address.trim() !== "" && !trustProfile.address.includes("Pokar")
      ? trustProfile.address
      : TRUST_BRAND.unverifiedAddressPlaceholder;
  const emailAddress =
    trustProfile?.email && trustProfile.email.trim() !== "" && !trustProfile.email.includes("siddhivinayaktrust.org")
      ? trustProfile.email
      : TRUST_BRAND.contact.email;
  const officeHours =
    trustProfile?.officeHours && trustProfile.officeHours.trim() !== ""
      ? trustProfile.officeHours
      : "Public desk timings will be updated soon.";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
    await api.post('/contact', {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        subject: `[${category}] ${subject.trim()}`,
        message: message.trim(),
        website_url: botTrap,
        _form_render_time: formRenderTime,
      });

      setSubmitted(true);
      setName("");
      setEmail("");
      setPhone("");
      setSubject("");
      setMessage("");
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to dispatch inquiry. Please check your network and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SEO
        title="Contact Trust Secretariat & Help Desk"
        description="Connect with the trustees and administrative secretariat of Icchapurti Riddhi Siddhi Vinayak Charitable Trust, Nashik (Reg. No. E/1341). Verified assistance, audits, and inquiries."
        canonicalPath="/contact"
        faqItems={activeFaqList.map((f) => ({ question: f.q, answer: f.a }))}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#14532d] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 shadow-2xs">
            Trust Liaison Desk
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-900 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 shadow-2xs">
            Secretariat & Support
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-serif font-bold text-stone-900 tracking-tight leading-[1.15]">
          Connect with Our Secretariat
        </h1>

        {/* Warm Subtle Decorative Divider */}
        <div className="flex items-center justify-center gap-2 mt-3.5 mb-2">
          <span className="w-8 h-px bg-amber-400/60" />
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          <span className="w-8 h-px bg-amber-400/60" />
        </div>

        <p className="text-sm sm:text-base text-stone-600 leading-relaxed max-w-2xl mx-auto">
          Have questions regarding program allocations, passport verifications, or campus partnerships?
          Our trustees and coordinators are available to assist.
        </p>
      </div>

      {/* Main Grid: Form + Trust Office Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Contact Form (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-8 border border-stone-200/90 shadow-xs space-y-6">
          <h2 className="text-xl font-serif font-bold text-stone-900">Send an Official Inquiry</h2>

          {submitted ? (
            <div className="py-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#14532d] flex items-center justify-center mx-auto border border-emerald-200">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-serif font-bold text-stone-900">Inquiry Dispatched Successfully!</h3>
              <p className="text-xs text-stone-600 max-w-md mx-auto leading-relaxed">
                Thank you. Your message has been dispatched to our secretariat desk. A trust coordinator will respond promptly.
              </p>
              <div className="pt-2">
                <Button size="sm" variant="outline" onClick={() => setSubmitted(false)}>
                  Send Another Inquiry
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
              {/* Accessible Anti-spam Honeypot Trap - hidden from assistive technologies */}
              <div className="hidden" aria-hidden="true" style={{ display: 'none' }}>
                <label htmlFor="website_url">Leave this field blank</label>
                <input
                  id="website_url"
                  type="text"
                  name="website_url"
                  tabIndex={-1}
                  autoComplete="off"
                  value={botTrap}
                  onChange={(e) => setBotTrap(e.target.value)}
                />
              </div>

              {errorMessage && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 leading-relaxed">
                  {errorMessage}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Anand R."
                    className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:bg-white focus:outline-none focus:border-[#14532d] focus:ring-1 focus:ring-[#14532d]/20 transition-all"
                  />
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Your Email *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="anand@example.com"
                    className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:bg-white focus:outline-none focus:border-[#14532d] focus:ring-1 focus:ring-[#14532d]/20 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Phone Number (Optional)</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 99222 71777"
                    className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:bg-white focus:outline-none focus:border-[#14532d] focus:ring-1 focus:ring-[#14532d]/20 transition-all"
                  />
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Inquiry Topic</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:bg-white focus:outline-none focus:border-[#14532d] focus:ring-1 focus:ring-[#14532d]/20 transition-all cursor-pointer"
                  >
                    <option value="General Query">General Trust Information</option>
                    <option value="Impact Passport">Impact Passport Audit & Verification</option>
                    <option value="Donation Help">Donation & Receipt Verification</option>
                    <option value="Volunteer Fellowship">Volunteer Fellowship</option>
                    <option value="Educational Support">Educational & Student Support</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Subject *</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Brief summary of inquiry..."
                  className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:bg-white focus:outline-none focus:border-[#14532d] focus:ring-1 focus:ring-[#14532d]/20 transition-all"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Message *</label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message here..."
                  className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:bg-white focus:outline-none focus:border-[#14532d] focus:ring-1 focus:ring-[#14532d]/20 transition-all"
                />
              </div>

              <div className="pt-2 flex items-center justify-between flex-wrap gap-2">
                <span className="text-[11px] text-stone-500">
                  Protected by anti-spam verification. By sending, you accept our{' '}
                  <a href="/privacy" className="text-[#14532d] underline">Privacy Policy</a>.
                </span>
                <Button
                  type="submit"
                  size="md"
                  variant="primary"
                  disabled={isSubmitting}
                  isLoading={isSubmitting}
                  className="bg-[#14532d] hover:bg-[#0f4023] text-white px-5 py-2.5"
                  leftIcon={<Send className="w-3.5 h-3.5" />}
                >
                  Transmit Message
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Office & Secretariat Details (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-gradient-to-br from-[#0c2e19] via-[#082212] to-[#04170c] text-white rounded-2xl p-6 sm:p-7 border border-emerald-900/80 shadow-md space-y-5">
            <div className="flex items-center justify-between border-b border-emerald-800/80 pb-3.5">
              <div>
                <h3 className="text-lg font-serif font-bold text-white">Trust Registered Office</h3>
                <p className="text-[11px] text-amber-300 font-mono mt-0.5">
                  Reg: {regNumber}
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs text-stone-300">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-900/80 border border-emerald-700/60 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4 text-amber-300" />
                </div>
                <div>
                  <div className="font-semibold text-white">Registered Address</div>
                  <div className="text-stone-300 text-xs mt-0.5 leading-relaxed">{address}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-900/80 border border-emerald-700/60 flex items-center justify-center shrink-0 mt-0.5">
                  <Phone className="w-4 h-4 text-amber-300" />
                </div>
                <div>
                  <div className="font-semibold text-white">Public Desk Phone</div>
                  <div className="flex flex-wrap items-center gap-1.5 text-stone-300 text-xs mt-0.5">
                    <a
                      href="tel:9922271777"
                      className="hover:text-amber-300 transition-colors underline-offset-2 hover:underline"
                    >
                      9922271777
                    </a>
                    <span className="text-stone-500">/</span>
                    <a
                      href="tel:7588833127"
                      className="hover:text-amber-300 transition-colors underline-offset-2 hover:underline"
                    >
                      7588833127
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-900/80 border border-emerald-700/60 flex items-center justify-center shrink-0 mt-0.5">
                  <Mail className="w-4 h-4 text-amber-300" />
                </div>
                <div>
                  <div className="font-semibold text-white">Secretariat Email</div>
                  <div className="text-stone-300 text-xs mt-0.5">
                    <a
                      href={`mailto:${emailAddress}`}
                      className="hover:text-amber-300 transition-colors underline-offset-2 hover:underline break-all"
                    >
                      {emailAddress}
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-900/80 border border-emerald-700/60 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-amber-300" />
                </div>
                <div>
                  <div className="font-semibold text-white">Public Desk Timings</div>
                  <div className="text-stone-300 text-xs mt-0.5">{officeHours}</div>
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-emerald-950/80 rounded-xl border border-emerald-800/60 text-[11px] text-stone-300 leading-relaxed">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-300 inline mr-1.5" />
              <strong>Official Notice:</strong> In-person visits and documentation inquiries may be coordinated during scheduled public desk timings.
            </div>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#14532d] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Guidance & FAQ
          </span>
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 mt-2.5">
            Frequently Asked Questions
          </h3>
        </div>

        <div className="space-y-3">
          {activeFaqList.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-stone-200/90 overflow-hidden hover:border-emerald-700/30 transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 font-serif font-bold text-stone-900 text-xs sm:text-sm hover:text-[#14532d] cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-stone-400 shrink-0 transition-transform ${
                      isOpen ? "rotate-180 text-[#14532d]" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-xs sm:text-sm text-stone-600 leading-relaxed border-t border-stone-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  </>
);
};
