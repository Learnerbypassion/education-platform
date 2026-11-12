import { Link } from 'react-router-dom';
import {
  HiOutlineShieldCheck,
  HiOutlineLockClosed,
  HiOutlineKey,
  HiOutlineDatabase,
  HiOutlineEye,
  HiOutlineUserGroup,
  HiOutlineMail,
  HiOutlineDocumentText,
  HiOutlineSparkles,
  HiOutlineCheckCircle,
  HiOutlineArrowLeft
} from 'react-icons/hi';

const PrivacyPolicy = () => {
  const lastUpdated = "September 3, 2026";

  const keyHighlights = [
    {
      icon: <HiOutlineLockClosed className="w-6 h-6 text-indigo-500" />,
      title: "End-to-End Security",
      desc: "All sensitive credentials and data are encrypted in transit and at rest."
    },
    {
      icon: <HiOutlineShieldCheck className="w-6 h-6 text-emerald-500" />,
      title: "No Data Selling",
      desc: "We never sell or monetize your personal information to any third parties."
    },
    {
      icon: <HiOutlineKey className="w-6 h-6 text-purple-500" />,
      title: "Google & GitHub OAuth",
      desc: "Strictly minimal scope usage (email and public profile) for authentication only."
    },
    {
      icon: <HiOutlineDatabase className="w-6 h-6 text-pink-500" />,
      title: "Your Data, Your Control",
      desc: "Full rights to access, export, or request permanent deletion of your account."
    }
  ];

  return (
    <div className="relative min-h-screen pt-24 pb-20 overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-r from-indigo-500/15 via-purple-500/15 to-pink-500/10 blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb / Back Link */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <HiOutlineArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>

        {/* Hero Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-4 shadow-sm">
            <HiOutlineShieldCheck className="w-4 h-4" /> Legal & Compliance
          </div>
          <h1 className="text-3xl sm:text-5xl font-black font-heading text-slate-900 dark:text-white tracking-tight mb-4">
            Privacy <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">Policy</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Your privacy is of utmost importance to us. This policy outlines how EduPlatform collects, uses, protects, and handles your data across our educational ecosystem.
          </p>
          <div className="mt-4 text-xs font-medium text-slate-400 dark:text-slate-500">
            Last Updated: <span className="text-slate-700 dark:text-slate-300 font-semibold">{lastUpdated}</span>
          </div>
        </div>

        {/* Highlights Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
          {keyHighlights.map((item, index) => (
            <div
              key={index}
              className="p-5 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                {item.icon}
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                {item.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Main Content Body */}
        <div className="bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl rounded-3xl p-6 sm:p-10 shadow-xl space-y-10 text-slate-700 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
          
          {/* Section 1 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3 text-slate-900 dark:text-white font-bold text-lg sm:text-xl">
              <span className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm font-black">1</span>
              <h2>Introduction & Scope</h2>
            </div>
            <p className="pl-11 text-slate-600 dark:text-slate-400">
              Welcome to <strong>EduPlatform</strong> (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We provide an online educational ecosystem for course creation, learning management, proctored examinations, assignment grading, and verifiable credentials. By accessing or using our platform, websites, and related services, you acknowledge that you have read and understood this Privacy Policy.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3 text-slate-900 dark:text-white font-bold text-lg sm:text-xl">
              <span className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm font-black">2</span>
              <h2>Information We Collect</h2>
            </div>
            <div className="pl-11 space-y-3 text-slate-600 dark:text-slate-400">
              <p>We collect the following categories of information to provide and enhance our services:</p>
              <ul className="space-y-2 list-none">
                <li className="flex items-start gap-2">
                  <HiOutlineCheckCircle className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                  <span><strong>Account Information:</strong> Name, email address, password hash, role (Student, Instructor, Admin), and optional profile avatars or biographical info.</span>
                </li>
                <li className="flex items-start gap-2">
                  <HiOutlineCheckCircle className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                  <span><strong>Learning & Academic Activity:</strong> Course enrollments, lesson completion status, quiz submissions, exam logs, assignment submissions, and instructor feedback.</span>
                </li>
                <li className="flex items-start gap-2">
                  <HiOutlineCheckCircle className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                  <span><strong>Certificates & Credentials:</strong> Unique certificate identifiers, issuance dates, recipient names, and public verification hashes.</span>
                </li>
                <li className="flex items-start gap-2">
                  <HiOutlineCheckCircle className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                  <span><strong>Uploaded Files:</strong> Course materials, video media, PDFs, and assignment deliverables uploaded via our secure media storage (ImageKit).</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3 text-slate-900 dark:text-white font-bold text-lg sm:text-xl">
              <span className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm font-black">3</span>
              <h2>Third-Party Authentication (Google & GitHub OAuth)</h2>
            </div>
            <div className="pl-11 space-y-3 text-slate-600 dark:text-slate-400">
              <p>
                When you sign in using <strong>Google Sign-In</strong> or <strong>GitHub OAuth</strong>, we only request access to basic profile information (name, primary email address, and avatar image) necessary to authenticate your account and create your user profile.
              </p>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                  <strong>Google API Services User Data Policy Compliance:</strong> EduPlatform adheres to the Google API Services User Data Policy, including the Limited Use requirements. We do not use Google user data for advertising, nor do we transfer or sell user data to third parties.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3 text-slate-900 dark:text-white font-bold text-lg sm:text-xl">
              <span className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm font-black">4</span>
              <h2>How We Use Your Data</h2>
            </div>
            <div className="pl-11 space-y-2 text-slate-600 dark:text-slate-400">
              <p>Your data is processed strictly for legitimate operational purposes:</p>
              <ul className="space-y-1.5 list-disc pl-5">
                <li>Providing course delivery, quiz scoring, and real-time exam management.</li>
                <li>Generating verifiable digital certificates with tamper-proof public verification IDs.</li>
                <li>Sending transactional emails such as account verification, password resets, and submission notifications.</li>
                <li>Facilitating AI-assisted learning tools and course creation assistants (powered by Google Gemini API).</li>
                <li>Ensuring security, detecting abuse, and maintaining platform uptime.</li>
              </ul>
            </div>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3 text-slate-900 dark:text-white font-bold text-lg sm:text-xl">
              <span className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm font-black">5</span>
              <h2>Security & Storage</h2>
            </div>
            <div className="pl-11 space-y-3 text-slate-600 dark:text-slate-400">
              <p>
                We employ industry-standard administrative, technical, and physical security measures to protect your personal information:
              </p>
              <ul className="space-y-2 list-none">
                <li className="flex items-start gap-2">
                  <HiOutlineLockClosed className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Cryptographic Hashing:</strong> Passwords are one-way hashed using bcrypt. We never store plain-text passwords.</span>
                </li>
                <li className="flex items-start gap-2">
                  <HiOutlineKey className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>JWT Authentication:</strong> Session authorization is maintained via secure JSON Web Tokens.</span>
                </li>
                <li className="flex items-start gap-2">
                  <HiOutlineShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Encrypted Connections:</strong> All API communication and data in transit use HTTPS / SSL / TLS encryption.</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3 text-slate-900 dark:text-white font-bold text-lg sm:text-xl">
              <span className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm font-black">6</span>
              <h2>Cookies & Local Storage</h2>
            </div>
            <p className="pl-11 text-slate-600 dark:text-slate-400">
              EduPlatform utilizes browser local storage and essential cookies strictly to maintain user authentication state and theme preferences (Dark / Light mode). We do not use third-party tracking or behavioral advertising cookies.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3 text-slate-900 dark:text-white font-bold text-lg sm:text-xl">
              <span className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm font-black">7</span>
              <h2>Your Rights & Data Portability</h2>
            </div>
            <div className="pl-11 space-y-2 text-slate-600 dark:text-slate-400">
              <p>Depending on your jurisdiction (such as GDPR or CCPA), you hold full rights to:</p>
              <ul className="space-y-1.5 list-disc pl-5">
                <li>Access the personal information we hold about you.</li>
                <li>Request corrections to any inaccurate or incomplete details.</li>
                <li>Request the complete deletion of your account and associated personal data.</li>
                <li>Revoke OAuth access via your Google or GitHub account settings at any time.</li>
              </ul>
            </div>
          </section>

          {/* Section 8 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3 text-slate-900 dark:text-white font-bold text-lg sm:text-xl">
              <span className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm font-black">8</span>
              <h2>Contact Us</h2>
            </div>
            <div className="pl-11 space-y-3 text-slate-600 dark:text-slate-400">
              <p>
                If you have any questions, inquiries, or requests regarding this Privacy Policy or our data handling practices, please contact our privacy team:
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium text-sm">
                <HiOutlineMail className="w-5 h-5 text-indigo-500" />
                <span>novatech.innovate.solutions@gmail.com</span>
              </div>
            </div>
          </section>

        </div>

        {/* Footer Note */}
        <div className="mt-10 text-center">
          <p className="text-xs text-slate-400 dark:text-slate-500">
            By continuing to use EduPlatform, you agree to the terms outlined in this Privacy Policy.
          </p>
        </div>

      </div>
    </div>
  );
};

export default PrivacyPolicy;
