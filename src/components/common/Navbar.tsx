import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import {
  Heart,
  ShieldCheck,
  Menu,
  X,
  Globe,
  ChevronDown,
} from "lucide-react";
import { Button } from "./Button";
import { NotificationBell } from "./NotificationBell";
import { cn } from "@/src/lib/utils";
import { useLanguage, Language } from "@/src/context/LanguageContext";
import { useKumbhMode } from "@/src/context/KumbhModeContext";
import { useAuth } from "@/src/context/AuthContext";

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();
  const { isKumbhMode } = useKumbhMode();
  const shouldReduceMotion = useReducedMotion();
  const { user } = useAuth();

  const isHome = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setMoreDropdownOpen(false);
  }, [location.pathname]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setMoreDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  interface NavItem {
    label: string;
    path: string;
    special?: boolean;
    isKumbh?: boolean;
  }

  // Primary navigation (direct)
  const primaryLinks: NavItem[] = [
    { label: t.navHome, path: "/" },
    { label: t.navCauses, path: "/causes" },
    {
      label: t.navPassport,
      path: "/impact-passport",
      special: true,
    },
    { label: t.navAbout, path: "/about" },
    ...(isKumbhMode ? [{ label: t.nav.kumbh, path: "/kumbh-seva", isKumbh: true }] : []),
  ];

  // Secondary navigation (in dropdown)
  const secondaryLinks: NavItem[] = [
    { label: t.navVolunteer, path: "/volunteer" },
    { label: t.navEvents, path: "/events" },
    {
      label:
        language === "mr"
          ? "पारदर्शकता नोंदवही"
          : language === "hi"
          ? "पारदर्शिता पंजी"
          : "Transparency Registry",
      path: "/transparency",
    },
    { label: t.navContact, path: "/contact" },
  ];

  const allNavLinks: NavItem[] = [...primaryLinks, ...secondaryLinks];

  const languages: { code: Language; label: string; nativeName: string }[] = [
    { code: "en", label: "English", nativeName: "EN" },
    { code: "mr", label: "Marathi", nativeName: "मराठी" },
    { code: "hi", label: "Hindi", nativeName: "हिन्दी" },
  ];

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const isSecondaryActive = secondaryLinks.some((l) => location.pathname === l.path);

  // Home top bar transparent mode vs solid mode
  const isTransparent = isHome && !isScrolled;

  return (
    <header
      className={cn(
        "w-full transition-all duration-300 z-50",
        isHome
          ? isScrolled
            ? "fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-stone-200/90 shadow-sm"
            : "absolute top-0 left-0 right-0 bg-gradient-to-b from-stone-950/80 via-stone-950/40 to-transparent border-b border-white/10"
          : "sticky top-0 bg-white/95 backdrop-blur-md border-b border-stone-200/90 shadow-2xs"
      )}
    >
      {/* 1. TOP CIVIC & CULTURAL TRUST STRIP */}
      <div
        className={cn(
          "text-xs py-1 px-3 sm:px-6 transition-colors duration-300",
          isTransparent
            ? "bg-black/25 text-stone-200 border-b border-white/10"
            : "bg-[#143823] text-stone-200 border-b border-[#1c4d30]"
        )}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-1.5 sm:gap-2">
          {/* Left: Registration & Academic notice */}
          <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs min-w-0">
            <span className="text-amber-300 font-semibold flex items-center gap-1 shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 inline text-amber-400 shrink-0" />
              <span>{t.academicNotice}</span>
            </span>
            <span className={cn("hidden md:inline", isTransparent ? "text-stone-400" : "text-emerald-700")}>•</span>
            <span
              className={cn(
                "hidden md:inline text-[11px] truncate",
                isTransparent ? "text-stone-300" : "text-emerald-100"
              )}
            >
              {language === "mr"
                ? "नोंदणीकृत विश्वस्त संस्था (नोंदणी क्र. E-9389 / Nashik) • अधिकृत पावती व पारदर्शक हिशोब"
                : language === "hi"
                ? "पंजीकृत धर्मार्थ ट्रस्ट (पंजीकरण सं. E-9389 / Nashik) • अधिकृत रसीद एवं पारदर्शी हिसाब"
                : "Regd. Public Charitable Trust (Reg. E-9389 / Nashik) • Official Receipts & Auditable Accounts"}
            </span>
          </div>

          {/* Right: Language Switcher in Top Bar */}
          <div className="flex items-center gap-2 text-xs shrink-0">
            <div
              className={cn(
                "flex items-center gap-1 text-[11px]",
                isTransparent ? "text-amber-200" : "text-emerald-100"
              )}
            >
              <Globe className="w-3 h-3 text-amber-400 shrink-0" />
              <span className="hidden sm:inline font-medium">भाषा / Language:</span>
            </div>
            <div
              className={cn(
                "inline-flex rounded-full p-0.5 text-[10px] sm:text-[11px] border backdrop-blur-sm transition-colors",
                isTransparent
                  ? "border-white/20 bg-black/40 text-stone-200"
                  : "border-emerald-800 bg-[#0b2315] text-stone-200"
              )}
            >
              {languages.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => setLanguage(l.code)}
                  className={cn(
                    "px-2 sm:px-2.5 py-0.5 rounded-full transition-all cursor-pointer font-medium",
                    language === l.code
                      ? isTransparent
                        ? "bg-amber-400 text-stone-950 font-bold shadow-xs"
                        : "bg-[#14532d] text-white font-bold shadow-xs"
                      : isTransparent
                      ? "text-stone-300 hover:text-white"
                      : "text-stone-300 hover:text-white"
                  )}
                  title={`Switch language to ${l.label}`}
                >
                  {l.nativeName}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN NAVIGATION BAR */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-3">
          {/* Logo / Trust Title */}
          <Link
            to="/"
            onClick={closeMobileMenu}
            className="flex items-center gap-2.5 sm:gap-3 group min-w-0 flex-1 sm:flex-initial"
          >
            {/* Dignified Indian Trust Seal */}
            <motion.div
              whileHover={!shouldReduceMotion ? { scale: 1.05 } : undefined}
              transition={{ duration: 0.2 }}
              className={cn(
                "w-10 h-10 sm:w-11 sm:h-11 rounded-lg flex items-center justify-center border shadow-xs transition-colors shrink-0",
                isTransparent
                  ? "bg-[#14532d]/90 text-amber-200 border-amber-400/40"
                  : "bg-[#14532d] text-amber-100 border-emerald-900/40 group-hover:bg-[#0f4023]"
              )}
            >
              <Heart className="w-5 h-5 fill-current text-amber-300 stroke-none" />
            </motion.div>

            <div className="flex flex-col min-w-0">
              <span
                className={cn(
                  "text-sm xs:text-base sm:text-lg font-serif font-bold leading-tight tracking-tight transition-colors truncate",
                  isTransparent
                    ? "text-white group-hover:text-amber-200"
                    : "text-stone-900 group-hover:text-[#14532d]"
                )}
              >
                {t.trustName}
              </span>
              <span className="text-[11px] hidden sm:flex items-center gap-1.5 mt-0.5">
                <span className={cn(isTransparent ? "text-amber-200/90 font-medium" : "text-stone-600 font-medium")}>
                  {t.trustShort}
                </span>
                <span className={cn("w-1 h-1 rounded-full inline-block", isTransparent ? "bg-stone-400" : "bg-stone-300")} />
                <span className={cn("truncate", isTransparent ? "text-stone-300" : "text-emerald-700 font-medium")}>
                  {language === "mr"
                    ? "सार्वजनिक पारदर्शकता नोंदवही"
                    : language === "hi"
                    ? "सार्वजनिक पारदर्शिता पंजी"
                    : "Public Transparency Registry"}
                </span>
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 relative">
            {primaryLinks.map((link) => {
              const isActive =
                link.path === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(link.path);

              if (link.special) {
                return (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    className={cn(
                      "relative px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all border",
                      isTransparent
                        ? isActive
                          ? "bg-amber-400 text-stone-950 border-amber-300 shadow-xs"
                          : "text-amber-200 bg-white/10 hover:bg-white/20 border-white/20 backdrop-blur-sm"
                        : isActive
                        ? "bg-[#14532d] text-white border-[#14532d] shadow-xs"
                        : "text-[#14532d] bg-[#f0fdf4] hover:bg-[#dcfce7] border-[#14532d]/20"
                    )}
                  >
                    <span>{link.label}</span>
                  </NavLink>
                );
              }

              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={cn(
                    "relative px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors",
                    isTransparent
                      ? isActive
                        ? "text-amber-300 font-bold bg-white/10"
                        : "text-stone-100 hover:text-amber-200 hover:bg-white/10"
                      : isActive
                      ? "text-[#14532d] font-bold bg-emerald-50/80"
                      : "text-stone-700 hover:text-stone-950 hover:bg-stone-100"
                  )}
                >
                  <span>{link.label}</span>

                  {/* Active Indicator Bar */}
                  {isActive && (
                    <motion.div
                      layoutId="navbar-active-indicator"
                      className={cn(
                        "absolute bottom-0 left-2 right-2 h-0.5 rounded-full",
                        isTransparent ? "bg-amber-400" : "bg-[#14532d]"
                      )}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                    />
                  )}
                </NavLink>
              );
            })}

            {/* Dropdown for Secondary Links */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors inline-flex items-center gap-1 cursor-pointer",
                  isTransparent
                    ? isSecondaryActive || moreDropdownOpen
                      ? "text-amber-300 font-bold bg-white/15"
                      : "text-stone-100 hover:text-amber-200 hover:bg-white/10"
                    : isSecondaryActive || moreDropdownOpen
                    ? "text-[#14532d] font-bold bg-emerald-50/80"
                    : "text-stone-700 hover:text-stone-950 hover:bg-stone-100"
                )}
              >
                <span>{language === "mr" ? "अधिक" : language === "hi" ? "अन्य" : "More"}</span>
                <ChevronDown
                  className={cn(
                    "w-3.5 h-3.5 transition-transform",
                    moreDropdownOpen ? "rotate-180" : ""
                  )}
                />
              </button>

              <AnimatePresence>
                {moreDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.15 }}
                    className={cn(
                      "absolute right-0 mt-1.5 w-52 rounded-md shadow-lg border py-1.5 z-50",
                      isTransparent
                        ? "bg-stone-900/95 backdrop-blur-xl border-stone-700 text-stone-100"
                        : "bg-white border-stone-200 text-stone-800"
                    )}
                  >
                    {secondaryLinks.map((sublink) => (
                      <Link
                        key={sublink.path}
                        to={sublink.path}
                        onClick={() => setMoreDropdownOpen(false)}
                        className={cn(
                          "block px-3.5 py-2 text-xs font-medium transition-colors",
                          location.pathname === sublink.path
                            ? isTransparent
                              ? "bg-white/15 text-amber-300 font-bold"
                              : "bg-emerald-50 text-[#14532d] font-bold"
                            : isTransparent
                            ? "hover:bg-white/10 hover:text-white"
                            : "hover:bg-stone-100 hover:text-stone-950"
                        )}
                      >
                        {sublink.label}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>

          {/* Desktop Right Actions */}
          <div className="hidden lg:flex items-center gap-2">
            {user && <NotificationBell />}

            <Link to="/donate">
              <Button
                variant={isTransparent ? "secondary" : "primary"}
                size="sm"
                className={cn(
                  "text-xs font-semibold px-4 py-2 transition-all",
                  isTransparent
                    ? "bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold border-0 shadow-sm"
                    : "bg-[#14532d] hover:bg-[#0f4023] text-white"
                )}
                leftIcon={
                  <Heart
                    className={cn(
                      "w-3.5 h-3.5 fill-current",
                      isTransparent ? "text-stone-900" : "text-amber-200"
                    )}
                  />
                }
              >
                {t.ctaDonate}
              </Button>
            </Link>
          </div>

          {/* Mobile Right Bar */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 lg:hidden">
            {user && <NotificationBell />}

            <Link to="/donate" className="shrink-0">
              <Button
                variant={isTransparent ? "secondary" : "primary"}
                size="sm"
                className={cn(
                  "text-xs font-semibold py-1.5 px-3 h-8 shrink-0",
                  isTransparent
                    ? "bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold border-0"
                    : "bg-[#14532d] hover:bg-[#0f4023] text-white"
                )}
              >
                {t.ctaDonate}
              </Button>
            </Link>

            <motion.button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              whileTap={!shouldReduceMotion ? { scale: 0.92 } : undefined}
              className={cn(
                "p-1.5 rounded-md focus:outline-none cursor-pointer shrink-0 transition-colors",
                isTransparent
                  ? "text-white hover:bg-white/15"
                  : "text-stone-700 hover:text-stone-900 hover:bg-stone-100"
              )}
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* 3. MOBILE DRAWER */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, height: "auto" }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className={cn(
              "lg:hidden border-t px-4 pt-3 pb-6 space-y-3 shadow-lg overflow-hidden",
              isTransparent
                ? "bg-stone-950/98 backdrop-blur-xl border-white/15 text-white"
                : "bg-white border-stone-200 text-stone-900"
            )}
          >
            {/* Language Selector in Mobile Drawer */}
            <div
              className={cn(
                "p-2.5 rounded-lg border flex items-center justify-between",
                isTransparent
                  ? "bg-white/5 border-white/10"
                  : "bg-stone-50 border-stone-200"
              )}
            >
              <span className={cn("text-xs font-medium", isTransparent ? "text-stone-300" : "text-stone-600")}>
                Language / भाषा:
              </span>
              <div
                className={cn(
                  "inline-flex rounded-full border p-0.5 text-xs",
                  isTransparent
                    ? "border-white/20 bg-black/40"
                    : "border-stone-300 bg-white"
                )}
              >
                {languages.map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => setLanguage(l.code)}
                    className={cn(
                      "px-2.5 py-1 rounded-full text-xs transition-colors cursor-pointer font-medium",
                      language === l.code
                        ? isTransparent
                          ? "bg-amber-400 text-stone-950 font-bold"
                          : "bg-[#14532d] text-white font-bold"
                        : isTransparent
                        ? "text-stone-300 hover:text-white"
                        : "text-stone-700 hover:bg-stone-100"
                    )}
                  >
                    {l.nativeName}
                  </button>
                ))}
              </div>
            </div>

            {/* Nav Links */}
            <div className="space-y-1">
              {allNavLinks.map((link) => {
                const isActive =
                  link.path === "/"
                    ? location.pathname === "/"
                    : location.pathname.startsWith(link.path);

                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={closeMobileMenu}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      isActive
                        ? isTransparent
                          ? "bg-white/15 text-amber-300 font-bold"
                          : "bg-emerald-50 text-[#14532d] font-bold"
                        : isTransparent
                        ? "text-stone-200 hover:bg-white/10"
                        : "text-stone-700 hover:bg-stone-50"
                    )}
                  >
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Auth / Dashboard Action links */}
            <div className={cn("pt-3 border-t grid grid-cols-2 gap-2", isTransparent ? "border-white/10" : "border-stone-100")}>
              <Link to="/login" onClick={closeMobileMenu}>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "w-full text-xs",
                    isTransparent ? "border-white/30 text-white hover:bg-white/10 bg-transparent" : ""
                  )}
                >
                  {t.navLogin}
                </Button>
              </Link>
              <Link to="/dashboard" onClick={closeMobileMenu}>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "w-full text-xs",
                    isTransparent ? "border-white/30 text-white hover:bg-white/10 bg-transparent" : ""
                  )}
                >
                  {t.navDashboard}
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
