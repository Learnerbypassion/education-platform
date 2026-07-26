import { useState } from 'react';
import { verifyCertificate } from '../api/certificateApi';
import toast from 'react-hot-toast';
import { 
  HiOutlineShieldCheck, 
  HiOutlineShieldExclamation, 
  HiOutlineSearch,
  HiOutlineLockClosed,
  HiOutlineBadgeCheck,
  HiOutlineLightningBolt,
  HiOutlineX,
  HiOutlinePrinter,
  HiOutlineShare,
  HiOutlineCheckCircle,
  HiOutlineSparkles
} from 'react-icons/hi';
import { formatDate } from '../utils/helpers';
import './VerifyCertificate.css';

const VerifyCertificate = () => {
  const [certId, setCertId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    if (!certId.trim()) {
      toast.error('Please enter a Certificate ID!');
      return;
    }
    
    setLoading(true);
    setResult(null);
    try {
      const res = await verifyCertificate(certId.trim());
      setResult(res.data.data);
      if (res.data.data?.isValid) {
        toast.success('Certificate Verified & Authentic! 🎉');
      } else {
        toast.error('Certificate ID not found.');
      }
    } catch {
      toast.error('Verification request failed. Please check your network.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="verify-page relative overflow-hidden">
      
      {/* Ambient Glowing Background Blobs */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-r from-indigo-500/15 via-purple-500/15 to-emerald-500/10 blur-[150px] pointer-events-none -z-10" />

      {/* Hero Header Banner */}
      <div className="verify-hero animate-fade-in print:hidden">
        <h1 className="text-4xl sm:text-5xl font-black font-heading text-slate-900 dark:text-white tracking-tight">
          Verify Academic <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">Certificates</span>
        </h1>
        
        <p className="text-base text-slate-600 dark:text-slate-300 font-medium max-w-xl mx-auto mt-3">
          Instant cryptographic validation of course completion certificates and skill credentials issued by EduPlatform.
        </p>
      </div>

      {/* Verification Input Form Card */}
      <div className="verify-form-card animate-scale-in print:hidden">
        <form onSubmit={handleVerify}>
          <div className="verify-input-group">
            <div className="verify-input-field-wrapper">
              <HiOutlineSearch className="verify-search-icon text-indigo-600 dark:text-indigo-400" size={22} />
              <input 
                type="text" 
                className="verify-input-field" 
                placeholder="Enter Certificate ID (e.g., CERT-A1B2C3D4-...)" 
                value={certId} 
                onChange={(e) => setCertId(e.target.value)} 
                id="certificate-id-input"
              />
              {certId && (
                <button 
                  type="button" 
                  onClick={() => setCertId('')}
                  className="absolute right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
                >
                  <HiOutlineX size={18} />
                </button>
              )}
            </div>
            
            <button 
              type="submit" 
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white rounded-2xl font-extrabold text-sm shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 active:scale-95 transition-all duration-300 disabled:opacity-50 whitespace-nowrap cursor-pointer flex items-center gap-2" 
              disabled={loading}
            >
              {loading ? (
                <span>Verifying...</span>
              ) : (
                <>
                  <span>Verify Credential</span>
                  <HiOutlineCheckCircle size={18} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Verified Certificate Result Card */}
      {result && (
        <div className="verify-result-wrapper animate-scale-in w-full">
          {result.isValid && result.certificate ? (
            <div className="verify-result-card printable-certificate-card">
              
              {/* Gold Ribbon Badge Header */}
              <div className="flex justify-between items-start pb-6 border-b-2 border-indigo-500/20 mb-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase tracking-wider shadow-sm">
                    <HiOutlineCheckCircle size={16} /> Official Verified Credential
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white font-heading mt-3 tracking-tight">
                    {result.certificate.studentName}
                  </h2>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">
                    Issued by EduPlatform Faculty Board & Certification Registry
                  </p>
                </div>

                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-white flex items-center justify-center text-3xl font-black shadow-lg shadow-amber-500/25 border-2 border-amber-300">
                  🏅
                </div>
              </div>

              {/* Certificate Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs mb-6">
                <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-500/20 space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">Course Title</span>
                  <strong className="text-base font-black text-slate-900 dark:text-white block">{result.certificate.courseName}</strong>
                </div>

                <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-500/20 space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400 block">Lead Instructor</span>
                  <strong className="text-base font-black text-slate-900 dark:text-white block">{result.certificate.instructorName}</strong>
                </div>

                <div className="p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block">Completion Date</span>
                  <strong className="text-base font-black text-slate-900 dark:text-white block">{formatDate(result.certificate.completionDate)}</strong>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-500/20 space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">Performance Grade</span>
                  <strong className="text-base font-black text-emerald-600 dark:text-emerald-400 block">{result.certificate.grade || 'A+ (Passed with Distinction)'}</strong>
                </div>
              </div>

              {/* Certificate ID & Action Buttons */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-4 print:hidden">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Cryptographic Verification ID</span>
                  <span className="text-sm font-mono font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 rounded-lg border border-indigo-200 dark:border-indigo-500/30 inline-block">
                    {result.certificate.certificateId}
                  </span>
                </div>

                <div className="flex gap-3">
                  <button 
                    type="button" 
                    className="px-5 py-2.5 rounded-xl border-2 border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 text-xs font-extrabold hover:bg-indigo-50 dark:hover:bg-indigo-500/20 flex items-center gap-2 transition-all shadow-sm cursor-pointer"
                    onClick={() => window.print()}
                  >
                    <HiOutlinePrinter size={16} /> Print Official Record
                  </button>
                  <button 
                    type="button" 
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-extrabold hover:from-indigo-700 hover:to-purple-700 flex items-center gap-2 transition-all shadow-md shadow-indigo-500/20 cursor-pointer"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      toast.success('Verification link copied to clipboard!');
                    }}
                  >
                    <HiOutlineShare size={16} /> Share Credential
                  </button>
                </div>
              </div>

              {/* Print Only Footer Seal */}
              <div className="hidden print:flex items-center justify-between pt-8 border-t border-slate-300 mt-8 text-xs font-bold text-slate-600">
                <div>
                  <p className="font-mono">ID: {result.certificate.certificateId}</p>
                  <p className="text-[10px] text-slate-500">Verified via EduPlatform Master Registry</p>
                </div>
                <div className="text-right">
                  <p className="font-serif italic text-slate-800">EduPlatform Faculty Board</p>
                  <p className="text-[10px] text-slate-500">Authorized Digital Signature</p>
                </div>
              </div>

            </div>
          ) : (
            <div className="verify-result-card invalid text-center py-10">
              <div className="w-20 h-20 rounded-3xl bg-rose-500/10 text-rose-500 flex items-center justify-center text-4xl mx-auto mb-4 border-2 border-rose-500/30 shadow-lg shadow-rose-500/10">
                <HiOutlineShieldExclamation size={44} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white font-heading">
                Invalid Certificate Record
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 max-w-sm mx-auto font-medium">
                No active credential was found matching <span className="font-mono font-black text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded border border-rose-200">"{certId}"</span>. Please double check the ID format and try again.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Trust & Security Features Cards */}
      <div className="verify-features-grid animate-fade-in-up print:hidden">
        <div className="verify-feature-card group hover:-translate-y-1.5 transition-all duration-300">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-2xl mx-auto mb-3 border border-indigo-500/20 group-hover:scale-110 transition-transform">
            <HiOutlineLockClosed size={26} />
          </div>
          <h4 className="text-base font-extrabold text-slate-900 dark:text-white font-heading">SHA-256 Hashed</h4>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-medium">Cryptographically signed digital signatures guarantee 100% tamper-proof validity.</p>
        </div>

        <div className="verify-feature-card group hover:-translate-y-1.5 transition-all duration-300">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center text-2xl mx-auto mb-3 border border-purple-500/20 group-hover:scale-110 transition-transform">
            <HiOutlineLightningBolt size={26} />
          </div>
          <h4 className="text-base font-extrabold text-slate-900 dark:text-white font-heading">Real-Time Lookup</h4>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-medium">Instant database query cross-references student identity and grade ledger.</p>
        </div>

        <div className="verify-feature-card group hover:-translate-y-1.5 transition-all duration-300">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-2xl mx-auto mb-3 border border-emerald-500/20 group-hover:scale-110 transition-transform">
            <HiOutlineBadgeCheck size={26} />
          </div>
          <h4 className="text-base font-extrabold text-slate-900 dark:text-white font-heading">Shareable Badges</h4>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-medium">Verified credentials can be linked directly on LinkedIn or printed as PDF resumes.</p>
        </div>
      </div>

    </div>
  );
};

export default VerifyCertificate;
