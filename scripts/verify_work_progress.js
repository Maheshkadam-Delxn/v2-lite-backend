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
    log("🚀 Starting Work Progress Verification...");

    const { token, cookie } = await login(MANAGER_EMAIL, PASSWORD);
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Cookie': cookie
    };

    // 1. Get a project
    log("🔎 Fetching Projects...");
    const projRes = await fetch(`${BASE_URL}/api/projects`, { headers });
    const projData = await projRes.json();
    if (!projData.success || projData.data.length === 0) {
        log("❌ No projects found.");
        return;
    }
    const project = projData.data[0];
    const projectId = project._id;
    log(`✅ Using Project: ${project.name} (${projectId})`);

    // 2. Create Daily Progress Entry
    log("📝 Creating Daily Progress Entry...");
    const today = new Date().toISOString().split('T')[0];
    const createRes = await fetch(`${BASE_URL}/api/work-progress`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            projectId,
            date: today,
            description: "Installed structural beams on Floor 1",
            progressPercent: 5,
            photos: ["https://example.com/beams1.jpg"],
            issues: "Slight delay due to rain in the morning."
        })
    });
    const createData = await createRes.json();
    if (createData.success) {
        log(`   ✅ Created Entry: ${createData.data._id}`);
    } else {
        log("   ❌ Creation Failed:", createData.message);
        // If it failed because of duplicate, we can still proceed to test GET
    }

    // 3. Create another entry for yesterday to test summary
    log("📝 Creating Entry for Yesterday...");
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    await fetch(`${BASE_URL}/api/work-progress`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            projectId,
            date: yesterdayStr,
            description: "Foundation work completed",
            progressPercent: 10,
            photos: ["https://example.com/foundation.jpg"]
        })
    });

    // 4. Test List API
    log("🔎 Testing List API...");
    const listRes = await fetch(`${BASE_URL}/api/work-progress?projectId=${projectId}`, { headers });
    const listData = await listRes.json();
    log(`   ✅ Found ${listData.data?.length} entries.`);

    // 5. Test Summary API (Daily)
    log("📊 Testing Summary API (Daily)...");
    const dailyRes = await fetch(`${BASE_URL}/api/work-progress/summary?projectId=${projectId}&range=daily`, { headers });
    const dailyData = await dailyRes.json();
    log(`   ✅ Summary (Daily) returned ${dailyData.data?.length} groups.`);

    // 6. Test Summary API (Weekly)
    log("📊 Testing Summary API (Weekly)...");
    const weeklyRes = await fetch(`${BASE_URL}/api/work-progress/summary?projectId=${projectId}&range=weekly`, { headers });
    const weeklyData = await weeklyRes.json();
    log(`   ✅ Summary (Weekly) returned ${weeklyData.data?.length} groups.`);

    if (weeklyData.data?.length > 0) {
        log(`   Total Progress in current week group: ${weeklyData.data[0].totalProgress}%`);
    }

    log("🏁 Verification complete.");
}

run().catch(e => log("❌ Error:", e.message));
