require('dotenv').config();
const { sequelize } = require('./src/config/db');
const { User, Subject, Enrollment } = require('./src/models');
const bcrypt = require('bcrypt');
const fs = require('fs');

const seedDB = async () => {
    try {
        console.log('🚀 Connecting to PostgreSQL and Syncing Tables...');
        await sequelize.sync({ force: true });
        console.log('✅ Tables Synchronized.');

        console.log('👥 Creating users...');
        const passwordHash = await bcrypt.hash('password123', 10);

        await User.create({
            userId: 'ADM001',
            name: 'Admin User',
            email: 'admin@lms.com',
            password: passwordHash,
            role: 'ADMIN',
            status: 'ACTIVE',
            isVerified: true
        });

        await User.create({
            userId: 'INS001',
            name: 'Dr. Smith',
            email: 'instructor@lms.com',
            password: passwordHash,
            role: 'INSTRUCTOR',
            status: 'ACTIVE',
            isVerified: true
        });

        const student = await User.create({
            userId: 'STU001',
            name: 'Test Student',
            email: 'student@lms.com',
            password: passwordHash,
            role: 'STUDENT',
            status: 'ACTIVE',
            isVerified: true
        });

        console.log('📚 Creating subject...');
        const physicsCourse = await Subject.create({
            title: 'Introduction to Quantum Mechanics',
            subject_name: 'Quantum Physics',
            description: 'Explore wave-particle duality.',
            instructorId: 1, // Fix: Use ID of instructor
            thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80',
            units: []
        });

        console.log('🔗 Enrolling student...');
        await Enrollment.create({
            studentId: student.id,
            subjectId: physicsCourse.id,
            progressPointer: { unit: 0, chapter: 0, section: 0 },
            percentageCompleted: 15
        });

        console.log('🎉 SEEDING SUCCESSFUL');
        process.exit(0);

    } catch (error) {
        const errorLog = `Error: ${error.message}\nStack: ${error.stack}`;
        fs.writeFileSync('seed_error.log', errorLog);
        console.error('❌ Seeding error logged to seed_error.log');
        process.exit(1);
    }
};

seedDB();
