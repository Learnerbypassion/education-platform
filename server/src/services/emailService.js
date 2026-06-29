const { google } = require('googleapis');
const config = require('../config/env');

class EmailService {
  constructor() {
    this.oauth2Client = null;
  }

  getOAuth2Client() {
    if (!this.oauth2Client) {
      this.oauth2Client = new google.auth.OAuth2(
        config.smtp.clientId,
        config.smtp.clientSecret,
        config.clientUrl
      );
      this.oauth2Client.setCredentials({
        refresh_token: config.smtp.refreshToken,
      });
    }
    return this.oauth2Client;
  }

  async sendEmail({ to, subject, html }) {
    try {
      const auth = this.getOAuth2Client();
      const gmail = google.gmail({ version: 'v1', auth });

      // Format MIME message
      const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
      const messageParts = [
        `From: "${config.smtp.fromName}" <${config.smtp.user}>`,
        `To: ${to}`,
        'Content-Type: text/html; charset=utf-8',
        'MIME-Version: 1.0',
        `Subject: ${utf8Subject}`,
        '',
        html,
      ];
      const message = messageParts.join('\r\n');

      // Base64url encode the message body
      const encodedMessage = Buffer.from(message)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedMessage,
        },
      });
      console.log(`📧 Email sent to ${to} using Google Gmail API`);
    } catch (error) {
      console.error(`❌ Google Gmail API error: ${error.message}`);
    }
  }

  async sendWelcomeEmail(user) {
    await this.sendEmail({
      to: user.email,
      subject: 'Welcome to EduPlatform! 🎓',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1a1a2e;">Welcome, ${user.name}!</h1>
          <p>Thank you for joining EduPlatform. You're now part of a community of learners and educators.</p>
          <p>Start exploring courses and begin your learning journey today.</p>
          <a href="${config.clientUrl}" style="display: inline-block; padding: 12px 24px; background: #e94560; color: #fff; text-decoration: none; border-radius: 8px;">Explore Courses</a>
        </div>
      `,
    });
  }

  async sendPasswordResetEmail(user, resetToken) {
    const resetUrl = `${config.clientUrl}/reset-password?token=${resetToken}`;
    await this.sendEmail({
      to: user.email,
      subject: 'Password Reset Request - EduPlatform',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1a1a2e;">Password Reset</h1>
          <p>You requested a password reset. Click the button below to create a new password.</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: #e94560; color: #fff; text-decoration: none; border-radius: 8px;">Reset Password</a>
          <p style="color: #999; margin-top: 20px;">This link expires in 30 minutes. If you didn't request this, please ignore this email.</p>
        </div>
      `,
    });
  }

  async sendEnrollmentEmail(user, course) {
    await this.sendEmail({
      to: user.email,
      subject: `Enrolled in ${course.title} - EduPlatform`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1a1a2e;">Enrollment Confirmed!</h1>
          <p>You've been enrolled in <strong>${course.title}</strong>.</p>
          <a href="${config.clientUrl}/courses/${course._id}/learn" style="display: inline-block; padding: 12px 24px; background: #e94560; color: #fff; text-decoration: none; border-radius: 8px;">Start Learning</a>
        </div>
      `,
    });
  }

  async sendCertificateEmail(user, certificate) {
    await this.sendEmail({
      to: user.email,
      subject: `Certificate Earned! - ${certificate.courseName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1a1a2e;">🎉 Congratulations, ${user.name}!</h1>
          <p>You've earned a certificate for completing <strong>${certificate.courseName}</strong>.</p>
          <p>Certificate ID: <strong>${certificate.certificateId}</strong></p>
          <a href="${config.clientUrl}/certificates/${certificate._id}" style="display: inline-block; padding: 12px 24px; background: #e94560; color: #fff; text-decoration: none; border-radius: 8px;">View Certificate</a>
        </div>
      `,
    });
  }
}

module.exports = new EmailService();
