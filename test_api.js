import axios from 'axios';

const API = 'http://localhost:5000/api';

async function runTests() {
    console.log("Starting API Tests...");
    let token = '';

    try {
        // 1. Test Registration
        console.log("-> Testing Registration...");
        const regRes = await axios.post(`${API}/auth/register`, {
            name: "Test Student",
            email: `student${Date.now()}@test.com`,
            password: "password123",
            role: "STUDENT"
        });
        console.log("Register Success");
        token = regRes.data.token;

        // 2. Test Get Profile
        console.log("-> Testing Fetch Profile...");
        const profileRes = await axios.get(`${API}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log("Profile Fetch Success:", profileRes.data.name);

        // 3. Test Fetch Subjects
        console.log("-> Testing Subject Fetch...");
        const subjectRes = await axios.get(`${API}/subjects`);
        console.log(`Subjects Fetch Success: Found ${subjectRes.data.length} subjects.`);

        console.log("\n✅ ALL TESTS PASSED!");
    } catch (error) {
        console.error("\n❌ TEST FAILED:", error.response?.data?.message || error.message);
    }
}

runTests();
