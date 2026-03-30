require('dotenv').config();
const { User, Subject, Enrollment } = require('./src/models');
const { sequelize } = require('./src/config/db');

async function fix() {
    try {
        await sequelize.authenticate();
        console.log('✅ DB Connected');

        // 1. Get all subjects
        const subjects = await Subject.findAll();
        console.log(`📚 Found ${subjects.length} subjects.`);

        if (subjects.length === 0) {
            console.log('⚠️ No subjects in DB. Please run: node seed_real.js');
            return;
        }

        // 2. Get the current student (Kamal Vamshi)
        const student = await User.findOne({ 
            where: { role: 'STUDENT' } 
        });

        if (!student) {
            console.log('⚠️ No student found in DB.');
            return;
        }

        console.log(`👤 Student: ${student.name} (ID: ${student.id})`);

        // 3. Enroll in all subjects
        for (const sub of subjects) {
            const [enr, created] = await Enrollment.findOrCreate({
                where: { userId: student.id, subjectId: sub.id }
            });
            if (created) console.log(`✅ Enrolled in ${sub.title}`);
        }

        console.log('✨ All done. Refresh the dashboard.');

    } catch (e) {
        console.error('❌ Error:', e.message);
    } finally {
        process.exit();
    }
}

fix();
