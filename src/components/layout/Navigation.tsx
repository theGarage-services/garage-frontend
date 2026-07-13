// components/layout/Navigation.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Target, X, Menu } from "lucide-react";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Job Seekers", href: "/jobseeker" },
  { label: "Recruiters", href: "/recruiter" },
];

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const go = (href: string) => {
    setIsMenuOpen(false);
    navigate(href);
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-[#E8E5E2]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <button
            onClick={() => go('/')}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity shrink-0"
          >
            <div className="w-8 h-8 bg-gradient-to-r from-[#FF6000] to-[#FF8533] rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>

            <span className="text-xl font-semibold">
              <span className="text-[#1A1A1A]">the</span>
              <span className="text-[#FF6000]">Garage</span>
            </span>
          </button>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.label}
                onClick={() => go(item.href)}
                className="text-sm font-medium text-[#545250] hover:text-[#1A1A1A] transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md text-[#9E9B98] hover:text-[#1A1A1A] transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden border-t border-[#E8E5E2]"
            >
              <div className="py-4 flex flex-col gap-1">
                {NAV_ITEMS.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => go(item.href)}
                    className="text-left px-2 py-2 rounded-lg text-sm font-medium text-[#545250] hover:text-[#1A1A1A] hover:bg-[#F5F3F1] transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}