import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Check, Zap, Target, Users, Brain, Star, ArrowRight, Clock } from 'lucide-react';
import { Footer } from '../layout/Footer';

export function Pricing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FBF9F7] via-[#FFF5F2] to-[#FBF9F7] text-[#1A1A1A] overflow-hidden relative">
      {/* Ambient glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#FF6000]/8 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#469AF9]/6 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s' }} />
      </div>

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-[#E8E5E2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <a href="/home" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-gradient-to-r from-[#FF6000] to-[#FF8533] rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-medium">
                <span className="text-[#1A1A1A]">the</span>
                <span className="text-[#FF6000]">Garage</span>
              </span>
            </a>
            <a href="/home">
              <Button variant="ghost" className="text-[#9E9B98] hover:text-[#1A1A1A] hover:bg-[#F5F3F1]">
                ← Back to Home
              </Button>
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="px-6 py-2 bg-gradient-to-r from-[#FF6000] to-[#FF8533] text-white rounded-full text-sm font-semibold shadow-lg inline-block mb-6">
              Simple, Transparent Pricing
            </span>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-[#FF6000] via-[#FF7A1F] to-[#469AF9] bg-clip-text text-transparent leading-tight">
              Start Free.<br />Upgrade When Ready.
            </h1>
            <p className="text-xl text-[#545250] max-w-[95vw] sm:max-w-2xl mx-auto">
              Get started at no cost and unlock your potential. Premium tiers with advanced AI features are launching soon.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 items-stretch">

            {/* Free */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0, duration: 0.6 }}
            >
              <Card className="h-full backdrop-blur-xl bg-white/60 border border-white/80 shadow-xl rounded-2xl p-8 flex flex-col">
                <div className="mb-6">
                  <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-[#F5F3F1] to-[#E8E5E2] mb-4">
                    <Users className="w-6 h-6 text-[#545250]" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#1A1A1A] mb-1">Free</h3>
                  <p className="text-[#9E9B98] text-sm">Perfect for getting started</p>
                </div>
                <div className="mb-6">
                  <span className="text-5xl font-bold text-[#1A1A1A]">$0</span>
                  <span className="text-[#9E9B98] ml-2">/ month</span>
                </div>
                <ul className="space-y-3 flex-1 mb-8">
                  {[
                    'Join the talent pool',
                    'Apply to matched jobs',
                    'Application status tracking',
                    'Basic job recommendations',
                    'Profile evaluation by institutions',
                    'Standard queue access',
                  ].map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-[#FF6000] mt-0.5 shrink-0" />
                      <span className="text-[#545250] text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href="https://forms.gle/CnPr692VyrhS8RHC7"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center py-3 px-6 rounded-xl border-2 border-[#E8E5E2] text-[#1A1A1A] font-semibold hover:border-[#FF6000] hover:text-[#FF6000] transition-colors"
                >
                  Get Started Free
                </a>
              </Card>
            </motion.div>

            {/* Premium — Coming Soon */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15, duration: 0.6 }}
              className="relative"
            >
              {/* Popular badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                <span className="px-4 py-1.5 bg-gradient-to-r from-[#FF6000] to-[#FF8533] text-white rounded-full text-xs font-bold shadow-lg whitespace-nowrap">
                  ✦ Most Popular
                </span>
              </div>
              <Card className="h-full backdrop-blur-xl bg-gradient-to-br from-[#FF6000]/5 to-[#469AF9]/5 border-2 border-[#FF6000]/30 shadow-2xl rounded-2xl p-8 flex flex-col">
                <div className="mb-6">
                  <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-[#FF6000] to-[#FF8533] mb-4">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-2xl font-bold text-[#1A1A1A]">Premium</h3>
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-[#FF6000]/10 text-[#FF6000] rounded-full text-xs font-semibold">
                      <Clock className="w-3 h-3" /> Coming Soon
                    </span>
                  </div>
                  <p className="text-[#9E9B98] text-sm">For serious job seekers</p>
                </div>
                <div className="mb-6">
                  <span className="text-5xl font-bold text-[#1A1A1A]">TBD</span>
                  <span className="text-[#9E9B98] ml-2">/ month</span>
                </div>
                <ul className="space-y-3 flex-1 mb-8">
                  {[
                    'Everything in Free',
                    'AI-powered queue intelligence',
                    'Smart job recommendations',
                    'Priority application placement',
                    'Profile comparison tools',
                    'Advanced analytics dashboard',
                    'Unlimited queue access',
                    'Profile boost & visibility',
                    'Expert resume reviews',
                    'Priority support',
                  ].map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-[#FF6000] mt-0.5 shrink-0" />
                      <span className="text-[#545250] text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  disabled
                  className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-[#FF6000] to-[#FF8533] text-white font-semibold opacity-60 cursor-not-allowed"
                >
                  Coming Soon
                </button>
              </Card>
            </motion.div>

            {/* Enterprise */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <Card className="h-full backdrop-blur-xl bg-gradient-to-br from-slate-900/95 to-gray-800/95 border border-white/10 shadow-xl rounded-2xl p-8 flex flex-col">
                <div className="mb-6">
                  <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-[#469AF9] to-[#6BB0FF] mb-4">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-2xl font-bold text-white">Enterprise</h3>
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-[#469AF9]/20 text-[#469AF9] rounded-full text-xs font-semibold">
                      <Clock className="w-3 h-3" /> Coming Soon
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm">For institutions & large teams</p>
                </div>
                <div className="mb-6">
                  <span className="text-5xl font-bold text-white">Custom</span>
                </div>
                <ul className="space-y-3 flex-1 mb-8">
                  {[
                    'Everything in Premium',
                    'Institution admin panel',
                    'Team & department management',
                    'Approval queues & workflows',
                    'Document management center',
                    'Advanced access controls',
                    'Custom integrations & API',
                    'Dedicated account manager',
                    'SLA & enterprise support',
                  ].map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-[#469AF9] mt-0.5 shrink-0" />
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  disabled
                  className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-[#469AF9] to-[#6BB0FF] text-white font-semibold opacity-60 cursor-not-allowed"
                >
                  Coming Soon
                </button>
              </Card>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Coming Soon Banner */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="backdrop-blur-xl bg-gradient-to-br from-[#FF6000]/10 to-[#469AF9]/10 border border-[#FF6000]/20 rounded-3xl p-10 text-center shadow-xl"
          >
            <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-[#FF6000] to-[#FF8533] text-white mb-6 shadow-lg">
              <Star className="w-8 h-8" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-[#FF6000] to-[#469AF9] bg-clip-text text-transparent">
              Premium is Coming Soon
            </h2>
            <p className="text-[#545250] text-lg max-w-xl mx-auto mb-8">
              We're putting the finishing touches on our Premium and Enterprise tiers. Join our waitlist to be first in line and get early access pricing.
            </p>
            <a
              href="https://forms.gle/CnPr692VyrhS8RHC7"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#FF6000] to-[#FF8533] hover:from-[#FF7A1F] hover:to-[#FF9D4D] text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Join the Waitlist
              <ArrowRight className="w-4 h-4" />
            </a>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
