import React from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import { Heart, FileCheck, CheckCircle2, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "../common/Button";

export const HumanImpactStory: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-md border border-stone-200 overflow-hidden shadow-2xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          {/* Image Column */}
          <motion.div
            className="lg:col-span-5 relative bg-stone-100 overflow-hidden min-h-[320px] sm:min-h-[400px] border-b lg:border-b-0 lg:border-r border-stone-200"
            initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.65, ease: [0.25, 0.1, 0.25, 1.0] }}
          >
            <img
              src="/activities/Charity Camp Book Distribution.png"
              alt="School notebook and stationery distribution for students in Nashik"
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-103"
              loading="lazy"
            />
            {/* Subtle Gradient Shadow */}
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-transparent pointer-events-none" />

            {/* Bottom photo caption badge */}
            <div className="absolute bottom-3 left-3 right-3 text-white text-xs bg-stone-900/80 backdrop-blur-xs p-3 rounded border border-stone-700/80">
              <div className="flex items-center justify-between text-[11px] font-semibold text-amber-300 mb-0.5">
                <span>Verified Field Seva</span>
                <span className="font-mono text-stone-300">#EDU-SEVA-NSK</span>
              </div>
              <p className="text-[11px] text-stone-200 leading-snug">
                Notebooks & stationery distribution for school students in Nashik.
              </p>
            </div>
          </motion.div>

          {/* Text Column */}
          <motion.div
            className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between space-y-6"
            initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.65, delay: shouldReduceMotion ? 0 : 0.15, ease: [0.25, 0.1, 0.25, 1.0] }}
          >
            <div className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#14532d] bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-700/20">
                  Documented Impact
                </span>
                <span className="text-xs text-stone-500 font-medium">
                  Education & Youth Welfare
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight leading-snug">
                Direct Educational Aid: Equipping Students with Books and Essential Stationery
              </h2>

              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Through community contributions and volunteer outreach in Nashik, Icchapurti Riddhi Siddhi Vinayak Charitable Trust directly supplies notebook bundles, writing materials, school uniforms, and educational sponsorship for orphan and underprivileged children in local schools. Every item distributed is accounted for with complete transparency.
              </p>

              {/* Verified Metrics Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 bg-stone-50 rounded border border-stone-200">
                  <div className="text-[10px] uppercase font-semibold text-stone-500 tracking-wider">
                    Seva Focus
                  </div>
                  <div className="text-xs font-serif font-bold text-emerald-800 flex items-center gap-1 mt-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Notebooks & Kits</span>
                  </div>
                </div>

                <div className="p-3 bg-stone-50 rounded border border-stone-200">
                  <div className="text-[10px] uppercase font-semibold text-stone-500 tracking-wider">
                    Operational Field
                  </div>
                  <div className="text-xs font-bold text-stone-900 mt-1">
                    Nashik District
                  </div>
                </div>

                <div className="p-3 bg-stone-50 rounded border border-stone-200 col-span-2 sm:col-span-1">
                  <div className="text-[10px] uppercase font-semibold text-stone-500 tracking-wider">
                    Trust Registration
                  </div>
                  <div className="text-xs font-bold text-[#14532d] font-mono mt-1 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#14532d] shrink-0" />
                    <span>E-9389 / Nashik</span>
                  </div>
                </div>
              </div>

              <blockquote className="border-l-2 border-[#14532d] pl-3.5 italic text-xs text-stone-700 bg-emerald-50/40 py-2 pr-2">
                &ldquo;By directly providing educational essentials to underprivileged and orphan students, we ensure that financial hardship never interrupts a child&apos;s learning and growth.&rdquo;
                <div className="text-[11px] font-sans font-semibold text-stone-900 not-italic mt-1">
                  — Trust Seva Committee, Nashik
                </div>
              </blockquote>
            </div>

            {/* Actions */}
            <div className="pt-2 flex flex-wrap items-center gap-3 border-t border-stone-100">
              <Link to="/causes">
                <Button
                  size="md"
                  variant="primary"
                  className="text-xs font-semibold"
                  leftIcon={<Heart className="w-3.5 h-3.5 fill-current text-amber-200" />}
                >
                  Support Education & Active Causes
                </Button>
              </Link>
              <Link to="/impact-passport">
                <Button
                  size="md"
                  variant="outline"
                  className="text-xs font-medium"
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  Explore Impact Passport Ledger
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
