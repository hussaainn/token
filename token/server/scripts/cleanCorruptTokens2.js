const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
    try {
        // Access native MongoDB driver collection to bypass Mongoose schema casting!
        const collection = mongoose.connection.db.collection('tokens');

        console.log('Scanning for corrupted tokens...');

        const countString = await collection.countDocuments({ service: { $type: "string" } });
        console.log(`Found ${countString} tokens where service is a string.`);

        const result1 = await collection.deleteMany({ service: { $type: "string" } });
        console.log(`Deleted ${result1.deletedCount} tokens where service is a string.`);

        // Any other non-ObjectId malformed structures fallback
        const collTokens = await collection.find({}).toArray();
        let deletedRegexCount = 0;

        for (const t of collTokens) {
            if (t.service && typeof t.service === 'string' && !(/^[0-9a-fA-F]{24}$/.test(t.service))) {
                await collection.deleteOne({ _id: t._id });
                deletedRegexCount++;
            }
        }

        console.log(`Deleted ${deletedRegexCount} tokens via manual string layout fallback.`);
    } catch (error) {
        console.error('Error cleaning up tokens:', error);
    } finally {
        process.exit();
    }
});
