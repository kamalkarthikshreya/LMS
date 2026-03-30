require('dotenv').config();
const { sequelize } = require('./src/config/db');
const { User, Subject, Enrollment, Quiz, Result } = require('./src/models');
const bcrypt = require('bcrypt');

const seedDB = async () => {
    try {
        console.log('🚀 Connecting to PostgreSQL and Syncing Tables (FORCE)...');
        await sequelize.sync({ force: true });
        console.log('✅ Tables Synchronized.');

        console.log('👥 Creating User Profiles...');
        const passwordHash = await bcrypt.hash('password123', 10);

        // --- Instructor ---
        const instructor = await User.create({
            userId: 'INS_TURING',
            name: 'Dr. Alan Turing',
            email: 'instructor@lms.com',
            password: passwordHash,
            role: 'INSTRUCTOR',
            status: 'ACTIVE',
            isVerified: true
        });

        // --- Student ---
        const student = await User.create({
            userId: 'STU_KAMAL',
            name: 'Kamal Vamshi',
            email: 'student@lms.com',
            password: passwordHash,
            role: 'STUDENT',
            status: 'ACTIVE',
            isVerified: true
        });

        console.log('📚 Reconstructing Curriculum...');

        // 1. Physics
        const physicsSubject = await Subject.create({
            title: 'Physics - Module 1',
            description: 'Fundamental principles of classical mechanics and optics.',
            instructorId: instructor.id,
            category: 'BSc',
            thumbnail: '/physics.png',
            units: [
                {
                    unitNumber: 1,
                    title: 'Classical Mechanics',
                    chapters: [
                        {
                            chapterNumber: 1,
                            title: 'Newton\'s Laws of Motion',
                            sections: [
                                {
                                    sectionNumber: 1,
                                    title: 'First Law: Inertia',
                                    paragraphs: [
                                        'An object at rest stays at rest, and an object in motion stays in motion unless acted upon by an external force.',
                                        'Inertia is the tendency of objects to resist changes in their state of motion.',
                                        'The mass of an object is a quantitative measure of its inertia.',
                                        'A more massive object has more inertia and is harder to accelerate.'
                                    ]
                                },
                                {
                                    sectionNumber: 2,
                                    title: 'Second Law: F=ma',
                                    paragraphs: [
                                        'The acceleration of an object as produced by a net force is directly proportional to the magnitude of the net force.',
                                        'Force is equal to the product of mass and acceleration (F = ma).',
                                        'The SI unit of force is the Newton (N), defined as kg·m/s².',
                                        'Direction of acceleration is in the same direction as the net force.',
                                        'Friction is a force that opposes motion between two surfaces in contact.',
                                        'Tension is a pulling force transmitted through a string or cable.'
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        });

        // 2. Chemistry
        const chemistrySubject = await Subject.create({
            title: 'General Chemistry',
            description: 'Atomic structure and chemical bonding.',
            instructorId: instructor.id,
            category: 'BSc',
            thumbnail: 'https://images.unsplash.com/photo-1532187875605-1ef6ec823b44?w=800&q=80',
            units: [
                {
                    unitNumber: 1,
                    title: 'Atomic Structure',
                    chapters: [{ chapterNumber: 1, title: 'The Atom', sections: [{ sectionNumber: 1, title: 'Subatomic Particles', paragraphs: ['Protons, neutrons and electrons are the building blocks. Protons are positive, electrons are negative, and neutrons are neutral.'] }] }]
                }
            ]
        });

        // 3. Math
        const mathSubject = await Subject.create({
            title: 'Engineering Mathematics',
            description: 'Calculus and Linear Algebra.',
            instructorId: instructor.id,
            category: 'BE',
            thumbnail: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&q=80',
            units: [
                {
                    unitNumber: 1,
                    title: 'Calculus',
                    chapters: [{ chapterNumber: 1, title: 'Derivatives', sections: [{ sectionNumber: 1, title: 'Rate of Change', paragraphs: ['Calculation of derivatives for polynomial functions using power rule.'] }] }]
                }
            ]
        });

        // 4. Electronics
        const electronicsSubject = await Subject.create({
            title: 'Basic Electronics',
            description: 'Semiconductors and circuit design.',
            instructorId: instructor.id,
            category: 'BE',
            thumbnail: 'https://images.unsplash.com/photo-1517055759838-8c3af62ad16a?w=800&q=80',
            units: [
                {
                    unitNumber: 1,
                    title: 'Circuit Basics',
                    chapters: [{ chapterNumber: 1, title: 'Ohms Law', sections: [{ sectionNumber: 1, title: 'V=IR', paragraphs: ['Voltage is directly proportional to current flowing through a conductor.'] }] }]
                }
            ]
        });

        console.log('📝 Creating Sample Quizzes...');
        
        // Physics Quiz
        await Quiz.create({
            subjectId: physicsSubject.id,
            title: 'Newtonian Mechanics Quiz',
            createdBy: instructor.id,
            questions: [
                {
                    questionText: 'What is the formula for Force according to Newton\'s Second Law?',
                    options: ['F = m/a', 'F = ma', 'F = m+a', 'F = a/m'],
                    correctOptionIndex: 1,
                    explanation: 'Newton\'s second law states that Force is the product of mass and acceleration.'
                }
            ]
        });

        // Chemistry Quiz
        await Quiz.create({
            subjectId: chemistrySubject.id,
            title: 'Atomic structure Quiz',
            createdBy: instructor.id,
            questions: [
                {
                    questionText: 'Which particle has a negative charge?',
                    options: ['Proton', 'Neutron', 'Electron', 'Nucleus'],
                    correctOptionIndex: 2,
                    explanation: 'Electrons carry a negative electrical charge.'
                }
            ]
        });

        console.log('🔗 Enrolling student in all subjects...');
        const subjects = [physicsSubject, chemistrySubject, mathSubject, electronicsSubject];
        for (const sub of subjects) {
            await Enrollment.create({ userId: student.id, subjectId: sub.id, studentId: student.id });
        }

        console.log('🎉 Final CURRICULUM SEEDING SUCCESSFUL');
        process.exit(0);

    } catch (error) {
        console.error('❌ Seeding error:', error);
        process.exit(1);
    }
};

seedDB();
