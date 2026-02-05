const mongoose = require('mongoose');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

// Load env
dotenv.config({ path: '.env.local' });

// Define minimal schemas to avoid import issues
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: String,
    email: String,
    role: String
});

const ProjectSchema = new Schema({
    manager: { type: Schema.Types.ObjectId, ref: 'User' },
    clientEmail: String
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Project = mongoose.models.Project || mongoose.model('Project', ProjectSchema);

const generateTestData = async () => {
    if (!process.env.MONGODB_URI) {
        console.error("MONGODB_URI not found");
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB");

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

        const secret = process.env.JWT_SECRET || 'secret';

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
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
        }
    }
};

generateTestData();
