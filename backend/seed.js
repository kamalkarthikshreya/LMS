require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Load Models
const User = require('./src/models/User');
const Subject = require('./src/models/Subject');
const Enrollment = require('./src/models/Enrollment');

const seedDB = async () => {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/lms_db');
        console.log('Connected.');

        console.log('Clearing existing data...');
        await User.deleteMany({});
        await Subject.deleteMany({});
        await Enrollment.deleteMany({});

        console.log('Creating users...');
        const passwordHash = await bcrypt.hash('password123', 10);

        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@lms.com',
            password: passwordHash,
            role: 'ADMIN',
            status: 'ACTIVE'
        });

        const instructor = await User.create({
            name: 'Dr. Smith',
            email: 'instructor@lms.com',
            password: passwordHash,
            role: 'INSTRUCTOR',
            status: 'ACTIVE'
        });

        const student = await User.create({
            name: 'Test Student',
            email: 'student@lms.com',
            password: passwordHash,
            role: 'STUDENT',
            status: 'ACTIVE'
        });

        console.log('Creating subject with video and AI-readable text...');
        // Let's use a nice YouTube video for the demo - MIT OCW or similar educational video
        const physicsCourse = await Subject.create({
            title: 'Introduction to Quantum Mechanics',
            description: 'Explore the fundamental principles of quantum mechanics, including wave-particle duality, the Schrödinger equation, and quantum entanglement in this comprehensive interactive course.',
            instructorId: instructor._id,
            thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            units: [
                {
                    unitNumber: 1,
                    title: 'Wave Mechanics',
                    chapters: [
                        {
                            chapterNumber: 1,
                            title: 'The Schrödinger Equation',
                            sections: [
                                {
                                    sectionNumber: 1,
                                    title: 'Introduction and The Wave Function',
                                    videoUrl: 'https://www.youtube.com/embed/lZ3bPUKo5zc', // MIT OCW Quantum Mechanics intro
                                    paragraphs: [
                                        'Welcome to the beginning of your journey into Quantum Mechanics. The video above provides an overview of the concepts we will cover.',
                                        'In classical mechanics, the state of a system is described by the positions and momenta of its particles. In quantum mechanics, the state is completely described by its wave function, $\\Psi(x,t)$.',
                                        'The probability of finding the particle between $x$ and $x + dx$ at time $t$ is given by $|\\Psi(x,t)|^2 dx$. This implies that the wave function must be normalized: $\\int_{-\\infty}^{\\infty} |\\Psi(x,t)|^2 dx = 1$.',
                                        'The time evolution of the wave function is governed by the time-dependent Schrödinger equation:',
                                        '$$ i\\hbar \\frac{\\partial \\Psi}{\\partial t} = \\hat{H} \\Psi $$',
                                        'where $\\hat{H}$ is the Hamiltonian operator, representing the total energy (kinetic + potential) of the system.',
                                        'If you have any questions about the nature of the wave function or the Schrödinger equation, just ask the AI Chat button in the bottom right corner!'
                                    ]
                                },
                                {
                                    sectionNumber: 2,
                                    title: 'Particle in a Box',
                                    paragraphs: [
                                        'One of the simplest quantum systems is a particle confined to a one-dimensional box of length $L$ with infinitely high, rigid walls.',
                                        'Inside the box ($0 < x < L$), the potential energy $V(x) = 0$. Outside, $V(x) = \\infty$. This means the particle must possess a zero probability of being found outside the box.',
                                        'Solving the time-independent Schrödinger equation yields the energy levels: $E_n = \\frac{n^2 \\pi^2 \\hbar^2}{2mL^2}$, where $n = 1, 2, 3, \\dots$',
                                        'This demonstrates the phenomenon of energy quantization – the particle can only exist in specific, discrete energy states.'
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        });

        console.log('Enrolling student in the course...');
        await Enrollment.create({
            studentId: student._id,
            subjectId: physicsCourse._id,
            progressPointer: { unit: 0, chapter: 0, section: 0 },
            percentageCompleted: 15
        });

        console.log('==============================================');
        console.log('SEEDING SUCCESSFUL!');
        console.log('You can now log in with the following test accounts:');
        console.log('Student: student@lms.com / password123');
        console.log('Instructor: instructor@lms.com / password123');
        console.log('Admin: admin@lms.com / password123');
        console.log('==============================================');
        process.exit(0);

    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

seedDB();
