import { Link } from 'react-router-dom';
import {
  HiOutlineDocumentText,
  HiOutlineAcademicCap,
  HiOutlineShieldCheck,
  HiOutlineScale,
  HiOutlineBadgeCheck,
  HiOutlineUserCircle,
  HiOutlineExclamationCircle,
  HiOutlineMail,
  HiOutlineCheckCircle,
  HiOutlineArrowLeft
} from 'react-icons/hi';

const TermsOfService = () => {
  const lastUpdated = "September 3, 2026";

  const keyHighlights = [
    {
      icon: <HiOutlineAcademicCap className="w-6 h-6 text-indigo-500" />,
      title: "Educational Integrity",
      desc: "Fair use and adherence to academic honesty across courses, exams, and assessments."
    },
    {
      icon: <HiOutlineShieldCheck className="w-6 h-6 text-emerald-500" />,
      title: "Account Security",
      desc: "Users are responsible for safeguarding login credentials and maintaining security."
    },
    {
      icon: <HiOutlineBadgeCheck className="w-6 h-6 text-purple-500" />,
      title: "Verified Credentials",
      desc: "Certificates are authentic, permanently verifiable, and tied to valid assessments."
    },
    {
      icon: <HiOutlineScale className="w-6 h-6 text-pink-500" />,
      title: "Intellectual Property",
      desc: "Instructors retain ownership of content while granting platform delivery licenses."
    }
  ];

  return (
    <div className="relative min-h-screen pt-24 pb-20 overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-r from-purple-500/15 via-indigo-500/15 to-pink-500/10 blur-[140px] pointer-events-none -z-10" />

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
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/60 text-purple-600 dark:text-purple-400 text-xs font-semibold uppercase tracking-wider mb-4 shadow-sm">
            <HiOutlineDocumentText className="w-4 h-4" /> Terms & Conditions
          </div>
          <h1 className="text-3xl sm:text-5xl font-black font-heading text-slate-900 dark:text-white tracking-tight mb-4">
            Terms of <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">Service</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Please read these Terms of Service carefully before utilizing the EduPlatform website, learning management systems, assessment portals, and certification services.
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
              <h2>Acceptance of Terms</h2>
            </div>
            <p className="pl-11 text-slate-600 dark:text-slate-400">
              By accessing, browsing, registering, or using <strong>EduPlatform</strong> (&quot;the Platform&quot;), you enter into a legally binding agreement and agree to comply with and be bound by these Terms of Service, our Privacy Policy, and any supplemental terms applicable to specific features. If you disagree with any part of these terms, you must discontinue using our platform.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3 text-slate-900 dark:text-white font-bold text-lg sm:text-xl">
              <span className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm font-black">2</span>
              <h2>User Accounts & Security</h2>
            </div>
            <div className="pl-11 space-y-3 text-slate-600 dark:text-slate-400">
              <p>When creating an account on EduPlatform, you agree to:</p>
              <ul className="space-y-2 list-none">
                <li className="flex items-start gap-2">
                  <HiOutlineCheckCircle className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                  <span>Provide accurate, current, and complete registration information.</span>
                </li>
                <li className="flex items-start gap-2">
                  <HiOutlineCheckCircle className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                  <span>Maintain the confidentiality of your password, login tokens, and OAuth credentials.</span>
                </li>
                <li className="flex items-start gap-2">
                  <HiOutlineCheckCircle className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                  <span>Notify our support team immediately of any unauthorized account activity or security breach.</span>
                </li>
                <li className="flex items-start gap-2">
                  <HiOutlineCheckCircle className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                  <span>Accept responsibility for all activities occurring under your account credentials.</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3 text-slate-900 dark:text-white font-bold text-lg sm:text-xl">
              <span className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm font-black">3</span>
              <h2>Academic Honesty & Code of Conduct</h2>
            </div>
            <div className="pl-11 space-y-3 text-slate-600 dark:text-slate-400">
              <p>
                EduPlatform maintains high standards of academic integrity. When participating in courses, assessments, and examinations:
              </p>
              <ul className="space-y-1.5 list-disc pl-5">
                <li>You must submit your own original work for assignments and examinations.</li>
                <li>Plagiarism, impersonation, or unauthorized collaboration during timed exams is strictly prohibited.</li>
                <li>Attempting to bypass proctoring tools, reverse-engineer API endpoints, or exploit grading systems will result in immediate account termination.</li>
                <li>Harassment, abusive language, or posting malicious content in public discussion areas is strictly forbidden.</li>
              </ul>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3 text-slate-900 dark:text-white font-bold text-lg sm:text-xl">
              <span className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm font-black">4</span>
              <h2>Instructor Responsibilities & Content Rights</h2>
            </div>
            <div className="pl-11 space-y-3 text-slate-600 dark:text-slate-400">
              <p>
                Instructors publishing courses, videos, PDFs, and assessments retain full intellectual property ownership of their materials. By uploading course content to EduPlatform:
              </p>
              <ul className="space-y-1.5 list-disc pl-5">
                <li>You grant EduPlatform a non-exclusive license to host, display, stream, and deliver course materials to enrolled students.</li>
                <li>You represent and warrant that you hold all necessary copyrights, licenses, and permissions for uploaded media.</li>
                <li>You agree not to upload defamatory, copyrighted without license, infringing, or harmful material.</li>
              </ul>
            </div>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3 text-slate-900 dark:text-white font-bold text-lg sm:text-xl">
              <span className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm font-black">5</span>
              <h2>Certificates & Credential Verification</h2>
            </div>
            <p className="pl-11 text-slate-600 dark:text-slate-400">
              Certificates issued by EduPlatform are awarded upon satisfying course completion criteria and required assessment passing marks. Each certificate is minted with a unique identifier and is publicly verifiable via our Verification Portal. EduPlatform reserves the right to revoke or invalidate any certificate obtained through fraudulent activity, cheating, or terms violations.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3 text-slate-900 dark:text-white font-bold text-lg sm:text-xl">
              <span className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm font-black">6</span>
              <h2>AI Tools & Third-Party Integrations</h2>
            </div>
            <p className="pl-11 text-slate-600 dark:text-slate-400">
              Certain features on our platform utilize artificial intelligence (such as Google Gemini API) for learning assistance, quiz creation, and course structuring. AI-generated suggestions are provided as learning aids and should be reviewed for accuracy. Third-party cloud infrastructure (such as ImageKit for media storage and MongoDB Atlas for database services) is subject to their respective service level agreements.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3 text-slate-900 dark:text-white font-bold text-lg sm:text-xl">
              <span className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm font-black">7</span>
              <h2>Limitation of Liability & Disclaimer</h2>
            </div>
            <p className="pl-11 text-slate-600 dark:text-slate-400">
              EduPlatform is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis without warranties of any kind, whether express or implied. To the maximum extent permitted by applicable law, EduPlatform and its affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the platform.
            </p>
          </section>

          {/* Section 8 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3 text-slate-900 dark:text-white font-bold text-lg sm:text-xl">
              <span className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm font-black">8</span>
              <h2>Modifications & Termination</h2>
            </div>
            <p className="pl-11 text-slate-600 dark:text-slate-400">
              We reserve the right to revise or update these Terms of Service at any time. Continued use of the platform after changes constitutes acceptance of the updated terms. We may suspend or terminate your account at our discretion if you violate these Terms or engage in conduct detrimental to other learners.
            </p>
          </section>

          {/* Section 9 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3 text-slate-900 dark:text-white font-bold text-lg sm:text-xl">
              <span className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm font-black">9</span>
              <h2>Contact Information</h2>
            </div>
            <div className="pl-11 space-y-3 text-slate-600 dark:text-slate-400">
              <p>
                If you have questions or concerns regarding these Terms of Service, please reach out to our legal and support team:
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
            Thank you for being part of the EduPlatform learning community.
          </p>
        </div>

      </div>
    </div>
  );
};

export default TermsOfService;
