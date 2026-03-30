require('dotenv').config();
const { User, sequelize } = require('./src/models');
const bcrypt = require('bcrypt');

async function restoreAdmin() {
    try {
        console.log('🚀 Restoring Admin Account...');
        const passwordHash = await bcrypt.hash('password123', 10);
        
        const [user, created] = await User.findOrCreate({
            where: { email: 'kamalkarthik886@gmail.com' },
            defaults: {
                userId: 'ADM_KAMAL_KARTHIK',
                name: 'Kamal Karthik (Owner)',
                email: 'kamalkarthik886@gmail.com',
                password: passwordHash,
                role: 'ADMIN',
                status: 'ACTIVE',
                isVerified: true
            }
        });

        if (!created) {
            user.role = 'ADMIN';
            user.status = 'ACTIVE';
            user.isVerified = true;
            await user.save();
            console.log('✅ Admin account updated to ADMIN role.');
        } else {
            console.log('✅ Admin account created.');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

restoreAdmin();
