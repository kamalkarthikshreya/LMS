const { User, Subject, Enrollment, Quiz, sequelize } = require('./src/models');
require('dotenv').config();

async function checkData() {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to DB');

        const users = await User.count();
        const subjects = await Subject.count();
        const enrollments = await Enrollment.count();
        const quizzes = await Quiz.count();

        console.log(`📊 Statistics:
        Users: ${users}
        Subjects: ${subjects}
        Enrollments: ${enrollments}
        Quizzes: ${quizzes}
        `);

        if (subjects === 0) {
            console.log('❌ No subjects found. Need to restore.');
        }

        const student = await User.findOne({ where: { role: 'STUDENT' } });
        if (student) {
            console.log(`🔍 Student Found: ${student.username} (ID: ${student.id})`);
            const studentEnr = await Enrollment.count({ where: { userId: student.id } });
            console.log(`📌 Enrolled in ${studentEnr} subjects.`);
            
            if (subjects > 0 && studentEnr === 0) {
                console.log('🚀 Enrolling student in all subjects...');
                const allSubs = await Subject.findAll();
                for (const sub of allSubs) {
                    await Enrollment.create({ userId: student.id, subjectId: sub.id });
                }
                console.log('✅ Enrollment complete.');
            }
        }
    } catch (e) {
        console.error('❌ DB Error:', e.message);
    } finally {
        process.exit();
    }
}

checkData();
