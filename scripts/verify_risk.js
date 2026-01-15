// Using global fetch (Node 18+)
const mongoose = require('mongoose');

// MONGODB_URI from .env.local
const MONGODB_URI = 'mongodb+srv://pratham:16451645@cluster0.zk7z6bv.mongodb.net/?appName=Cluster0';
const BASE_URL = 'http://localhost:3000';
const RANDOM_ID = Math.floor(Math.random() * 10000);
const EMAIL = `testuser${RANDOM_ID}@example.com`;
const PASSWORD = 'password123';
const PROJECT_NAME = `Test Project ${RANDOM_ID}`;

// Minimal User Schema for finding token
const UserSchema = new mongoose.Schema({
    email: String,
    emailVerificationToken: String,
});
const User = mongoose.model('User', UserSchema);

async function run() {
    console.log(`Starting Verification for ${EMAIL}...`);

    // 0. Connect to DB
    console.log("0. Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI, { dbName: 'constructionApp' });
    console.log("   Connected to DB:", mongoose.connection.name);

    // 1. Register
    console.log("1. Registering User...");
    // We expect this to succeed but NOT return a token
    let res = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: 'Test Reference User',
            email: EMAIL,
            password: PASSWORD,
            role: 'client'
        })
    });
    let data = await res.json();
    if (!data.success) {
        console.error("Register failed:", data);
        mongoose.disconnect();
        return;
    }
    console.log("   Registered via API.");

    // 2. Verify Email (Direct DB Access)
    console.log("2. Fetching Verification Token from DB...");

    // Wait for DB propagation
    await new Promise(r => setTimeout(r, 2000));

    const user = await User.findOne({ email: EMAIL });

    if (!user) {
        console.error("   User not found in DB.");
        mongoose.disconnect();
        return;
    }

    if (!user.emailVerificationToken) {
        console.error("   User found but no token:", user);
        mongoose.disconnect();
        return;
    }

    const token = user.emailVerificationToken;
    console.log("   Token found:", token);

    console.log("   Verifying Email via API...");
    res = await fetch(`${BASE_URL}/api/auth/verify-email?token=${token}`);
    if (res.status === 200) {
        console.log("   Email Verified.");
    } else {
        console.error("   Email Verification Failed:", res.status);
        mongoose.disconnect();
        return;
    }

    // 3. Login
    console.log("3. Logging in...");
    res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: EMAIL, password: PASSWORD })
    });
    data = await res.json();
    if (!data.success) {
        console.error("Login failed:", data);
        mongoose.disconnect();
        return;
    }
    const cookie = res.headers.get('set-cookie');
    console.log("   Logged in. Cookie obtained.");

    // 4. Create Project
    console.log("4. Creating Project...");
    res = await fetch(`${BASE_URL}/api/projects`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': cookie
        },
        body: JSON.stringify({
            name: PROJECT_NAME,
            startDate: new Date(),
            endDate: new Date(Date.now() + 86400000),
            description: 'Test Project',
            manager: data.data.user.id,
            status: 'ongoing'
        })
    });
    data = await res.json();

    const projectId = data.data?._id;
    if (!projectId) {
        console.error("Project creation failed:", data);
        mongoose.disconnect();
        return;
    }
    console.log("   Project Created:", projectId);


    // 5. Create Risk
    console.log("5. Creating Risk...");
    const riskTitle = "Test Risk 1";
    res = await fetch(`${BASE_URL}/api/risks`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': cookie
        },
        body: JSON.stringify({
            projectId: projectId,
            title: riskTitle,
            category: 'Safety',
            severity: 'High',
            likelihood: 4,
            impact: 5,
            assignedTo: data.data.user.id
        })
    });
    data = await res.json();
    console.log("   Create Risk Response:", JSON.stringify(data, null, 2));
    const riskId = data.data?._id;

    if (data.data?.score !== 20) {
        console.error("   ❌ Score calculation failed. Expected 20, got", data.data?.score);
    } else {
        console.log("   ✅ Score calculated correctly (20).");
    }

    // 6. Fetch Risks
    console.log(`6. Fetching Risks for Project ${projectId}...`);
    res = await fetch(`${BASE_URL}/api/risks/project/${projectId}`, {
        headers: { 'Cookie': cookie }
    });
    data = await res.json();
    if (data.data && data.data.length > 0) {
        console.log("   ✅ Risks fetched successfully.");
    } else {
        console.error("   ❌ No risks found.");
    }

    // 7. Update Risk
    console.log(`7. Updating Risk ${riskId}...`);
    res = await fetch(`${BASE_URL}/api/risks/${riskId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': cookie
        },
        body: JSON.stringify({
            status: 'Mitigating',
            likelihood: 3 // Score should update to 3*5 = 15
        })
    });
    data = await res.json();
    if (data.data?.status === 'Mitigating' && data.data?.score === 15) {
        console.log("   ✅ Risk updated successfully.");
    } else {
        console.error("   ❌ Risk update failed:", data);
    }

    // 8. Delete Risk
    console.log(`8. Deleting Risk ${riskId}...`);
    res = await fetch(`${BASE_URL}/api/risks/${riskId}`, {
        method: 'DELETE',
        headers: { 'Cookie': cookie }
    });
    data = await res.json();
    if (data.success) {
        console.log("   ✅ Risk deleted successfully.");
    } else {
        console.error("   ❌ Risk deletion failed:", data);
    }

    mongoose.disconnect();
}

run().catch(err => {
    console.error(err);
    mongoose.disconnect();
});
