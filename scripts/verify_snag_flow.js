const mongoose = require('mongoose');
const fs = require('fs');

const BASE_URL = 'http://localhost:3000';
const EMAIL = "zameersailong@gmail.com"; // Admin/Manager
const PASSWORD = "123456789";

const log = (...args) => {
    const msg = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' ');
    console.log(msg);
};

async function run() {
    log("🚀 Starting Snag Verification Flow (No Milestones)...");

    // 1. Login
    log("🔐 Logging in...");
    let res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: EMAIL, password: PASSWORD })
    });
    let data = await res.json();
    if (!data.success) {
        log("❌ Login failed:", data);
        return;
    }

    const cookieHeader = res.headers.get('set-cookie');
    let token = data.token;
    if (!token && cookieHeader) {
        const match = cookieHeader.match(/app_session=([^;]+)/);
        if (match) token = match[1];
    }

    const userId = data.data?.user?.id || data.user?.id;
    const userRole = data.data?.user?.role || data.user?.role;
    log(`✅ Logged in as ${userRole} (${userId})`);

    const headers = {
        'Content-Type': 'application/json',
    };
    if (cookieHeader) headers['Cookie'] = cookieHeader;
    if (token) headers['Authorization'] = `Bearer ${token}`;

    // 2. Fetch Project Types
    log("🔎 Fetching Project Types...");
    res = await fetch(`${BASE_URL}/api/project-types`, { headers });
    data = await res.json();
    if (!data.success || !data.data || data.data.length === 0) {
        log("❌ No Project Types found. Cannot create project.");
        return;
    }
    const projectTypeId = data.data[0]._id;

    // 3. Create Project
    log("🏗️ Creating Test Project...");
    const projectName = `Snag Test ${Math.floor(Math.random() * 1000)}`;
    res = await fetch(`${BASE_URL}/api/projects`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            name: projectName,
            clientName: "Test Client",
            clientEmail: `client${Math.floor(Math.random() * 1000)}@test.com`,
            clientPhone: 1234567890,
            status: "ongoing",
            budget: 10000,
            projectType: projectTypeId
        })
    });
    data = await res.json();
    if (!data.success) {
        log("❌ Project creation failed:", data);
        return;
    }
    const projectId = data.data._id;
    log(`✅ Project Created: ${projectId}`);

    // 4. Create Snag
    log("🚩 Creating Snag...");
    res = await fetch(`${BASE_URL}/api/snags`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            projectId: projectId,
            title: "General Snag",
            description: "Testing snag without milestone",
            category: "civil",
            location: "Site A",
            severity: "critical",
            photos: ["http://example.com/snag.jpg"]
        })
    });
    data = await res.json();
    if (!data.success) {
        log("❌ Snag Creation Failed:", data);
        return;
    }
    const snagId = data.data._id;
    log(`✅ Snag Created: ${snagId} (Status: ${data.data.status})`);

    // 5. Fix the Snag (Lifecycle)
    log("🔄 Advancing Snag Lifecycle...");

    // a. Assign
    res = await fetch(`${BASE_URL}/api/snags/${snagId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: "assigned", assignedTo: userId })
    });
    log("   Assigned:", (await res.json()).success);

    // b. Fix
    res = await fetch(`${BASE_URL}/api/snags/${snagId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: "fixed", resolutionPhotos: ["http://fixed.jpg"] })
    });
    log("   Fixed:", (await res.json()).success);

    // c. Verify
    res = await fetch(`${BASE_URL}/api/snags/${snagId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: "verified" })
    });
    log("   Verified:", (await res.json()).success);

    // d. Close
    res = await fetch(`${BASE_URL}/api/snags/${snagId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: "closed" })
    });
    data = await res.json();
    log("   Closed:", data.success);

    if (data.success) {
        log("✅ Snag Lifecycle verified successfully without Milestone integration.");
    } else {
        log("❌ Failed to close snag:", data);
    }
}

run().catch(console.error);
