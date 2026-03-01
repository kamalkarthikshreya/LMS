require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const User = require('./src/models/User');
const Subject = require('./src/models/Subject');
const Enrollment = require('./src/models/Enrollment');
const Quiz = require('./src/models/Quiz');
const Result = require('./src/models/Result');

const seedDB = async () => {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/lms_db');
        console.log('Connected to MongoDB.');

        console.log('Clearing existing data...');
        await User.deleteMany({});
        await Subject.deleteMany({});
        await Enrollment.deleteMany({});
        await Quiz.deleteMany({});
        await Result.deleteMany({});

        console.log('Creating users...');
        const passwordHash = await bcrypt.hash('password123', 10);

        const admin = await User.create({
            name: 'Priya Sharma (Admin)',
            email: 'admin@lms.com',
            password: passwordHash,
            role: 'ADMIN',
            status: 'ACTIVE'
        });

        const instructor = await User.create({
            name: 'Dr. Alan Turing',
            email: 'instructor@lms.com',
            password: passwordHash,
            role: 'INSTRUCTOR',
            status: 'ACTIVE'
        });

        const student1 = await User.create({
            name: 'Kamal Vamshi',
            email: 'student@lms.com',
            password: passwordHash,
            role: 'STUDENT',
            status: 'ACTIVE'
        });

        const student2 = await User.create({
            name: 'Ananya Rao',
            email: 'ananya@lms.com',
            password: passwordHash,
            role: 'STUDENT',
            status: 'ACTIVE'
        });

        console.log('Creating real subjects (Data Structures, Mathematics, History)...');

        // 1. Data Structures
        const dsaSubject = await Subject.create({
            title: 'Data Structures and Algorithms',
            description: 'A comprehensive guide to understanding core data structures (Arrays, Linked Lists, Trees, Graphs) and algorithms (Sorting, Searching, Dynamic Programming) essential for software engineering.',
            instructorId: instructor._id,
            thumbnail: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&q=80',
            units: [
                {
                    unitNumber: 1,
                    title: 'Linear Data Structures',
                    chapters: [
                        {
                            chapterNumber: 1,
                            title: 'Arrays and Strings',
                            sections: [
                                {
                                    sectionNumber: 1,
                                    title: 'Introduction to Arrays in Memory',
                                    videoUrl: 'https://www.youtube.com/embed/M7lc1UVf-VE',
                                    paragraphs: [
                                        '[IMG]https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&q=80',
                                        'An array is a collection of items stored at contiguous memory locations. The idea is to store multiple items of the same type together.',
                                        'This makes it easier to calculate the position of each element by simply adding an offset to a base value, i.e., the memory location of the first element of the array (generally denoted by the name of the array).',
                                        'For example, if an array of integers starts at memory address 200, and the size of an integer is 4 bytes, the second element will be at 204, the third at 208, and so on.',
                                        'Time Complexity for accessing an element by index remains O(1), making arrays extremely fast for read-heavy operations.'
                                    ]
                                },
                                {
                                    sectionNumber: 2,
                                    title: 'Dynamic Arrays vs Static Arrays',
                                    paragraphs: [
                                        'Static arrays have a fixed size defined at creation. If you exceed this size, you risk a buffer overflow or must manually create a new array and copy elements.',
                                        'Dynamic arrays (like std::vector in C++, ArrayList in Java, or standard arrays in Python/JS) handle resizing automatically. When the array reaches capacity and a new element is added, the system allocates a new block of memory (usually double the current size) and copies the old elements over.',
                                        'While this resizing operation takes O(n) time, the *amortized* insertion time for dynamic arrays is still considered O(1).'
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        });

        // 2. Mathematics
        const mathSubject = await Subject.create({
            title: 'Advanced Calculus & Linear Algebra',
            description: 'Explore limits, derivatives, integrals, and vector spaces. Essential mathematics for machine learning, physics, and advanced engineering computations.',
            instructorId: instructor._id,
            thumbnail: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&q=80',
            units: [
                {
                    unitNumber: 1,
                    title: 'Differential Calculus',
                    chapters: [
                        {
                            chapterNumber: 1,
                            title: 'Limits and Continuity',
                            sections: [
                                {
                                    sectionNumber: 1,
                                    title: 'The Formal Definition of a Limit',
                                    videoUrl: 'https://www.youtube.com/embed/M7lc1UVf-VE',
                                    paragraphs: [
                                        '[IMG]https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1200&q=80',
                                        'The foundation of calculus rests on the concept of a limit. We say that the limit of $f(x)$ as $x$ approaches $c$ is $L$ if we can make the value of $f(x)$ arbitrarily close to $L$ (as close as we like) by taking $x$ to be sufficiently close to $c$ (but not equal to $c$).',
                                        'The precise intuitive definition is: $\\lim_{x \\to c} f(x) = L$',
                                        'In rigorous mathematical terms (the epsilon-delta definition), for every $\\epsilon > 0$ there exists a $\\delta > 0$ such that if $0 < |x - c| < \\delta$, then $|f(x) - L| < \\epsilon$.',
                                        'Understanding limits is crucial before moving on to derivatives, which are simply the limit of a difference quotient.'
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        });

        // 3. History
        const historySubject = await Subject.create({
            title: 'Modern World History',
            description: 'A deep dive into the socio-political movements, world wars, and technological revolutions that shaped the 19th and 20th centuries.',
            instructorId: instructor._id,
            thumbnail: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800&q=80',
            units: [
                {
                    unitNumber: 1,
                    title: 'The Industrial Revolution',
                    chapters: [
                        {
                            chapterNumber: 1,
                            title: 'Mechanization and Society',
                            sections: [
                                {
                                    sectionNumber: 1,
                                    title: 'The Birth of the Factory System',
                                    videoUrl: 'https://www.youtube.com/embed/M7lc1UVf-VE',
                                    paragraphs: [
                                        '[IMG]https://images.unsplash.com/photo-1502444330042-d1a1ddf9bb5b?w=1200&q=80',
                                        'The Industrial Revolution marked a period of development in the latter half of the 18th century that transformed largely rural, agrarian societies in Europe and America into industrialized, urban ones.',
                                        'Goods that had once been painstakingly crafted by hand started to be produced in mass quantities by machines in factories, thanks to the introduction of new machines and techniques in textiles, iron making and other industries.',
                                        'Fuelled by the game-changing use of steam power, the Industrial Revolution fundamentally changed the way people worked, travel, and lived.'
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        });

        // 4. Electronics & Communication
        const eceSubject = await Subject.create({
            title: 'Basic Electronics & Network Theory',
            description: 'Introduction to foundational electronic components, Kirchhoff\'s laws, and SPICE netlist circuit simulations.',
            instructorId: instructor._id,
            thumbnail: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800&q=80',
            units: [
                {
                    unitNumber: 1,
                    title: 'Circuit Analysis Fundamentals',
                    chapters: [
                        {
                            chapterNumber: 1,
                            title: 'Ohm\'s Law and Nodes',
                            sections: [
                                {
                                    sectionNumber: 1,
                                    title: 'Simple Resistive Divider',
                                    paragraphs: [
                                        'A voltage divider is a simple linear circuit that produces an output voltage (Vout) that is a fraction of its input voltage (Vin). Voltage division is the result of distributing the input voltage among the components of the divider.',
                                        'The easiest example consists of two resistors connected in series. The formula is $V_{out} = V_{in} \\cdot \\frac{R_2}{R_1 + R_2}$.',
                                        'Below is a standard SPICE netlist representation of a basic voltage divider circuit with a 10V DC source and two 1k ohm resistors.',
                                        '[SPICE]\n* Basic Voltage Divider Circuit\nV1 1 0 10V\nR1 1 2 1k\nR2 2 0 1k\n.op\n.end'
                                    ]
                                },
                                {
                                    sectionNumber: 2,
                                    title: 'RC Low-Pass Filter',
                                    paragraphs: [
                                        'An RC low-pass filter is a filter circuit consisting of a resistor and a capacitor which passes low-frequency signals but attenuates signals with frequencies higher than the cutoff frequency.',
                                        'The cutoff frequency in Hertz is calculated by $f_c = \\frac{1}{2\\pi R C}$.',
                                        'Here is the SPICE netlist for a simple first-order RC low-pass filter:',
                                        '[SPICE]\n* Simple RC Low Pass Filter\nVin 1 0 AC 5V\nR1 1 2 1k\nC1 2 0 1uF\n.ac dec 10 1Hz 10kHz\n.end'
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        });

        console.log('Creating Quizzes (5 MCQs each)...');

        // Quiz for DSA
        await Quiz.create({
            subjectId: dsaSubject._id,
            createdBy: instructor._id,
            title: 'Arrays and Fundamentals Assessment',
            questions: [
                {
                    questionText: 'What is the time complexity of accessing an element in an array by its index?',
                    options: ['O(n)', 'O(log n)', 'O(1)', 'O(n^2)'],
                    correctOptionIndex: 2
                },
                {
                    questionText: 'Which of the following describes a Dynamic Array?',
                    options: ['An array with a strict fixed size', 'An array that automatically resizes when capacity is reached', 'A linked list', 'An array that can only hold integers'],
                    correctOptionIndex: 1
                },
                {
                    questionText: 'If an integer array starts at memory address 1000 and the size of an integer is 4 bytes, what is the address of the 3rd element (index 2)?',
                    options: ['1004', '1006', '1008', '1012'],
                    correctOptionIndex: 2
                },
                {
                    questionText: 'When a dynamic array resizes, what is typically the new capacity compared to the old?',
                    options: ['Increases by 1 element', 'Doubles the current capacity', 'Halves the current capacity', 'Triples the current capacity'],
                    correctOptionIndex: 1
                },
                {
                    questionText: 'What risk is associated with exceeding the bounds of a static array in languages like C/C++?',
                    options: ['The program automatically resizes it', 'NullPointerException', 'Buffer Overflow', 'Compilation Error immediately'],
                    correctOptionIndex: 2
                }
            ]
        });

        // Quiz for Math
        await Quiz.create({
            subjectId: mathSubject._id,
            createdBy: instructor._id,
            title: 'Calculus Limits Quiz CIE 1',
            questions: [
                {
                    questionText: 'What is the rigorous mathematical definition of a limit called?',
                    options: ['Alpha-Beta definition', 'Epsilon-Delta definition', 'Newton-Leibniz definition', 'Integral definition'],
                    correctOptionIndex: 1
                },
                {
                    questionText: 'If lim (x→c) f(x) = L, does f(c) necessarily have to equal L?',
                    options: ['Yes, always', 'No, the function curve does not even need to be strictly defined exactly at c', 'Only if the function is a polynomial', 'Only if c is zero'],
                    correctOptionIndex: 1
                },
                {
                    questionText: 'Derivatives are fundamentally derived from the limit of a:',
                    options: ['Difference Quotient', 'Definite Integral', 'Taylor Series', 'Matrices'],
                    correctOptionIndex: 0
                },
                {
                    questionText: 'What is the limit of (sin x)/x as x approaches 0?',
                    options: ['0', 'Undefined', '1', 'Infinity'],
                    correctOptionIndex: 2
                },
                {
                    questionText: 'Which mathematical concept relies directly on limits remaining finite and equal from both the left and right sides?',
                    options: ['Continuity', 'Algebra', 'Trigonometry', 'Set Theory'],
                    correctOptionIndex: 0
                }
            ]
        });

        // Quiz for History
        await Quiz.create({
            subjectId: historySubject._id,
            createdBy: instructor._id,
            title: 'Industrial Revolution Basics',
            questions: [
                {
                    questionText: 'What century did the Industrial Revolution primarily begin in?',
                    options: ['16th Century', '17th Century', 'Late 18th Century', '20th Century'],
                    correctOptionIndex: 2
                },
                {
                    questionText: 'Which fundamental power source fueled the rapid expansion of the factory system?',
                    options: ['Wind Power', 'Nuclear Power', 'Solar Power', 'Steam Power'],
                    correctOptionIndex: 3
                },
                {
                    questionText: 'Which industry was among the first to mechanize rapidly during this era?',
                    options: ['Textiles', 'Automotive', 'Aerospace', 'Electronics'],
                    correctOptionIndex: 0
                },
                {
                    questionText: 'Before the Industrial Revolution, societies were predominantly:',
                    options: ['Urban and Technological', 'Rural and Agrarian', 'Nomadic', 'Underground'],
                    correctOptionIndex: 1
                },
                {
                    questionText: 'What was a major social consequence of the factory system?',
                    options: ['Decline of cities', 'Mass urbanization and movement away from farms', 'Return to feudalism', 'Disappearance of coal mining'],
                    correctOptionIndex: 1
                }
            ]
        });

        // Quiz for ECE
        await Quiz.create({
            subjectId: eceSubject._id,
            createdBy: instructor._id,
            title: 'Network Analysis & SPICE Basics',
            questions: [
                {
                    questionText: 'In a SPICE netlist, what does the first letter of a component name denote (e.g., "R1" or "C1")?',
                    options: ['The value of the component', 'The type of the component', 'The node it connects to', 'The polarity'],
                    correctOptionIndex: 1
                },
                {
                    questionText: 'What is the voltage across R2 in a voltage divider if Vin = 10V, R1 = 1kΩ, and R2 = 1kΩ?',
                    options: ['10V', '5V', '0V', '2.5V'],
                    correctOptionIndex: 1
                },
                {
                    questionText: 'Which mathematical formula determines the cutoff frequency ($f_c$) of an RC low-pass filter?',
                    options: ['$f_c = 2\\pi R C$', '$f_c = \\frac{1}{2\\pi R C}$', '$f_c = R / C$', '$f_c = R + C$'],
                    correctOptionIndex: 1
                },
                {
                    questionText: 'Which SPICE directive is used to perform an AC analysis sweep?',
                    options: ['.op', '.tran', '.ac', '.end'],
                    correctOptionIndex: 2
                },
                {
                    questionText: 'In the SPICE line `V1 1 0 10V`, what does the `0` represent?',
                    options: ['0 Volts', 'The Ground Node', 'Initial Time', 'Phase angle'],
                    correctOptionIndex: 1
                }
            ]
        });

        console.log('Enrolling students & updating realistic progress...');

        await Enrollment.create({
            studentId: student1._id,
            subjectId: dsaSubject._id,
            progressPointer: { unit: 1, chapter: 1, section: 2 },
            percentageCompleted: 58
        });

        await Enrollment.create({
            studentId: student1._id,
            subjectId: mathSubject._id,
            progressPointer: { unit: 1, chapter: 1, section: 1 },
            percentageCompleted: 70
        });

        await Enrollment.create({
            studentId: student1._id,
            subjectId: historySubject._id,
            progressPointer: { unit: 1, chapter: 1, section: 1 },
            percentageCompleted: 65
        });

        await Enrollment.create({
            studentId: student2._id,
            subjectId: eceSubject._id,
            progressPointer: { unit: 1, chapter: 1, section: 1 },
            percentageCompleted: 15
        });

        console.log('==============================================');
        console.log('REAL DATA SEEDING SUCCESSFUL!');
        console.log('Created Subjects: Data Structures, Mathematics, History');
        console.log('Created robust 5-question MCQs for all subjects.');
        console.log('Test Accounts:');
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

