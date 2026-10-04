import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  ShieldCheck,
  Bot,
  User,
  Heart,
  HelpCircle,
  Clock,
  MapPin,
  ExternalLink,
} from "lucide-react";
import { useKumbhMode } from "@/src/context/KumbhModeContext";
import { TRUST_INFO } from "@/src/data/mockData";

interface ChatMessage {
  id: string;
  sender: "bot" | "user";
  text: string;
  time: string;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "msg-1",
    sender: "bot",
    text: "Namaste! I am SevaSahayak, your verified assistant for Siddhivinayak Charitable Trust. How may I assist your charitable journey today?",
    time: "Just now",
  },
];

export const Chatbot: React.FC = () => {
  const { isKumbhMode } = useKumbhMode();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputVal, setInputVal] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    "How do donation receipts work?",
    "How can I track my donation?",
    "How to volunteer?",
    "Where is the trust office?",
    ...(isKumbhMode ? ["Tell me about Kumbh Seva 2027"] : []),
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const generateAnswer = (query: string): string => {
    const q = query.toLowerCase();

    if (q.includes("80g") || q.includes("tax") || q.includes("receipt") || q.includes("deduction")) {
      return "All donations to Icchapurti Riddhi Siddhi Vinayak Charitable Trust receive an official donation receipt with our registration number (E-9389 / Nashik). Tax exemption status under Section 80G is subject to verification of the Trust's current statutory documentation and filings.";
    }

    if (q.includes("track") || q.includes("passport") || q.includes("audit") || q.includes("rupee")) {
      return "Through our unique Impact Passport framework, your contribution is tracked across 4 stages: Donation → Allocation → Verification → Field Impact. You can enter your receipt docket number anytime on the Impact Passport page to view the audit record.";
    }

    if (q.includes("volunteer") || q.includes("join") || q.includes("work")) {
      return "We welcome volunteers across Education, Medical Camps, Hospital Kitchens, and Field Audits! Visit the Volunteer page to view open weekend roles and submit your registration.";
    }

    if (q.includes("office") || q.includes("timing") || q.includes("address") || q.includes("contact") || q.includes("phone")) {
      return `Our central office is located at: ${TRUST_INFO.address}. Office hours are ${TRUST_INFO.officeHours}. You can also call us at ${TRUST_INFO.phone}.`;
    }

    if (q.includes("kumbh") || q.includes("nashik") || q.includes("simhastha") || q.includes("ramkund")) {
      return "For the upcoming Nashik–Trimbakeshwar Simhastha Kumbh 2027, our trust is organizing preparatory civic seva including 24/7 free Annachhatras (satvik meals), 50 pure RO drinking water kiosks, and ghat cleanliness marshals. Check out our Kumbh Seva page for details!";
    }

    if (q.includes("help") || q.includes("patient") || q.includes("apply") || q.includes("surgery") || q.includes("fees")) {
      return "Families facing acute medical distress or student fee hardships can submit an aid petition under our 'Request Help' portal. Each request is physically verified by an empanelled trust officer.";
    }

    return "Thank you for reaching out. As a trust information assistant, I can answer queries regarding donation receipts, our 4-stage Impact Passport, volunteer opportunities, help requests, and office timings. What would you like to know?";
  };

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputVal;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: "user",
      text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal("");
    setIsTyping(true);

    setTimeout(() => {
      const botResponse = generateAnswer(text);
      const botMsg: ChatMessage = {
        id: `b-${Date.now()}`,
        sender: "bot",
        text: botResponse,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 550);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-5 right-5 z-40">
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="w-13 h-13 rounded-full bg-[#14532d] text-white shadow-lg hover:bg-[#0f4023] flex items-center justify-center border-2 border-amber-300/40 relative cursor-pointer focus:outline-none"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          aria-label="Open Trust Assistant Chatbot"
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <>
              <MessageSquare className="w-6 h-6 text-white" />
              <span className="absolute top-0 right-0 w-3 h-3 bg-amber-400 rounded-full border-2 border-[#14532d]" />
            </>
          )}
        </motion.button>
      </div>

      {/* Chat Window Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.22 }}
            className="fixed bottom-20 right-4 sm:right-6 w-[calc(100vw-32px)] sm:w-96 max-h-[520px] bg-white rounded-2xl shadow-2xl border border-stone-200 z-50 flex flex-col overflow-hidden text-stone-900"
          >
            {/* Header */}
            <div className="bg-[#133c2a] text-white p-4 flex items-center justify-between border-b border-emerald-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-700/80 border border-amber-300/40 flex items-center justify-center text-amber-300 text-xs font-bold">
                  सेवा
                </div>
                <div>
                  <h3 className="font-serif font-bold text-sm text-white flex items-center gap-1.5">
                    <span>SevaSahayak</span>
                    <span className="text-[10px] bg-emerald-950 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-700">
                      Verified
                    </span>
                  </h3>
                  <p className="text-[11px] text-emerald-200/80">Trust Information Assistant</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-stone-300 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Transparency Mandate Notice */}
            <div className="bg-stone-50 px-3 py-2 border-b border-stone-200 text-[10px] text-stone-600 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span>Answers are based strictly on information approved by the trust.</span>
            </div>

            {/* Message Feed */}
            <div className="flex-1 p-3.5 space-y-3 overflow-y-auto max-h-[290px] text-xs">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-2 ${m.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  {m.sender === "bot" && (
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                      ॐ
                    </div>
                  )}
                  <div
                    className={`p-3 rounded-xl max-w-[82%] leading-relaxed ${
                      m.sender === "user"
                        ? "bg-[#14532d] text-white rounded-br-none"
                        : "bg-stone-100 text-stone-800 border border-stone-200 rounded-bl-none"
                    }`}
                  >
                    {m.text}
                    <div
                      className={`text-[9px] mt-1 text-right ${
                        m.sender === "user" ? "text-emerald-200" : "text-stone-400"
                      }`}
                    >
                      {m.time}
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-1.5 text-stone-400 text-xs pl-8">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.4s]" />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompt Pills */}
            <div className="p-2 border-t border-stone-100 bg-stone-50 flex gap-1.5 overflow-x-auto whitespace-nowrap text-[11px] no-scrollbar">
              {quickPrompts.map((qp, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSend(qp)}
                  className="px-2.5 py-1 bg-white hover:bg-emerald-50 border border-stone-200 hover:border-emerald-300 text-stone-700 hover:text-emerald-900 rounded-full shrink-0 transition-colors cursor-pointer"
                >
                  {qp}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-2.5 border-t border-stone-200 bg-white flex items-center gap-2"
            >
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Ask about receipts, passport, timings..."
                className="flex-1 px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 bg-stone-50/50"
              />
              <button
                type="submit"
                className="bg-[#14532d] hover:bg-[#0f4023] text-white p-2 h-8 w-8 rounded-lg flex items-center justify-center shrink-0 cursor-pointer"
                aria-label="Send message"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
