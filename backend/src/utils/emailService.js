"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const logger_1 = require("./logger");

class EmailService {
    /**
     * Mock email sender for development
     */
    static async sendEmail({ to, subject, html }) {
        logger_1.logger.info(`[MOCK EMAIL] Sending email to: ${to}`);
        logger_1.logger.info(`[MOCK EMAIL] Subject: ${subject}`);
        logger_1.logger.info(`[MOCK EMAIL] HTML Content: \n${html}`);
        return true;
    }

    static async sendVerificationEmail(to, token) {
        // In a real app, env.CLIENT_URL would be used. Assuming it's http://localhost:5173 for local dev.
        const url = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email/${token}`;
        const html = `
            <h1>Verify your email address</h1>
            <p>Please click the link below to verify your email address:</p>
            <a href="${url}">Verify Email</a>
        `;
        return this.sendEmail({ to, subject: 'Verify your ServiceDesk Pro Account', html });
    }

    static async sendPasswordResetEmail(to, token) {
        const url = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${token}`;
        const html = `
            <h1>Password Reset Request</h1>
            <p>You requested a password reset. Click the link below to set a new password:</p>
            <a href="${url}">Reset Password</a>
            <p>If you didn't request this, you can ignore this email.</p>
        `;
        return this.sendEmail({ to, subject: 'ServiceDesk Pro Password Reset', html });
    }
}
exports.EmailService = EmailService;
