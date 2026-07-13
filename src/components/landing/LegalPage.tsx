import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Footer } from '../layout/Footer';
import { Navigation } from '../layout/Navigation';
import { Shield, FileText, Cookie, AlertTriangle, Lock } from 'lucide-react';

const SECTIONS = [
  { id: 'privacy-policy',   label: 'Privacy Policy',   icon: Shield },
  { id: 'terms-of-service', label: 'Terms of Service', icon: FileText },
  { id: 'cookie-policy',    label: 'Cookie Policy',    icon: Cookie },
  { id: 'acceptable-use',   label: 'Acceptable Use',   icon: AlertTriangle },
  { id: 'data-protection',  label: 'Data Protection',  icon: Lock },
];

const LAST_UPDATED = 'April 8, 2026';

export function LegalPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('privacy-policy');
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  // On mount or hash change, scroll to the correct section
  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash && SECTIONS.some(s => s.id === hash)) {
      setActiveSection(hash);
      setTimeout(() => {
        sectionRefs.current[hash]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [location.hash]);

  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      for (const section of SECTIONS) {
        const el = sectionRefs.current[section.id];
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 120 && rect.bottom > 120) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    setActiveSection(id);
    navigate(`/legal#${id}`, { replace: true });
    sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-white pt-16">
      <Navigation />

      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 via-gray-800 to-slate-900 text-white py-16">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Legal &amp; Policies</h1>
          <p className="text-gray-300 max-w-[95vw] sm:max-w-2xl mx-auto">
            Transparency is core to how we operate. Read our policies to understand how we collect,
            use, and protect your information.
          </p>
          <p className="text-gray-500 text-sm mt-4">Last updated: {LAST_UPDATED}</p>
        </div>
      </div>

      {/* Section quick-links (mobile) */}
      <div className="md:hidden bg-gray-50 border-b border-gray-200 sticky top-16 z-40">
        <div className="flex flex-wrap gap-2 px-6 py-3">
          {SECTIONS.map(s => (
            <button
              key={s.id}
              onClick={() => scrollTo(s.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                activeSection === s.id
                  ? 'bg-[#ff6b35] text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-[#ff6b35] hover:text-[#ff6b35]'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main layout: sidebar + content */}
      <div className="container mx-auto px-6 py-12 flex gap-12 items-start">
        {/* Sidebar (desktop) */}
        <aside className="hidden md:block w-56 shrink-0 sticky top-24">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Contents</p>
          <nav className="space-y-1">
            {SECTIONS.map(s => {
              const Icon = s.icon;
              return (
                <button
                  key={s.id}
                  onClick={() => scrollTo(s.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                    activeSection === s.id
                      ? 'bg-orange-50 text-[#ff6b35] border border-orange-100'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {s.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0 space-y-20">

          {/* ── Privacy Policy ── */}
          <section
            id="privacy-policy"
            ref={el => { sectionRefs.current['privacy-policy'] = el; }}
            className="scroll-mt-28"
          >
            <SectionHeader icon={Shield} title="Privacy Policy" />
            <Prose>
              <H2>1. Information We Collect</H2>
              <p>We collect information you provide directly, such as when you create an account, upload a resume, or communicate through our platform. This includes name, email address, employment history, skills, and other profile details.</p>
              <p>We also collect usage data automatically — including IP address, browser type, pages visited, and interactions with our platform — to improve our service and troubleshoot issues.</p>

              <H2>2. How We Use Your Information</H2>
              <p>Your information is used to:</p>
              <ul>
                <li>Create and manage your account</li>
                <li>Match job seekers with relevant opportunities and recruiters</li>
                <li>Send notifications, updates, and platform communications</li>
                <li>Analyze and improve platform performance</li>
                <li>Comply with legal obligations</li>
              </ul>

              <H2>3. Information Sharing</H2>
              <p>We do not sell your personal data. We may share information with:</p>
              <ul>
                <li><strong>Recruiters and employers</strong> — only the profile information you choose to make visible</li>
                <li><strong>Service providers</strong> — trusted third parties who assist in operating our platform (hosting, analytics, email)</li>
                <li><strong>Legal authorities</strong> — when required by applicable law or to protect rights and safety</li>
              </ul>

              <H2>4. Your Rights</H2>
              <p>Depending on your jurisdiction, you may have the right to access, correct, or delete your personal data, restrict or object to certain processing, and request data portability. To exercise any of these rights, please contact us at <strong>privacy@thegarage.app</strong>.</p>

              <H2>5. Data Retention</H2>
              <p>We retain your data for as long as your account is active or as needed to provide services. You may request deletion of your account and associated data at any time through account settings.</p>

              <H2>6. Contact</H2>
              <p>Questions about this policy? Reach us at <strong>privacy@thegarage.app</strong>.</p>
            </Prose>
          </section>

          <Divider />

          {/* ── Terms of Service ── */}
          <section
            id="terms-of-service"
            ref={el => { sectionRefs.current['terms-of-service'] = el; }}
            className="scroll-mt-28"
          >
            <SectionHeader icon={FileText} title="Terms of Service" />
            <Prose>
              <H2>1. Acceptance of Terms</H2>
              <p>By accessing or using theGarage, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any part of these terms, you may not use our platform.</p>

              <H2>2. Eligibility</H2>
              <p>You must be at least 16 years old to use theGarage. By creating an account, you represent and warrant that you meet this requirement.</p>

              <H2>3. Account Responsibilities</H2>
              <p>You are responsible for:</p>
              <ul>
                <li>Maintaining the confidentiality of your account credentials</li>
                <li>All activity that occurs under your account</li>
                <li>Providing accurate and up-to-date profile information</li>
                <li>Notifying us immediately of any unauthorized account access</li>
              </ul>

              <H2>4. Prohibited Conduct</H2>
              <p>You agree not to:</p>
              <ul>
                <li>Post false, misleading, or fraudulent job listings or profile information</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Use automated tools to scrape or extract platform data</li>
                <li>Attempt to gain unauthorized access to any part of the platform</li>
                <li>Use theGarage for any unlawful purpose</li>
              </ul>

              <H2>5. Intellectual Property</H2>
              <p>theGarage and its content, features, and functionality are owned by theGarage-services and are protected by copyright, trademark, and other intellectual property laws. You may not reproduce or redistribute our platform content without explicit written permission.</p>

              <H2>6. Termination</H2>
              <p>We reserve the right to suspend or terminate accounts that violate these terms, with or without notice, at our sole discretion.</p>

              <H2>7. Disclaimer of Warranties</H2>
              <p>theGarage is provided "as is" without warranties of any kind, either express or implied. We do not guarantee uninterrupted or error-free service.</p>

              <H2>8. Limitation of Liability</H2>
              <p>To the maximum extent permitted by law, theGarage shall not be liable for indirect, incidental, special, or consequential damages arising from your use of the platform.</p>

              <H2>9. Changes to Terms</H2>
              <p>We may update these terms at any time. Continued use of the platform after changes constitutes acceptance of the updated terms.</p>
            </Prose>
          </section>

          <Divider />

          {/* ── Cookie Policy ── */}
          <section
            id="cookie-policy"
            ref={el => { sectionRefs.current['cookie-policy'] = el; }}
            className="scroll-mt-28"
          >
            <SectionHeader icon={Cookie} title="Cookie Policy" />
            <Prose>
              <H2>1. What Are Cookies</H2>
              <p>Cookies are small text files placed on your device by a website when you visit it. They help the website remember your preferences, keep you logged in, and gather analytics about how the site is used.</p>

              <H2>2. Types of Cookies We Use</H2>
              <ul>
                <li><strong>Essential cookies</strong> — required for core functionality such as authentication and session management. These cannot be disabled.</li>
                <li><strong>Preference cookies</strong> — remember your settings and customizations across sessions.</li>
                <li><strong>Analytics cookies</strong> — help us understand how visitors interact with our platform so we can improve it.</li>
                <li><strong>Marketing cookies</strong> — may be used to show relevant content or track the effectiveness of campaigns.</li>
              </ul>

              <H2>3. Third-Party Cookies</H2>
              <p>Some features on theGarage use third-party services (e.g., analytics providers or OAuth providers) that may set their own cookies. These are governed by their respective privacy policies.</p>

              <H2>4. Managing Cookies</H2>
              <p>You can control cookies through your browser settings. Note that disabling certain cookies may affect platform functionality. Most browsers allow you to refuse or delete cookies — consult your browser's help documentation for instructions.</p>

              <H2>5. Cookie Consent</H2>
              <p>By using theGarage, you consent to our use of cookies as described in this policy. We may show a cookie consent banner for first-time visitors in jurisdictions that require explicit consent.</p>
            </Prose>
          </section>

          <Divider />

          {/* ── Acceptable Use ── */}
          <section
            id="acceptable-use"
            ref={el => { sectionRefs.current['acceptable-use'] = el; }}
            className="scroll-mt-28"
          >
            <SectionHeader icon={AlertTriangle} title="Acceptable Use" />
            <Prose>
              <H2>1. Purpose</H2>
              <p>This Acceptable Use Policy sets out the rules governing use of theGarage platform. By using our platform, you agree to comply with this policy.</p>

              <H2>2. Permitted Use</H2>
              <p>theGarage is intended for:</p>
              <ul>
                <li>Job seekers looking for employment opportunities</li>
                <li>Recruiters and employers seeking candidates</li>
                <li>Institutions managing their talent pipeline and student career services</li>
              </ul>

              <H2>3. Prohibited Activities</H2>
              <p>The following activities are strictly prohibited:</p>
              <ul>
                <li>Posting fraudulent, misleading, or discriminatory job listings</li>
                <li>Impersonating another person or organization</li>
                <li>Sending unsolicited bulk messages or spam to other users</li>
                <li>Collecting or harvesting user data without consent</li>
                <li>Uploading malware, viruses, or malicious code</li>
                <li>Interfering with or disrupting the platform's infrastructure</li>
                <li>Circumventing access controls or security measures</li>
                <li>Using the platform to facilitate illegal employment practices</li>
              </ul>

              <H2>4. Content Standards</H2>
              <p>All content you post must:</p>
              <ul>
                <li>Be accurate and not misleading</li>
                <li>Not infringe any third-party intellectual property rights</li>
                <li>Be free from discriminatory language or hate speech</li>
                <li>Comply with applicable employment and anti-discrimination laws</li>
              </ul>

              <H2>5. Enforcement</H2>
              <p>Violations of this policy may result in content removal, account suspension, or permanent ban from the platform. We may also report illegal activity to the appropriate authorities.</p>

              <H2>6. Reporting Violations</H2>
              <p>If you encounter a violation of this policy, please report it to <strong>trust@thegarage.app</strong>.</p>
            </Prose>
          </section>

          <Divider />

          {/* ── Data Protection ── */}
          <section
            id="data-protection"
            ref={el => { sectionRefs.current['data-protection'] = el; }}
            className="scroll-mt-28"
          >
            <SectionHeader icon={Lock} title="Data Protection" />
            <Prose>
              <H2>1. Our Commitment</H2>
              <p>theGarage is committed to protecting the personal data of all users in accordance with applicable data protection laws, including the General Data Protection Regulation (GDPR) and other regional frameworks where applicable.</p>

              <H2>2. Legal Basis for Processing</H2>
              <p>We process personal data on the following legal bases:</p>
              <ul>
                <li><strong>Contractual necessity</strong> — processing required to provide our services to you</li>
                <li><strong>Legitimate interests</strong> — improving platform security, preventing fraud, and understanding usage patterns</li>
                <li><strong>Legal obligation</strong> — compliance with applicable laws and regulations</li>
                <li><strong>Consent</strong> — for optional features such as marketing communications</li>
              </ul>

              <H2>3. Security Measures</H2>
              <p>We implement industry-standard security practices including:</p>
              <ul>
                <li>Encryption of data in transit (TLS) and at rest</li>
                <li>Access controls and role-based permissions</li>
                <li>Regular security assessments</li>
                <li>Secure development practices aligned with OWASP guidelines</li>
              </ul>

              <H2>4. International Data Transfers</H2>
              <p>If we transfer personal data outside your country of residence, we ensure appropriate safeguards are in place, such as standard contractual clauses or adequacy decisions.</p>

              <H2>5. Data Subject Rights</H2>
              <p>Under applicable data protection law, you may have the right to:</p>
              <ul>
                <li><strong>Access</strong> — request a copy of the personal data we hold about you</li>
                <li><strong>Rectification</strong> — request correction of inaccurate data</li>
                <li><strong>Erasure</strong> — request deletion of your data ("right to be forgotten")</li>
                <li><strong>Restriction</strong> — request that we restrict processing of your data</li>
                <li><strong>Portability</strong> — receive your data in a structured, machine-readable format</li>
                <li><strong>Object</strong> — object to processing based on legitimate interests</li>
                <li><strong>Withdraw consent</strong> — at any time, where processing is based on consent</li>
              </ul>
              <p>To exercise any of these rights, contact our Data Protection Officer at <strong>dpo@thegarage.app</strong>. We will respond within 30 days.</p>

              <H2>6. Data Breach Notification</H2>
              <p>In the event of a personal data breach that is likely to result in a risk to your rights and freedoms, we will notify the relevant supervisory authority within 72 hours and affected users without undue delay.</p>

              <H2>7. Contact Our DPO</H2>
              <p>Our Data Protection Officer can be reached at <strong>dpo@thegarage.app</strong> for any data protection queries or concerns.</p>
            </Prose>
          </section>

        </main>
      </div>

      <Footer />
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({ icon: Icon, title }: Readonly<{ icon: React.ElementType; title: string }>) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-[#ff6b35]" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
    </div>
  );
}

function H2({ children }: Readonly<{ children: React.ReactNode }>) {
  return <h3 className="text-base font-semibold text-gray-800 mt-6 mb-2">{children}</h3>;
}

function Prose({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="text-gray-600 text-sm leading-relaxed space-y-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_strong]:font-semibold [&_strong]:text-gray-700">
      {children}
    </div>
  );
}

function Divider() {
  return <hr className="border-gray-100" />;
}