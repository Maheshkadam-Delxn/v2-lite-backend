import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import jwt from 'jsonwebtoken'; // using jsonwebtoken directly as 'jose' is async and might be overkill for this script
import Project from '../models/Project';
import User from '../models/User';
import dbConnect from '../lib/dbConnect';
import '../models/ProjectType'; // Ensure models are registered

dotenv.config({ path: '.env.local' });

const generateTestData = async () => {
    // Manually connect if dbConnect doesn't work in script context or just use it
    if (!process.env.MONGODB_URI) {
        console.error("MONGODB_URI not found");
        process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to DB");

    try {
        // 1. Find a Project with a Manager
        const project = await Project.findOne({ manager: { $exists: true } });

        if (!project) {
            console.log("❌ No projects found in DB.");
            process.exit(1);
        }

        // 2. Find the Manager User
        const user = await User.findById(project.manager);
        if (!user) {
            console.log("❌ Manager user not found.");
            process.exit(1);
        }

        // 3. Generate Token (Simulating the login token)
        // Note: Main app uses 'jose', but for testing socket (which uses jwt/jose), a standard HS256 JWT using jsonwebtoken is easier to generate here and often compatible if configured right.
        // However, the textEncoder logic in main app suggests it expects a specific format.
        // Let's try to grab the SECRET.

        const secret = process.env.JWT_SECRET || 'secret';

        // Creating a simple token
        const token = jwt.sign(
            { _id: user._id, role: user.role, name: user.name },
            secret,
            { expiresIn: '1d' }
        );

        console.log("\n============================================");
        console.log("✅ TEST DATA GENERATED");
        console.log("============================================");
        console.log(`📂 Project ID:  "${project._id}"`);
        console.log(`👤 User (Manager): ${user.name} (${user.role})`);
        console.log(`🔑 Auth Token:`);
        console.log(token);
        console.log("============================================\n");

    } catch (error) {
        console.error(error);
    } finally {
        mongoose.connection.close();
    }
};

generateTestData();
