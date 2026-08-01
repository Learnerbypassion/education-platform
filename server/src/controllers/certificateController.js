const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const certificateService = require('../services/certificateService');
const Certificate = require('../models/Certificate');

// @desc    Generate certificate
// @route   POST /api/certificates/generate
// @access  Private/Student
const generateCertificate = asyncHandler(async (req, res) => {
  const { courseId } = req.body;
  const certificate = await certificateService.generateCertificate(req.user._id, courseId);
  ApiResponse.created(res, 'Certificate generated', certificate);
});

// @desc    Get my certificates
// @route   GET /api/certificates/me
// @access  Private/Student
const getMyCertificates = asyncHandler(async (req, res) => {
  const certificates = await Certificate.find({ studentId: req.user._id })
    .sort({ completionDate: -1 });
  ApiResponse.success(res, 'Certificates fetched', certificates);
});

// @desc    Get certificate by ID
// @route   GET /api/certificates/:id
// @access  Private
const getCertificate = asyncHandler(async (req, res) => {
  const certificate = await Certificate.findById(req.params.id);
  const ApiError = require('../utils/ApiError');
  if (!certificate) {
    throw ApiError.notFound('Certificate not found');
  }

  const Course = require('../models/Course');
  const course = await Course.findById(certificate.courseId);

  const studentId = certificate.studentId?.toString();
  const isOwner = studentId === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';
  let isInstructorOwner = false;

  if (req.user.role === 'instructor' && course) {
    isInstructorOwner = course.creatorId.toString() === req.user._id.toString();
  }

  if (!isOwner && !isAdmin && !isInstructorOwner) {
    throw ApiError.forbidden('You are not authorized to access this certificate');
  }

  // Refresh PDF file on disk to guarantee it matches current white diploma template
  try {
    const config = require('../config/env');
    const { generateQRBuffer } = require('../utils/qrGenerator');
    const verifyUrl = `${config.clientUrl}/verify/${certificate.certificateId}`;
    const qrCodeBuffer = await generateQRBuffer(verifyUrl);
    const pdfUrl = await certificateService.generatePDF({
      certificateId: certificate.certificateId,
      studentName: certificate.studentName,
      courseName: certificate.courseName,
      instructorName: certificate.instructorName,
      completionDate: new Date(certificate.completionDate),
      grade: certificate.grade,
      qrCodeBuffer,
    });
    certificate.pdfUrl = pdfUrl;
    await certificate.save();
  } catch (err) {
    console.error('Failed to sync certificate PDF:', err);
  }

  ApiResponse.success(res, 'Certificate details', certificate);
});

// @desc    Verify certificate (Public)
// @route   GET /api/certificates/verify/:certificateId
// @access  Public
const verifyCertificate = asyncHandler(async (req, res) => {
  const result = await certificateService.verifyCertificate(req.params.certificateId);
  ApiResponse.success(res, result.isValid ? 'Valid certificate' : 'Invalid certificate', result);
});

module.exports = { generateCertificate, getMyCertificates, getCertificate, verifyCertificate };
