require('dotenv').config();
const { Subject } = require('./src/models');

const additionalContent = [
    {
        id: 2,
        title: "General Chemistry",
        category: "BSc",
        units: [
            {
                unitNumber: 1,
                title: "Atomic Structure",
                chapters: [
                    {
                        chapterNumber: 1,
                        title: "Protons, Neutrons, and Electrons",
                        sections: [
                            {
                                sectionNumber: 1,
                                title: "The Subatomic Particles",
                                paragraphs: [
                                    "Atoms are composed of three primary subatomic particles: protons, neutrons, and electrons. Protons and neutrons are located in the nucleus at the center of the atom, while electrons orbit the nucleus in specific energy levels or shells.",
                                    "Protons have a positive electric charge (+1), while electrons have a negative charge (-1). Neutrons are electrically neutral, meaning they have no net charge.",
                                    "The number of protons in an atom's nucleus determines its atomic number and defines which element it is. For example, any atom with exactly 6 protons is an atom of Carbon."
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 3,
        title: "Advanced Mathematics",
        category: "BE",
        units: [
            {
                unitNumber: 1,
                title: "Differential Calculus",
                chapters: [
                    {
                        chapterNumber: 1,
                        title: "Limits and Continuity",
                        sections: [
                            {
                                sectionNumber: 1,
                                title: "Introduction to Limits",
                                paragraphs: [
                                    "In mathematics, a limit is the value that a function 'approaches' as the input approaches some value. Limits are essential to calculus and mathematical analysis, and are used to define continuity, derivatives, and integrals.",
                                    "A function is said to be continuous if there are no sudden jumps, holes, or asymptotes in its graph. Formally, a function is continuous at a point if the limit at that point equals the function's value.",
                                    "The derivative represents the instantaneous rate of change of a function with respect to one of its variables. This is equivalent to finding the slope of the tangent line to the function at a specific point."
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    }
];

const seedAdditional = async () => {
    try {
        for (const data of additionalContent) {
            const subject = await Subject.findByPk(data.id);
            if (subject) {
                subject.units = data.units;
                subject.category = data.category;
                await subject.save();
                console.log(`✅ Updated ${data.title} (ID: ${data.id})`);
            } else {
                await Subject.create({
                    id: data.id,
                    title: data.title,
                    category: data.category,
                    units: data.units,
                    instructorId: 1 // Default to first user
                });
                console.log(`✨ Created ${data.title} (ID: ${data.id})`);
            }
        }
        console.log("🚀 All subjects populated with testing content!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Seeding failed:", err);
        process.exit(1);
    }
};

seedAdditional();
