import mongoose from 'mongoose';

const moduleSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    courseId: { type: String, default: 'csv-course' },
    title: { type: String, required: true },
    sessions: [{
        title: String,
        date: String,
        time: String,
        link: String,
        duration: String,
        isLive: { type: Boolean, default: false },
        content: String,
        videoUrl: String,
        pdfUrl: String,
        code: String,
        output: String,
        mcqs: [{
            question: String,
            options: [String],
            correctAnswer: Number
        }]
    }],
    order: { type: Number, required: true }
});

export const Module = mongoose.model('Module', moduleSchema);
