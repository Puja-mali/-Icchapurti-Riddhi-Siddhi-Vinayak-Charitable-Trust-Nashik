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
import { About } from "@/src/pages/About";
import { Causes } from "@/src/pages/Causes";
import { CauseDetails } from "@/src/pages/CauseDetails";
import { Donate } from "@/src/pages/Donate";
import { ImpactPassport } from "@/src/pages/ImpactPassport";
import { Volunteer } from "@/src/pages/Volunteer";
import { Events } from "@/src/pages/Events";
import { EventDetails } from "@/src/pages/EventDetails";
import { Contact } from "@/src/pages/Contact";
import { Login } from "@/src/pages/Login";
import { Register } from "@/src/pages/Register";
import { UserDashboard } from "@/src/pages/UserDashboard";
import { AdminDashboard } from "@/src/pages/AdminDashboard";
import { KumbhSeva } from "@/src/pages/KumbhSeva";
import { RequestHelp } from "@/src/pages/RequestHelp";
import { Transparency } from "@/src/pages/Transparency";
import { VolunteerPortal } from "@/src/pages/VolunteerPortal";
import { Gallery } from "@/src/pages/Gallery";
import { Blog } from "@/src/pages/Blog";
import { BlogPost } from "@/src/pages/BlogPost";

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
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/causes" element={<Causes />} />
          <Route path="/causes/:id" element={<CauseDetails />} />
          <Route path="/donate" element={<Donate />} />
          <Route path="/impact-passport" element={<ImpactPassport />} />
          <Route path="/volunteer" element={<Volunteer />} />
          <Route path="/volunteer-portal" element={<VolunteerPortal />} />
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
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
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
                <div className="flex flex-col min-h-screen bg-[#faf8f5] text-stone-900 font-sans w-full max-w-full overflow-x-hidden">
                  <Navbar />
                  <main className="flex-1 flex flex-col w-full max-w-full overflow-x-hidden">
                    <AnimatedRoutes />
                  </main>
                  <Footer />
                  <Chatbot />
                </div>
              </BrowserRouter>
            </TrustProvider>
          </AuthProvider>
        </LanguageProvider>
      </KumbhModeProvider>
    </ThemeProvider>
  );
}
