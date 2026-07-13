import { useNavigate } from 'react-router-dom';

export function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="bg-[#1A1A1A] text-white py-16 relative overflow-hidden">
      {/* Ambient glow */}
  <div className="absolute top-0 left-0 w-full sm:w-96 h-96 bg-[#FF6000]/10 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
  <div className="absolute bottom-0 right-0 w-full sm:w-96 h-96 bg-[#469AF9]/10 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl md:text-3xl font-bold">
                <span className="text-white">the</span>
                <span className="text-[#ff6b35]">Garage</span>
              </span>
            </div>
            <p className="text-gray-400 text-md md:text-lg  leading-relaxed">
              It Gets Better
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-4 pt-4">
              <a
                href="https://www.linkedin.com/company/thegaragejobs/about/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-[#ff6b35] transition-colors"
                aria-label="LinkedIn"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Product Section */}
          <div>
            <h2 className="font-semibold mb-4 text-white">Product</h2>
            <ul className="space-y-3">
              <li>
                <button className="text-gray-400 hover:text-[#ff6b35] transition-colors text-sm cursor-pointer bg-transparent border-none p-0">Features</button>
              </li>
              <li>
                <button
                  onClick={() => {
                    navigate('/pricing');
                    window.scrollTo(0, 0);
                  }}
                  className="text-gray-400 hover:text-[#ff6b35] transition-colors text-sm cursor-pointer bg-transparent border-none p-0"
                >
                  Pricing
                </button>
              </li>
              <li>
                <button onClick={() => {
                  navigate('/faq');
                  window.scrollTo(0, 0);
                }} className="text-gray-400 hover:text-[#ff6b35] transition-colors text-sm cursor-pointer bg-transparent border-none p-0">FAQ</button>
              </li>
              <li>
                <button onClick={() => {
                  navigate('/auth/role-select?role=job-seeker&intent=login');
                  window.scrollTo(0, 0);
                }} className="text-gray-400 hover:text-[#ff6b35] transition-colors text-sm cursor-pointer bg-transparent border-none p-0">For Job Seekers</button>
              </li>
              <li>
                <button onClick={() => {
                  navigate('/auth/role-select?role=recruiter&intent=login');
                  window.scrollTo(0, 0);
                }} className="text-gray-400 hover:text-[#ff6b35] transition-colors text-sm cursor-pointer bg-transparent border-none p-0">For Recruiters</button>
              </li>
              <li>
                <button onClick={() => {
                  navigate('/auth/role-select?role=admin&intent=login');
                  window.scrollTo(0, 0);
                }} className="text-gray-400 hover:text-[#ff6b35] transition-colors text-sm cursor-pointer bg-transparent border-none p-0">For Institutions</button>
              </li>
            </ul>
          </div>

          {/* Company Section */}
          <div>
            <h2 className="font-semibold mb-4 text-white">Company</h2>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => {
                    navigate('/about');
                    window.scrollTo(0, 0);
                  }}
                  className="text-gray-400 hover:text-[#ff6b35] transition-colors text-sm cursor-pointer bg-transparent border-none p-0"
                >
                  About Us
                </button>
              </li>
              <li>
                <button 
                onClick={() => {
                    navigate('/jobseeker');
                    window.scrollTo(0, 0);
                  }}
                className="text-gray-400 hover:text-[#ff6b35] transition-colors text-sm cursor-pointer bg-transparent border-none p-0">Job Seeker</button>
              </li>
              <li>
                <button 
                onClick={() => {
                    navigate('/recruiter');
                    window.scrollTo(0, 0);
                  }}
                className="text-gray-400 hover:text-[#ff6b35] transition-colors text-sm cursor-pointer bg-transparent border-none p-0">Recruiter</button>
              </li>
              <li>
                <button onClick={() => {
                  navigate('/contact');
                  window.scrollTo(0, 0);
                }} className="text-gray-400 hover:text-[#ff6b35] transition-colors text-sm cursor-pointer bg-transparent border-none p-0">Contact</button>
              </li>
            </ul>
          </div>

          {/* Legal Section */}
          <div>
            <h2 className="font-semibold mb-4 text-white">Legal</h2>
            <ul className="space-y-3">
              <li>
                <button onClick={() => {
                  navigate('/legal#privacy-policy');
                  window.scrollTo(0, 0);
                }} className="text-gray-400 hover:text-[#ff6b35] transition-colors text-sm cursor-pointer bg-transparent border-none p-0">Privacy Policy</button>
              </li>
              <li>
                <button onClick={() => {
                  navigate('/legal#terms-of-service');
                  window.scrollTo(0, 0);
                }} className="text-gray-400 hover:text-[#ff6b35] transition-colors text-sm cursor-pointer bg-transparent border-none p-0">Terms of Service</button>
              </li>
              <li>
                <button onClick={() => {
                  navigate('/legal#cookie-policy');
                  window.scrollTo(0, 0);
                }} className="text-gray-400 hover:text-[#ff6b35] transition-colors text-sm cursor-pointer bg-transparent border-none p-0">Cookie Policy</button>
              </li>
              <li>
                <button onClick={() => {
                  navigate('/legal#acceptable-use');
                  window.scrollTo(0, 0);
                }} className="text-gray-400 hover:text-[#ff6b35] transition-colors text-sm cursor-pointer bg-transparent border-none p-0">Acceptable Use</button>
              </li>
              <li>
                <button onClick={() => {
                  navigate('/legal#data-protection');
                  window.scrollTo(0, 0);
                }} className="text-gray-400 hover:text-[#ff6b35] transition-colors text-sm cursor-pointer bg-transparent border-none p-0">Data Protection</button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-700/50">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} theGarage. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <span>Made with ❤️ for job seekers everywhere</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
