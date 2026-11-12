import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
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
  HiOutlineDownload,
  HiOutlineInformationCircle
} from 'react-icons/hi';
import { formatDate, getMediaUrl } from '../utils/helpers';
import './VerifyCertificate.css';

const VerifyCertificate = () => {
  const { certificateId } = useParams();
  const [certId, setCertId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const executeVerification = useCallback(async (idToVerify) => {
    const trimmed = (idToVerify || '').trim();
    if (!trimmed) {
      toast.error('Please enter a Certificate ID');
      return;
    }
    
    setLoading(true);
    setResult(null);
    try {
      const res = await verifyCertificate(trimmed);
      setResult(res.data.data);
      if (res.data.data?.isValid) {
        toast.success('Certificate record verified as authentic');
      } else {
        toast.error('Certificate ID not found in registry');
      }
    } catch {
      toast.error('Verification query failed. Check network connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (certificateId) {
      setCertId(certificateId);
      executeVerification(certificateId);
    }
  }, [certificateId, executeVerification]);

  const handleVerify = (e) => {
    if (e) e.preventDefault();
    executeVerification(certId);
  };

  return (
    <div className="verify-page min-h-screen text-slate-900 dark:text-white px-4 py-8 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="verify-hero text-center space-y-3 mb-8 print:hidden">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <HiOutlineShieldCheck size={16} />
          <span>Official Public Credential Registry</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950 dark:text-white">
          Certificate Verification
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
          Confirm the authenticity of course completion certificates and academic credentials issued by EduPlatform.
        </p>
      </div>

      {/* Verification Query Form */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#11131c] p-4 sm:p-5 shadow-xs mb-8 print:hidden">
        <form onSubmit={handleVerify}>
          <div className="flex flex-col sm:flex-row items-stretch gap-3">
            <div className="relative flex-1 flex items-center">
              <label htmlFor="certificate-id-input" className="sr-only">Certificate ID</label>
              <HiOutlineSearch className="absolute left-3.5 text-slate-400 pointer-events-none" size={18} />
              <input 
                type="text" 
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-slate-900 dark:focus:border-white transition-colors" 
                placeholder="Enter Certificate ID (e.g., CERT-A1B2C3D4-...)" 
                value={certId} 
                onChange={(e) => setCertId(e.target.value)} 
                id="certificate-id-input"
                autoComplete="off"
              />
              {certId && (
                <button 
                  type="button" 
                  onClick={() => setCertId('')}
                  aria-label="Clear input"
                  className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <HiOutlineX size={16} />
                </button>
              )}
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary px-5 py-2.5 text-xs font-semibold whitespace-nowrap cursor-pointer flex items-center justify-center gap-1.5" 
              disabled={loading}
            >
              {loading ? (
                <span>Querying Registry...</span>
              ) : (
                <>
                  <HiOutlineShieldCheck size={16} />
                  <span>Verify Credential</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Verification Result Card */}
      {result && (
        <div className="mb-8">
          {result.isValid && result.certificate ? (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#11131c] p-6 sm:p-8 shadow-xs printable-certificate-card">
              
              <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-6 border-b border-slate-100 dark:border-slate-850 gap-4 mb-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded border border-emerald-200 dark:border-emerald-800">
                    <HiOutlineCheckCircle size={15} /> Verified & Authentic
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-950 dark:text-white mt-2">
                    {result.certificate.studentName}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Issued by EduPlatform Academic Faculty & Certification Registry
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">Verification ID</span>
                  <span className="text-xs font-mono font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-850 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 inline-block mt-1">
                    {result.certificate.certificateId}
                  </span>
                </div>
              </div>

              {/* Certificate Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs mb-6">
                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">Course Curriculum</span>
                  <strong className="text-sm font-semibold text-slate-900 dark:text-white block mt-1">{result.certificate.courseName}</strong>
                </div>

                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">Lead Instructor</span>
                  <strong className="text-sm font-semibold text-slate-900 dark:text-white block mt-1">{result.certificate.instructorName}</strong>
                </div>

                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">Completion Date</span>
                  <strong className="text-sm font-semibold text-slate-900 dark:text-white block mt-1">{formatDate(result.certificate.completionDate)}</strong>
                </div>

                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">Performance Distinction</span>
                  <strong className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 block mt-1">{result.certificate.grade || 'Passed with Distinction'}</strong>
                </div>
              </div>

              {/* Actions Row */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-end gap-2.5 print:hidden">
                {result.certificate.pdfUrl && (
                  <button 
                    type="button" 
                    className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    onClick={async () => {
                      try {
                        const fullUrl = getMediaUrl(result.certificate.pdfUrl);
                        const res = await fetch(fullUrl);
                        if (!res.ok) throw new Error('Download failed');
                        const blob = await res.blob();
                        const blobUrl = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = blobUrl;
                        a.download = `Certificate_${result.certificate.certificateId}.pdf`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        window.URL.revokeObjectURL(blobUrl);
                        toast.success('Certificate PDF downloaded');
                      } catch {
                        window.open(getMediaUrl(result.certificate.pdfUrl), '_blank');
                      }
                    }}
                  >
                    <HiOutlineDownload size={15} /> Download PDF
                  </button>
                )}
                <button 
                  type="button" 
                  className="btn btn-outline px-3.5 py-2 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                  onClick={() => window.print()}
                >
                  <HiOutlinePrinter size={15} /> Print Record
                </button>
                <button 
                  type="button" 
                  className="btn btn-outline px-3.5 py-2 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success('Verification URL copied to clipboard');
                  }}
                >
                  <HiOutlineShare size={15} /> Copy Link
                </button>
              </div>

              {/* Print Only Seal */}
              <div className="hidden print:flex items-center justify-between pt-8 border-t border-slate-300 mt-8 text-xs font-medium text-slate-600">
                <div>
                  <p className="font-mono">ID: {result.certificate.certificateId}</p>
                  <p className="text-[10px] text-slate-500">Authenticated via EduPlatform Academic Registry</p>
                </div>
                <div className="text-right">
                  <p className="italic">EduPlatform Academic Board</p>
                  <p className="text-[10px] text-slate-500">Official Digital Signature</p>
                </div>
              </div>

            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#11131c] p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 flex items-center justify-center mx-auto mb-3">
                <HiOutlineShieldExclamation size={24} />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                No Record Found
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No active credential was found matching <span className="font-mono font-semibold">"{certId}"</span>. Verify the Certificate ID format and try again.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Information Guide */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#11131c] p-6 text-xs text-slate-600 dark:text-slate-400 print:hidden space-y-3">
        <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
          <HiOutlineInformationCircle size={16} />
          <span>Verification Protocol & Standards</span>
        </div>
        <p className="leading-relaxed">
          The EduPlatform credential registry maintains permanent completion records for all issued certificates. Each credential record stores student identity, course curriculum, passing date, and distinction marks to prevent forgery.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-[11px]">
          <div>
            <span className="font-semibold text-slate-700 dark:text-slate-300 block">Tamper-Evident</span>
            <span>Cryptographic IDs cross-reference immutable completion records.</span>
          </div>
          <div>
            <span className="font-semibold text-slate-700 dark:text-slate-300 block">Instant Verification</span>
            <span>Direct database query confirms status in real time.</span>
          </div>
          <div>
            <span className="font-semibold text-slate-700 dark:text-slate-300 block">Third-Party Auditable</span>
            <span>Employers and universities can verify without platform login.</span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default VerifyCertificate;
