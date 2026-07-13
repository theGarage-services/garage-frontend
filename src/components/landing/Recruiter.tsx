import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { Footer } from '../layout/Footer';
import { Navigation } from '../layout/Navigation';
import { ArrowRight, Sparkles, FileText, ListChecks, CalendarCheck, TrendingUp, ShieldCheck, Zap, LucideIcon } from 'lucide-react';

interface RecruiterProps {
  onGetStarted: () => void;
  isAuthenticated?: boolean;
}

export function Recruiter({ onGetStarted, isAuthenticated }: Readonly<RecruiterProps>) {
  const benefits = [
    "You receive hundreds of applications for every open role.",
    "Manually reviewing each one is slow and inconsistent.",
    "The best candidates get buried. Bias creeps into shortlists.",
  ];

  const steps: { icon: LucideIcon; label: string; headline: string; body: string }[] = [
    {
      icon: FileText,
      label: "Post your role",
      headline: "Create a job posting with your requirements.",
      body: "Kazi AI handles the matching.",
    },
    {
      icon: ListChecks,
      label: "Review ranked candidates",
      headline: "See AI-ranked applicants with match scores.",
      body: "Fit explanations included for every candidate.",
    },
    {
      icon: CalendarCheck,
      label: "Move forward fast",
      headline: "Schedule interviews directly from the platform.",
      body: "No back-and-forth. No wasted time.",
    },
  ];

  const kaziFeatures: { icon: LucideIcon; title: string; body: string }[] = [
    {
      icon: TrendingUp,
      title: "Ranked Candidates",
      body: "AI pre-ranks applicants so your shortlist is already sorted when you arrive.",
    },
    {
      icon: ShieldCheck,
      title: "Reduced Bias",
      body: "Bias-aware scoring surfaces the best fit, not the most familiar profile.",
    },
    {
      icon: Zap,
      title: "Faster Shortlists",
      body: "Go from open role to interview-ready candidates in less time.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FBF9F7] text-[#1A1A1A] overflow-hidden relative">
      <Navigation />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden bg-gradient-to-b from-[#EEF5FF] to-[#FBF9F7]">

        {/* Abstract background shapes */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute -top-20 -left-32 w-[420px] h-[420px] rounded-full bg-[#FF6000]/20" />
          <div className="absolute bottom-5 -left-20 w-[340px] h-[340px] rounded-full bg-[#469AF9]/20" />
          <div className="absolute top-24 right-10 w-[260px] h-[260px] rounded-3xl bg-[#469AF9]/20 rotate-[18deg]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full py-24">
          <div className="flex flex-col items-center text-center">

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="inline-block mb-8"
            >
              <div className="px-4 py-2 bg-white border-2 font-medium border-[#469AF9]/40 rounded-full text-sm text-[#469AF9]">
                <Sparkles className="w-4 h-4 inline mr-2" />
                For Recruiters
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
              Hire faster.
              <br />
              Hire{" "}
              <span className="text-[#469AF9]">smarter.</span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap justify-center gap-3 mb-8"
            >
              <span className="inline-flex items-center gap-1.5 bg-[#469AF9]/10 text-[#185FA5] pl-2 pr-4 py-1.5 rounded-full text-base font-medium">
                <span className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-xs">M</span>{' '}
                Managers
              </span>
              <span className="inline-flex items-center gap-1.5 bg-green-500/10 text-green-800 pl-2 pr-4 py-1.5 rounded-full text-base font-medium">
                <span className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-xs">HR</span>{' '}
                Human Resources
              </span>
              <span className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-800 pl-2 pr-4 py-1.5 rounded-full text-base font-medium">
                <span className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-xs">AD</span>{' '}
                Administrators
              </span>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-lg text-[#545250] mb-8 max-w-[95vw] sm:max-w-lg leading-relaxed"
            >
              Ranked candidates, reduced bias, faster shortlist. Create your free recruiter account.
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
                    className="bg-[#469AF9] hover:bg-[#1e74d6] text-white rounded-full px-6 py-5"
                  >
                    Create Account
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <Button
                    onClick={onGetStarted}
                    className="bg-white text-black rounded-full py-5 border-2 border-[#469AF9] hover:bg-[#1e74d6] hover:text-white"
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


      {/* Benefits Section */}
      <section className="relative py-28 px-8 sm:px-6 lg:px-8 bg-[#1A1A1A] overflow-hidden">
        
        <div className="max-w-7xl mx-auto relative z-10">
         <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#FF6000]/5" style={{ transform: "translate(30%, -40%)" }} />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[#469AF9]/5" style={{ transform: "translate(-30%, 40%)" }} />
        </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 "
          >
            <p className="text-[#469AF9] uppercase tracking-widest text-sm font-medium font-inter mb-3">
              The Problem
            </p>
            <h2 className="text-5xl md:text-6xl font-semibold font-inter text-white leading-tight">
              The old way wastes{" "}
              <span className=" text-transparent bg-clip-text bg-gradient-to-r from-[#469AF9] to-[#FF6000]">time</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10 ">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`group bg-[#1A1A1A] py-8  ${
                  index === 0
                    ? "md:pr-10"
                    : index === benefits.length - 1
                    ? "md:pl-10"
                    : "md:px-10"
                }`}
              >
                <div className="text-6xl font-medium text-white/70 leading-none mb-6 select-none transition-colors duration-200 group-hover:text-[#469AF9]">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <p className="text-lg text-white/45 leading-relaxed">{benefit}</p>
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
            <p className="text-[#469AF9] uppercase tracking-widest text-sm font-semibold font-inter mb-3">
              How it works
            </p>
            <h2 className="text-5xl md:text-6xl font-semibold font-inter text-[#1A1A1A] leading-tight">
              For recruiters
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
                className="grid grid-cols-[72px_1fr] md:grid-cols-[96px_1fr] gap-6 py-10 items-start"
              >
                <div className="w-12 h-12 rounded-xl bg-[#469AF9]/[0.08] border border-[#469AF9]/20 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-[#469AF9]" aria-hidden="true" />
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


      {/* Three Things Kazi Does Section */}
      <section className="relative py-28 px-8 sm:px-6 lg:px-8 bg-[#1A1A1A] overflow-hidden">

        {/* Subtle accent shapes */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#FF6000]/5" style={{ transform: "translate(30%, -40%)" }} />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[#469AF9]/5" style={{ transform: "translate(-30%, 40%)" }} />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <p className="text-[#469AF9] uppercase tracking-widest text-sm font-medium font-inter mb-3">
              What you get
            </p>
            <h2 className="text-5xl md:text-6xl font-semibold font-inter text-white leading-tight max-w-[95vw] sm:max-w-2xl">
              Three things Kazi AI does{" "}
              <span className="text-[#469AF9]">for you</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10">
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
                <div className="w-12 h-12 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center group-hover:border-[#469AF9]/40 group-hover:bg-[#469AF9]/10 transition-all duration-300">
                  <Icon className="w-5 h-5 text-white/60 group-hover:text-[#469AF9] transition-colors duration-300" aria-hidden="true" />
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
      <section className="relative py-32 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-[#EEF5FF] to-[#FBF9F7]">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl md:text-7xl font-bold mb-8 leading-tight text-[#1A1A1A]">
              Find your ideal{' '}
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#469AF9] to-[#FF6000]">
                candidate
              </span>
              {' '}today!
            </h2>

            <p className="text-xl text-[#545250] mb-12 max-w-[95vw] sm:max-w-lg mx-auto">
              Join thousands of recruiters who have found their perfect candidates through Kazi.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={onGetStarted}
                size="lg"
                className="bg-gradient-to-r from-[#469AF9] to-[#6AADFA] hover:from-[#3B8FE8] hover:to-[#5FA0F9] text-white px-12 py-6 text-lg rounded-full"
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