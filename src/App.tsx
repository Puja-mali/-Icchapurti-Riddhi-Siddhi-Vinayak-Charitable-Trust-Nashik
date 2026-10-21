import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Navbar } from "@/src/components/common/Navbar";
import { Footer } from "@/src/components/common/Footer";
import { ScrollToTop } from "@/src/components/common/ScrollToTop";
import { Chatbot } from "@/src/components/common/Chatbot";
import { LanguageProvider } from "@/src/context/LanguageContext";
import { KumbhModeProvider } from "@/src/context/KumbhModeContext";
import { ThemeProvider } from "@/src/context/ThemeContext";
import { AuthProvider } from "@/src/context/AuthContext";
import { TrustProvider } from "@/src/context/TrustContext";

// Pages
import { Home } from "@/src/pages/Home";
import { ProtectedRoute } from "@/src/components/common/ProtectedRoute";

// Lazy-loaded routes for optimal initial bundle size and rapid time-to-interactive
const About = React.lazy(() => import("@/src/pages/About").then((m) => ({ default: m.About })));
const Causes = React.lazy(() => import("@/src/pages/Causes").then((m) => ({ default: m.Causes })));
const CauseDetails = React.lazy(() => import("@/src/pages/CauseDetails").then((m) => ({ default: m.CauseDetails })));
const Donate = React.lazy(() => import("@/src/pages/Donate").then((m) => ({ default: m.Donate })));
const ImpactPassport = React.lazy(() => import("@/src/pages/ImpactPassport").then((m) => ({ default: m.ImpactPassport })));
const Volunteer = React.lazy(() => import("@/src/pages/Volunteer").then((m) => ({ default: m.Volunteer })));
const VolunteerPortal = React.lazy(() => import("@/src/pages/VolunteerPortal").then((m) => ({ default: m.VolunteerPortal })));
const Events = React.lazy(() => import("@/src/pages/Events").then((m) => ({ default: m.Events })));
const EventDetails = React.lazy(() => import("@/src/pages/EventDetails").then((m) => ({ default: m.EventDetails })));
const Contact = React.lazy(() => import("@/src/pages/Contact").then((m) => ({ default: m.Contact })));
const Login = React.lazy(() => import("@/src/pages/Login").then((m) => ({ default: m.Login })));
const Register = React.lazy(() => import("@/src/pages/Register").then((m) => ({ default: m.Register })));
const UserDashboard = React.lazy(() => import("@/src/pages/UserDashboard").then((m) => ({ default: m.UserDashboard })));
const AdminDashboard = React.lazy(() => import("@/src/pages/AdminDashboard").then((m) => ({ default: m.AdminDashboard })));
const AdminLogin = React.lazy(() => import("@/src/pages/AdminLogin").then((m) => ({ default: m.AdminLogin })));
const KumbhSeva = React.lazy(() => import("@/src/pages/KumbhSeva").then((m) => ({ default: m.KumbhSeva })));
const RequestHelp = React.lazy(() => import("@/src/pages/RequestHelp").then((m) => ({ default: m.RequestHelp })));
const Transparency = React.lazy(() => import("@/src/pages/Transparency").then((m) => ({ default: m.Transparency })));
const Gallery = React.lazy(() => import("@/src/pages/Gallery").then((m) => ({ default: m.Gallery })));
const Blog = React.lazy(() => import("@/src/pages/Blog").then((m) => ({ default: m.Blog })));
const BlogPost = React.lazy(() => import("@/src/pages/BlogPost").then((m) => ({ default: m.BlogPost })));
const AcceptInvitation = React.lazy(() => import("@/src/pages/AcceptInvitation").then((m) => ({ default: m.AcceptInvitation })));
const ForgotPassword = React.lazy(() => import("@/src/pages/ForgotPassword").then((m) => ({ default: m.ForgotPassword })));
const ResetPassword = React.lazy(() => import("@/src/pages/ResetPassword").then((m) => ({ default: m.ResetPassword })));
const PrivacyPolicy = React.lazy(() => import("@/src/pages/PrivacyPolicy").then((m) => ({ default: m.PrivacyPolicy })));
const Terms = React.lazy(() => import("@/src/pages/Terms").then((m) => ({ default: m.Terms })));
const DonationStatus = React.lazy(() => import("@/src/pages/DonationStatus").then((m) => ({ default: m.DonationStatus })));
const NotFound = React.lazy(() => import("@/src/pages/NotFound").then((m) => ({ default: m.NotFound })));
import { CookieConsent } from "@/src/components/common/CookieConsent";

import { TrustEmblem } from "@/src/components/common/TrustEmblem";

const RouteLoadingFallback: React.FC = () => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center" role="status" aria-live="polite">
    <TrustEmblem size="md" showRibbonTab={false} className="mb-4" />
    <div className="w-9 h-9 rounded-full border-3 border-emerald-200 border-t-[#14532d] animate-spin mb-3" />
    <span className="text-sm font-semibold text-stone-700">Loading trust portal...</span>
  </div>
);

const AnimatedRoutes: React.FC = () => {
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -6 }}
        transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1.0] }}
        className="flex-1"
      >
        <React.Suspense fallback={<RouteLoadingFallback />}>
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/causes" element={<Causes />} />
            <Route path="/causes/:id" element={<CauseDetails />} />
            <Route path="/donate" element={<Donate />} />
            <Route path="/impact-passport" element={<ImpactPassport />} />
            <Route path="/volunteer" element={<Volunteer />} />
            <Route
              path="/volunteer-portal"
              element={
                <ProtectedRoute allowedRoles={['VOLUNTEER', 'ADMIN', 'STAFF']}>
                  <VolunteerPortal />
                </ProtectedRoute>
              }
            />
            <Route path="/kumbh-seva" element={<KumbhSeva />} />
            <Route path="/request-help" element={<RequestHelp />} />
            <Route path="/transparency" element={<Transparency />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/:id" element={<EventDetails />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['DONOR', 'ADMIN', 'STAFF', 'VOLUNTEER']}>
                  <UserDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/accept-invitation" element={<AcceptInvitation />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/donation-status" element={<DonationStatus />} />
            <Route path="/donation-confirmation" element={<DonationStatus />} />
            {/* Custom 404 handler */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </React.Suspense>
      </motion.div>
    </AnimatePresence>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <KumbhModeProvider>
        <LanguageProvider>
          <AuthProvider>
            <TrustProvider>
              <BrowserRouter>
                <ScrollToTop />
                <div className="flex flex-col min-h-screen bg-[#faf8f5] text-stone-900 font-sans w-full max-w-full overflow-x-clip">
                  <Navbar />
                  <main id="main-content" className="flex-1 flex flex-col w-full max-w-full overflow-x-clip focus:outline-none">
                    <AnimatedRoutes />
                  </main>
                  <Footer />
                  <Chatbot />
                  <CookieConsent />
                </div>
              </BrowserRouter>
            </TrustProvider>
          </AuthProvider>
        </LanguageProvider>
      </KumbhModeProvider>
    </ThemeProvider>
  );
}
