const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
    try {
        const collection = mongoose.connection.db.collection('tokens');
        const collTokens = await collection.find({}).toArray();
        console.log(`Found ${collTokens.length} total tokens in the DB.`);
        const badTokens = collTokens.filter(t => {
            return t.service && typeof t.service !== 'object';
        });
        const badTokens2 = collTokens.filter(t => {
            // Any service that does not look like an ObjectId
            const s = t.service ? t.service.toString() : '';
            return s && !(/^[0-9a-fA-F]{24}$/.test(s));
        });
        console.log(`Bad tokens (typeof not object): ${badTokens.length}`);
        console.log(`Bad tokens (regex fail): ${badTokens2.length}`);
        if (badTokens2.length > 0) {
            console.log("Here is one of the corrupted tokens:");
            console.log(JSON.stringify(badTokens2[0], null, 2));
        }

        // Just blindly try to delete EVERYTHING that's not an ObjectId using native driver
        const delRes = await collection.deleteMany({ service: { $not: { $type: "objectId" } } });
        console.log(`Native deleteMany($not {$type: "objectId"}) removed: ${delRes.deletedCount}`);

    } catch (e) { console.error(e); } finally { process.exit(); }
});
