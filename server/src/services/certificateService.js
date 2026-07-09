const { v4: uuidv4 } = require('uuid');
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');
const Certificate = require('../models/Certificate');
const Enrollment = require('../models/Enrollment');
const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');
const Exam = require('../models/Exam');
const Course = require('../models/Course');
const User = require('../models/User');
const { generateQRBuffer } = require('../utils/qrGenerator');
const ApiError = require('../utils/ApiError');
const config = require('../config/env');
const emailService = require('./emailService');
const { createNotification } = require('../utils/notificationHelper');

class CertificateService {
  /**
   * Check eligibility and generate a certificate.
   */
  async generateCertificate(studentId, courseId) {
    // Check if certificate already exists
    const existing = await Certificate.findOne({ studentId, courseId });
    if (existing) {
      return existing;
    }

    // 1. Verify enrollment exists
    const enrollment = await Enrollment.findOne({ studentId, courseId });
    if (!enrollment) {
      throw ApiError.badRequest('Not enrolled in this course');
    }

    // 2. Check course progress is 100%
    if (enrollment.progress < 100) {
      throw ApiError.badRequest(
        `Course progress is ${enrollment.progress}%. You must complete 100% of the course to earn a certificate.`
      );
    }

    // 3. Check all published assignments for this course are passed
    const assignments = await Assignment.find({ courseId, isPublished: true });
    if (assignments.length > 0) {
      for (const assignment of assignments) {
        const passedSubmission = await Submission.findOne({
          assignmentId: assignment._id,
          studentId,
          type: 'assignment',
          isPassed: true,
        });
        if (!passedSubmission) {
          throw ApiError.badRequest(
            `You must pass all assignments before earning a certificate. Assignment "${assignment.title}" is not yet passed.`
          );
        }
      }
    }

    // 4. Check all published exams for this course are passed
    const exams = await Exam.find({ courseId, isPublished: true });
    if (exams.length > 0) {
      for (const exam of exams) {
        const passedSubmission = await Submission.findOne({
          examId: exam._id,
          studentId,
          type: 'exam',
          isPassed: true,
        });
        if (!passedSubmission) {
          throw ApiError.badRequest(
            `You must pass all exams before earning a certificate. Exam "${exam.title}" is not yet passed.`
          );
        }
      }
    }

    // Get course and student info
    const course = await Course.findById(courseId).populate('creatorId', 'name');
    const student = await User.findById(studentId);

    if (!course || !student) {
      throw ApiError.notFound('Course or student not found');
    }

    // Get best exam score for this course (for grading)
    const bestSubmission = await Submission.findOne({
      studentId,
      courseId,
      type: 'exam',
      isPassed: true,
    }).sort({ score: -1 });

    // Generate certificate ID and QR
    const certificateId = `CERT-${uuidv4().split('-')[0].toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
    const verifyUrl = `${config.clientUrl}/verify/${certificateId}`;
    const qrCodeBuffer = await generateQRBuffer(verifyUrl);

    // Calculate grade
    let grade = 'P'; // Pass
    if (bestSubmission) {
      const pct = bestSubmission.percentage;
      if (pct >= 90) grade = 'A+';
      else if (pct >= 80) grade = 'A';
      else if (pct >= 70) grade = 'B';
      else if (pct >= 60) grade = 'C';
      else grade = 'D';
    }

    // Generate PDF
    const pdfUrl = await this.generatePDF({
      certificateId,
      studentName: student.name,
      courseName: course.title,
      instructorName: course.creatorId.name,
      completionDate: new Date(),
      grade,
      qrCodeBuffer,
    });

    // Save certificate
    const certificate = await Certificate.create({
      studentId,
      courseId,
      certificateId,
      studentName: student.name,
      courseName: course.title,
      instructorName: course.creatorId.name,
      completionDate: new Date(),
      qrCode: verifyUrl,
      pdfUrl,
      grade,
      score: bestSubmission ? bestSubmission.percentage : 0,
    });

    // Try sending email (safely wrapped)
    try {
      await emailService.sendCertificateEmail(student, certificate);
    } catch (err) {
      console.error(`❌ Certificate email failed: ${err.message}`);
    }

    // Create notification
    createNotification(
      studentId,
      'certificate-issued',
      'Certificate Earned! 🎉',
      `Congratulations! You've earned a certificate for completing "${course.title}".`,
      `/certificates/${certificate._id}`
    ).catch(console.error);

    return certificate;
  }

  /**
   * Generate certificate PDF.
   */
  async generatePDF({ certificateId, studentName, courseName, instructorName, completionDate, grade, qrCodeBuffer }) {
    return new Promise((resolve, reject) => {
      const uploadsDir = path.join(__dirname, '../../uploads/certificates');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const filename = `${certificateId}.pdf`;
      const filepath = path.join(uploadsDir, filename);
      const doc = new PDFDocument({ layout: 'landscape', size: 'A4', margin: 50 });

      const stream = fs.createWriteStream(filepath);
      doc.pipe(stream);

      // Border
      doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke('#1a1a2e');
      doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60).stroke('#e94560');

      // Header
      doc.fontSize(16).fillColor('#666').text('EDUPLATFORM', 0, 60, { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(36).fillColor('#1a1a2e').text('Certificate of Completion', 0, 90, { align: 'center' });

      // Decorative line
      doc.moveTo(200, 140).lineTo(doc.page.width - 200, 140).stroke('#e94560');

      // Body
      doc.moveDown(2);
      doc.fontSize(14).fillColor('#444').text('This is to certify that', 0, 170, { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(28).fillColor('#1a1a2e').text(studentName, 0, 200, { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(14).fillColor('#444').text('has successfully completed the course', 0, 245, { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(22).fillColor('#e94560').text(`"${courseName}"`, 0, 275, { align: 'center' });
      doc.moveDown(1);
      doc.fontSize(12).fillColor('#666').text(`Grade: ${grade}`, 0, 320, { align: 'center' });

      // Footer details
      const dateStr = completionDate.toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
      });

      doc.fontSize(11).fillColor('#444');
      doc.text(`Date: ${dateStr}`, 100, doc.page.height - 130);
      doc.text(`Instructor: ${instructorName}`, 100, doc.page.height - 110);
      doc.text(`Certificate ID: ${certificateId}`, 100, doc.page.height - 90);

      // QR Code
      if (qrCodeBuffer) {
        doc.image(qrCodeBuffer, doc.page.width - 180, doc.page.height - 160, { width: 100 });
      }

      doc.end();

      stream.on('finish', () => resolve(`/uploads/certificates/${filename}`));
      stream.on('error', reject);
    });
  }

  /**
   * Verify a certificate by its ID.
   */
  async verifyCertificate(certificateId) {
    const certificate = await Certificate.findOne({ certificateId });

    if (!certificate) {
      return { isValid: false, message: 'Certificate not found' };
    }

    return {
      isValid: certificate.isValid,
      certificate: {
        certificateId: certificate.certificateId,
        studentName: certificate.studentName,
        courseName: certificate.courseName,
        instructorName: certificate.instructorName,
        completionDate: certificate.completionDate,
        grade: certificate.grade,
        type: certificate.type,
      },
    };
  }
}

module.exports = new CertificateService();
