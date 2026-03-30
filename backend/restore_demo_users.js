require('dotenv').config({ path: './.env' });
const { User } = require('./src/models');
const bcrypt = require('bcrypt');

async function restoreDemoUsers() {
    try {
        console.log('Connecting to database...');
        
        const demoUsers = [
            { name: 'Demo Student', email: 'student@lms.com', role: 'STUDENT', status: 'ACTIVE' },
            { name: 'Demo Instructor', email: 'instructor@lms.com', role: 'INSTRUCTOR', status: 'ACTIVE' },
            { name: 'Demo Admin', email: 'admin@lms.com', role: 'ADMIN', status: 'ACTIVE' },
            { name: 'Demo IT Admin', email: 'itadmin@lms.com', role: 'IT_ADMIN', status: 'ACTIVE' }
        ];

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        for (const demoUser of demoUsers) {
            const [user, created] = await User.findOrCreate({
                where: { email: demoUser.email },
                defaults: {
                    ...demoUser,
                    password: hashedPassword,
                    isVerified: true,
                    userId: 'DEMO_' + demoUser.role
                }
            });

            if (!created) {
                // Force reset password and status if it already exists
                user.password = hashedPassword;
                user.status = demoUser.status;
                user.isVerified = true;
                await user.save();
                console.log(`Reset existing demo user: ${demoUser.email}`);
            } else {
                console.log(`Created new demo user: ${demoUser.email}`);
            }
        }
        
        console.log('Demo users correctly restored with password: password123');
        process.exit(0);
    } catch (error) {
        console.error('Error restoring demo users:', error);
        process.exit(1);
    }
}

restoreDemoUsers();
