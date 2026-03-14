const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
    try {
        const collection = mongoose.connection.db.collection('tokens');
        const collTokens = await collection.find({}).toArray();

        console.log(`Scanning ${collTokens.length} total tokens...`);
        for (const t of collTokens) {
            console.log(`ID: ${t._id} | Service: ${t.service} | Type: ${typeof t.service} | IsObjectId: ${t.service instanceof mongoose.Types.ObjectId}`);

            // Check if stringified version looks like a date
            if (t.service && t.service.toString().includes('GMT')) {
                console.log(`>>> SUSPICIOUS TOKEN FOUND: ${t._id}`);
                console.log('Document:', JSON.stringify(t, null, 2));
            }
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
});
