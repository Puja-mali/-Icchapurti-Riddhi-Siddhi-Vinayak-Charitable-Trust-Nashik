import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import {
  Heart,
  ShieldCheck,
  Search,
  ArrowRight,
  ChevronDown,
  Flame,
  CheckCircle2,
  Volume2,
  VolumeX,
  RotateCcw,
  FastForward,
  UserPlus,
  Play,
  Utensils,
  Stethoscope,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { Button } from "@/src/components/common/Button";
import { useLanguage } from "@/src/context/LanguageContext";
import { useKumbhMode } from "@/src/context/KumbhModeContext";

const HAS_SEEN_WELCOME_KEY = "hasSeenWelcome";
const LEGACY_STORAGE_KEY = "hasVisitedTrustWebsite";

export const HeroNamaste: React.FC = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { isKumbhMode } = useKumbhMode();
  const shouldReduceMotion = useReducedMotion();
  const [searchPassportId, setSearchPassportId] = useState("");

  // ================= WELCOME INTERACTION STATE =================
  const [hasSeenWelcome, setHasSeenWelcome] = useState<boolean>(() => {
    try {
      return (
        localStorage.getItem(HAS_SEEN_WELCOME_KEY) === "true" ||
        localStorage.getItem(LEGACY_STORAGE_KEY) === "true"
      );
    } catch {
      return false;
    }
  });

  // Welcome interaction steps:
  // 0 = Initial mount / autoplay pending
  // 1 = Sentence 1: Respectful greeting + speech + typewriter
  // 2 = Brief conversational pause & transition
  // 3 = Sentence 2: Helpful invitation + speech + typewriter
  // 4 = Welcome finished (steady state)
  const [welcomeStep, setWelcomeStep] = useState<number>(() => (hasSeenWelcome ? 4 : 0));
  const [displayedText, setDisplayedText] = useState<string>("");
  const [isAudioSpeaking, setIsAudioSpeaking] = useState<boolean>(false);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const [autoplayBlocked, setAutoplayBlocked] = useState<boolean>(false);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);

  const heroSectionRef = useRef<HTMLElement>(null);
  const typewriterTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Mandated welcome sentences
  const getSentence1 = useCallback(() => {
    if (language === "mr") {
      return "नमस्कार! सिद्धिविनायक चॅरिटेबल ट्रस्टमध्ये आपले मनःपूर्वक स्वागत आहे.";
    }
    if (language === "hi") {
      return "नमस्ते! सिद्धिविनायक चैरिटेबल ट्रस्ट में आपका हार्दिक स्वागत है।";
    }
    return "Namaste! A warm welcome to Siddhivinayak Charitable Trust.";
  }, [language]);

  const getSentence2 = useCallback(() => {
    if (language === "mr") {
      return "आपण आज कोणत्या सेवेसाठी आला आहात?";
    }
    if (language === "hi") {
      return "आज हम आपकी क्या सेवा कर सकते हैं?";
    }
    return "How may we help you today?";
  }, [language]);

  const SENTENCE_1 = getSentence1();
  const SENTENCE_2 = getSentence2();

  // Helper to safely stop any ongoing speech synthesis
  const stopSpeech = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Ignore errors
      }
    }
    setIsAudioSpeaking(false);
  }, []);

  // Complete and record welcome
  const completeWelcome = useCallback(() => {
    stopSpeech();
    setWelcomeStep(4);
    try {
      localStorage.setItem(HAS_SEEN_WELCOME_KEY, "true");
      localStorage.setItem(LEGACY_STORAGE_KEY, "true");
    } catch {
      // Ignore errors
    }
  }, [stopSpeech]);

  // Robust Speech Synthesis with Marathi / Indian regional voice priority
  const speakText = useCallback(
    (text: string, onEndCallback?: () => void) => {
      if (
        typeof window === "undefined" ||
        !("speechSynthesis" in window) ||
        !voiceEnabled
      ) {
        if (onEndCallback) {
          setTimeout(onEndCallback, 1400);
        }
        return;
      }

      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);

        if (language === "mr") {
          utterance.lang = "mr-IN";
        } else if (language === "hi") {
          utterance.lang = "hi-IN";
        } else {
          utterance.lang = "en-IN";
        }

        utterance.rate = language === "mr" ? 0.9 : 0.95;
        utterance.pitch = 1.05;

        // Select regional Indian voice
        const voices = window.speechSynthesis.getVoices();
        let selectedVoice: SpeechSynthesisVoice | undefined;

        if (language === "mr") {
          selectedVoice =
            voices.find((v) => v.lang.startsWith("mr") && /female|priya|neerja|lekha/i.test(v.name)) ||
            voices.find((v) => v.lang.startsWith("mr")) ||
            voices.find((v) => v.lang.startsWith("hi") && /female|priya|swara/i.test(v.name)) ||
            voices.find((v) => v.lang.startsWith("hi"));
        } else if (language === "hi") {
          selectedVoice =
            voices.find((v) => v.lang.startsWith("hi") && /female|priya|swara/i.test(v.name)) ||
            voices.find((v) => v.lang.startsWith("hi"));
        } else {
          selectedVoice =
            voices.find((v) => v.lang.startsWith("en-IN") && /female/i.test(v.name)) ||
            voices.find((v) => v.lang.startsWith("en-IN")) ||
            voices.find((v) => v.lang.startsWith("en") && /female/i.test(v.name));
        }

        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }

        utterance.onstart = () => {
          setIsAudioSpeaking(true);
          setAutoplayBlocked(false);
        };

        utterance.onend = () => {
          setIsAudioSpeaking(false);
          if (onEndCallback) onEndCallback();
        };

        utterance.onerror = (event) => {
          setIsAudioSpeaking(false);
          if (event.error === "not-allowed") {
            setAutoplayBlocked(true);
          }
          if (onEndCallback) onEndCallback();
        };

        window.speechSynthesis.speak(utterance);
      } catch {
        setIsAudioSpeaking(false);
        if (onEndCallback) onEndCallback();
      }
    },
    [language, voiceEnabled]
  );

  // Typewriter streaming helper
  const streamText = useCallback((fullText: string, onComplete?: () => void) => {
    let charIdx = 0;
    setDisplayedText("");
    if (typewriterTimeoutRef.current) clearInterval(typewriterTimeoutRef.current);

    typewriterTimeoutRef.current = setInterval(() => {
      charIdx++;
      setDisplayedText(fullText.slice(0, charIdx));
      if (charIdx >= fullText.length) {
        if (typewriterTimeoutRef.current) clearInterval(typewriterTimeoutRef.current);
        if (onComplete) onComplete();
      }
    }, 28);
  }, []);

  // Main welcome sequence orchestrator
  const startWelcomeSequence = useCallback(
    (withAudio: boolean = true) => {
      stopSpeech();
      setAutoplayBlocked(false);
      setWelcomeStep(1);

      const s1 = getSentence1();
      const s2 = getSentence2();

      streamText(s1);

      if (withAudio && voiceEnabled) {
        speakText(s1, () => {
          setWelcomeStep(2);
          setTimeout(() => {
            setWelcomeStep(3);
            streamText(s2);
            speakText(s2, () => {
              setTimeout(() => {
                completeWelcome();
              }, 600);
            });
          }, 600);
        });
      } else {
        setTimeout(() => {
          setWelcomeStep(2);
          setTimeout(() => {
            setWelcomeStep(3);
            streamText(s2, () => {
              setTimeout(() => {
                completeWelcome();
              }, 800);
            });
          }, 500);
        }, s1.length * 30 + 400);
      }
    },
    [completeWelcome, getSentence1, getSentence2, speakText, stopSpeech, streamText, voiceEnabled]
  );

  // Handle voices loaded asynchronously by browser
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const loadVoices = () => {
      window.speechSynthesis.getVoices();
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Ignore
      }
    };
  }, []);

  // Automatic welcome on first visit
  useEffect(() => {
    if (!hasSeenWelcome) {
      const autoTimer = setTimeout(() => {
        try {
          startWelcomeSequence(true);
        } catch {
          setAutoplayBlocked(true);
        }
      }, 450);

      return () => clearTimeout(autoTimer);
    }
  }, [hasSeenWelcome, startWelcomeSequence]);

  // When user scrolls away from hero: stop voice and mark welcome completed
  useEffect(() => {
    if (!heroSectionRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            stopSpeech();
            try {
              localStorage.setItem(HAS_SEEN_WELCOME_KEY, "true");
              localStorage.setItem(LEGACY_STORAGE_KEY, "true");
            } catch {
              // Ignore
            }
            setHasSeenWelcome(true);
          }
        });
      },
      { threshold: 0.05 }
    );

    observer.observe(heroSectionRef.current);
    return () => observer.disconnect();
  }, [stopSpeech]);

  // Window scroll fallback listener
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 250) {
        if (isAudioSpeaking) {
          stopSpeech();
        }
        try {
          localStorage.setItem(HAS_SEEN_WELCOME_KEY, "true");
          localStorage.setItem(LEGACY_STORAGE_KEY, "true");
        } catch {
          // Ignore
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isAudioSpeaking, stopSpeech]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typewriterTimeoutRef.current) {
        clearInterval(typewriterTimeoutRef.current);
      }
      stopSpeech();
    };
  }, [stopSpeech]);

  // Synchronize displayed text when language toggles
  useEffect(() => {
    if (welcomeStep === 4) {
      setDisplayedText(getSentence2());
    } else if (welcomeStep === 1 || welcomeStep === 2) {
      setDisplayedText(getSentence1());
    } else if (welcomeStep === 3) {
      setDisplayedText(getSentence2());
    }
  }, [getSentence1, getSentence2, language, welcomeStep]);

  // User Actions
  const toggleVoice = () => {
    if (isAudioSpeaking) {
      stopSpeech();
      setVoiceEnabled(false);
      setVoiceNotice(language === "mr" ? "ध्वनी बंद केला" : "Audio Muted");
      setTimeout(() => setVoiceNotice(null), 2000);
    } else {
      setVoiceEnabled(true);
      const currentText = welcomeStep === 3 ? SENTENCE_2 : `${SENTENCE_1} ${SENTENCE_2}`;
      speakText(currentText);
      setVoiceNotice(language === "mr" ? "ध्वनी सुरू" : "Voice Playing");
      setTimeout(() => setVoiceNotice(null), 2000);
    }
  };

  const handleSkipWelcome = () => {
    completeWelcome();
    setHasSeenWelcome(true);
  };

  const handleReplayWelcome = () => {
    setHasSeenWelcome(false);
    startWelcomeSequence(true);
  };

  const handleSearchPassport = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchPassportId.trim()) {
      navigate(`/impact-passport?id=${encodeURIComponent(searchPassportId.trim())}`);
    } else {
      navigate(`/impact-passport`);
    }
  };

  const scrollToExplore = () => {
    const nextSection = document.getElementById("trust-stats-section");
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Reusable Docket Search and Trust Pillars Component
  const renderDocketAndPillars = () => (
    <div className="space-y-3 pt-1 w-full max-w-xl">
      {/* Verifiable Docket Search Field */}
      <div>
        <form
          onSubmit={handleSearchPassport}
          className="bg-white p-1 rounded-lg border border-stone-300 shadow-2xs hover:border-emerald-700/60 focus-within:border-emerald-700 focus-within:ring-2 focus-within:ring-emerald-700/20 transition-all flex flex-col sm:flex-row gap-1.5 sm:gap-2 items-center"
        >
          <div className="relative flex-1 w-full min-w-0">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 shrink-0 pointer-events-none" />
            <input
              type="text"
              value={searchPassportId}
              onChange={(e) => setSearchPassportId(e.target.value)}
              placeholder={t.hero.searchPassportPlaceholder}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm text-stone-800 placeholder-stone-400 bg-transparent focus:outline-none"
            />
          </div>
          <Button
            type="submit"
            size="sm"
            variant="secondary"
            className="w-full sm:w-auto text-xs px-3 sm:px-4 h-8.5 sm:h-9 bg-stone-900 text-white hover:bg-stone-800 shrink-0 cursor-pointer justify-center"
          >
            {t.hero.trackImpact}
          </Button>
        </form>

        <div className="flex items-center justify-between flex-wrap gap-1 text-[10px] sm:text-[11px] text-stone-500 mt-1.5 px-0.5">
          <span>
            Sample:{" "}
            <button
              type="button"
              onClick={() => setSearchPassportId("SCT-PASS-2025-0812")}
              className="text-[#14532d] font-mono font-semibold underline hover:text-emerald-950 cursor-pointer"
            >
              SCT-PASS-2025-0812
            </button>
          </span>
          <Link
            to="/impact-passport"
            className="text-stone-600 hover:text-[#14532d] underline font-medium"
          >
            {t.passportJourneyTitle} →
          </Link>
        </div>
      </div>

      {/* Quick 3-point Trust Pillars */}
      <div className="pt-2 border-t border-stone-200/80 text-[11px] sm:text-xs text-stone-600 grid grid-cols-1 xs:grid-cols-3 gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#14532d] shrink-0" />
          <span className="truncate">Reg. No. E-9389 / Nashik</span>
        </div>
        <div className="flex items-center gap-1.5 min-w-0">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#14532d] shrink-0" />
          <span className="truncate">Direct Grassroots Seva</span>
        </div>
        <div className="flex items-center gap-1.5 min-w-0">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#14532d] shrink-0" />
          <span className="truncate">Itemized Public Records</span>
        </div>
      </div>
    </div>
  );

  // Clean, Text-Based Dignified Welcome & Seva Hub Card
  const renderWelcomeHub = () => (
    <div className="w-full rounded-2xl bg-gradient-to-br from-[#0c2819] via-[#0f3421] to-[#14422b] border border-emerald-700/40 text-white shadow-md p-3.5 sm:p-5 text-left space-y-3 relative overflow-hidden">
      {/* Subtle Inner Ambient Glow */}
      <div className="absolute top-0 right-0 w-44 h-44 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-36 h-36 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />

      {/* Card Header: Welcome Badge, Speaking Status & Controls */}
      <div className="flex items-center justify-between border-b border-emerald-700/50 pb-2.5 text-xs gap-2 relative z-10">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-base leading-none select-none">🙏</span>
          <div className="min-w-0">
            <span className="text-amber-300 font-serif font-bold text-xs sm:text-sm block truncate">
              {language === "mr" ? "सस्नेह स्वागत कक्ष" : "Namaste • Welcome"}
            </span>
            <span className="text-[10px] text-emerald-300/80 block truncate">
              {language === "mr" ? "सिद्धिविनायक सेवा दालन" : "Siddhivinayak Seva Hub"}
            </span>
          </div>
        </div>

        {/* Voice and Audio Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Mute / Unmute */}
          <button
            type="button"
            onClick={toggleVoice}
            title={voiceEnabled ? t.hero.voiceOff : t.hero.voiceOn}
            aria-label={voiceEnabled ? t.hero.voiceOff : t.hero.voiceOn}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
              isAudioSpeaking
                ? "bg-amber-400/20 text-amber-200 border border-amber-400/50 shadow-xs"
                : "bg-emerald-900/70 text-emerald-200 hover:text-white border border-emerald-600/40"
            }`}
          >
            {isAudioSpeaking ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-amber-300 animate-pulse shrink-0" />
                <span className="hidden xs:inline">{t.hero.voiceOn}</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                <span className="hidden xs:inline">{t.hero.voiceOff}</span>
              </>
            )}
          </button>

          {/* Skip Welcome */}
          {welcomeStep < 4 && (
            <button
              type="button"
              onClick={handleSkipWelcome}
              aria-label={t.hero.skip}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium bg-emerald-900/80 hover:bg-emerald-800 text-stone-200 border border-emerald-600/40 cursor-pointer"
            >
              <span>{t.hero.skip}</span>
              <FastForward className="w-3 h-3 shrink-0" />
            </button>
          )}

          {/* Replay Welcome Button */}
          {welcomeStep === 4 && (
            <button
              type="button"
              onClick={handleReplayWelcome}
              aria-label={t.hero.replay}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium bg-amber-500/20 text-amber-200 hover:text-white border border-amber-400/40 cursor-pointer"
              title="Replay Welcome"
            >
              <RotateCcw className="w-3 h-3 shrink-0" />
              <span>{t.hero.replay}</span>
            </button>
          )}
        </div>
      </div>

      {/* Dynamic Typewriter / Welcome Speech Area */}
      <div className="relative z-10 min-h-[58px] sm:min-h-[64px] flex flex-col justify-center bg-black/25 rounded-xl p-3 border border-emerald-800/40">
        {welcomeStep === 0 && (
          <div className="space-y-1">
            <p className="text-xs sm:text-[13px] text-amber-100 font-medium leading-relaxed">
              {SENTENCE_1}
            </p>
            <p className="text-[11px] text-emerald-200/90 font-sans">
              {SENTENCE_2}
            </p>
          </div>
        )}

        {(welcomeStep === 1 || welcomeStep === 2) && (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] text-amber-300 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              <span>{language === "mr" ? "स्वागत संदेश..." : "Welcome greeting..."}</span>
            </div>
            <p className="text-xs sm:text-[13px] text-amber-100 font-medium leading-relaxed">
              {displayedText || SENTENCE_1}
            </p>
          </div>
        )}

        {(welcomeStep === 3 || welcomeStep === 4) && (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] text-emerald-300 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>{language === "mr" ? "सेवा आमंत्रण" : "Direct Seva Inquiries"}</span>
            </div>
            <p className="text-xs sm:text-[13px] text-amber-200 font-semibold leading-relaxed">
              {displayedText || SENTENCE_2}
            </p>
          </div>
        )}

        {/* Autoplay Blocked Fallback Action */}
        {autoplayBlocked && welcomeStep === 0 && (
          <div className="mt-2 pt-2 border-t border-emerald-800/40 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => startWelcomeSequence(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-xs cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5 shrink-0" />
              <span>{language === "mr" ? "स्वागत संदेश ऐका" : "Listen Welcome Audio"}</span>
              <Play className="w-3 h-3 fill-current shrink-0" />
            </button>
            <button
              type="button"
              onClick={handleSkipWelcome}
              className="text-[10px] text-stone-300 hover:text-white underline cursor-pointer"
            >
              {t.hero.skip}
            </button>
          </div>
        )}
      </div>

      {/* Direct Quick Seva Action Hub: 4 High-Visibility Buttons */}
      <div className="space-y-1.5 relative z-10 pt-1">
        <div className="text-[11px] font-semibold text-emerald-200 uppercase tracking-wider flex items-center justify-between">
          <span>{language === "mr" ? "थेट सेवा पर्याय" : "Quick Seva Actions"}</span>
          <Sparkles className="w-3 h-3 text-amber-300 shrink-0" />
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* 1. Food / Annachhatra */}
          <Link
            to="/causes?category=Food%20%26%20Nutrition"
            className="flex items-center gap-2 p-2 rounded-lg bg-emerald-950/70 hover:bg-emerald-900 text-emerald-100 hover:text-white border border-emerald-700/40 text-xs transition-colors group cursor-pointer"
          >
            <div className="w-6 h-6 rounded bg-emerald-800/80 text-amber-300 flex items-center justify-center shrink-0">
              <Utensils className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 text-left">
              <span className="font-semibold block truncate leading-tight text-white group-hover:text-amber-200">
                {t.hero.directSevaFood}
              </span>
              <span className="text-[10px] text-emerald-300/80 block truncate">
                {language === "mr" ? "अन्नदान सेवा" : "Daily Meals"}
              </span>
            </div>
          </Link>

          {/* 2. Healthcare / Medical */}
          <Link
            to="/causes?category=Medical%20Support"
            className="flex items-center gap-2 p-2 rounded-lg bg-emerald-950/70 hover:bg-emerald-900 text-emerald-100 hover:text-white border border-emerald-700/40 text-xs transition-colors group cursor-pointer"
          >
            <div className="w-6 h-6 rounded bg-emerald-800/80 text-cyan-300 flex items-center justify-center shrink-0">
              <Stethoscope className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 text-left">
              <span className="font-semibold block truncate leading-tight text-white group-hover:text-amber-200">
                {t.hero.directSevaHealth}
              </span>
              <span className="text-[10px] text-emerald-300/80 block truncate">
                {language === "mr" ? "आरोग्य शिबिरे" : "Health Relief"}
              </span>
            </div>
          </Link>

          {/* 3. Education Support */}
          <Link
            to="/causes?category=Education"
            className="flex items-center gap-2 p-2 rounded-lg bg-emerald-950/70 hover:bg-emerald-900 text-emerald-100 hover:text-white border border-emerald-700/40 text-xs transition-colors group cursor-pointer"
          >
            <div className="w-6 h-6 rounded bg-emerald-800/80 text-amber-300 flex items-center justify-center shrink-0">
              <GraduationCap className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 text-left">
              <span className="font-semibold block truncate leading-tight text-white group-hover:text-amber-200">
                {t.hero.directSevaEdu}
              </span>
              <span className="text-[10px] text-emerald-300/80 block truncate">
                {language === "mr" ? "शैक्षणिक मदत" : "Scholarships"}
              </span>
            </div>
          </Link>

          {/* 4. Volunteer Portal */}
          <Link
            to="/volunteer"
            className="flex items-center gap-2 p-2 rounded-lg bg-amber-950/70 hover:bg-amber-900 text-amber-100 hover:text-white border border-amber-600/40 text-xs transition-colors group cursor-pointer"
          >
            <div className="w-6 h-6 rounded bg-amber-800/80 text-amber-200 flex items-center justify-center shrink-0">
              <UserPlus className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 text-left">
              <span className="font-semibold block truncate leading-tight text-white group-hover:text-amber-200">
                {t.hero.directSevaVol}
              </span>
              <span className="text-[10px] text-amber-300/80 block truncate">
                {language === "mr" ? "सहभागी व्हा" : "Join Hands"}
              </span>
            </div>
          </Link>
        </div>
      </div>

      {/* Discrete Audio Notice Toast */}
      {voiceNotice && (
        <div className="text-[11px] text-amber-300 font-medium pt-1 text-center bg-black/30 rounded py-0.5 border border-amber-400/20">
          {voiceNotice}
        </div>
      )}
    </div>
  );

  return (
    <section
      ref={heroSectionRef}
      className="relative bg-[#fcfbf9] border-b border-stone-200/80 pt-4 sm:pt-8 md:pt-10 lg:pt-12 pb-8 sm:pb-12 md:pb-16 lg:pb-20 overflow-hidden text-stone-900 w-full"
    >
      {/* Subtle Natural Ambient Depth Gradient */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[380px] sm:w-[480px] h-[320px] rounded-full bg-emerald-50/50 blur-3xl" />
        <div className="absolute bottom-6 left-6 w-[280px] sm:w-[350px] h-[250px] rounded-full bg-amber-50/40 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative z-10 w-full">
        {/* ========================================================================= */}
        {/* DESKTOP & TABLET VIEW (md and up): 2-COLUMN BALANCED LAYOUT */}
        {/* ========================================================================= */}
        <div className="hidden md:grid md:grid-cols-12 gap-6 lg:gap-10 items-start">
          {/* Left Column: Heading, description, primary CTAs, docket search */}
          <motion.div
            className="md:col-span-7 space-y-4 sm:space-y-5 text-left"
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Top Civic & Cultural Badge */}
            <div className="inline-flex items-center gap-1.5 sm:gap-2 flex-wrap bg-white px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full border border-stone-200 text-[11px] sm:text-xs text-stone-800 shadow-2xs max-w-full">
              <span className="flex items-center gap-1.5 text-[#14532d] font-semibold shrink-0">
                <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block animate-pulse shrink-0" />
                <span>{t.common.trustName}</span>
              </span>
              <span className="text-stone-300">|</span>
              <span className="text-stone-600 font-medium truncate">{t.hero.badge}</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-4xl md:text-[2.5rem] lg:text-[3.1rem] font-serif font-bold text-stone-900 tracking-tight leading-[1.18]">
                {t.hero.welcomeTitle}
              </h1>
            </div>

            {/* Subtitle / Mission */}
            <p className="text-sm sm:text-base md:text-lg text-stone-700 leading-relaxed font-sans max-w-xl">
              {t.hero.welcomeSubtitle}
            </p>

            {/* Primary & Secondary CTAs */}
            <div className="pt-1 flex flex-wrap items-center gap-2.5 sm:gap-3">
              <Link to="/donate">
                <Button
                  size="lg"
                  className="bg-[#14532d] hover:bg-[#0f4023] text-white border border-emerald-700/30 shadow-xs font-semibold text-sm sm:text-base px-5 sm:px-6 h-11 cursor-pointer justify-center"
                  leftIcon={
                    <Heart className="w-4 h-4 fill-amber-300 text-amber-300 shrink-0" />
                  }
                >
                  {t.common.donateNow}
                </Button>
              </Link>

              <Link to="/causes">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-stone-300 text-stone-800 bg-white hover:bg-stone-50 hover:border-emerald-700 font-medium text-xs sm:text-sm md:text-base px-4 sm:px-5 h-11 justify-center"
                  leftIcon={<ShieldCheck className="w-4 h-4 text-[#14532d] shrink-0" />}
                >
                  {t.common.exploreWork}
                </Button>
              </Link>

              <Link to="/volunteer">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-emerald-800/20 text-[#14532d] bg-emerald-50/60 hover:bg-emerald-100 hover:border-emerald-700 font-medium text-xs sm:text-sm md:text-base px-4 sm:px-5 h-11 justify-center"
                  leftIcon={<UserPlus className="w-4 h-4 text-[#14532d] shrink-0" />}
                >
                  {t.common.volunteer}
                </Button>
              </Link>

              {/* Conditional Kumbh Mode CTA */}
              {isKumbhMode && (
                <Link to="/kumbh-seva">
                  <div className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-md bg-amber-50 border border-amber-300 text-amber-950 text-xs sm:text-sm font-semibold hover:bg-amber-100 transition-colors shadow-2xs">
                    <Flame className="w-4 h-4 text-amber-600 fill-amber-500 animate-pulse shrink-0" />
                    <span>{t.nav.kumbh}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  </div>
                </Link>
              )}
            </div>

            {/* Desktop Docket Search & Trust Pillars */}
            <div className="pt-2">
              {renderDocketAndPillars()}
            </div>
          </motion.div>

          {/* Right Column: Dignified Welcome & Seva Hub Panel */}
          <div className="md:col-span-5 relative flex flex-col items-center md:items-end justify-start pt-1 sm:pt-2">
            <div className="w-full max-w-md">
              {renderWelcomeHub()}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MOBILE VIEW (< md): INTENTIONAL, FITTED, SINGLE-COLUMN HIERARCHY */}
        {/* Structure: Badge -> Headline -> Description -> Donate CTA -> Secondary Actions */}
        {/*            -> Welcome & Voice Panel -> Quick Seva Actions -> Search/Pillars */}
        {/* ========================================================================= */}
        <div className="flex flex-col md:hidden space-y-4 text-left w-full max-w-full">
          {/* 1. Trust badge */}
          <div className="inline-flex items-center gap-1.5 flex-wrap bg-white px-2.5 py-1 rounded-full border border-stone-200 text-[11px] text-stone-800 shadow-2xs self-start max-w-full">
            <span className="flex items-center gap-1.5 text-[#14532d] font-semibold shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block animate-pulse shrink-0" />
              <span>{t.common.trustName}</span>
            </span>
            <span className="text-stone-300">|</span>
            <span className="text-stone-600 font-medium truncate">{t.hero.badge}</span>
          </div>

          {/* 2. Main headline */}
          <h1 className="text-2xl xs:text-[1.7rem] font-serif font-bold text-stone-900 tracking-tight leading-[1.2]">
            {t.hero.welcomeTitle}
          </h1>

          {/* 3. Short description */}
          <p className="text-xs xs:text-sm text-stone-700 leading-relaxed font-sans">
            {t.hero.welcomeSubtitle}
          </p>

          {/* 4. Primary Donate CTA */}
          <Link to="/donate" className="w-full">
            <Button
              size="lg"
              className="w-full bg-[#14532d] hover:bg-[#0f4023] text-white border border-emerald-700/30 shadow-xs font-semibold text-sm px-4 h-11 cursor-pointer justify-center"
              leftIcon={
                <Heart className="w-4 h-4 fill-amber-300 text-amber-300 shrink-0" />
              }
            >
              {t.common.donateNow}
            </Button>
          </Link>

          {/* 5. Secondary actions: Explore Causes & Volunteer */}
          <div className="grid grid-cols-2 gap-2 w-full">
            <Link to="/causes" className="w-full">
              <Button
                size="md"
                variant="outline"
                className="w-full border-stone-300 text-stone-800 bg-white hover:bg-stone-50 font-medium text-xs px-2 h-9.5 justify-center truncate"
                leftIcon={<ShieldCheck className="w-3.5 h-3.5 text-[#14532d] shrink-0" />}
              >
                <span className="truncate">{t.common.exploreWork}</span>
              </Button>
            </Link>

            <Link to="/volunteer" className="w-full">
              <Button
                size="md"
                variant="outline"
                className="w-full border-emerald-800/20 text-[#14532d] bg-emerald-50/60 hover:bg-emerald-100 font-medium text-xs px-2 h-9.5 justify-center truncate"
                leftIcon={<UserPlus className="w-3.5 h-3.5 text-[#14532d] shrink-0" />}
              >
                <span className="truncate">{t.common.volunteer}</span>
              </Button>
            </Link>
          </div>

          {/* Conditional Kumbh Mode Banner on Mobile */}
          {isKumbhMode && (
            <Link to="/kumbh-seva" className="w-full">
              <div className="inline-flex items-center justify-center gap-2 w-full px-3 py-2 rounded-md bg-amber-50 border border-amber-300 text-amber-950 text-xs font-semibold shadow-2xs">
                <Flame className="w-4 h-4 text-amber-600 fill-amber-500 animate-pulse shrink-0" />
                <span>{t.nav.kumbh}</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              </div>
            </Link>
          )}

          {/* 6. Dignified Welcome Message & Quick Seva Actions Hub */}
          <div className="w-full pt-1">
            {renderWelcomeHub()}
          </div>

          {/* 7. Docket Search & Trust Pillars */}
          <div className="w-full pt-2">
            {renderDocketAndPillars()}
          </div>
        </div>
      </div>

      {/* ================= SMOOTH SCROLL INDICATOR ================= */}
      <div
        className="hidden sm:flex absolute bottom-2 left-1/2 -translate-x-1/2 flex-col items-center gap-0.5 cursor-pointer text-stone-500 hover:text-[#14532d] transition-colors select-none z-10"
        onClick={scrollToExplore}
      >
        <span className="text-[10px] sm:text-[11px] font-medium tracking-wide whitespace-nowrap">
          {language === "mr" ? "अधिक माहितीसाठी खाली स्क्रोल करा" : "Scroll to explore trust initiatives"}
        </span>
        <motion.div
          animate={shouldReduceMotion ? undefined : { y: [0, 4, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="w-4 h-4 text-[#14532d]" />
        </motion.div>
      </div>
    </section>
  );
};
