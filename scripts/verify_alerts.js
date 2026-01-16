// scripts/verify_alerts.js
const mongoose = require('mongoose');

// MONGODB_URI from .env.local
const MONGODB_URI = 'mongodb+srv://pratham:16451645@cluster0.zk7z6bv.mongodb.net/?appName=Cluster0';
const BASE_URL = 'http://localhost:3000';
const RANDOM_ID = Math.floor(Math.random() * 10000);
const EMAIL = `alerttest${RANDOM_ID}@example.com`;
const PASSWORD = 'password123';
const PROJECT_NAME = `Alert Project ${RANDOM_ID}`;
const BUDGET = 1000;

async function run() {
    console.log(`Starting Alert Verification...`);

    // 0. Connect to DB for token and notifications
    console.log("0. Connecting to MongoDB...");
    try {
        await mongoose.connect(MONGODB_URI, { dbName: 'constructionApp' });
        console.log("   Connected to DB:", mongoose.connection.name);
    } catch (e) {
        console.error("   ❌ Connection Failed:", e);
        return;
    }

    // 1. Register User
    console.log("1. Registering User...");
    let res = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: 'Alert User',
            email: EMAIL,
            password: PASSWORD,
            role: 'client'
        })
    });
    let data = await res.json();
    if (!data.success && data.message !== 'User already exists') {
        console.error("Register failed:", data);
        mongoose.disconnect(); return;
    }

    // 2. Verify Email (Direct DB Access)
    console.log("2. Verifying Email...");
    await new Promise(r => setTimeout(r, 2000));
    const User = mongoose.connection.db.collection('users');
    const user = await User.findOne({ email: EMAIL });
    if (user && user.emailVerificationToken) {
        await fetch(`${BASE_URL}/api/auth/verify-email?token=${user.emailVerificationToken}`);
    }

    // 3. Login
    console.log("3. Logging in...");
    res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: EMAIL, password: PASSWORD })
    });
    data = await res.json();
    const cookie = res.headers.get('set-cookie');
    const userId = data.data?.user?.id || user._id.toString();

    // 4. Create Project with Budget
    console.log("4. Creating Project...");
    const startDate = new Date();
    const endDate = new Date(Date.now() + 86400000); // Tomorrow
    res = await fetch(`${BASE_URL}/api/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
        body: JSON.stringify({
            name: PROJECT_NAME,
            startDate: startDate,
            endDate: endDate,
            description: 'Test Project',
            manager: userId,
            budget: BUDGET,
            status: 'ongoing'
        })
    });
    data = await res.json();
    const projectId = data.data?._id;
    console.log("   Project Created:", projectId);

    // 5. Test Budget Alert
    console.log("5. Testing Budget Alert...");
    // Create transaction exceeding budget
    res = await fetch(`${BASE_URL}/api/newTransaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
        body: JSON.stringify({
            projectId: projectId,
            type: 'expense',
            amount: BUDGET + 500, // Exceeds budget
            description: 'Budget Buster',
            date: new Date()
        })
    });
    data = await res.json();
    console.log("   Transaction Created:", data.success);

    // Wait for notification processing
    await new Promise(r => setTimeout(r, 2000));

    // Check Notification in DB
    const Notification = mongoose.connection.db.collection('notifications');
    const budgetNotif = await Notification.findOne({
        type: 'alert',
        title: 'Budget Exceeded Alert',
        message: { $regex: PROJECT_NAME }
    });

    if (budgetNotif) {
        console.log("   ✅ Budget Alert Notification Found:", budgetNotif.message);
    } else {
        console.error("   ❌ Budget Alert Notification NOT Found!");
    }

    // 6. Test Time Extension Alert
    console.log("6. Testing Time Extension Alert...");
    const extendedDate = new Date(Date.now() + 172800000); // Day after tomorrow
    res = await fetch(`${BASE_URL}/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
        body: JSON.stringify({
            endDate: extendedDate,
            status: 'ongoing'
        })
    });
    data = await res.json();
    console.log("   Project Updated:", data.success);

    await new Promise(r => setTimeout(r, 2000));

    const timeNotif = await Notification.findOne({
        type: 'alert',
        title: 'Project Timeline Extended',
        message: { $regex: PROJECT_NAME }
    });

    if (timeNotif) {
        console.log("   ✅ Time Extension Alert Notification Found:", timeNotif.message);
    } else {
        console.error("   ❌ Time Extension Alert Notification NOT Found!");
    }

    mongoose.disconnect();
}

run().catch(err => {
    console.error(err);
    mongoose.disconnect();
});
