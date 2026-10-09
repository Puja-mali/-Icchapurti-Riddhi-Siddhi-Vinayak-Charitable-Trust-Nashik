import React from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  Award,
  Scale,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  UserCheck,
  Sparkles,
  Heart,
  Leaf,
  BookOpen,
  Users,
  ArrowRight,
  HandHeart,
  Stethoscope,
  GraduationCap,
  TreePine,
  Droplets,
  MapPin,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { PageHeader } from "@/src/components/common/PageHeader";
import { SectionHeader } from "@/src/components/common/SectionHeader";
import { Button } from "@/src/components/common/Button";
import { useLanguage } from "@/src/context/LanguageContext";
import { useTrust } from "@/src/context/TrustContext";

export const About: React.FC = () => {
  const { language } = useLanguage();
  const { trustProfile, trustees, loading, error, refreshAll } = useTrust();
const shouldReduceMotion = useReducedMotion() ?? false;

  const trustName =
    trustProfile?.trustName ||
    "Icchapurti Riddhi Siddhi Vinayak Charitable Trust, Nashik";

  const missionText =
    trustProfile?.mission ||
    "To serve our community through compassionate social action supporting education, healthcare, community welfare, women’s empowerment, senior citizens and environmental care.";

  const visionText =
    trustProfile?.vision ||
    "To foster an empowered, compassionate and self-reliant society through accessible community support, education, health and meaningful social participation.";

  const getInitials = (name: string): string => {
    if (!name) return "TR";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const reveal = shouldReduceMotion
    ? { initial: { opacity: 1, y: 0 }, whileInView: { opacity: 1, y: 0 } }
    : { initial: { opacity: 0, y: 35 }, whileInView: { opacity: 1, y: 0 } };

  const fadeLeft = shouldReduceMotion
    ? { initial: { opacity: 1, x: 0 }, whileInView: { opacity: 1, x: 0 } }
    : { initial: { opacity: 0, x: -45 }, whileInView: { opacity: 1, x: 0 } };

  const fadeRight = shouldReduceMotion
    ? { initial: { opacity: 1, x: 0 }, whileInView: { opacity: 1, x: 0 } }
    : { initial: { opacity: 0, x: 45 }, whileInView: { opacity: 1, x: 0 } };

  const transition = { duration: 0.7, ease: "easeOut" as const };

  const t = {
    about: language === "mr" ? "आमच्याविषयी" : language === "hi" ? "हमारे बारे में" : "About Our Trust",
    title:
      language === "mr"
        ? "सेवा, संवेदना आणि समाजाशी नाते"
        : language === "hi"
        ? "सेवा, संवेदना और समाज से जुड़ाव"
        : "Service, Compassion & Community",
    description:
      language === "mr"
        ? `${trustName} समाजातील गरजू व्यक्ती, कुटुंबे आणि समुदायांसाठी विविध सामाजिक उपक्रमांद्वारे कार्य करण्याचा प्रयत्न करते.`
        : language === "hi"
        ? `${trustName} जरूरतमंद लोगों, परिवारों और समुदायों के लिए विभिन्न सामाजिक पहलों के माध्यम से सेवा का प्रयास करता है।`
        : `${trustName} works towards meaningful community service through initiatives supporting people, families and communities in need.`,
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f5f0e7] text-stone-800">
      {/* Ambient editorial background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          animate={
            shouldReduceMotion
              ? undefined
              : { y: [0, -20, 0], rotate: [0, 5, 0] }
          }
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -left-32 top-36 h-80 w-80 rounded-full border-[20px] border-amber-700/[0.035]"
        />
        <motion.div
          animate={
            shouldReduceMotion
              ? undefined
              : { y: [0, 18, 0], rotate: [0, -4, 0] }
          }
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -right-40 top-[38%] h-96 w-96 rounded-full border-[26px] border-emerald-900/[0.035]"
        />
        <div className="absolute left-[10%] top-[18%] h-2 w-2 rounded-full bg-amber-500/30" />
        <div className="absolute right-[14%] top-[42%] h-1.5 w-1.5 rounded-full bg-emerald-700/30" />
      </div>

      <div className="relative mx-auto max-w-7xl space-y-20 px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
        {/* HEADER */}
        <motion.section {...reveal} transition={transition} viewport={{ once: true, amount: 0.15 }}>
          <PageHeader
            badge={t.about}
            badgeIcon={<ShieldCheck className="h-3.5 w-3.5 text-emerald-700" />}
            title={t.title}
            description={t.description}
          />
        </motion.section>

        {/* HERO / VISUAL STORY */}
        <motion.section
          {...reveal}
          transition={{ ...transition, duration: 0.85 }}
          viewport={{ once: true, amount: 0.15 }}
          className="relative overflow-hidden rounded-[2.5rem] border border-[#ded5c4] bg-[#fffdf8] shadow-[0_25px_70px_rgba(55,45,29,0.10)]"
        >
          <div className="absolute left-0 right-0 top-0 z-30 h-1.5 bg-gradient-to-r from-emerald-950 via-amber-500 to-emerald-950" />

          <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
            <div className="group relative min-h-[430px] overflow-hidden bg-[#123d29] sm:min-h-[540px]">
              <video
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1800ms] group-hover:scale-[1.035]"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                poster="/activities/image.png"
              >
                <source
                  src="/activities/gemini_generated_video_aab217ae.mp4"
                  type="video/mp4"
                />
              </video>

              <div className="absolute inset-0 bg-gradient-to-r from-[#0b2d1e]/60 via-transparent to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#071d14]/80 via-transparent to-transparent" />

              <motion.div
                animate={shouldReduceMotion ? undefined : { y: [0, -8, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-7 left-6 sm:left-9"
              >
                <div className="flex items-center gap-2 rounded-full border border-white/20 bg-black/20 px-4 py-2.5 text-xs font-semibold text-white backdrop-blur-xl">
                  <span className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.8)]" />
                  {language === "mr"
                    ? "समाजाशी जोडलेली सेवा"
                    : language === "hi"
                    ? "समाज से जुड़ी सेवा"
                    : "Service rooted in community"}
                </div>
              </motion.div>

              <div className="absolute right-6 top-7 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur-md">
                Nashik • Maharashtra
              </div>
            </div>

            <motion.div
              {...fadeRight}
              transition={{ ...transition, delay: 0.12 }}
              className="relative flex flex-col justify-center p-7 sm:p-10 lg:p-12"
            >
              <div className="mb-5 flex items-center gap-3">
                <span className="h-px w-10 bg-amber-500" />
                <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-800">
                  {language === "mr" ? "सेवेची वाटचाल" : language === "hi" ? "सेवा की यात्रा" : "A Journey of Service"}
                </span>
              </div>

              <h2 className="max-w-lg font-serif text-3xl font-bold leading-[1.08] text-[#173b2a] sm:text-5xl">
                {language === "mr"
                  ? "समाजासाठी केलेली प्रत्येक छोटी सेवा महत्त्वाची आहे."
                  : language === "hi"
                  ? "समाज के लिए किया गया हर छोटा प्रयास महत्वपूर्ण है।"
                  : "Every meaningful act of service begins with care."}
              </h2>

              <p className="mt-5 max-w-xl text-sm leading-7 text-stone-600 sm:text-base">
                {language === "mr"
                  ? "शिक्षण, आरोग्य, पर्यावरण आणि समुदायाच्या गरजांशी जोडलेल्या विविध उपक्रमांमधून समाजाशी अर्थपूर्ण नाते निर्माण करण्याचा प्रयत्न."
                  : language === "hi"
                  ? "शिक्षा, स्वास्थ्य, पर्यावरण और समुदाय की जरूरतों से जुड़े विभिन्न प्रयासों के माध्यम से सार्थक जुड़ाव का प्रयास।"
                  : "Through initiatives connected with education, healthcare, environment and community needs, the Trust seeks to create meaningful social participation."}
              </p>

              <div className="mt-8 grid grid-cols-2 gap-3">
                <MiniHighlight icon={<Heart className="h-4 w-4" />} text={language === "mr" ? "समुदाय" : language === "hi" ? "समुदाय" : "Community"} />
                <MiniHighlight icon={<Leaf className="h-4 w-4" />} text={language === "mr" ? "पर्यावरण" : language === "hi" ? "पर्यावरण" : "Environment"} />
                <MiniHighlight icon={<BookOpen className="h-4 w-4" />} text={language === "mr" ? "शिक्षण" : language === "hi" ? "शिक्षा" : "Education"} />
                <MiniHighlight icon={<Stethoscope className="h-4 w-4" />} text={language === "mr" ? "आरोग्य" : language === "hi" ? "स्वास्थ्य" : "Healthcare"} />
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* MISSION / VISION */}
        <section className="space-y-8">
          <motion.div {...reveal} transition={transition} viewport={{ once: true }}>
            <SectionHeader
              tag={language === "mr" ? "ध्येय आणि दृष्टी" : language === "hi" ? "ध्येय और दृष्टि" : "Mission & Vision"}
              title={language === "mr" ? "सेवेचा विचार आणि भविष्यातील दिशा" : language === "hi" ? "सेवा का विचार और भविष्य की दिशा" : "The Thought Behind Our Service"}
              description={language === "mr" ? "समाजाच्या गरजा समजून घेऊन सातत्यपूर्ण आणि अर्थपूर्ण सामाजिक सहभाग निर्माण करण्याचा प्रयत्न." : language === "hi" ? "समुदाय की जरूरतों को समझते हुए निरंतर और सार्थक सामाजिक सहभागिता का प्रयास।" : "An approach centred on understanding community needs and creating meaningful social participation."}
            />
          </motion.div>

          <div className="grid gap-5 lg:grid-cols-2">
            <InfoCard
              number="01"
              icon={<Award className="h-5 w-5" />}
              title={language === "mr" ? "आमचे ध्येय" : language === "hi" ? "हमारा ध्येय" : "Our Mission"}
              text={missionText}
              accent="green"
              shouldReduceMotion={shouldReduceMotion}
            />
            <InfoCard
              number="02"
              icon={<Scale className="h-5 w-5" />}
              title={language === "mr" ? "आमची दृष्टी" : language === "hi" ? "हमारी दृष्टि" : "Our Vision"}
              text={visionText}
              accent="gold"
              shouldReduceMotion={shouldReduceMotion}
            />
          </div>
        </section>

        {/* DIVIDER */}
        <motion.div {...reveal} transition={transition} viewport={{ once: true }} className="flex items-center justify-center gap-3">
          <span className="h-px w-16 bg-gradient-to-r from-transparent to-amber-400" />
          <span className="h-2 w-2 rotate-45 border border-amber-500" />
          <Heart className="h-4 w-4 text-emerald-700" />
          <span className="h-2 w-2 rotate-45 border border-amber-500" />
          <span className="h-px w-16 bg-gradient-to-l from-transparent to-amber-400" />
        </motion.div>

        {/* SERVICES */}
        <section className="space-y-8">
          <motion.div {...reveal} transition={transition} viewport={{ once: true }}>
            <SectionHeader
              tag={language === "mr" ? "सेवा क्षेत्र" : language === "hi" ? "सेवा क्षेत्र" : "Areas of Service"}
              title={language === "mr" ? "समाजाच्या विविध गरजांशी जोडलेले कार्य" : language === "hi" ? "समुदाय की विभिन्न जरूरतों से जुड़ा कार्य" : "Serving Different Community Needs"}
              description={language === "mr" ? "विविध सामाजिक गरजांशी जोडलेले उपक्रम." : language === "hi" ? "विभिन्न सामाजिक जरूरतों से जुड़े प्रयास।" : "Community-oriented initiatives across different areas of social service."}
            />
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {trustProfile?.objectives?.length ? (
              trustProfile.objectives.map((obj, idx) => (
                <CompactServiceCard
                  key={idx}
                  number={String(idx + 1).padStart(2, "0")}
                  title={obj.title}
                  description={obj.description}
                  icon={getServiceIcon(idx)}
                  shouldReduceMotion={shouldReduceMotion}
                />
              ))
            ) : (
              <>
                <CompactServiceCard number="01" title="Educational Support" description="Support connected with learning, students and educational opportunities." icon={<GraduationCap className="h-5 w-5" />} shouldReduceMotion={shouldReduceMotion} />
                <CompactServiceCard number="02" title="Health & Wellness" description="Community health activities and wellbeing initiatives." icon={<Stethoscope className="h-5 w-5" />} shouldReduceMotion={shouldReduceMotion} />
                <CompactServiceCard number="03" title="Community Support" description="Support and participation for people and families in need." icon={<Users className="h-5 w-5" />} shouldReduceMotion={shouldReduceMotion} />
                <CompactServiceCard number="04" title="Senior Citizens" description="Initiatives supporting dignity, wellbeing and participation." icon={<Heart className="h-5 w-5" />} shouldReduceMotion={shouldReduceMotion} />
                <CompactServiceCard number="05" title="Environment" description="Tree plantation and environmental awareness activities." icon={<TreePine className="h-5 w-5" />} shouldReduceMotion={shouldReduceMotion} />
                <CompactServiceCard number="06" title="Community Empowerment" description="Activities encouraging skills, participation and self-reliance." icon={<HandHeart className="h-5 w-5" />} shouldReduceMotion={shouldReduceMotion} />
              </>
            )}
          </div>
        </section>

        {/* ACTIVITY COLLAGE */}
        <motion.section
          {...reveal}
          transition={{ ...transition, duration: 0.85 }}
          viewport={{ once: true, amount: 0.15 }}
          className="relative overflow-hidden rounded-[2.5rem] bg-[#173f2c] p-5 text-white shadow-[0_22px_60px_rgba(23,63,44,0.18)] sm:p-8"
        >
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border border-amber-300/10" />

          <div className="relative mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="h-px w-8 bg-amber-400" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-300">
                  {language === "mr" ? "सेवेतील क्षण" : language === "hi" ? "सेवा के क्षण" : "Moments of Service"}
                </span>
              </div>
              <h3 className="font-serif text-3xl font-bold">
                {language === "mr" ? "कामातून दिसणारी सेवा" : language === "hi" ? "काम के माध्यम से दिखाई देने वाली सेवा" : "Service in Action"}
              </h3>
            </div>
            <p className="max-w-md text-xs leading-6 text-emerald-50/70 sm:text-right">
              {language === "mr" ? "Trust च्या वास्तविक उपक्रमांचे निवडक क्षण." : language === "hi" ? "Trust की वास्तविक गतिविधियों के चुनिंदा क्षण।" : "Selected moments from the Trust's community activities."}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-[1.4fr_0.6fr]">
            <div className="group relative min-h-[350px] overflow-hidden rounded-[1.8rem] border border-white/10 bg-black/20">
              <video
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-[1.04]"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                poster="/activities/image.png"
              >
                <source src="/activities/gemini_generated_video_d46168d8.mp4" type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-transparent" />
              <div className="absolute bottom-5 left-5">
                <span className="rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-md">
                  Trust Activity
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-1">
              <ActivityImage
                src="/activities/Charity Camp Book Distribution.png"
                label={language === "mr" ? "शिक्षण" : language === "hi" ? "शिक्षा" : "Education"}
                icon={<BookOpen className="h-4 w-4" />}
              />
              <ActivityImage
                src="/activities/Community Aid Distribution Under the Trees.png"
                label={language === "mr" ? "समुदाय" : language === "hi" ? "समुदाय" : "Community"}
                icon={<Users className="h-4 w-4" />}
              />
            </div>
          </div>
        </motion.section>

        {/* IMPACT PASSPORT */}
        <motion.section
          {...reveal}
          transition={{ ...transition, duration: 0.85 }}
          viewport={{ once: true, amount: 0.2 }}
          className="relative overflow-hidden rounded-[2.5rem] border border-emerald-900 bg-[#174b31] text-white shadow-[0_22px_60px_rgba(23,75,49,0.16)]"
        >
          <motion.div
            animate={shouldReduceMotion ? undefined : { scale: [1, 1.05, 1], opacity: [0.25, 0.55, 0.25] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -right-24 -top-24 h-80 w-80 rounded-full border border-amber-300/20"
          />

          <div className="relative grid items-center gap-8 p-8 sm:p-10 lg:grid-cols-[1fr_auto] lg:p-12">
            <div>
              <div className="flex items-center gap-2 text-amber-300">
                <Sparkles className="h-4 w-4" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em]">
                  {language === "mr" ? "प्रभावाची नोंद" : language === "hi" ? "प्रभाव की जानकारी" : "Understanding Impact"}
                </span>
              </div>
              <h3 className="mt-4 font-serif text-3xl font-bold">Impact Passport</h3>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-emerald-50/80">
                {language === "mr"
                  ? "देणगी आणि सामाजिक उपक्रमांचा प्रवास समजून घेण्यासाठी डिजिटल सुविधा."
                  : language === "hi"
                  ? "दान और सामाजिक पहलों की यात्रा को समझने के लिए डिजिटल सुविधा।"
                  : "A digital feature designed to help understand the journey of donations and community initiatives."}
              </p>
            </div>

            <Link to="/impact-passport">
              <Button size="sm" className="border-0 bg-amber-400 font-bold text-stone-950 hover:bg-amber-300" rightIcon={<ArrowRight className="h-4 w-4" />}>
                {language === "mr" ? "पहा" : language === "hi" ? "देखें" : "Explore"}
              </Button>
            </Link>
          </div>
        </motion.section>

        {/* TRUSTEES */}
        <motion.section
          {...reveal}
          transition={transition}
          viewport={{ once: true, amount: 0.1 }}
          id="trustees"
          className="relative overflow-hidden rounded-[2.5rem] border border-[#ded7ca] bg-[#fffdf8] p-6 shadow-[0_15px_45px_rgba(67,56,38,0.07)] sm:p-9"
        >
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full border-[18px] border-amber-700/[0.035]" />

          <SectionHeader
            tag={language === "mr" ? "विश्वस्त मंडळ" : language === "hi" ? "न्यासी मंडल" : "Trustees"}
            title={language === "mr" ? "संस्थेच्या कार्याला दिशा देणारे विश्वस्त" : language === "hi" ? "संस्था के कार्य को दिशा देने वाले न्यासी" : "The People Guiding the Trust"}
            description={language === "mr" ? "संस्थेच्या सामाजिक कार्याला मार्गदर्शन करणाऱ्या विश्वस्तांची माहिती." : language === "hi" ? "संस्था के सामाजिक कार्य का मार्गदर्शन करने वाले न्यासियों की जानकारी।" : "Meet the trustees who help guide the Trust's social initiatives."}
          />

          {loading ? (
            <div className="space-y-3 py-14 text-center">
              <RefreshCw className="mx-auto h-6 w-6 animate-spin text-[#185c3a]" />
              <p className="text-sm text-stone-500">
                {language === "mr" ? "विश्वस्तांची माहिती लोड होत आहे..." : language === "hi" ? "न्यासियों की जानकारी लोड हो रही है..." : "Loading trustee information..."}
              </p>
            </div>
          ) : error ? (
            <div className="mx-auto mt-8 max-w-md space-y-3 rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center">
              <AlertCircle className="mx-auto h-6 w-6 text-rose-600" />
              <p className="text-sm text-rose-800">{error}</p>
              <Button size="sm" variant="outline" onClick={refreshAll} className="text-xs">
                <RefreshCw className="mr-1 h-3.5 w-3.5" />
                Try Again
              </Button>
            </div>
          ) : trustees.length === 0 ? (
            <div className="mx-auto mt-8 max-w-xl rounded-2xl border border-dashed border-stone-300 bg-[#faf7f0] p-8 text-center">
              <UserCheck className="mx-auto h-8 w-8 text-stone-400" />
              <h4 className="mt-3 font-serif font-bold text-stone-800">
                {language === "mr" ? "विश्वस्तांची माहिती अद्याप प्रकाशित केलेली नाही" : language === "hi" ? "न्यासियों की जानकारी अभी प्रकाशित नहीं की गई है" : "Trustee records are not published yet"}
              </h4>
              <p className="mt-2 text-sm leading-relaxed text-stone-500">
                {language === "mr" ? "अधिकृत माहिती उपलब्ध झाल्यानंतर ती येथे प्रदर्शित केली जाईल." : language === "hi" ? "आधिकारिक जानकारी उपलब्ध होने के बाद उसे यहां प्रदर्शित किया जाएगा।" : "Official trustee information will appear here once it is published."}
              </p>
            </div>
          ) : (
            <div className="mx-auto mt-8 grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {trustees.map((trustee, idx) => (
                <motion.div
                  key={trustee.id || trustee._id}
                  initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.1 }}
                  transition={{ duration: 0.5, delay: Math.min(idx * 0.06, 0.3) }}
                  whileHover={shouldReduceMotion ? undefined : { y: -7 }}
                  className="group rounded-[1.5rem] border border-[#e2dacd] bg-[#faf7f0] p-5 text-center transition-all duration-300 hover:border-amber-300 hover:bg-white hover:shadow-[0_16px_35px_rgba(67,56,38,0.10)]"
                >
                  {trustee.photo ? (
                    <img src={trustee.photo} alt={trustee.name} className="mx-auto h-[76px] w-[76px] rounded-full border-2 border-amber-400/60 object-cover ring-4 ring-emerald-50" />
                  ) : (
                    <div className="mx-auto flex h-[76px] w-[76px] items-center justify-center rounded-full border-2 border-amber-300/60 bg-gradient-to-br from-emerald-50 to-amber-50 font-serif text-lg font-bold text-[#185c3a]">
                      {getInitials(trustee.name)}
                    </div>
                  )}

                  <div className="mt-4">
                    <h4 className="font-serif text-base font-bold text-stone-900">{trustee.name}</h4>
                    <p className="mt-1 text-xs font-semibold text-[#185c3a]">{trustee.designation}</p>
                    {trustee.qualification && <p className="mt-1 text-[11px] italic text-stone-500">{trustee.qualification}</p>}
                    {trustee.role && trustee.role !== "Trustee" && (
                      <span className="mt-2 inline-block rounded-full border border-amber-200 bg-amber-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-900">
                        {trustee.role}
                      </span>
                    )}
                    {trustee.bio && (
                      <p className="mt-3 rounded-xl border border-[#e9e2d7] bg-white/70 p-3 text-left text-xs leading-relaxed text-stone-600">
                        {trustee.bio}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.section>

        {/* FINAL CTA */}
        <motion.section
          {...reveal}
          transition={{ ...transition, duration: 0.85 }}
          viewport={{ once: true, amount: 0.15 }}
          className="relative overflow-hidden rounded-[2.5rem] bg-[#174b31] text-white shadow-[0_22px_60px_rgba(23,75,49,0.18)]"
        >
          <motion.div
            animate={shouldReduceMotion ? undefined : { rotate: [0, 360] }}
            transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
            className="absolute -right-24 -top-24 h-80 w-80 rounded-full border border-amber-300/15"
          />

          <div className="relative p-9 text-center sm:p-14">
            <motion.div
              animate={shouldReduceMotion ? undefined : { y: [0, -6, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-amber-300/40 bg-white/5"
            >
              <HandHeart className="h-6 w-6 text-amber-300" />
            </motion.div>

            <h3 className="mt-5 font-serif text-3xl font-bold sm:text-4xl">
              {language === "mr" ? "सेवा कार्याशी जोडा" : language === "hi" ? "सेवा कार्य से जुड़ें" : "Be Part of the Journey"}
            </h3>

            <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-emerald-50/80">
              {language === "mr"
                ? "समाजोपयोगी उपक्रम जाणून घ्या, सहभागी व्हा किंवा आमच्याशी संपर्क साधा."
                : language === "hi"
                ? "सामाजिक पहलों को जानें, सहभागी बनें या हमसे संपर्क करें।"
                : "Explore our initiatives, participate in meaningful work or connect with the Trust."}
            </p>

            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link to="/causes">
                <Button size="sm" className="border-0 bg-amber-400 font-bold text-stone-950 hover:bg-amber-300">
                  {language === "mr" ? "उपक्रम पहा" : language === "hi" ? "उपक्रम देखें" : "Explore Causes"}
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="sm" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  {language === "mr" ? "संपर्क साधा" : language === "hi" ? "संपर्क करें" : "Contact Trust"}
                </Button>
              </Link>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

function getServiceIcon(index: number): React.ReactNode {
  const icons = [
    <GraduationCap className="h-5 w-5" />,
    <Stethoscope className="h-5 w-5" />,
    <Users className="h-5 w-5" />,
    <Heart className="h-5 w-5" />,
    <TreePine className="h-5 w-5" />,
    <HandHeart className="h-5 w-5" />,
    <BookOpen className="h-5 w-5" />,
    <Droplets className="h-5 w-5" />,
  ];
  return icons[index % icons.length];
}

interface MiniHighlightProps {
  icon: React.ReactNode;
  text: string;
}

const MiniHighlight: React.FC<MiniHighlightProps> = ({ icon, text }) => (
  <motion.div
    whileHover={{ y: -3 }}
    className="group flex items-center gap-2 rounded-xl border border-[#e6dfd3] bg-[#faf7f0] px-3 py-2.5 transition-all duration-300 hover:border-amber-200 hover:bg-white hover:shadow-sm"
  >
    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#e8f1e9] text-[#185c3a] transition-transform duration-300 group-hover:scale-110">
      {icon}
    </span>
    <span className="text-xs font-semibold text-stone-700">{text}</span>
  </motion.div>
);

interface InfoCardProps {
  number: string;
  icon: React.ReactNode;
  title: string;
  text: string;
  accent: "green" | "gold";
  shouldReduceMotion: boolean;
}

const InfoCard: React.FC<InfoCardProps> = ({
  number,
  icon,
  title,
  text,
  accent,
  shouldReduceMotion,
}) => {
  const green = accent === "green";

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6 }}
      whileHover={shouldReduceMotion ? undefined : { y: -7 }}
      className="group relative overflow-hidden rounded-[1.8rem] border border-[#ddd5c6] bg-[#fffdf8] p-6 shadow-[0_8px_28px_rgba(67,56,38,0.05)] transition-shadow duration-500 hover:shadow-[0_18px_42px_rgba(67,56,38,0.10)] sm:p-8"
    >
      <div className={`absolute right-0 top-0 h-36 w-36 rounded-bl-full transition-transform duration-700 group-hover:scale-125 ${green ? "bg-emerald-50/80" : "bg-amber-50/80"}`} />

      <div className="relative">
        <div className="flex items-center justify-between">
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${green ? "bg-[#e8f1e9] text-[#185c3a]" : "bg-[#fbf1d9] text-amber-800"}`}>
            {icon}
          </div>
          <span className="font-serif text-5xl font-bold text-stone-900/[0.045]">{number}</span>
        </div>

        <h3 className="mt-7 font-serif text-2xl font-bold text-[#173b2a]">{title}</h3>
        <p className="mt-3 text-sm leading-7 text-stone-600 sm:text-base">{text}</p>

        <div className="mt-6 flex items-center gap-2 border-t border-[#ece6dc] pt-4">
          <CheckCircle2 className="h-4 w-4 text-emerald-700" />
          <span className="text-xs text-stone-500">Community-focused approach</span>
        </div>
      </div>
    </motion.div>
  );
};

interface CompactServiceCardProps {
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  shouldReduceMotion: boolean;
}

const CompactServiceCard: React.FC<CompactServiceCardProps> = ({
  number,
  title,
  description,
  icon,
  shouldReduceMotion,
}) => (
  <motion.div
    initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.1 }}
    transition={{ duration: 0.5 }}
    whileHover={shouldReduceMotion ? undefined : { y: -6 }}
    className="group relative overflow-hidden rounded-[1.5rem] border border-[#ddd5c7] bg-[#fffdf8] p-5 shadow-[0_5px_20px_rgba(67,56,38,0.045)] transition-all duration-300 hover:border-emerald-200 hover:shadow-[0_16px_34px_rgba(67,56,38,0.10)]"
  >
    <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-emerald-50/80 transition-transform duration-500 group-hover:scale-150" />
    <div className="absolute bottom-0 left-0 top-0 w-[3px] bg-gradient-to-b from-amber-400 via-amber-300 to-transparent" />

    <div className="relative flex items-start gap-4">
      <motion.div
        whileHover={shouldReduceMotion ? undefined : { scale: 1.08, rotate: 4 }}
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-emerald-100 bg-[#e8f1e9] text-[#185c3a] transition-all duration-300 group-hover:bg-[#185c3a] group-hover:text-white"
      >
        {icon}
      </motion.div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-serif text-[17px] font-bold leading-tight text-[#173b2a]">{title}</h4>
          <span className="shrink-0 text-[10px] font-bold tracking-[0.15em] text-amber-700/70">{number}</span>
        </div>
        <p className="mt-2 line-clamp-3 text-[13px] leading-5 text-stone-600">{description}</p>
      </div>
    </div>

    <div className="relative mt-5 flex items-center gap-2">
      <span className="h-px w-8 bg-amber-400/70 transition-all duration-300 group-hover:w-12" />
      <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-stone-400">Community Service</span>
    </div>
  </motion.div>
);

interface ActivityImageProps {
  src: string;
  label: string;
  icon: React.ReactNode;
}

const ActivityImage: React.FC<ActivityImageProps> = ({ src, label, icon }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="group relative min-h-[160px] overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#214f39]"
  >
    <img
      src={src}
      alt={label}
      className="absolute inset-0 h-full w-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-110"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
    <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white">
      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/15 backdrop-blur-md">
        {icon}
      </span>
      <span className="text-xs font-semibold">{label}</span>
    </div>
  </motion.div>
);
