import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { Footer } from '../layout/Footer';
import { Navigation } from '../layout/Navigation';
import { 
  ArrowRight, 
  Target, 
  Zap, 
  Users, 
  Sparkles,
  TrendingUp,
  Brain,
  Heart,
  Award,
  Eye,
  Shield,
} from 'lucide-react';

interface AboutProps {
  onGetStarted: () => void;
  onLogin: () => void;
  onNavigateToLanding: () => void;
  onClose?: () => void;
  onViewBlog?: () => void;
  isAuthenticated?: boolean;
  onBackToApp?: () => void;
}

export function About({ onGetStarted, onLogin, isAuthenticated }: Readonly<AboutProps>) {

  const team = [
    {
      name: "Ray Asuma",
      role: "CEO & Co-Founder",
      image: "/Ray.png",
      bio: "Visionary leader driving theGarage's mission to revolutionize recruitment.",
      expertise: ["Leadership", "Compliance", "Law"],
      linkedin: "https://www.linkedin.com/in/rayasuma/"
    },
    {
      name: "Declan Kintu",
      role: "CTO & Co-Founder",
      image: "/Declan.png",
      bio: "Engineering excellence powering our platform's cutting-edge technology.",
      expertise: ["System Architecture", "AI", "Scale"],
      linkedin: "https://www.linkedin.com/in/declan-trevor-kintu/"
    },
    {
      name: "Michelle Cheng",
      role: "AI Lead & Co-Founder",
      image: "/Michelle.png",
      bio: "AI expert creating intelligent matching systems for perfect career connections.",
      expertise: ["AI/ML", "Data Science", "Algorithms"],
      linkedin: "https://www.linkedin.com/in/michelle-cheng-643878119/"
    },
    {
      name: "Sandile Ngwenya",
      role: "CISO",
      image: "/Sandile.jpg",
      bio: "Guardian of our platform, ensuring secure and trusted experiences for all users.",
      expertise: ["Security", "Privacy", "Compliance"],
      linkedin: "https://www.linkedin.com/in/sandile-ngwenya-a00666296/"
    },
    {
      name: "Thandizo Henderson",
      role: "CMO",
      image: "/Thandizo.png",
      bio: "Building communities and fostering connections that transform careers.",
      expertise: ["Marketing", "Branding", "Engagement"],
      linkedin: "https://www.linkedin.com/in/thandizo/"
    },
    {
      name: "René Baine",
      role: "Front-End Engineer",
      image: "/Rene.png",
      bio: "Computer science student at Trent University",
      expertise: ["UI/UX Design", "Front-End Development"],
      linkedin: "https://www.linkedin.com/in/rené-baine"
    },
    {
      name: "Shreya Sharma",
      role: "Software developer",
      image: "/Shreya.png",
      bio: "Software developer focused on building customer-centric, accessible web experiences.",
      expertise: ["JavaScript"],
      linkedin: "https://www.linkedin.com/in/shreyamsharma/"
    },
    {
      name: "Kavya Madaa",
      role: "Business Analyst",
      image: "/Kavya.png",
      bio: "Aspiring entrepreneur with a strong interest in finance",
      expertise: ["Sales Operations", "Point of Sale Systems"],
      linkedin: "https://www.linkedin.com/in/kavya-madaan-2b2452356/"
    }
  ];

  const values = [
    {
      icon: Sparkles,
      title: "Innovation First",
      description: "We push boundaries to create solutions that don't just work they transform."
    },
    {
      icon: Heart,
      title: "Human-Centered",
      description: "Technology should adapt to people, not the other way around."
    },
    {
      icon: TrendingUp,
      title: "Data-Driven",
      description: "Every decision backed by insights, every feature validated by results."
    },
    {
      icon: Award,
      title: "Excellence Always",
      description: "Good isn't good enough. We strive for exceptional in everything we do."
    }
  ];

  const beliefs = [
    {
      icon: Eye,
      statement: "Faster",
      sub: "Speed over friction. No unnecessary delays for anyone in the process."
    },
    {
      icon: Shield,
      statement: "Fairer",
      sub: "Bias-aware decisions. Every candidate seen clearly."
    },
    {
      icon: Zap,
      statement: "More Human",
      sub: "AI enhances, not replaces, human judgment."
    },
    {
      icon: Users,
      statement: "Transparent",
      sub: "No hidden processes. Every action feels intentional."
    }
  ];

  const buildPrinciples = [
    {
      number: "01",
      title: "Clarity over complexity",
      body: "We don't build features. We find friction and eliminate it."
    },
    {
      number: "02",
      title: "Transparency over opacity",
      body: "No black boxes. Every match, every score, every recommendation comes with a reason."
    },
    {
      number: "03",
      title: "Speed over friction",
      body: "We move fast and fix things. Every release makes the next one better."
    },
    {
      number: "04",
      title: "Insight over noise",
      body: "Every product decision gets asked twice: does this work for the job seeker? Does this work for the recruiter?"
    }, 
    {
      number: "05",
      title: "Human first, AI enhances",
      body: "We build tools that empower people, not replace them."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FBF9F7] via-[#FFF5F2] to-[#FBF9F7] text-[#1A1A1A] overflow-hidden relative">

      {/* Fixed Navigation */}
      <Navigation/>

      {/* Hero Section */}
<section className="relative min-h-screen flex items-center pt-16 overflow-hidden">

  {/* Columnar background: left warm, right cool — clean vertical split */}
  <div className="absolute inset-0 flex pointer-events-none" aria-hidden="true">
    <div className="w-1/2 h-full bg-gradient-to-b from-[#FFF5EE] to-[#FBF9F7]" />
    <div className="w-1/2 h-full bg-gradient-to-b from-[#EEF5FF] to-[#FBF9F7]" />
  </div>

  {/* Subtle center divider — only when two columns are active */}
  <div 
    className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px pointer-events-none hidden lg:block"
    aria-hidden="true"
    style={{ background: 'linear-gradient(to bottom, transparent, #FF6000 30%, #469AF9 70%, transparent)' }}
  />

  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full py-24">
    <div className="grid lg:grid-cols-2 gap-16 items-center">

      {/* Left — headline + copy + CTA */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7 }}
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="inline-block mb-5"
        >
          <div className="px-4 py-2 bg-[#FF6000]/10 border border-[#FF6000]/30 rounded-full text-sm text-[#FF6000]">
            <Sparkles className="w-4 h-4 inline mr-2" />
            Redefining Recruitment
          </div>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="text-5xl md:text-6xl font-medium font-inter mb-6 leading-none"
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6000] to-[#FF8533]">
            Kazi AI
          </span>{' '}
          was born from a shared frustration with how hiring works today
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="text-lg text-[#545250] mb-6 max-w-[95vw] sm:max-w-lg leading-relaxed"
        >
          Candidates apply without feedback. Recruiters sift through noise without clear signals. The process is slow, opaque, and often unfair.
        </motion.p>

        <motion.p 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="text-lg text-[#545250] mb-6 max-w-[95vw] sm:max-w-lg leading-relaxed"
        >
          We are building an AI-powered hiring platform that brings clarity, transparency, and fairness into how people connect with opportunity.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-xl text-[#9E9B98] italic mb-10"
        >
          "It gets better."
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap gap-3"
        >
          {!isAuthenticated && (
            <Button
              onClick={onGetStarted}
              className="inline-flex items-center gap-2 bg-[#FF751F] hover:bg-[#E55500] text-white text-sm font-semibold px-7 py-3.5 rounded-full transition-all duration-200 hover:-translate-y-px group"
            >
              Get Started
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </motion.div>
      </motion.div>

      {/* Right — stats grid */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-5"
      >
        {[
          { number: "5K+",  label: "Job Seekers",   icon: Users,      gradient: 'from-[#FF6000] to-[#FF8533]' },
          { number: "100+", label: "Companies",     icon: Target,     gradient: 'from-[#469AF9] to-[#6AADFA]' },
          { number: "89%",  label: "Success Rate",  icon: TrendingUp, gradient: 'from-[#FF8533] to-[#FF6000]' },
          { number: "2.3x", label: "Faster Hiring", icon: Zap,        gradient: 'from-[#6AADFA] to-[#469AF9]' }
        ].map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              whileHover={{ scale: 1.04, rotate: 1 }}
              className="bg-white/80 backdrop-blur-sm border border-[#E8E5E2] rounded-2xl p-6 shadow-sm group"
            >
              <div className={`w-11 h-11 bg-gradient-to-r ${stat.gradient} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <IconComponent className="w-5 h-5 text-white" />
              </div>
              <div className="text-4xl font-medium mb-1 text-[#1A1A1A]">{stat.number}</div>
              <div className="text-sm text-[#9E9B98]">{stat.label}</div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  </div>

  {/* Scroll indicator */}
  <motion.div
    animate={{ y: [0, 10, 0] }}
    transition={{ repeat: Infinity, duration: 2 }}
    className="absolute bottom-8 left-1/2 -translate-x-1/2"
  >
  </motion.div>

</section>
      {/* Mission Statement */}
      <section id="mission-statement" className="relative py-28 px-4 sm:px-6 lg:px-8 bg-[#FF6000] overflow-hidden">
        {/* Subtle texture dots */}
        <div className="absolute inset-0 pointer-events-none opacity-10" aria-hidden="true"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '32px 32px'
          }}
        />

        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="text-white/80 rounded-full inline-block px-5 py-2 border border-white/70 uppercase tracking-widest text-sm font-medium mb-6">Our Mission</div>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-medium text-white leading-tight">
              Make hiring honest,
              <br />
              fast, and fair
              <br />
              <span className="text-white/70">for <span className="italic">everyone</span> in the room.</span>
            </h2>
            <p className="mt-8 text-white/80 text-lg max-w-[95vw] sm:max-w-2xl mx-auto leading-relaxed">
              Not just for the recruiter with the spreadsheet. Not just for the candidate who got lucky with a referral. For everyone.
            </p>
          </motion.div>
        </div>
      </section>

      {/*what we believe in*/}
      <section id="beliefs" className="relative py-28 font-inter px-4 sm:px-6 lg:px-8 bg-[#FBF9F7]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <p className="text-[#FF6000] uppercase tracking-widest text-xs font-medium mb-3">Principles</p>
            <h2 className="text-4xl md:text-5xl font-semibold font-inter text-[#1A1A1A] tracking-tight">
              What we{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6000] to-[#469AF9]">believe in.</span>
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-6">
            {beliefs.map((belief, index) => {
              const IconComponent = belief.icon;
              return (
                <motion.div
                  key={belief.statement}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group bg-white border border-[#E8E5E2] rounded-2xl p-8 hover:border-[#FF6000]/40 hover:shadow-md transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-[#FF6000]/10 rounded-xl flex items-center justify-center mb-5 group-hover:bg-[#FF6000]/20 transition-colors">
                    <IconComponent className="w-6 h-6 text-[#FF6000]" />
                  </div>
                  <h3 className="text-2xl font-medium text-[#1A1A1A] mb-2 leading-snug">
                    {belief.statement}
                  </h3>
                  <p className="text-[#545250] text-xl lg:text-base leading-relaxed">{belief.sub}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How we build*/}
      <section id="how-we-build" className="relative py-28 px-4 sm:px-6 lg:px-8 bg-[#1A1A1A] overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#FF6000]/10 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#469AF9]/10 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />

        <div className="max-w-7xl font-inter mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <p className="text-[#FF6000] uppercase tracking-widest text-sm font-medium mb-3">Process</p>
            <h2 className="text-5xl md:text-6xl font-inter font-medium text-white leading-tight">
              How we{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6000] to-[#469AF9]">build.</span>
            </h2>
          </motion.div>

          <div className="space-y-0 divide-y divide-white/10">
            {buildPrinciples.map((principle, index) => (
              <motion.div
                key={principle.number}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group grid md:grid-cols-[120px_1fr] gap-6 py-10 hover:bg-white/[0.02] transition-colors px-2 rounded-xl"
              >
                <div className="text-6xl font-medium text-white/10 group-hover:text-[#FF6000]/80 transition-colors leading-none pt-1 select-none">
                  {principle.number}
                </div>
                <div className="flex flex-col justify-center">
                  <h3 className="text-2xl md:text-3xl font-inter font-medium text-white mb-2 leading-snug">
                    {principle.title}
                  </h3>
                  <p className="text-white/50 text-lg leading-relaxed max-w-[95vw] sm:max-w-2xl">
                    {principle.body}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-16 flex items-center gap-4"
          >
            <div className="h-px flex-1 bg-white/10" />
          </motion.div>
        </div>
      </section>

      {/* What we Actually Do */}
<section id="mission" className="relative py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#FFE8DC] to-[#FBF9F7]">
  <div className="max-w-7xl mx-auto relative z-10">
    <div className="grid lg:grid-cols-5 gap-12 items-center">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="lg:col-span-3"
      >
        <h2 className="text-5xl font-inter font-medium sm:text-5xl md:text-5xl lg:text-6xl mb-8 leading-snug">
          What We{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6000] to-[#469AF9]">
            Actually Do
          </span>
        </h2>

        <div className="space-y-6 sm:text-xl text-[#545250] leading-relaxed">
          <p className='text-lg'>
            We're building the world's first <span className="text-[#1A1A1A] font-medium">dual-perspective recruitment platform</span> that serves both job seekers and recruiters with equal excellence.
          </p>
          <p className='text-lg'>
            Traditional job platforms force you to pick a side. We believe the best solutions come from understanding both perspectives. That's why <span className="text-[#FF6000] font-medium">theGarage</span> gives you the full picture.
          </p>
          <p className='text-lg'>
            For <span className="text-[#469AF9] font-medium">job seekers</span>, we provide AI-powered queues, real-time rankings, and actionable insights to level up your career. For <span className="text-[#FF6000] font-medium">recruiters</span>, we offer intelligent candidate matching, streamlined pipeline management, and data-driven hiring decisions.
          </p>
        </div>

        <div className="mt-12 grid md:grid-cols-2 gap-6">
          {values.map((value, index) => {
            const IconComponent = value.icon;
            return (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#FF6000]/20 to-[#469AF9]/20 border border-[#FF6000]/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <IconComponent className="w-6 h-6 text-[#FF6000]" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-2 text-[#1A1A1A]">{value.title}</h3>
                    <p className="text-md text-[#545250]">{value.description}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="lg:col-span-2"
      >
        {/* Mobile / tablet: full-width stacked cards, no animation */}
        <div className="flex flex-col gap-4 lg:hidden">
          <div className="w-full bg-gradient-to-br from-[#469AF9]/20 to-[#469AF9]/10 border border-[#469AF9]/30 rounded-2xl p-5 flex items-center gap-4">
            <Users className="w-8 h-8 text-[#469AF9] shrink-0" />
            <div>
              <div className="text-sm text-[#545250]">Job Seekers</div>
              <div className="text-2xl font-medium text-[#1A1A1A]">89K+</div>
            </div>
          </div>
          <div className="w-full bg-gradient-to-br from-[#FF6000]/20 to-[#FF8533]/10 border border-[#FF6000]/30 rounded-2xl p-5 flex items-center gap-4">
            <Target className="w-8 h-8 text-[#FF6000] shrink-0" />
            <div>
              <div className="text-sm text-[#545250]">Recruiters</div>
              <div className="text-2xl font-medium text-[#1A1A1A]">8.5K+</div>
            </div>
          </div>
        </div>

        {/* Desktop: floating animated cards */}
        <div className="relative h-96 hidden lg:block">
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="absolute top-0 right-0 w-48 h-32 bg-gradient-to-br from-[#469AF9]/20 to-[#469AF9]/10 border border-[#469AF9]/30 rounded-2xl backdrop-blur-sm p-4"
          >
            <Users className="w-8 h-8 text-[#469AF9] mb-2" />
            <div className="text-sm text-[#545250]">Job Seekers</div>
            <div className="text-2xl font-medium text-[#1A1A1A]">89K+</div>
          </motion.div>

          <motion.div
            animate={{ y: [0, 20, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 0.5 }}
            className="absolute bottom-0 left-0 w-48 h-32 bg-gradient-to-br from-[#FF6000]/20 to-[#FF8533]/10 border border-[#FF6000]/30 rounded-2xl backdrop-blur-sm p-4"
          >
            <Target className="w-8 h-8 text-[#FF6000] mb-2" />
            <div className="text-sm text-[#545250]">Recruiters</div>
            <div className="text-2xl font-medium text-[#1A1A1A]">8.5K+</div>
          </motion.div>

          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-[#FF6000]/20 to-[#469AF9]/20 rounded-full blur-3xl" />
        </div>
      </motion.div>
    </div>
  </div>
</section>

      {/* Team */}
<section id="team" className="relative py-28 px-4 sm:px-6 lg:px-8 bg-[#1A1A1A] overflow-hidden">
  {/* Ambient glow */}
  <div className="absolute top-0 left-0 w-96 h-96 bg-[#FF6000]/10 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
  <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#469AF9]/10 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />

  <div className="max-w-7xl mx-auto relative z-10">
    {/* Section header — matches How We Build style */}
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mb-16"
    >
      <p className="text-[#FF6000] uppercase tracking-widest text-xs font-medium mb-3">The People</p>
      <h2 className="text-5xl md:text-6xl font-inter font-medium text-white leading-tight">
        Meet the{' '}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6000] to-[#469AF9]"> team.</span>
      </h2>
    </motion.div>

    {/* Cards grid */}
    <div className="grid md:grid-cols-2 gap-6">
      {team.map((member, index) => (
        <motion.div
          key={member.name}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ y: -6 }}
          className="group"
        >
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 hover:border-[#FF6000]/40 hover:bg-white/[0.07] transition-all duration-300 shadow-xl">
            <div className="flex items-start gap-6">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div
                  className="w-24 h-24 rounded-2xl bg-cover bg-center group-hover:scale-105 transition-transform"
                  style={{ backgroundImage: `url(${member.image})` }}
                />
                {/* <div className="absolute -bottom-2 -right-2 w-5 h-5 bg-green-500 border-2 border-[#1A1A1A] rounded-full" /> */}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-2xl font-medium text-white mb-1">{member.name}</h3>
                <div className="text-[#FF6000] text-sm mb-3">{member.role}</div>
                <p className="text-white/50 text-sm leading-relaxed mb-4">{member.bio}</p>

                {/* Expertise tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {member.expertise.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-white/60 font-medium group-hover:border-[#FF6000]/30 transition-colors"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                {/* LinkedIn */}
                <a
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-8 h-8 bg-white/5 border border-white/10 rounded-lg items-center justify-center hover:bg-[#FF6000]/20 hover:border-[#FF6000]/50 transition-all"
                >
                  <svg className="w-4 h-4 text-white/40 group-hover:text-[#FF6000] transition-colors" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>

    {/* Divider */}
    <div className="mt-16 flex items-center gap-4">
      <div className="h-px flex-1 bg-white/10" />
      <Users className="w-5 h-5 text-white/20" />
      <div className="h-px flex-1 bg-white/10" />
    </div>

    {/* Join CTA */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mt-16 text-center"
    >
      <div className="inline-block bg-white/5 border border-white/10 rounded-2xl p-8 hover:border-[#FF6000]/30 transition-all">
        <Brain className="w-12 h-12 text-[#FF6000] mx-auto mb-4" />
        <h3 className="text-2xl font-medium text-white mb-3">Want to join us?</h3>
        <p className="text-white/50 text-sm mb-6 max-w-[95vw] sm:max-w-md">
          We're always looking for exceptional talent to join our mission.
        </p>
        <Button className="bg-gradient-to-r from-[#FF6000] to-[#469AF9] hover:from-[#FF7A1F] hover:to-[#6BB0FF] text-white">
          View Open Positions
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </motion.div>
  </div>
</section>

      {/* Final CTA */}
      <section id="cta" className="relative py-32 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-[#FFE8DC] to-[#FBF9F7]">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <motion.div 
            animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
            transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-[#FF6000]/20 to-[#469AF9]/20 rounded-full blur-3xl"
          />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl md:text-7xl font-inter font-semibold mb-8 leading-tight text-[#1A1A1A]">
              Ready to Transform{' '}
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#FF6000] to-[#469AF9]">
                Your Career?
              </span>
            </h2>

            <p className="text-xl text-[#545250] mb-12 max-w-[95vw] sm:max-w-lg mx-auto ">
             Kazi is not just a platform. It is a response to a broken system. Step by step
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button 
                onClick={onGetStarted}
                size="lg"
                className="bg-gradient-to-r from-[#469AF9] to-[#6AADFA] hover:from-[#3B8FE8] hover:to-[#5FA0F9] text-white px-12 py-6 text-lg rounded-full"
              >
                I'm a Recruiter
              </Button>
              <Button 
                onClick={onLogin}
                size="lg"
                className="bg-gradient-to-r from-[#FF6000] to-[#FF8533] hover:from-[#FF7A1F] hover:to-[#FF9D4D] text-white px-12 py-6 text-lg rounded-full"
              >
                I'm a Job Seeker
              </Button>
            </div>

            <p className="text-xl text-[#9E9B98] italic">"It gets better."</p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}