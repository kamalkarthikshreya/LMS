const { Subject, Quiz, Enrollment, Result } = require('./src/models');
const { Op } = require('sequelize');

async function removeDuplicates() {
    try {
        console.log('Connecting to database...');
        const subjects = await Subject.findAll();
        
        const titleMap = new Map();
        for (const sub of subjects) {
            const lowerTitle = sub.title.trim().toLowerCase();
            if (!titleMap.has(lowerTitle)) {
                titleMap.set(lowerTitle, []);
            }
            titleMap.get(lowerTitle).push(sub);
        }

        let deletedCount = 0;
        
        for (const [title, subs] of titleMap.entries()) {
            if (subs.length > 1) {
                subs.sort((a, b) => a.id - b.id);
                // The first element is the oldest. The rest are duplicates.
                const duplicates = subs.slice(1);
                
                for (const dup of duplicates) {
                    console.log(`Cleaning up duplicate subject: "${dup.title}" (ID: ${dup.id})`);
                    
                    // Delete associated records first to bypass foreign key constraints
                    await Result.destroy({ where: { subjectId: dup.id } });
                    await Enrollment.destroy({ where: { subjectId: dup.id } });
                    await Quiz.destroy({ where: { subjectId: dup.id } });
                    
                    await dup.destroy();
                    deletedCount++;
                }
            }
        }
        
        console.log(`Cleanup complete! Removed ${deletedCount} duplicate subjects.`);
        process.exit(0);
    } catch (error) {
        console.error('Error cleaning up duplicates:', error);
        process.exit(1);
    }
}

removeDuplicates();
