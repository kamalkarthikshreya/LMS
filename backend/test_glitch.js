const jwt = require('jsonwebtoken');

require('dotenv').config({ path: './.env' });

async function test() {
    try {
        const token = jwt.sign({ id: 1, role: 'STUDENT', status: 'ACTIVE' }, process.env.JWT_SECRET, { expiresIn: '1h' });
        
        const res = await fetch('http://localhost:5000/api/glitches', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ title: 'Test', description: 'Test desc' })
        });
        const text = await res.text();
        console.log('STATUS:', res.status, 'BODY:', text);
    } catch(err) {
        console.error('ERROR:', err);
    }
}
test();
