console.log("Initializing server...");
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import userRoutes from './routes/userRoutes';


const app = express();
const allowedOrigins = [
    'https://lms-frontend-blue-mu.vercel.app',
    'http://localhost:5173',
    'https://lms-frontend-rouge-eta.vercel.app',
    'https://lms-h89v.vercel.app',
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1 && !allowedOrigins.includes('*')) {
            // If explicit origins are set and match fails, try lenient mode if * is meant to be allowed
            // checking if user just wants simple access:
            return callback(null, true); // Temporarily allow all for debugging
        }
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/dashboard';

const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
        console.log('MongoDB connected. Database Name:', mongoose.connection.name);
    } catch (err) {
        console.error('MongoDB connection error:', err);
    }
};
// connectDB();

import courseRoutes from './routes/courseRoutes';
import chatRoutes from './routes/chatRoutes';

import adminRoutes from './routes/adminRoutes';
import paymentRoutes from './routes/paymentRoutes';
import certificateRoutes from './routes/certificateRoutes';
import instructorRoutes from './routes/instructorRoutes';

app.get('/', (req, res) => {
    res.send('Server is running');
});

app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/certificate', certificateRoutes);
import assessmentRoutes from './routes/assessmentRoutes';
app.use('/api/assessment', assessmentRoutes);

app.use('/api/instructor', instructorRoutes);




if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
