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

const FAQS = [
  {
    q: "What is the Impact Passport and how does it prevent fund leakage?",
    a: "The Impact Passport is our structured tracking mechanism. Rather than blending donations into an opaque general pool, each pledge is tagged with an indexed audit ID. Donors follow their funds through four stages: Donation receipt, vendor allocation, independent field audit, and monitored beneficiary outcome.",
  },
  {
    q: "Are donations eligible for statutory deduction?",
    a: "Tax exemption under Section 80G is subject to verification of the Trust's current official documentation (Form 10AC reference E-9389 / Nashik). Donors receive numbered donation receipts for their contributions with clear audit references.",
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
  const { t } = useLanguage();
  const { trustProfile } = useTrust();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("General Query");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const regNumber = trustProfile?.registrationDetails?.registrationNumber || "E-9389 / Nashik";
  const address = trustProfile?.address || "7, Pokar Avenue, Nandanvan Garden Apartment, Nashik, Maharashtra, India, PIN 422004";
  const phone = trustProfile?.phone || "0253 6029200 / 0253 6018200";
  const emailAddress = trustProfile?.email || "contact@siddhivinayaktrust.org";
  const officeHours = trustProfile?.officeHours || "Mon - Sat: 9:30 AM - 5:30 PM IST";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    }, 500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#14532d] bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-700/20">
            Trust Liaison Desk
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 tracking-tight">
          Connect with Our Secretariat
        </h1>
        <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
          Have questions regarding program allocations, passport verifications, or campus partnerships?
          Our trustees and coordinators are available to assist.
        </p>
      </div>

      {/* Main Grid: Form + Trust Office Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Contact Form (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-md p-6 sm:p-7 border border-stone-200 shadow-2xs">
          <h2 className="text-lg font-serif font-bold text-stone-900 mb-5">Send an Official Inquiry</h2>

          {submitted ? (
            <div className="py-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#14532d] flex items-center justify-center mx-auto border border-emerald-700/20">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-serif font-bold text-stone-900">Inquiry Dispatched Successfully!</h3>
              <p className="text-xs text-stone-600 max-w-md mx-auto">
                Thank you. Your message has been dispatched to our secretariat desk. A trust coordinator will respond promptly.
              </p>
              <div className="pt-2">
                <Button size="sm" variant="outline" onClick={() => setSubmitted(false)}>
                  Send Another Inquiry
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Anand R."
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-[#14532d]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Your Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="anand@example.com"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-[#14532d]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Inquiry Topic</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-[#14532d]"
                  >
                    <option value="General Query">General Trust Information</option>
                    <option value="Impact Passport">Impact Passport Audit & Verification</option>
                    <option value="Donation Help">Donation & Receipt Verification</option>
                    <option value="Volunteer Fellowship">Volunteer Fellowship</option>
                    <option value="Educational Support">Educational & Student Support</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Brief summary of inquiry..."
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-[#14532d]"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Message</label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message here..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-[#14532d]"
                />
              </div>

              <div className="pt-1 flex items-center justify-end flex-wrap gap-2">
                <Button
                  type="submit"
                  size="md"
                  variant="primary"
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
          <div className="bg-[#062c1c] text-white rounded-md p-6 border border-emerald-900 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-emerald-800/80 pb-3">
              <div>
                <h3 className="text-base font-serif font-bold text-white">Trust Registered Office</h3>
                <p className="text-[11px] text-amber-300 font-mono mt-0.5">
                  Reg: {regNumber}
                </p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs text-stone-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-white">Registered Address</div>
                  <div className="text-stone-300 text-xs mt-0.5 leading-relaxed">{address}</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-300 shrink-0" />
                <div>
                  <div className="font-semibold text-white">Public Desk Phone</div>
                  <div className="text-stone-300 text-xs mt-0.5">{phone}</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-300 shrink-0" />
                <div>
                  <div className="font-semibold text-white">Secretariat Email</div>
                  <div className="text-stone-300 text-xs mt-0.5">{emailAddress}</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-amber-300 shrink-0" />
                <div>
                  <div className="font-semibold text-white">Public Desk Timings</div>
                  <div className="text-stone-300 text-xs mt-0.5">{officeHours}</div>
                </div>
              </div>
            </div>

            <div className="p-3 bg-emerald-950/80 rounded border border-emerald-800/60 text-[11px] text-stone-300 leading-relaxed">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-300 inline mr-1" />
              <strong>Official Notice:</strong> In-person visits and documentation inquiries may be coordinated during scheduled public desk timings.
            </div>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="bg-white border border-stone-200 rounded-md p-6 sm:p-8 shadow-2xs space-y-5">
        <div className="max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#14532d] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-700/20">
            Guidance & FAQ
          </span>
          <h3 className="text-xl font-serif font-bold text-stone-900 mt-2">
            Frequently Asked Questions
          </h3>
        </div>

        <div className="space-y-2">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded border border-stone-200 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-3.5 text-left flex items-center justify-between gap-4 font-serif font-bold text-stone-900 text-xs sm:text-sm hover:text-[#14532d] cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-stone-400 shrink-0 transition-transform ${
                      isOpen ? "rotate-180 text-[#14532d]" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-3.5 pb-3.5 text-xs text-stone-600 leading-relaxed border-t border-stone-100 pt-2.5">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
