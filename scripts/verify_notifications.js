const mongoose = require('mongoose');
const fs = require('fs');



// MONGODB_URI from .env.local
const MONGODB_URI = 'mongodb+srv://pratham:16451645@cluster0.zk7z6bv.mongodb.net/?appName=Cluster0';
const BASE_URL = 'http://localhost:3000';
const RANDOM_ID = Math.floor(Math.random() * 10000);
const EMAIL = "zameersailong@gmail.com";
const PASSWORD = "123456789";
const PROJECT_NAME = `Notify Project ${RANDOM_ID}`;
const BUDGET = 1000;

const log = (...args) => {
    const msg = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' ');
    fs.appendFileSync('verify.log', msg + '\n');
    process.stdout.write(msg + '\n');
};
console.log = log;
console.error = log;

async function run() {
    console.log(`Starting Notification Verification for ${EMAIL}...`);

    console.log("0. Connecting to MongoDB...");
    try {
        await mongoose.connect(MONGODB_URI, { dbName: 'constructionApp' });
        console.log("   Connected to DB:", mongoose.connection.name);
    } catch (e) {
        console.error("   ❌ Connection Failed:", e);
        return;
    }

    // 1. Register (Skipped for existing admin)
    console.log("1. Skipping Registration (Using Admin Credentials)...");

    // 2. Verify Email (Skipped for existing admin)
    console.log("2. Skipping Email Verification...");

    // 3. Login
    log("3. Logging in...");
    let res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: EMAIL, password: PASSWORD })
    });
    data = await res.json();
    if (!data.success) {
        console.error("Login failed:", data);
        mongoose.disconnect(); return;
    }

    const cookie = res.headers.get('set-cookie');
    console.log("   All Headers:", Array.from(res.headers.entries()));
    console.log("   Set-Cookie Header:", cookie);

    let token = '';
    if (cookie) {
        const match = cookie.match(/app_session=([^;]+)/);
        if (match) token = match[1];
    }
    console.log("   Extracted Token:", token ? token.substring(0, 20) + "..." : "NONE");

    const userId = data.data?.user?.id || user._id.toString();
    const role = data.data?.user?.role;

    console.log("   Logged in.");
    console.log("   User ID:", userId);
    console.log("   User Role:", role);

    if (!token) {
        console.error("   ❌ NO TOKEN EXTRACTED! Aborting.");
        mongoose.disconnect(); return;
    }

    // 4. Create Project with Budget
    console.log("4. Creating Project...");
    const startDate = new Date();
    const endDate = new Date(Date.now() + 86400000); // Tomorrow

    res = await fetch(`${BASE_URL}/api/projects`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            name: PROJECT_NAME,
            startDate: startDate,
            endDate: endDate,
            description: 'Test Project',
            manager: userId,
            status: 'ongoing',
            budget: BUDGET,
            clientEmail: 'filament325@gmail.com',
            clientName: 'Test Client',
            clientPhone: 1000000000 + RANDOM_ID

        })
    });
    data = await res.json();

    const projectId = data.data?._id;
    if (!projectId) {
        console.error("Project creation failed:", data);
        mongoose.disconnect(); return;
    }
    console.log("   Project Created:", projectId);


    // 5. Test Budget Alert
    console.log("5. Testing Budget Alert...");
    res = await fetch(`${BASE_URL}/api/newTransaction`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
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
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
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



    // 7. Verify Project Stats (Budget & Time)
    log("7. Verifying Project Stats...");
    res = await fetch(`${BASE_URL}/api/projects/${projectId}`, {
        headers: {
            'Content-Type': 'application/json',
            'Cookie': cookie
        }
    });
    data = await res.json();
    const stats = data.data;

    if (stats) {
        log(`   Stats Received:`);
        log(`   - Budget: ${stats.budget}`);
        log(`   - Total Expenses: ${stats.totalExpenses} (Expected: ${BUDGET + 500})`);
        log(`   - Total Duration: ${stats.totalDuration} days`);
        log(`   - Days Elapsed: ${stats.daysElapsed} days`);

        if (stats.totalExpenses === (BUDGET + 500)) {
            log("   ✅ Total Expenses verified.");
        } else {
            console.error("   ❌ Total Expenses mismatch!");
        }

        if (typeof stats.daysElapsed === 'number' && typeof stats.totalDuration === 'number') {
            log("   ✅ Time stats present.");
        } else {
            console.error("   ❌ Time stats missing!");
        }

    } else {
        console.error("   ❌ Failed to fetch project stats");
    }

    mongoose.disconnect();
}

run().catch(err => {
    console.error(err);
    mongoose.disconnect();
});
