import { useState } from 'react';
import { motion } from 'framer-motion';
import { Navigation } from '../layout/Navigation';
import { Card } from '../ui/card';
import { ArrowRight, Users, Target, Zap } from 'lucide-react';
import { DualPerspectiveDemo } from './DualPerspectiveDemo';
import { Footer } from '../layout/Footer';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
  onViewAbout?: () => void;
  onViewBlog?: () => void;
  isAuthenticated?: boolean;
  onBackToApp?: () => void;
}

export function LandingPage({  }: Readonly<LandingPageProps>) {
  const [showDemo, setShowDemo] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FBF9F7] via-[#FFF5F2] to-[#FBF9F7] text-[#1A1A1A] overflow-hidden relative">
      {/* Ambient glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#FF6000]/8 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#469AF9]/6 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s' }} />
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-[#FF6000]/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '12s' }} />
      </div>
      
      <Navigation/>

      {/* Hero Section with glassmorphism */}
       <section className="relative w-full min-h-screen flex items-center bg-gradient-to-br from-[#FBF9F7] via-[#FFF5F2] to-[#FFE8DC] overflow-hidden">

  {/* ── Animated background blobs ── */}
  <motion.div
    className="absolute top-20 -left-20 w-64 h-64 md:w-96 md:h-96 bg-[#FF6000] rounded-full mix-blend-multiply filter blur-3xl opacity-20 pointer-events-none"
    animate={{ x: [0, 100, 0], y: [0, 50, 0], scale: [1, 1.1, 1] }}
    transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
  />
  <motion.div
    className="absolute top-40 right-20 w-64 h-64 md:w-96 md:h-96 bg-[#469AF9] rounded-full mix-blend-multiply filter blur-3xl opacity-20 pointer-events-none"
    animate={{ x: [0, -100, 0], y: [0, 100, 0], scale: [1, 1.2, 1] }}
    transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
  />
  <motion.div
    className="absolute -bottom-20 left-1/2 w-64 h-64 md:w-96 md:h-96 bg-[#FF6000] rounded-full mix-blend-multiply filter blur-3xl opacity-[0.15] pointer-events-none"
    animate={{ x: [0, 50, 0], y: [0, -50, 0], scale: [1, 1.15, 1] }}
    transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
  />

  {/* Content grid */}
  <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-24">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

      {/* Left — text content */}
      <div className="flex flex-col">

        {/* Badge */}
        <div className="mb-7 w-fit">
          <span className="inline-flex items-center gap-1.5 bg-[#FFF0E8] text-[#C44B00] text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full border border-[#FFCCAA]">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />{' '}
            It Gets Better
          </span>
        </div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="font-bold font-inter text-5xl sm:text-6xl xl:text-7xl tracking-tight text-orange-950 mb-6"
          style={{ lineHeight: 0.95 }}
        >
          Stop applying
          <br />
          into the
          <br />
          <span className="text-[#FF6000] italic">void</span>
        </motion.h1>

        {/* Body */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-base sm:text-lg xl:text-xl text-[#6B6460] leading-relaxed mb-8 max-w-[95vw] sm:max-w-md"
        >
          We connect top talent with recruiters by building smart queues that
          rank candidates, so you get seen, not skipped.
        </motion.p>

        {/* CTAs */}
        <div className="flex flex-wrap gap-3">
          <a
            href="https://forms.gle/XSTpkTWovXBfhf7p9"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#FF751F] hover:bg-[#E55500] text-white text-sm font-semibold px-7 py-3.5 rounded-full transition-all duration-200 hover:-translate-y-px group"
          >
            Join our Talent Pool
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </a>
          <a
            href="https://forms.gle/CnPr692VyrhS8RHC7"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#469AF9] hover:bg-[#1e74d6] text-white text-sm font-semibold px-7 py-3.5 rounded-full transition-all duration-200 hover:-translate-y-px"
          >
            Join our Recruiter Network
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </a>
        </div>
      </div>

      {/* Right — image panel */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="relative flex items-center justify-center"
      >
        {/* Image */}
        <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl" style={{ aspectRatio: "4/5" }}>
          <img
            src={"./Image-2.png"}
            alt="Professional in a modern workspace"
            className="w-full h-full object-cover object-center"
          />
          {/* Subtle dark scrim */}
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(13,5,0,0.45) 100%)" }}
          />
        </div>

        {/* Floating badges — desktop only */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="hidden lg:flex absolute -top-4 -left-6 z-10 items-center gap-2 bg-white/95 backdrop-blur-sm rounded-xl px-5 py-3 text-sm font-semibold text-[#1A1714] shadow-xl whitespace-nowrap"
        >
          <span className="w-2 h-2 rounded-full bg-[#1D9E75]" />{' '}
          3 recruiter views today
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="hidden lg:flex absolute -bottom-4 -right-6 z-10 items-center gap-2 bg-white/95 backdrop-blur-sm rounded-xl px-3 py-2 text-xs font-semibold text-[#1A1714] shadow-xl whitespace-nowrap"
        >
          <span className="w-2 h-2 rounded-full bg-[#469AF9]" />{' '}
          Matched with Stripe · 2m ago
        </motion.div>
      </motion.div>

    </div>
  </div>
</section>
    
     {/* Honest Section - The slow silence of a job search */}
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
      <h2 className="text-4xl font-inter text-white md:text-5xl font-semibold mb-6 bg-clip-text">
        The hiring process lacks clarity.{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#469AF9] to-[#FF6000]">
          But it doesn't have to stay that way.
        </span>
      </h2>
    </motion.div>

    <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10">
      {["You apply.", "You wait.", "You hear nothing."].map((phrase, index) => (
        <motion.div
          key={phrase}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.2 }}
          className={`group bg-[#1A1A1A] py-8 ${
            index === 0
              ? "md:pr-10"
              : index === 2
              ? "md:pl-10"
              : "md:px-10"
          }`}
        >
          <div className="text-6xl font-medium text-white/70 leading-none mb-6 select-none transition-colors duration-200 group-hover:text-[#FF6000]">
            {String(index + 1).padStart(2, "0")}
          </div>
          <p className="text-2xl text-white/45 leading-relaxed">{phrase}</p>
        </motion.div>
      ))}
    </div>
  </div>
</section>

      {/* Dual Perspective Demo Modal */}
      {showDemo && (
        <DualPerspectiveDemo
          onBack={() => setShowDemo(false)}
          onNavigate={() => {}}
          user={null}
          onLogout={() => {}}
        />
      )}

      {/* About Section with glass cards */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#FFE8DC] to-[#FBF9F7]">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-inter text-[#1A1714] md:text-5xl font-semibold mb-6 bg-clip-text">
              Why Join{' '}
            <span className='text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-[#FF6000] to-[#469AF9] bg-clip-text text-transparent'> theGarage?</span>
            </h2>
            <p className="text-xl text-[#545250] max-w-[95vw] sm:max-w-2xl mx-auto">
              We exist to make hiring faster, fairer and more human
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Users className="h-12 w-12" />,
                title: 'Recruiter Selection',
                description: 'Recruiters, when hiring, will upload a JD, and the system will match the JD with a job queue, and based on the rankings, recruiters can select candidates for interviews.',
                color: 'from-[#FF6000] to-[#FF8533]',
              },
              {
                icon: <Zap className="h-12 w-12" />,
                title: 'Job Recommendations & Auto-Apply',
                description: 'The app then surfaces matching jobs (within those streams) ranked by fit. It auto-apply for recommended roles.',
                color: 'from-[#469AF9] to-[#6BB0FF]',
              },
              {
                icon: <Target className="h-12 w-12" />,
                title: 'Application Status Tracking',
                description: 'Once applied (manually or via auto-apply), the candidate dashboard tracks each application\'s status. The platform pushes real-time status updates as recruiters progress candidates through the pipeline.',
                color: 'from-[#FF6000] to-[#469AF9]',
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
              >
                <Card className="h-full backdrop-blur-xl bg-white/60 border border-white/80 shadow-xl hover:shadow-2xl transition-all duration-300 p-8 rounded-2xl group">
                  <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.color} text-white mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-[#1A1A1A]">{feature.title}</h3>
                  <p className="text-[#545250] leading-relaxed">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
<section className="py-24 px-4 sm:px-6 lg:px-8 bg-[#1A1A1A] relative overflow-hidden">
  {/* Abstract background shapes */}
  <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
    <div className="absolute -top-10 -left-16 w-[200px] h-[200px] sm:w-[420px] sm:h-[420px] sm:-top-20 sm:-left-32 rounded-full bg-[#FF6000]/20" />
    <div className="absolute top-16 right-4 w-[140px] h-[140px] sm:w-[260px] sm:h-[260px] sm:top-24 sm:right-10 rounded-3xl bg-[#469AF9]/20 rotate-[18deg]" />
  </div>
  <div className="max-w-6xl mx-auto">
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="text-center mb-16"
    >
      <h2 className="text-4xl md:text-5xl font-bold font-inter mb-6 text-white">
        How It Works
      </h2>
      <p className="text-xl text-gray-400 max-w-[95vw] sm:max-w-2xl mx-auto">
        Three simple steps to transform your job search
      </p>
    </motion.div>
    <div className="grid md:grid-cols-3 gap-8">
      {[
        {
          step: '01',
          title: 'Build your profile',
          description: 'Create a comprehensive profile showcasing your skills, experience, and career preferences to stand out to recruiters.',
        },
        {
          step: '02',
          title: 'Get matched',
          description: 'Our AI-powered system matches you with relevant job queues based on your profile and preferences.',
        },
        {
          step: '03',
          title: 'See where you stand',
          description: 'Track your application status in real-time and see how you rank in job queues for transparency.',
        },
      ].map((step, index) => (
        <motion.div
          key={step.step}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.2, duration: 0.6 }}
          whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
        >
          <div className="relative bg-[#252525] border border-[#333] rounded-2xl p-8 hover:border-[#FF6000] transition-all duration-300">
            <div className="text-6xl font-bold text-[#FF7B25]/80 mb-4">{step.step}</div>
            <h3 className="text-2xl font-bold mb-4 text-white">{step.title}</h3>
            <p className="text-gray-400 leading-relaxed">{step.description}</p>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
</section>
      {/* Dual Audience Section (FULL BLEED IMAGE VERSION) */}
<section className="w-full py-28 px-4 sm:px-6 lg:px-8 bg-[#FBF9F7]">
  <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">

    {/* Recruiter */}
    <div className="relative h-[600px] rounded-xl overflow-hidden group">

      {/* Full bleed image */}
      <img
        src="/Recruiter.png"
        alt="Recruiter"
        className="absolute inset-0 w-full h-full object-cover scale-105 group-hover:scale-110 transition-transform duration-700"
      />

      {/* overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
      <div className="absolute inset-0 shadow-[inset_0_-160px_140px_-20px_rgba(0,0,0,0.75)]" />

      {/* content overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-10 sm:p-12 z-10">

        <p className="text-red-400 uppercase tracking-widest text-xs font-semibold mb-4">
          A Message for Recruiters
        </p>

        <p className="text-white text-xl sm:text-2xl leading-relaxed mb-6 max-w-[95vw] sm:max-w-md">
          "Hire faster. Hire smarter. Ranked candidates. Reduced bias. Faster shortlists."
        </p>

        <button className="bg-[#469AF9] hover:bg-[#2f86f0] text-white font-semibold px-6 py-3 rounded-full transition-all">
          I'm a Recruiter
        </button>
      </div>
    </div>

    {/* Job Seeker */}
    <div className="relative h-[600px] rounded-xl overflow-hidden group">

      {/* Full bleed image */}
      <img
        src="/Jobseeker.png"
        alt="Job seeker"
        className="absolute inset-0 w-full h-full object-cover scale-105 group-hover:scale-110 transition-transform duration-700"
      />

      {/* overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
      <div className="absolute inset-0 shadow-[inset_0_-160px_140px_-20px_rgba(0,0,0,0.75)]" />

      {/* content overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-10 sm:p-12 z-10">

        <p className="text-red-400 uppercase tracking-widest text-xs font-semibold mb-4">
          A Message for Job Seekers
        </p>

        <p className="text-white text-xl sm:text-2xl leading-relaxed mb-6 max-w-[95vw] sm:max-w-md">
          "You're more than a resume. Behind every application is someone trying to move forward.
          We're here to make that path clearer."
        </p>

        <button className="bg-[#FF6000] hover:bg-[#E55500] text-white font-semibold px-6 py-3 rounded-full transition-all">
          I'm a Job Seeker
        </button>
      </div>
    </div>

  </div>
</section>
      <Footer />
    </div>
  );
}
