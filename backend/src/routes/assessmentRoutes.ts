import express from 'express';
import { User } from '../models/User';
import { Module } from '../models/Module';
import { csvAssessmentQuestions } from '../data/csvAssessmentQuestions';

const router = express.Router();

// Generate Assessment Questions
router.get('/generate', async (req, res) => {
    try {
        const courseId = (req.query.courseId as string) || 'csv-course';
        console.log(`Generating assessment questions for course: ${courseId}...`);

        // If CSV course (or default), serve the curated 15 CSV MCQs directly (no LLM required)
        if (courseId === 'csv-course' || !courseId) {
            const clientQuestions = csvAssessmentQuestions.map(q => ({
                id: q.id,
                question: q.question,
                options: q.options
            }));
            return res.json(clientQuestions);
        }

        // For other courses, if GROQ_API_KEY is available, use LLM
        if (process.env.GROQ_API_KEY) {
            try {
                const Groq = require('groq-sdk');
                const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
                const query = { courseId };
                const modules = await Module.find(query).limit(5);
                const topics = modules.map(m => m.title).join(", ");

                const subject = `the course "${courseId.toString().replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}" covering: ${topics}`;

                const prompt = `
                    You are an expert instructor. Create a final assessment for ${subject}.
                    
                    Generate exactly 10 multiple-choice questions.
                    Verify that your output is a valid JSON array of objects.
                    Each object must have:
                    - "id": number (1-10)
                    - "question": string
                    - "options": array of 4 strings
                    
                    Do NOT include the answer key in this output. I want the student to answer them first.
                    Ensure the JSON is raw and not wrapped in markdown code blocks.
                `;

                const completion = await groq.chat.completions.create({
                    messages: [{ role: "user", content: prompt }],
                    model: "llama-3.3-70b-versatile",
                    temperature: 0.7,
                });

                let content = completion.choices[0]?.message?.content || "[]";
                content = content.replace(/```json/g, '').replace(/```/g, '').trim();
                const questions = JSON.parse(content);
                return res.json(questions);
            } catch (llmError) {
                console.warn("Groq generation failed, falling back to course module MCQs:", llmError);
            }
        }

        // Fallback for other courses: extract MCQs from course modules in DB or seed
        const courseModules = await Module.find({ courseId });
        const gatheredMcqs: any[] = [];
        for (const m of courseModules) {
            const anyM = m as any;
            if (anyM.mcqs && Array.isArray(anyM.mcqs)) {
                gatheredMcqs.push(...anyM.mcqs);
            }
            if (anyM.sessions && Array.isArray(anyM.sessions)) {
                for (const s of anyM.sessions) {
                    if (s.mcqs && Array.isArray(s.mcqs)) {
                        gatheredMcqs.push(...s.mcqs);
                    }
                }
            }
        }

        if (gatheredMcqs.length > 0) {
            // Select up to 15 questions
            const selected = gatheredMcqs.slice(0, 15).map((q, idx) => ({
                id: idx + 1,
                question: q.question,
                options: q.options
            }));
            return res.json(selected);
        }

        // Default fallback to CSV questions if nothing found
        const clientQuestions = csvAssessmentQuestions.map(q => ({
            id: q.id,
            question: q.question,
            options: q.options
        }));
        return res.json(clientQuestions);

    } catch (error) {
        console.error("Error generating assessment:", error);
        res.status(500).json({ message: "Failed to generate assessment" });
    }
});

// Submit and Grade Assessment
router.post('/submit', async (req, res) => {
    try {
        const { email, questions, answers, courseId } = req.body;
        // answers: { questionId: number, selectedOption: string }[]

        if (!email || !questions || !answers) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const effectiveCourseId = courseId || 'csv-course';
        console.log(`Grading assessment for ${email} in course ${effectiveCourseId}...`);

        let score = 0;
        let passed = false;
        let feedback = '';

        // Deterministic grading for CSV course (no LLM required)
        if (effectiveCourseId === 'csv-course') {
            let correctCount = 0;
            const totalQuestions = questions.length || csvAssessmentQuestions.length;

            questions.forEach((q: any) => {
                // Find matching user answer
                const studentAns = answers.find((a: any) => a.questionId === q.id || a.questionId === parseInt(q.id));
                // Find reference question in our 15-question bank
                const refQuestion = csvAssessmentQuestions.find(item => item.id === q.id || item.question.trim().toLowerCase() === q.question.trim().toLowerCase());

                if (studentAns && refQuestion) {
                    const correctOptionText = refQuestion.options[refQuestion.correctAnswer];
                    if (studentAns.selectedOption && correctOptionText && studentAns.selectedOption.trim().toLowerCase() === correctOptionText.trim().toLowerCase()) {
                        correctCount++;
                    }
                }
            });

            score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
            passed = score >= 85;

            if (passed) {
                feedback = `Outstanding work! You scored ${score}% (${correctCount}/${totalQuestions} correct) and successfully passed the Computerized System Validation (CSV) final assessment. Your official certificate is unlocked and ready to view.`;
            } else {
                feedback = `You scored ${score}% (${correctCount}/${totalQuestions} correct). A minimum score of 85% is required to pass and unlock your certificate. Please review the course modules and retry the assessment.`;
            }

        } else if (process.env.GROQ_API_KEY) {
            // LLM grading for other courses if key is available
            try {
                const Groq = require('groq-sdk');
                const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
                const prompt = `
                    You are a strict automated grader.
                    
                    Here are multiple-choice questions and the student's selected answers.
                    
                    Questions: ${JSON.stringify(questions)}
                    Student Answers: ${JSON.stringify(answers)}
                    
                    Task:
                    1. Determine the correct answer for each question based on your expert knowledge.
                    2. Compare the student's answer to the correct answer.
                    3. Calculate the final percentage score (0-100).
                    
                    Return ONLY a JSON object with this structure:
                    {
                        "score": number,
                        "passed": boolean,
                        "feedback": "string summary of performance"
                    }
                    Do not provide any other text.
                `;

                const completion = await groq.chat.completions.create({
                    messages: [{ role: "user", content: prompt }],
                    model: "llama-3.3-70b-versatile",
                    temperature: 0,
                });

                let content = completion.choices[0]?.message?.content || "{}";
                content = content.replace(/```json/g, '').replace(/```/g, '').trim();
                const result = JSON.parse(content);
                score = typeof result.score === 'number' ? result.score : 0;
                passed = score >= 85;
                feedback = result.feedback || (passed ? "Congratulations! You passed the assessment." : "Score below 85%. Please review and try again.");
            } catch (llmGradeError) {
                console.warn("Groq grading failed, calculating default score:", llmGradeError);
                score = 0;
                passed = false;
                feedback = "Unable to evaluate via AI. Please contact support.";
            }
        } else {
            // Fallback grading if no LLM for other courses
            let correctCount = 0;
            const totalQuestions = questions.length;
            questions.forEach((q: any) => {
                const studentAns = answers.find((a: any) => a.questionId === q.id || a.questionId === parseInt(q.id));
                const refQuestion = csvAssessmentQuestions.find(item => item.id === q.id || item.question.trim().toLowerCase() === q.question.trim().toLowerCase());
                if (studentAns && refQuestion) {
                    const correctOptionText = refQuestion.options[refQuestion.correctAnswer];
                    if (studentAns.selectedOption && correctOptionText && studentAns.selectedOption.trim().toLowerCase() === correctOptionText.trim().toLowerCase()) {
                        correctCount++;
                    }
                }
            });
            score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
            passed = score >= 85;
            feedback = passed 
                ? `Congratulations! You scored ${score}% and passed the assessment.` 
                : `You scored ${score}%. Score 85% or higher is required to pass. Please try again.`;
        }

        const result = {
            score,
            passed,
            feedback
        };

        // Update User Model (Case-insensitive email match)
        const user = await User.findOne({ 
            email: { $regex: new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } 
        });

        if (user) {
            const anyUser = user as any;
            if (!anyUser.courseAssessments) anyUser.courseAssessments = [];

            const existingIndex = anyUser.courseAssessments.findIndex((a: any) => a.courseId === effectiveCourseId);
            const attempts = existingIndex !== -1 ? (anyUser.courseAssessments[existingIndex].attempts + 1) : 1;

            if (existingIndex !== -1) {
                anyUser.courseAssessments[existingIndex].score = result.score;
                anyUser.courseAssessments[existingIndex].passed = result.passed;
                anyUser.courseAssessments[existingIndex].attempts = attempts;
                anyUser.courseAssessments[existingIndex].date = new Date();
            } else {
                anyUser.courseAssessments.push({
                    courseId: effectiveCourseId,
                    score: result.score,
                    passed: result.passed,
                    attempts: attempts,
                    date: new Date()
                });
            }

            // Update legacy field for backward compatibility
            user.finalAssessment = {
                score: result.score,
                passed: result.passed,
                attempts: (user.finalAssessment?.attempts || 0) + 1
            };

            await user.save();
        }

        res.json(result);

    } catch (error) {
        console.error("Error grading assessment:", error);
        res.status(500).json({ message: "Failed to grade assessment" });
    }
});

export default router;
