// Removed axios
require('dotenv').config({ path: './.env' });

async function run() {
    try {
        console.log("Logging in...");
        const loginRes = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ email: 'student@lms.com', password: 'password123' })
        });
        const loginData = await loginRes.json();
        console.log("Login Status:", loginRes.status);
        if(!loginData.token) {
            console.log("Failed to login", loginData);
            return;
        }

        console.log("Reporting glitch...");
        const glitchRes = await fetch('http://localhost:5000/api/glitches', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${loginData.token}`
            },
            body: JSON.stringify({ title: 'My Bug', description: 'desc' })
        });
        const glitchData = await glitchRes.text();
        console.log("Glitch Response:", glitchRes.status, glitchData);

    } catch (e) {
        console.error("Test error:", e);
    }
}
run();
