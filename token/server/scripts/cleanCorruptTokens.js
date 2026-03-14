const mongoose = require('mongoose');
const Token = require('../models/Token');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
    try {
        const result = await Token.deleteMany({
            service: { $not: { $type: 'objectId' } }
        });
        console.log(`Deleted ${result.deletedCount} corrupted tokens`);
    } catch (error) {
        console.error('Error cleaning up tokens:', error);
    } finally {
        process.exit();
    }
});
