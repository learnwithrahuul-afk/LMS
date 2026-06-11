import express from 'express';
import { sendContactNotification } from '../utils/emailService';

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const { name, email, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ success: false, message: 'All fields are required.' });
        }

        const result = await sendContactNotification(name, email, message);

        if (result.success) {
            res.json({ success: true, message: 'Contact notification sent successfully.' });
        } else {
            console.error("Failed to send contact notification:", result.error);
            res.status(500).json({ success: false, message: 'Failed to send message.' });
        }
    } catch (error) {
        console.error("Error in contact route:", error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

export default router;
