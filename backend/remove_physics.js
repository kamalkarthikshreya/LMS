const { Subject, Quiz, Enrollment, Result } = require('./src/models');
const { Op } = require('sequelize');

async function removePhysicsModule1() {
    try {
        console.log('Connecting to database...');
        
        // Find the exact subject "Physics - module 1"
        const subject = await Subject.findOne({ 
            where: { 
                title: { [Op.iLike]: 'Physics - module 1' } 
            } 
        });

        if (!subject) {
            console.log('Target subject "Physics - module 1" not found. It might have already been deleted.');
            process.exit(0);
        }

        console.log(`Cleaning up subject: "${subject.title}" (ID: ${subject.id})`);
        
        // Delete associated records first to bypass foreign key constraints
        await Result.destroy({ where: { subjectId: subject.id } });
        await Enrollment.destroy({ where: { subjectId: subject.id } });
        await Quiz.destroy({ where: { subjectId: subject.id } });
        
        // Finally, delete the subject itself
        await subject.destroy();
        
        console.log(`Successfully removed "${subject.title}" and all its associated data!`);
        process.exit(0);
    } catch (error) {
        console.error('Error cleaning up subject:', error);
        process.exit(1);
    }
}

removePhysicsModule1();
