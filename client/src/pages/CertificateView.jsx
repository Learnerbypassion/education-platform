import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCertificate } from '../api/certificateApi';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';
import { HiOutlineDownload, HiOutlineShieldCheck, HiOutlineShare } from 'react-icons/hi';
import { formatDate } from '../utils/helpers';
import './CertificateView.css';

const CertificateView = () => {
  const { id } = useParams();
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);

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
              <a href={cert.pdfUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
                <HiOutlineDownload /> Download PDF
              </a>
            )}
          </div>
        </div>

        <div className="cert-document-wrapper glass-card animate-scale-in">
          <div className="cert-border-outer">
            <div className="cert-border-inner">
              <div className="cert-badge-wrapper">
                <HiOutlineShieldCheck className="cert-verified-icon" />
                <span>Verified Credential</span>
              </div>

              <span className="cert-org">EDUPLATFORM ACADEMY</span>
              
              <h1 className="cert-title">Certificate of Completion</h1>
              
              <p className="cert-subtitle">This is to certify that</p>
              
              <h2 className="cert-recipient">{cert.studentName}</h2>
              
              <p className="cert-statement">has successfully completed the course requirements and examinations for</p>
              
              <h3 className="cert-course-name">&ldquo;{cert.courseName}&rdquo;</h3>
              
              <p className="cert-grade">with an overall grade of <strong>{cert.grade}</strong></p>

              <div className="cert-footer">
                <div className="cert-signatures">
                  <div className="cert-sig-item">
                    <span className="sig-line">{cert.instructorName}</span>
                    <span>Lead Instructor</span>
                  </div>
                  <div className="cert-sig-item">
                    <span className="sig-line">{formatDate(cert.completionDate)}</span>
                    <span>Date Issued</span>
                  </div>
                </div>

                <div className="cert-meta">
                  <span>Certificate ID: <strong>{cert.certificateId}</strong></span>
                  {cert.qrCode && (
                    <div className="cert-qr-holder">
                      {/* Simple visual fallback since verify certificate URL is stored in qrCode */}
                      <span className="qr-text">Scan for Verification</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateView;
