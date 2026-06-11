import { Resend } from 'resend';

// Use environment variables for API key and Sender Email
const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Learn With Rahuul <info@learnwithrahuul.com>';

// Base HTML template matching the website theme
const baseHtmlTemplate = (title: string, content: string) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>${title}</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
        .header { background-color: #0A2A66; padding: 20px; text-align: center; border-bottom: 4px solid #0FA958; }
        .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 1px; }
        .content { padding: 30px; color: #333333; line-height: 1.6; }
        .content h2 { color: #0A2A66; font-size: 20px; margin-top: 0; }
        .button { display: inline-block; padding: 12px 24px; background-color: #0FA958; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px; text-align: center; }
        .footer { background-color: #f9fafb; padding: 15px; text-align: center; color: #777777; font-size: 14px; border-top: 1px solid #eeeeee; }
        .credentials { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 15px; margin: 20px 0; }
        .credentials p { margin: 5px 0; font-family: monospace; font-size: 15px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://lms-frontend-blue-mu.vercel.app/Logo.jpeg" alt="Learn With Rahuul Logo" style="height: 50px; margin-bottom: 10px; border-radius: 4px;" onerror="this.style.display='none'" />
            <h1>Learn With Rahuul</h1>
        </div>
        <div class="content">
            ${content}
        </div>
        <div class="footer">
            <p style="margin: 0 0 10px 0; color: #666; font-size: 13px;">This is an automated professional email, please do not reply directly to this address. If you have any queries, contact us at <a href="mailto:learnwithrahuul@gmail.com" style="color: #0A2A66; text-decoration: none; font-weight: bold;">learnwithrahuul@gmail.com</a>.</p>
            &copy; ${new Date().getFullYear()} Learn With Rahuul. All rights reserved.
        </div>
    </div>
</body>
</html>
`;

export const sendWelcomeEmail = async (toEmail: string, studentName: string, password?: string, loginLink?: string) => {
    const title = "Welcome to Learn With Rahuul!";
    const content = `
        <h2>Hello ${studentName},</h2>
        <p>Your account has been successfully created by the administrator. Welcome aboard!</p>
        <p>You can now log in to your dashboard to access your courses and learning materials.</p>
        
        ${password ? `
        <div class="credentials">
            <strong>Your Login Credentials:</strong>
            <p>Email: ${toEmail}</p>
            <p>Password: ${password}</p>
        </div>
        <p><em>Please change your password after logging in for the first time.</em></p>
        ` : ''}
        
        <div style="text-align: center;">
            <a href="${loginLink || 'https://learnwithrahuul.com'}" class="button">Access Dashboard</a>
        </div>
    `;

    try {
        const data = await resend.emails.send({
            from: FROM_EMAIL,
            to: [toEmail],
            subject: title,
            html: baseHtmlTemplate(title, content)
        });
        console.log("Welcome Email sent:", data);
        return { success: true, data };
    } catch (error) {
        console.error("Failed to send Welcome Email:", error);
        return { success: false, error };
    }
};

export const sendCertificateEmail = async (toEmail: string, studentName: string, courseName: string, certificateId: string, downloadLink: string, verificationLink: string) => {
    const title = "Congratulations on Your Course Completion!";
    const content = `
        <h2>Congratulations ${studentName}!</h2>
        <p>You have successfully completed the course <strong>"${courseName}"</strong>.</p>
        <p>Your certificate has been generated and verified. This is a testament to your hard work and dedication.</p>
        
        <div class="credentials">
            <strong>Certificate Details:</strong>
            <p>Certificate ID: ${certificateId}</p>
        </div>

        <div style="text-align: center;">
            <a href="${downloadLink}" class="button">View & Download Certificate</a>
        </div>

        <p style="margin-top: 30px; font-size: 14px; color: #555;">
            <strong>Verify Authenticity:</strong><br>
            You can verify this certificate at any time by visiting <a href="${verificationLink}" style="color: #0A2A66;">${verificationLink}</a> and entering your Certificate ID.
        </p>
    `;

    try {
        const data = await resend.emails.send({
            from: FROM_EMAIL,
            to: [toEmail],
            subject: title,
            html: baseHtmlTemplate(title, content)
        });
        console.log("Certificate Email sent:", data);
        return { success: true, data };
    } catch (error) {
        console.error("Failed to send Certificate Email:", error);
        return { success: false, error };
    }
};

// Kept for backward compatibility if used elsewhere
export const sendEmail = async (toEmail: string, message: string, attachmentData?: string, attachmentName: string = 'certificate.png', templateId?: string, extraParams?: any) => {
    try {
        const data = await resend.emails.send({
            from: FROM_EMAIL,
            to: [toEmail],
            subject: "Notification from Learn With Rahuul",
            html: baseHtmlTemplate("Notification", `<p>${message.replace(/\n/g, '<br/>')}</p>`)
        });
        return { success: true, data };
    } catch (error) {
        console.error("Failed to send basic Email:", error);
        return { success: false, error };
    }
};

export const sendContactNotification = async (name: string, email: string, message: string) => {
    const title = "New Contact Form Submission";
    const content = `
        <h2>New Inquiry Received</h2>
        <p><strong>From:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <div class="credentials">
            <strong>Message:</strong>
            <p>${message.replace(/\n/g, '<br/>')}</p>
        </div>
    `;

    try {
        const data = await resend.emails.send({
            from: FROM_EMAIL,
            to: ['learnwithrahuul@gmail.com'], // Send TO the admin email
            subject: `New Inquiry from ${name}`,
            html: baseHtmlTemplate(title, content)
        });
        console.log("Contact Notification Email sent:", data);
        return { success: true, data };
    } catch (error) {
        console.error("Failed to send Contact Notification Email:", error);
        return { success: false, error };
    }
};
