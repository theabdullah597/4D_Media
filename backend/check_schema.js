const db = require('./database/db');

async function checkSchema() {
    try {
        await db.initializeDatabase();
        const schema = await db.all("PRAGMA table_info(order_items)");
        console.table(schema);
    } catch (error) {
        console.error('Error:', error);
    }
}

checkSchema();
