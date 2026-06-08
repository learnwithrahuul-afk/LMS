import express from 'express';
import { modulesData, modulesDataHindi, modulesDataKannada } from '../data/modules';

const router = express.Router();

import { Module } from '../models/Module';

import { User } from '../models/User';

// Manual Seed Endpoint
// Manual Seed Endpoint (Syncs DB with Seed Data)
router.post('/seed', async (req, res) => {
    try {
        console.log("Manual seeding/syncing triggered...");

        const operations = modulesData.map(module => ({
            updateOne: {
                filter: { id: module.id },
                update: { $set: module },
                upsert: true
            }
        }));

        const result = await Module.bulkWrite(operations);
        console.log(`Synced modules. Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}, Upserted: ${result.upsertedCount}`);

        res.json({
            message: "Database synced with seed data.",
            details: {
                matched: result.matchedCount,
                modified: result.modifiedCount,
                upserted: result.upsertedCount
            },
            success: true
        });
    } catch (error) {
        console.error("Seeding error:", error);
        res.status(500).json({ message: "Seeding failed", error });
    }
});

// Get all courses (modules)
router.get('/', async (req, res) => {
    const lang = req.query.lang as string;
    const email = req.query.email as string;

    try {
        // Fetch modules from DB
        let allModules = await Module.find({}).sort({ order: 1 });

        // Language Handling (Legacy Static for now, until DB supports Multi-lang)
        if (lang === 'HINDI') {
            const hindiModules = allModules.map(dbMod => {
                const staticMod = modulesDataHindi.find(m => m.id === dbMod.id);
                if (staticMod) return { ...dbMod.toObject(), ...staticMod };
                return dbMod.toObject();
            });
            res.json(hindiModules);
            return;
        } else if (lang === 'KANNADA') {
            const kannadaModules = allModules.map(dbMod => {
                const staticMod = modulesDataKannada.find(m => m.id === dbMod.id);
                if (staticMod) return { ...dbMod.toObject(), ...staticMod };
                return dbMod.toObject();
            });
            res.json(kannadaModules);
            return;
        }

        // Determine Allowed Courses
        let filteredModules = allModules;

        if (req.query.all !== 'true') {
            let allowedCourses: string[] = ['csv-course']; // Default fallback
            if (email) {
                const user = await User.findOne({ email });
                if (user && user.enrolledCourses && user.enrolledCourses.length > 0) {
                    allowedCourses = user.enrolledCourses;
                } else if (user && user.isPaid) {
                    allowedCourses = ['csv-course'];
                }
            }

            // Filter modules based on allowed courses
            filteredModules = allModules.filter((m: any) => {
                const cId = m.courseId || 'csv-course';
                return allowedCourses.includes(cId);
            });
        }

        // Sort by order
        filteredModules.sort((a: any, b: any) => a.order - b.order);

        res.json(filteredModules);
    } catch (error) {
        console.error("Error fetching modules from DB:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Get a specific module by ID
// Get a specific module by ID
router.get('/:id', async (req, res) => {
    const lang = req.query.lang as string;

    try {
        let module = await Module.findOne({ id: req.params.id });

        if (!module) {
            return res.status(404).json({ message: 'Module not found' });
        }

        let moduleObj: any = (module as any).toObject ? (module as any).toObject() : module;

        // Language Handling (Legacy Static for now)
        if (lang === 'HINDI') {
            const staticM = modulesDataHindi.find(m => m.id === req.params.id);
            if (staticM) moduleObj = { ...moduleObj, ...staticM };
        } else if (lang === 'KANNADA') {
            const staticM = modulesDataKannada.find(m => m.id === req.params.id);
            if (staticM) moduleObj = { ...moduleObj, ...staticM };
        }

        res.json(moduleObj);
    } catch (error) {
        console.error("Error fetching module from DB:", error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
