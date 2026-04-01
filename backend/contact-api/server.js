require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Paths to save leads
const jsonDataPath = path.join(__dirname, 'leads.json');
const csvDataPath = path.join(__dirname, 'entries.csv');

// Ensure files exist
if (!fs.existsSync(jsonDataPath)) {
    fs.writeFileSync(jsonDataPath, JSON.stringify([]));
}
if (!fs.existsSync(csvDataPath)) {
    fs.writeFileSync(csvDataPath, 'Name,Phone,LINE,Email,Message,Time,Status\n');
}

/**
 * Helper to append to CSV
 */
const appendToCSV = (data) => {
    const { name, phone, line, email, message, status } = data;
    const time = new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' });
    // Clean message for CSV (remove line breaks)
    const cleanMsg = message.replace(/\s\s+/g, ' ');
    const lineStr = `${name},${phone},${line},${email},${cleanMsg},${time},${status}\n`;
    fs.appendFileSync(csvDataPath, lineStr);
};

app.post('/api/contact', async (req, res) => {
    try {
        const { name, phone, line, email, message, website } = req.body;

        // 1. Honeypot Validation
        if (website && website.length > 0) {
            console.warn('Bot detected via honeypot field');
            return res.status(200).json({ success: true, message: 'Message received.' });
        }

        // 2. Field Validation
        if (!name || !phone || !email) {
            return res.status(400).json({ error: '姓名、電話和 Email 為必填欄位。' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: '請輸入有效的 Email 格式。' });
        }

        // 3. Email Sending (OAuth2)
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: process.env.GMAIL_USER,
                clientId: process.env.GMAIL_CLIENT_ID,
                clientSecret: process.env.GMAIL_CLIENT_SECRET,
                refreshToken: process.env.GMAIL_REFRESH_TOKEN
            }
        });

        const mailOptions = {
            from: `"${name}" <${process.env.SENDER_EMAIL}>`,
            to: process.env.RECEIVER_EMAIL,
            subject: 'PixoLab - Online Inquiry',
            html: `
                <html>
                <p><strong>新的預約諮詢資訊：</strong></p>
                <p>
                    姓名: <b>${name}</b><br/>
                    電話: <a href="tel:${phone}"><b>${phone}</b></a><br/>
                    LINE ID: <b>${line || 'N/A'}</b><br/>
                    Email: <a href="mailto:${email}"><b>${email}</b></a><br/>
                    訊息: <b>${message || 'N/A'}</b>
                </p>
                <p style="color: #666; font-size: 12px; margin-top: 20px;">這是一封自動產生的通知電子郵件，請勿直接回覆。</p>
                </html>
            `
        };

        let emailStatus = 'Success';
        try {
            await transporter.sendMail(mailOptions);
            console.log(`[Email Success] New Lead from ${name}`);
        } catch (mailError) {
            console.error('[Email Error]', mailError);
            emailStatus = 'Failed';
        }

        // 4. Save to Local JSON
        const newLead = {
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            name,
            phone,
            line: line || '',
            email,
            message: message || '',
            emailStatus
        };

        const currentData = JSON.parse(fs.readFileSync(jsonDataPath, 'utf8'));
        currentData.push(newLead);
        fs.writeFileSync(jsonDataPath, JSON.stringify(currentData, null, 2));

        // 5. Save to Local CSV
        appendToCSV({ ...newLead, status: emailStatus });

        // 6. Respond
        if (emailStatus === 'Failed') {
            return res.status(200).json({ success: true, message: 'Message saved, but email failed.' });
        }
        return res.status(200).json({ success: true, message: 'Success' });

    } catch (err) {
        console.error('Server error:', err);
        return res.status(500).json({ error: '伺服器內部錯誤，請稍後再試。' });
    }
});

app.listen(PORT, () => {
    console.log(`PixoLab Contact API running on port ${PORT}`);
});
