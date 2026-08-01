import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCertificate } from '../api/certificateApi';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';
import { HiOutlineDownload, HiOutlineShieldCheck, HiOutlineShare } from 'react-icons/hi';
import { formatDate, getMediaUrl } from '../utils/helpers';
import './CertificateView.css';

const CertificateView = () => {
  const { id } = useParams();
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const loadCertificate = async () => {
      try {
        const res = await getCertificate(id);
        setCert(res.data.data);
      } catch {
        toast.error('Failed to load certificate');
      } finally {
        setLoading(false);
      }
    };
    loadCertificate();
  }, [id]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Certificate link copied to clipboard!');
  };

  const handleDownloadPdf = async () => {
    if (!cert?.pdfUrl) return;
    setDownloading(true);
    try {
      const fullUrl = getMediaUrl(cert.pdfUrl);
      const response = await fetch(fullUrl);
      if (!response.ok) throw new Error('PDF file stream unavailable');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `Certificate_${cert.certificateId || 'EduPlatform'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      toast.success('Certificate PDF downloaded!');
    } catch (err) {
      console.error('Failed to download PDF:', err);
      // Fallback: Open in new window if blob fetch hits CORS or direct stream
      const fallbackUrl = getMediaUrl(cert.pdfUrl);
      window.open(fallbackUrl, '_blank');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <Loader text="Retrieving verified certificate credentials..." />;
  if (!cert) return <div className="container"><h3>Certificate not found</h3></div>;

  return (
    <div className="cert-view-page">
      <div className="container">
        <div className="cert-action-bar animate-fade-in-down">
          <Link to="/dashboard" className="btn btn-ghost btn-sm">← Back to Dashboard</Link>
          <div className="cert-actions-group">
            <button onClick={handleShare} className="btn btn-outline btn-sm"><HiOutlineShare /> Share Link</button>
            {cert.pdfUrl && (
              <button 
                onClick={handleDownloadPdf} 
                disabled={downloading}
                className="btn btn-primary btn-sm flex items-center gap-1.5 cursor-pointer"
              >
                <HiOutlineDownload /> {downloading ? 'Downloading...' : 'Download PDF'}
              </button>
            )}
          </div>
        </div>

        <div className="cert-document-wrapper animate-scale-in">
          <div className="cert-border-outer">
            <div className="cert-border-inner">
              
              {/* Top Academy Header */}
              <div className="cert-header-crest">
                <h4 className="cert-academy-title">EDUPLATFORM ACADEMY OF TECHNOLOGY</h4>
                <p className="cert-academy-subtitle">OFFICIAL ACCREDITED ACADEMIC CREDENTIAL</p>
              </div>

              {/* Certificate Main Title */}
              <div className="cert-title-container">
                <h1 className="cert-main-heading">Certificate of Completion</h1>
                <div className="cert-gold-ribbon-line"></div>
              </div>
              
              <p className="cert-preamble">THIS IS TO CERTIFY THAT</p>
              
              <h2 className="cert-student-name">{cert.studentName}</h2>
              
              <p className="cert-statement-text">
                has successfully satisfied all required coursework, engineering laboratories, and comprehensive final examinations for
              </p>
              
              <div className="cert-course-container">
                <h3 className="cert-course-title">&ldquo;{cert.courseName}&rdquo;</h3>
              </div>
              
              <div className="cert-grade-container">
                <span className="cert-grade-badge">Academic Standing: <strong>Grade {cert.grade || 'P (Passed)'}</strong></span>
              </div>

              {/* Signatures & Gold Seal Footer Grid */}
              <div className="cert-signatures-row">
                <div className="cert-sig-column">
                  <div className="cert-signature-handwritten">{cert.instructorName}</div>
                  <div className="cert-sig-underline"></div>
                  <span className="cert-sig-title">FACULTY CHAIR & INSTRUCTOR</span>
                </div>

                <div className="cert-gold-seal-wrapper">
                  <div className="cert-gold-seal-badge">
                    <HiOutlineShieldCheck size={28} className="text-amber-600" />
                    <span className="seal-text-main">VERIFIED</span>
                    <span className="seal-text-sub">OFFICIAL SEAL</span>
                  </div>
                </div>

                <div className="cert-sig-column">
                  <div className="cert-date-text">{formatDate(cert.completionDate)}</div>
                  <div className="cert-sig-underline"></div>
                  <span className="cert-sig-title">DATE OF ISSUANCE</span>
                </div>
              </div>

              {/* Certificate Verification Ledger Bar */}
              <div className="cert-ledger-bar">
                <span className="cert-id-label">Verification ID: <strong className="font-mono text-indigo-900">{cert.certificateId}</strong></span>
                <span className="cert-ledger-badge">✓ Authenticated on EduPlatform Registry</span>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateView;
