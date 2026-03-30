require('dotenv').config();
const { sequelize } = require('./src/config/db');
const { User, Subject, Enrollment, ActivityLog } = require('./src/models');
const bcrypt = require('bcrypt');
const fs = require('fs');

const seedDB = async () => {
    try {
        console.log('🚀 Connecting to PostgreSQL and Syncing Tables...');
        await sequelize.sync({ force: true });
        console.log('✅ Tables Synchronized.');

        console.log('👥 Creating users...');
        const passwordHash = await bcrypt.hash('password123', 10);

        // --- Admins ---
        await User.create({
            userId: 'ADM001',
            name: 'System Admin',
            email: 'admin@lms.com',
            password: passwordHash,
            role: 'ADMIN',
            status: 'ACTIVE',
            isVerified: true
        });

        // --- Instructors ---
        const instructors = await Promise.all([
            User.create({ userId: 'INS001', name: 'Dr. Sarah Smith', email: 'sarah@lms.com', password: passwordHash, role: 'INSTRUCTOR', status: 'ACTIVE', isVerified: true }),
            User.create({ userId: 'INS002', name: 'Prof. James Wilson', email: 'james@lms.com', password: passwordHash, role: 'INSTRUCTOR', status: 'ACTIVE', isVerified: true }),
            User.create({ userId: 'INS003', name: 'Dr. Emily Chen', email: 'instructor@lms.com', password: passwordHash, role: 'INSTRUCTOR', status: 'ACTIVE', isVerified: true })
        ]);

        // --- Students ---
        const studentNames = ['Alice Johnson', 'Bob Miller', 'Charlie Davis', 'Diana Prince', 'Ethan Hunt', 'Fiona Gallagher', 'George Costanza', 'Hannah Abbott', 'Ian Wright', 'Jenny Slate'];
        const students = await Promise.all(studentNames.map((name, i) => 
            User.create({
                userId: `STU${String(i + 1).padStart(3, '0')}`,
                name,
                email: i === 0 ? 'student@lms.com' : `${name.toLowerCase().replace(' ', '.')}@example.com`,
                password: passwordHash,
                role: 'STUDENT',
                status: 'ACTIVE',
                isVerified: true
            })
        ));

        console.log('📚 Creating subjects...');
        const physics = await Subject.create({
            title: 'Quantum Mechanics 101',
            subject_name: 'Physics',
            description: 'Introduction to wave functions and quantum states.',
            instructorId: instructors[0].id,
            thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80',
            units: []
        });

        const math = await Subject.create({
            title: 'Advanced Linear Algebra',
            subject_name: 'Mathematics',
            description: 'Vector spaces, eigenvalues, and transformations.',
            instructorId: instructors[1].id,
            thumbnail: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&q=80',
            units: []
        });

        console.log('🔗 Enrolling students...');
        await Promise.all(students.map((student, i) => 
            Enrollment.create({
                studentId: student.id,
                subjectId: i % 2 === 0 ? physics.id : math.id,
                progressPointer: { unit: 0, chapter: 0, section: 0 },
                percentageCompleted: Math.floor(Math.random() * 100)
            })
        ));

        console.log('📊 Generating activity logs...');
        await Promise.all(students.slice(0, 5).map(student => 
            ActivityLog.create({
                userId: student.id,
                loginTime: new Date(Date.now() - Math.random() * 10000000),
                logoutTime: new Date(),
                durationSeconds: Math.floor(Math.random() * 3600)
            })
        ));

        console.log('\n' + '='.repeat(40));
        console.log('🎉 COMPREHENSIVE SEEDING SUCCESSFUL');
        console.log(`- 1 Admin\n- ${instructors.length} Instructors\n- ${students.length} Students`);
        console.log('='.repeat(40));
        process.exit(0);

    } catch (error) {
        const errorLog = `Error: ${error.message}\nStack: ${error.stack}`;
        fs.writeFileSync('seed_error.log', errorLog);
        process.exit(1);
    }
};

seedDB();
