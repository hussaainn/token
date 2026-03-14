const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
    try {
        const collection = mongoose.connection.db.collection('tokens');
        const collTokens = await collection.find({}).toArray();
        let logs = [];
        for (const t of collTokens) {
            if (t.service && t.service.toString && !(/^[0-9a-fA-F]{24}$/.test(t.service.toString()))) {
                logs.push(`ID: ${t._id} | Service: ${t.service} | Type: ${typeof t.service}`);
            } else if (!t.service) {
                logs.push(`ID: ${t._id} | Service: ${t.service} (NULL/UNDEFINED)`);
            }
        }
        fs.writeFileSync('scripts/bad_tokens.json', JSON.stringify(logs, null, 2), 'utf8');
        console.log('done');
    } catch (e) { console.error(e); } finally { process.exit(); }
});
