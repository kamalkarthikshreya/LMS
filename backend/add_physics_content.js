require('dotenv').config();
const { Subject } = require('./src/models');

const physicsContent = [
    {
        unitNumber: 1,
        title: "Classical Mechanics & Dynamics",
        chapters: [
            {
                chapterNumber: 1,
                title: "Newton's Laws of Motion",
                sections: [
                    {
                        sectionNumber: 1,
                        title: "The First Law: Inertia",
                        paragraphs: [
                            "Newton's First Law of Motion, often called the Law of Inertia, states that an object at rest stays at rest, and an object in motion stays in motion with the same speed and in the same direction unless acted upon by an unbalanced force.",
                            "Inertia is the resistance of any physical object to any change in its velocity. This includes changes to the object's speed, or direction of motion. An aspect of this property is the tendency of objects to keep moving in a straight line at a constant speed, when no forces act upon them.",
                            "Mass is a measure of inertia. The more mass an object has, the more inertia it possesses—meaning it has a greater resistance to changes in its state of motion."
                        ],
                        videoUrl: "https://www.youtube.com/embed/5mIsz_6m858"
                    },
                    {
                        sectionNumber: 2,
                        title: "The Second Law: F=ma",
                        paragraphs: [
                            "The Second Law of Motion states that the acceleration of an object as produced by a net force is directly proportional to the magnitude of the net force, in the same direction as the net force, and inversely proportional to the mass of the object.",
                            "This relationship is mathematically summarized as F = ma, where 'F' is the net force applied, 'm' is the mass of the object, and 'a' is the resulting acceleration.",
                            "The unit of force is the Newton (N), which is defined as the force required to accelerate one kilogram of mass at a rate of one meter per second squared."
                        ]
                    }
                ]
            },
            {
                chapterNumber: 2,
                title: "Work, Energy, and Power",
                sections: [
                    {
                        sectionNumber: 1,
                        title: "Kinetic and Potential Energy",
                        paragraphs: [
                            "Energy is defined as the capacity to do work. Kinetic energy is the energy of an object in motion, calculated as 1/2 * m * v^2.",
                            "Potential energy is stored energy based on an object's position or state. For example, gravitational potential energy is calculated as m * g * h.",
                            "The law of conservation of energy states that energy cannot be created or destroyed, only transformed from one form to another."
                        ]
                    }
                ]
            }
        ]
    }
];

const updateContent = async () => {
    try {
        const subject = await Subject.findByPk(1);
        if (!subject) {
            console.error("Subject 1 not found!");
            return;
        }
        subject.units = physicsContent;
        await subject.save();
        console.log("✅ Subject 1 (Physics) has been populated with rich content!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Failed to update content:", err);
        process.exit(1);
    }
};

updateContent();
