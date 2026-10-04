import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import {
  Heart,
  ShieldCheck,
  Menu,
  X,
  User,
  LayoutDashboard,
  Globe,
  Flame,
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

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 15) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    { label: language === "mr" ? "पारदर्शकता नोंदवही" : "Transparency Registry", path: "/transparency" },
    { label: t.navContact, path: "/contact" },
  ];

  const allNavLinks: NavItem[] = [
    ...primaryLinks,
    ...secondaryLinks,
  ];

  const languages: { code: Language; label: string; nativeName: string }[] = [
    { code: "en", label: "English", nativeName: "English" },
    { code: "mr", label: "Marathi", nativeName: "मराठी" },
    { code: "hi", label: "Hindi", nativeName: "हिन्दी" },
  ];

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const isSecondaryActive = secondaryLinks.some((l) => location.pathname === l.path);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 bg-white border-b transition-all duration-300",
        isScrolled
          ? "border-stone-300 shadow-sm bg-white/95 backdrop-blur-xs"
          : "border-stone-200 shadow-2xs"
      )}
    >
      {/* Top Civic & Trust Notice Bar */}
      <div className="bg-[#143823] text-stone-200 text-xs py-1 px-3 sm:px-4 border-b border-[#1c4d30]">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-1.5 sm:gap-2">
          {/* Left: Registration & Academic notice */}
          <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs min-w-0">
            <span className="text-amber-300 font-medium flex items-center gap-1 shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 inline text-amber-400 shrink-0" />
              <span>{t.academicNotice}</span>
            </span>
            <span className="hidden md:inline text-emerald-700">•</span>
            <span className="hidden md:inline text-emerald-100 text-[11px] truncate">
              {language === "mr"
                ? "नोंदणीकृत विश्वस्त संस्था (नोंदणी क्र. E-9389 / Nashik) • ८०-जी कर सवलत पडताळणी अधीन"
                : "Regd. Public Charitable Trust (Reg. E-9389 / Nashik) • Tax-Exemption Subject to Verification"}
            </span>
          </div>

          {/* Right: Language Switcher in Top Bar */}
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs shrink-0">
            <div className="flex items-center gap-1 text-[11px] text-emerald-100">
              <Globe className="w-3 h-3 text-amber-400 shrink-0" />
              <span className="hidden sm:inline">भाषा / Language:</span>
            </div>
            <div className="inline-flex rounded border border-emerald-800 p-0.5 bg-[#0b2315] text-[10px] sm:text-[11px]">
              {languages.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => setLanguage(l.code)}
                  className={cn(
                    "px-1.5 sm:px-2 py-0.5 rounded transition-colors cursor-pointer",
                    language === l.code
                      ? "bg-[#14532d] text-white font-semibold shadow-xs"
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

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-15 sm:h-18 gap-2">
          {/* Logo / Trust Title */}
          <Link
            to="/"
            onClick={closeMobileMenu}
            className="flex items-center gap-2 sm:gap-3 group min-w-0 flex-1 sm:flex-initial"
          >
            {/* Dignified Indian Trust Seal */}
            <motion.div
              whileHover={!shouldReduceMotion ? { scale: 1.05 } : undefined}
              transition={{ duration: 0.2 }}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-md bg-[#14532d] text-amber-100 flex items-center justify-center border border-emerald-900/40 shadow-2xs group-hover:bg-[#0f4023] transition-colors shrink-0"
            >
              <Heart className="w-4.5 h-4.5 sm:w-5 sm:h-5 fill-current text-amber-300 stroke-none" />
            </motion.div>

            <div className="flex flex-col min-w-0">
              <span className="text-sm xs:text-base sm:text-lg font-serif font-bold text-stone-900 leading-tight tracking-tight group-hover:text-[#14532d] transition-colors truncate">
                {t.trustName}
              </span>
              <span className="text-[11px] text-stone-500 hidden sm:flex items-center gap-1.5 mt-0.5">
                <span>{t.trustShort}</span>
                <span className="w-1 h-1 rounded-full bg-stone-400 inline-block" />
                <span className="text-[#15803d] font-medium truncate">
                  {language === "mr" ? "सार्वजनिक पारदर्शकता नोंदवही" : "Public Transparency Registry"}
                </span>
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5 relative">
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
                      isActive
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
                    "relative px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors group",
                    isActive
                      ? "text-[#14532d] font-semibold"
                      : "text-stone-700 hover:text-stone-950 hover:bg-stone-50"
                  )}
                >
                  <span>{link.label}</span>

                  {/* Active Link Animated Indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="navbar-active-indicator"
                      className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#14532d] rounded-full"
                      transition={{ duration: 0.25, ease: "easeOut" }}
                    />
                  )}
                </NavLink>
              );
            })}

            {/* Dropdown for More Links (Keeps Navbar Uncluttered) */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors inline-flex items-center gap-1 cursor-pointer",
                  isSecondaryActive || moreDropdownOpen
                    ? "text-[#14532d] font-semibold bg-emerald-50/70"
                    : "text-stone-700 hover:text-stone-950 hover:bg-stone-50"
                )}
              >
                <span>{language === "mr" ? "अधिक" : "More"}</span>
                <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", moreDropdownOpen ? "rotate-180" : "")} />
              </button>

              <AnimatePresence>
                {moreDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-1.5 w-52 bg-white rounded-md shadow-lg border border-stone-200 py-1.5 z-50"
                  >
                    {secondaryLinks.map((sublink) => (
                      <Link
                        key={sublink.path}
                        to={sublink.path}
                        onClick={() => setMoreDropdownOpen(false)}
                        className={cn(
                          "block px-3.5 py-2 text-xs font-medium transition-colors",
                          location.pathname === sublink.path
                            ? "bg-emerald-50 text-[#14532d] font-semibold"
                            : "text-stone-700 hover:bg-stone-50 hover:text-stone-950"
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
                variant="primary"
                size="sm"
                className="text-xs font-semibold px-4 py-2"
                leftIcon={<Heart className="w-3.5 h-3.5 fill-current text-amber-200" />}
              >
                {t.ctaDonate}
              </Button>
            </Link>
          </div>

          {/* Mobile Right Bar */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 lg:hidden">
            {user && <NotificationBell />}

            <Link to="/donate" className="shrink-0">
              <Button variant="primary" size="sm" className="text-xs font-semibold py-1.5 px-2.5 sm:px-3 h-8 shrink-0">
                {t.ctaDonate}
              </Button>
            </Link>

            <motion.button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              whileTap={!shouldReduceMotion ? { scale: 0.92 } : undefined}
              className="p-1.5 rounded-md text-stone-700 hover:text-stone-900 hover:bg-stone-100 focus:outline-none cursor-pointer shrink-0"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer with AnimatePresence */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, height: "auto" }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="lg:hidden border-t border-stone-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-md overflow-hidden"
          >
            {/* Language Selector for mobile */}
            <div className="p-2.5 bg-stone-50 rounded-md border border-stone-200 flex items-center justify-between">
              <span className="text-xs font-medium text-stone-600">Language / भाषा:</span>
              <div className="inline-flex rounded border border-stone-300 p-0.5 bg-white text-xs">
                {languages.map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => setLanguage(l.code)}
                    className={cn(
                      "px-2.5 py-1 rounded text-xs transition-colors",
                      language === l.code
                        ? "bg-[#14532d] text-white font-semibold"
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
                        ? "bg-emerald-50 text-[#14532d] font-semibold"
                        : "text-stone-700 hover:bg-stone-50"
                    )}
                  >
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Action links */}
            <div className="pt-3 border-t border-stone-100 grid grid-cols-2 gap-2">
              <Link to="/login" onClick={closeMobileMenu}>
                <Button variant="outline" size="sm" className="w-full text-xs">
                  {t.navLogin}
                </Button>
              </Link>
              <Link to="/dashboard" onClick={closeMobileMenu}>
                <Button variant="outline" size="sm" className="w-full text-xs">
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

