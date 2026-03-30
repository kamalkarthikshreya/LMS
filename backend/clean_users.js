require('dotenv').config();
const { User, sequelize } = require('./src/models');

async function cleanupUsers() {
    try {
        console.log('🔍 Starting user cleanup...');
        
        // Fetch all users
        const users = await User.findAll({ order: [['id', 'ASC']] });
        console.log(`Found ${users.length} total users.`);

        const seenEmails = new Set();
        let deletedCount = 0;

        for (const user of users) {
            const email = user.email.toLowerCase().trim();
            if (seenEmails.has(email)) {
                console.log(`🗑️ Deleting duplicate user: ${user.name} (${email}) | ID: ${user.id}`);
                await user.destroy();
                deletedCount++;
            } else {
                seenEmails.add(email);
            }
        }

        console.log(`✅ Cleanup finished. Removed ${deletedCount} duplicates.`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during cleanup:', error);
        process.exit(1);
    }
}

cleanupUsers();
