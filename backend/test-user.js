require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcrypt');

async function createTestUser() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.DB_CONNECT);
        console.log('Connected to MongoDB');

        // Check if test user already exists
        const existingUser = await User.findOne({ email: 'test@example.com' });
        if (existingUser) {
            console.log('Test user already exists');
            return existingUser;
        }

        // Create test user
        const hashedPassword = await bcrypt.hash('test123', 10);
        const testUser = new User({
            username: 'testuser',
            email: 'test@example.com',
            password: hashedPassword,
            fullname: {
                firstname: 'Test',
                lastname: 'User'
            },
            points: 100,
            rank: 1
        });

        await testUser.save();
        console.log('Test user created successfully:', testUser);
        return testUser;
    } catch (error) {
        console.error('Error creating test user:', error);
        throw error;
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

// Run the function
createTestUser(); 