const BASE_URL = 'http://localhost:3000';
const MANAGER_EMAIL = "zameersailong@gmail.com";
const PASSWORD = "123456789";

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
    if (!data.success) throw new Error(`Login failed: ${data.message}`);

    const cookieHeader = res.headers.get('set-cookie');
    let token = data.token;
    if (!token && cookieHeader) {
        const match = cookieHeader.match(/app_session=([^;]+)/);
        if (match) token = match[1];
    }

    return { token, cookie: cookieHeader };
}

async function run() {
    log("🚀 Starting Snag-WorkProgress Linkage & Handover Gate Verification...");

    const { token, cookie } = await login(MANAGER_EMAIL, PASSWORD);
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Cookie': cookie
    };

    // 1. Get a project
    const projRes = await fetch(`${BASE_URL}/api/projects`, { headers });
    const projData = await projRes.json();
    const project = projData.data[0];
    const projectId = project._id;
    log(`✅ Using Project: ${project.name}`);

    // 2. Get high-priority Work Progress entry
    const wpRes = await fetch(`${BASE_URL}/api/work-progress?projectId=${projectId}`, { headers });
    const wpData = await wpRes.json();
    const wpEntry = wpData.data[0];
    if (!wpEntry) {
        log("❌ No Work Progress entry found to link. Run verify_work_progress.js first.");
        return;
    }
    log(`✅ Linking to Work Progress entry: ${wpEntry._id}`);

    // 3. Create Snag linked to Work Progress
    log("📝 Creating Snag linked to Work Progress...");
    const snagRes = await fetch(`${BASE_URL}/api/snags`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            projectId,
            title: "Cracked beam noticed during installation",
            description: "A hairline crack was seen on the structural beam installed today.",
            location: "Floor 1, Sector B",
            category: "civil",
            severity: "critical",
            workProgressId: wpEntry._id
        })
    });
    const snagData = await snagRes.json();
    const snagId = snagData.data._id;
    log(`   ✅ Snag Created: ${snagId} (Severity: ${snagData.data.severity})`);

    // 4. Test Handover Gate (Attempt to complete project with open critical snag)
    log("🔒 Testing Handover Gate (Attempting Project Completion)...");
    const updateRes = await fetch(`${BASE_URL}/api/projects/${projectId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ status: "Completed" })
    });
    const updateData = await updateRes.json();
    if (!updateData.success && updateData.message.includes("Cannot complete project")) {
        log(`   ✅ Handover Gate BLOCKED completion as expected: "${updateData.message}"`);
    } else {
        log(`   ❌ Handover Gate FAILED to block completion. Status: ${updateData.success}, Msg: ${updateData.message}`);
    }

    log("🏁 Verification complete.");
}

run().catch(e => log("❌ Error:", e.message));
