const mongoose = require('mongoose');
const fs = require('fs');

const BASE_URL = 'http://localhost:3000';

// Credentials
const ADMIN_EMAIL = "zameersailong@gmail.com";
const ADMIN_PASS = "123456789";

const CLIENT_EMAIL = "filament325@gmail.com";
const CLIENT_PASS = "123456789";

const log = (...args) => {
    const msg = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' ');
    console.log(msg);
};

async function login(email, password) {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!data.success) throw new Error(`Login failed for ${email}: ${data.message || JSON.stringify(data)}`);

    // Extract Token Preference: Body > Header > Cookie
    let token = data.token;
    const cookieHeader = res.headers.get('set-cookie');
    if (!token && cookieHeader) {
        const match = cookieHeader.match(/app_session=([^;]+)/);
        if (match) token = match[1];
    }

    const headers = { 'Content-Type': 'application/json' };
    if (cookieHeader) headers['Cookie'] = cookieHeader;
    if (token) headers['Authorization'] = `Bearer ${token}`;

    return { headers, userId: data.data?.user?.id || data.user?.id, role: data.data?.user?.role || data.user?.role };
}

async function run() {
    log("🚀 Starting Snag Client Verification...");

    try {
        // 1. Admin Login
        log("👮 Logging in as Admin...");
        const adminSession = await login(ADMIN_EMAIL, ADMIN_PASS);
        log(`   Admin: ${adminSession.userId} (${adminSession.role})`);

        // 2. Find or Create Project
        let projectId;

        // Try Finding Existing Project for Client
        log("🔎 Checking for existing project for client...");
        const listRes = await fetch(`${BASE_URL}/api/projects`, { headers: adminSession.headers });
        const listData = await listRes.json();
        const existingProject = listData.data?.find(p => p.clientEmail === CLIENT_EMAIL);

        if (existingProject) {
            projectId = existingProject._id;
            log(`   ✅ Found Existing Project: ${projectId}`);
        } else {
            // Create New
            log("   Creating New Project...");
            const ptRes = await fetch(`${BASE_URL}/api/project-types`, { headers: adminSession.headers });
            const ptData = await ptRes.json();
            const projectTypeId = ptData.data[0]._id;

            const projRes = await fetch(`${BASE_URL}/api/projects`, {
                method: 'POST',
                headers: adminSession.headers,
                body: JSON.stringify({
                    name: `Client Snag Test ${Math.floor(Math.random() * 1000)}`,
                    clientName: "Test Client",
                    clientEmail: CLIENT_EMAIL,
                    clientPhone: 1234567890,
                    status: "ongoing",
                    budget: 10000,
                    projectType: projectTypeId
                })
            });
            const projData = await projRes.json();
            if (!projData.success) throw new Error(`Project Creation Failed: ${projData.message}`);
            projectId = projData.data._id;
            log(`   ✅ Project Created: ${projectId}`);
        }

        // 3. Client Login
        log("👤 Logging in as Client...");
        const clientSession = await login(CLIENT_EMAIL, CLIENT_PASS);
        log(`   Client: ${clientSession.userId} (${clientSession.role})`);

        // 4. Client Creates Snag
        log("📝 Client Reporting Snag...");
        const snagRes = await fetch(`${BASE_URL}/api/snags`, {
            method: 'POST',
            headers: clientSession.headers,
            body: JSON.stringify({
                projectId: projectId,
                title: "Client Reported Issue",
                description: "Testing client permissions",
                category: "other",
                location: "Test Location",
                severity: "low"
            })
        });
        const snagData = await snagRes.json();
        if (snagData.success) {
            log(`   ✅ Client Snag Created: ${snagData.data._id}`);
        } else {
            log("   ❌ Client Snag Failed:", snagData);
            return;
        }
        const snagId = snagData.data._id;

        // 5. Client Tries to Verify (Should Fail)
        log("🚫 Client Trying to VERIFY (Expect Failure)...");

        // Admin assigns
        await fetch(`${BASE_URL}/api/snags/${snagId}`, {
            method: 'PATCH',
            headers: adminSession.headers,
            body: JSON.stringify({ status: "assigned", assignedTo: adminSession.userId })
        });
        // Admin fixes
        await fetch(`${BASE_URL}/api/snags/${snagId}`, {
            method: 'PATCH',
            headers: adminSession.headers,
            body: JSON.stringify({ status: "fixed", resolutionPhotos: ["valid.jpg"] })
        });

        // Now Client tries verify
        const verifyRes = await fetch(`${BASE_URL}/api/snags/${snagId}`, {
            method: 'PATCH',
            headers: clientSession.headers,
            body: JSON.stringify({ status: "verified" })
        });
        const verifyData = await verifyRes.json();

        if (!verifyData.success) {
            log(`   ✅ Client Verify Blocked correctly: ${verifyData.message}`);
        } else {
            log("   ❌ Client Verify SUCCEEDED (Should have failed!). Response:", verifyData);
        }

    } catch (e) {
        log("❌ Error:", e.message);
    }
}

run();
