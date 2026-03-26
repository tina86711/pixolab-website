const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Path to save leads
const dataFilePath = path.join(__dirname, 'leads.json');

// Ensure data file exists
if (!fs.existsSync(dataFilePath)) {
    fs.writeFileSync(dataFilePath, JSON.stringify([]));
}

app.post('/api/contact', async (req, res) => {
    try {
        const { name, company, email, phone, service, message, website } = req.body;

        // 1. Honeypot Validation
        if (website && website.length > 0) {
            // Bot detected
            console.warn('Bot detected via honeypot field');
            return res.status(200).json({ success: true, message: 'Message received.' }); // Fake success to bot
        }

        // 2. Field Validation
        if (!name || !company || !email) {
            return res.status(400).json({ error: '姓名、公司名稱和 Email 為必填欄位。' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: '請輸入有效的 Email 格式。' });
        }

        // 3. Save to Local File
        const newLead = {
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            name,
            company,
            email,
            phone: phone || '',
            service: service || '',
            message: message || ''
        };

        const currentData = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
        currentData.push(newLead);
        fs.writeFileSync(dataFilePath, JSON.stringify(currentData, null, 2));

        // 4. Send Notification Email (Dummy/Placeholder for Vultr production)
        // require('nodemailer') configuration goes here...
        console.log(`[Email Mock] Sending notification to Ivan: New Lead from ${name} (${company})`);

        // 5. Respond Success
        return res.status(200).json({ success: true, message: 'Success' });

    } catch (err) {
        console.error('Server error:', err);
        return res.status(500).json({ error: '伺服器內部錯誤，請稍後再試。' });
    }
});

app.listen(PORT, () => {
    console.log(`AEGIS Contact API running on port ${PORT}`);
});
