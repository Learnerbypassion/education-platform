import { useState } from 'react';
import { verifyCertificate } from '../api/certificateApi';
import toast from 'react-hot-toast';
import { HiOutlineShieldCheck, HiOutlineShieldExclamation, HiOutlineSearch } from 'react-icons/hi';
import { FaCertificate } from 'react-icons/fa';
import { formatDate } from '../utils/helpers';
import './VerifyCertificate.css';

const VerifyCertificate = () => {
  const [certId, setCertId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!certId.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await verifyCertificate(certId.trim());
      setResult(res.data.data);
    } catch {
      toast.error('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="verify-page">
      <div className="container">
        <div className="verify-header animate-fade-in-up">
          <FaCertificate className="verify-header-icon" />
          <h1 className="section-title">Verify <span className="gradient-text">Certificate</span></h1>
          <p className="section-subtitle">Enter a certificate ID or scan a QR code to verify its authenticity</p>
        </div>

        <form onSubmit={handleVerify} className="verify-form glass-card animate-fade-in-up" style={{ animationDelay: '0.1s' }} id="verify-form">
          <div className="verify-input-wrapper">
            <HiOutlineSearch className="verify-search-icon" />
            <input type="text" className="input-field" placeholder="Enter Certificate ID (e.g., CERT-A1B2C3D4-...)" value={certId} onChange={(e) => setCertId(e.target.value)} id="certificate-id-input" />
          </div>
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </form>

        {result && (
          <div className={`verify-result glass-card animate-scale-in ${result.isValid ? 'verify-valid' : 'verify-invalid'}`}>
            <div className="verify-result-icon">
              {result.isValid ? <HiOutlineShieldCheck /> : <HiOutlineShieldExclamation />}
            </div>
            <h2 className="verify-result-status">
              {result.isValid ? 'Valid Certificate' : 'Invalid Certificate'}
            </h2>
            {result.isValid && result.certificate && (
              <div className="verify-result-details">
                <div className="verify-detail"><span>Student</span><strong>{result.certificate.studentName}</strong></div>
                <div className="verify-detail"><span>Course</span><strong>{result.certificate.courseName}</strong></div>
                <div className="verify-detail"><span>Instructor</span><strong>{result.certificate.instructorName}</strong></div>
                <div className="verify-detail"><span>Date</span><strong>{formatDate(result.certificate.completionDate)}</strong></div>
                <div className="verify-detail"><span>Grade</span><strong>{result.certificate.grade}</strong></div>
                <div className="verify-detail"><span>Certificate ID</span><strong>{result.certificate.certificateId}</strong></div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyCertificate;
