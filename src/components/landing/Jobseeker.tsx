import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { Footer } from '../layout/Footer';
import { Navigation } from '../layout/Navigation';
import {
  ArrowRight,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Zap,
  FileText,
  ListChecks,
  CalendarCheck,
  LucideIcon,
} from 'lucide-react';

interface JobseekerProps {
  onGetStarted: () => void;
  isAuthenticated?: boolean;
}

export function Jobseeker({ onGetStarted, isAuthenticated }: Readonly<JobseekerProps>) {
  const benefits = [
    "You apply and wait weeks, with no update.",
    "You never know if your resume even got read.",
    "You wonder what's holding you back."
  ];

    const steps: { icon: LucideIcon; label: string; headline: string; body: string }[] = [
    {
      icon: FileText,
      label: "Upload your resume",
      headline: "Kazi reads your resume and builds your profile automatically. ",
      body: "You can review and edit everything it pulls in.",
    },
    {
      icon: ListChecks,
      label: "Get matched",
      headline: "AI matches you to relevant roles based on your skills, experience, and goals.",
      body: "Get instant match scores and personalized recommendations.",
    },
    {
      icon: CalendarCheck,
      label: "See where you Stand",
      headline: "Know your match score and ranking for every role you apply to.",
      body: "No guessing. No waiting.",
    },
  ];

  const kaziFeatures: { icon: LucideIcon; title: string; body: string }[] = [
    {
      icon: TrendingUp,
      title: "No more Silence",
      body: "Real feedback on every application.",
    },
    {
      icon: ShieldCheck,
      title: "Matched to the right roles",
      body: "Opportunities that genuinely fit your profile.",
    },
    {
      icon: Zap,
      title: "See your match score",
      body: "Understand how well you fit each role before and after applying.",
    },
    {
      icon: Zap,
      title: "Move at your pace",
      body: "Track all your applications in one place.",
    },
  ];
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FBF9F7] via-[#FFF5F2] to-[#FBF9F7] text-[#1A1A1A] overflow-hidden relative">
      <Navigation />

{/* Hero Section */}
<section className="relative min-h-screen flex items-center pt-16 overflow-hidden bg-[#FBF9F7]">
 
  {/* Abstract background shapes */}
  <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
    <div className="absolute -top-20 -right-20 w-[420px] h-[420px] rounded-full bg-[#469AF9]/15" />
    <div className="absolute bottom-0 -left-24 w-[340px] h-[340px] rounded-full bg-[#469AF9]/15" />
    <div className="absolute bottom-24 right-1/4 w-[260px] h-[260px] rounded-3xl bg-amber-400/15 rotate-[18deg]" />
  </div>
 
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full py-24">
    <div className="flex flex-col items-center text-center">
 
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="inline-block mb-8"
      >
        <div className="px-4 py-2 bg-white border-2 border-[#FF6000]/50 rounded-full text-sm text-[#FF6000]">
          <Sparkles className="w-4 h-4 inline mr-2" />
          For Job Seekers
        </div>
      </motion.div>
 
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="font-inter font-semibold tracking-tight mb-8"
        style={{
          fontSize: "clamp(3.5rem, 13vw, 9rem)",
          lineHeight: 0.95,
        }}
      >
        You are
        <br />
        more than
        <br />
        a <span className="text-[#FF6000]">resume</span>
      </motion.h1>
 
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-wrap justify-center gap-3 mb-8"
      >
        <span className="inline-flex items-center gap-1.5 bg-[#469AF9]/10 text-[#185FA5] pl-2 pr-4 py-1.5 rounded-full text-base font-medium">
          <span className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-xs">PM</span>{' '}
          Product roles
        </span>
        <span className="inline-flex items-center gap-1.5 bg-green-500/10 text-green-800 pl-2 pr-4 py-1.5 rounded-full text-base font-medium">
          <span className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-xs">UX</span>{' '}
          Design roles
        </span>
        <span className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-800 pl-2 pr-4 py-1.5 rounded-full text-base font-medium">
          <span className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-xs">DS</span>{' '}
          Data roles
        </span>
      </motion.div>
 
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-lg text-[#545250] mb-8 max-w-[95vw] sm:max-w-lg leading-relaxed"
      >
        See how you rank. Get matched to the right roles. Move forward with confidence.
      </motion.p>
 
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex flex-col sm:flex-row gap-3 justify-center"
      >
        {!isAuthenticated && (
          <>
          <Button
            onClick={onGetStarted}
            className="bg-gradient-to-r rounded-3xl p-5 from-[#FF6000] to-[#ff8437] hover:from-[#FF6000] hover:to-[#FF6000] text-white"
          >
            Start my profile
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Button
                    onClick={onGetStarted}
                    className="bg-white rounded-full px-6 py-5 border-2 border-[#FF6000] text-[] hover:bg-[#FF6000]/70 hover:text-white hover:border-[#FF6000]/70"
                  >
                    See how it works
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  </>
        )}
      </motion.div>
 
    </div>
  </div>
</section>


      <section className="relative py-28 px-8 sm:px-6 lg:px-8 bg-[#1A1A1A] overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">

          {/* Abstract background shapes */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute -top-20 -right-80 w-[420px] h-[420px] rounded-full bg-[#FF6000]/10" />
          <div className="absolute bottom-0 -left-40 w-[340px] h-[340px] rounded-full bg-[#469AF9]/10" />
        </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <p className="text-[#FF6000] uppercase tracking-widest text-sm font-semibold font-inter mb-3">
              Acknowledging the pain
            </p>
            <h2 className="text-5xl md:text-6xl font-bold font-inter text-white leading-tight">
              Sound familiar  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#469AF9] to-[#FF6000]">?</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`group bg-[#1A1A1A] py-8 ${
                  index === 0
                    ? "md:pr-10"
                    : index === benefits.length - 1
                    ? "md:pl-10"
                    : "md:px-10"
                }`}
              >
                <div className="text-6xl font-medium text-white/70 leading-none mb-6 select-none transition-colors duration-200 group-hover:text-[#FF6000]">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <p className="text-xl text-white/45 leading-relaxed">{benefit}</p>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative py-28 px-8 sm:px-6 lg:px-8 bg-[#FBF9F7] overflow-hidden">
        <div className="max-w-7xl mx-auto">

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <p className="text-[#FF6000] uppercase tracking-wider text-sm font-semibold font-inter mb-3">
              Three Simple Steps
            </p>
            <h2 className="text-5xl md:text-6xl font-semibold font-inter tracking-tight text-[#1A1A1A]">
              How Kazi AI works for job seekers
            </h2>
          </motion.div>

          <div className="flex flex-col divide-y divide-[#1A1A1A]/10">
            {steps.map(({ icon: Icon, label, headline, body }, index) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="grid grid-cols-[72px_1fr] md:grid-cols-[96px_1fr] gap-6 py-8 items-start"
              >
                <div className="w-12 h-12 rounded-xl bg-[#FF6000]/[0.08] border border-[#FF6000]/20 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-[#FF6000]" aria-hidden="true" />
                </div>

                <div>
                  <p className="text-xs uppercase tracking-widest text-[#888] font-medium mb-2">
                    {label}
                  </p>
                  <p className="text-2xl md:text-3xl font-medium text-[#1A1A1A] leading-snug mb-2">
                    {headline}
                  </p>
                  <p className="text-base text-[#545250] leading-relaxed">{body}</p>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* Four Things Kazi Does Section */}
      <section className="relative py-28 px-8 sm:px-6 lg:px-8 bg-[#1A1A1A] overflow-hidden">

        {/* Subtle accent shapes */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-0 hidden md:block right-0 w-[500px] h-[500px] rounded-full bg-[#FF6000]/5" style={{ transform: "translate(30%, -40%)" }} />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[#469AF9]/5" style={{ transform: "translate(-30%, 40%)" }} />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <p className="text-[#FF6000] uppercase tracking-widest text-sm font-semibold font-inter mb-3">
              What you get
            </p>
            <h2 className="text-5xl md:text-6xl font-semibold font-inter text-white leading-tight max-w-[95vw] sm:max-w-2xl">
              Four key things Kazi AI does{" "}
              <span className="text-[#FF6000]">for you</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-white/10">
            {kaziFeatures.map(({ icon: Icon, title, body }, index) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.12 }}
                className={`group py-10 flex flex-col gap-6 ${
                  index === 0
                    ? "md:pr-12"
                    : index === kaziFeatures.length - 1
                    ? "md:pl-12"
                    : "md:px-12"
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center group-hover:border-[#FF6000]/40 group-hover:bg-[#FF6000]/10 transition-all duration-300">
                  <Icon className="w-5 h-5 text-white/60 group-hover:text-[#FF6000] transition-colors duration-300" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-2xl md:text-3xl font-medium text-white mb-3">{title}</p>
                  <p className="text-base text-white/55 leading-relaxed">{body}</p>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-br from-[#FBF9F7] via-[#FFF5F2] to-[#FBF9F7]">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl md:text-7xl font-semibold mb-8 leading-tight text-[#1A1A1A]">
              Ready to Find Your {' '}
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#469AF9] to-[#FF6000]">
                Dream Job?
              </span>
            </h2>

            <p className="text-xl text-[#545250] mb-12 max-w-[95vw] sm:max-w-lg mx-auto">
              Join thousands of job seekers who have found their perfect role through Kazi.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={onGetStarted}
                size="lg"
                className="bg-gradient-to-r from-[#FF6000] to-[#ff9452] hover:from-[#b64600] hover:to-[#d35100] text-white px-12 py-6 text-lg rounded-full"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
