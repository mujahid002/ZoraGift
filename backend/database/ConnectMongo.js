require("dotenv").config(); // Load environment variables
const { MongoClient, ServerApiVersion } = require("mongodb");

const uri = process.env.MONGO_URL;
if (!uri) {
    throw new Error("MONGO_URL environment variable is not defined");
}

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

async function ConnectMongo() {
    try {
        await client.connect();
        await client.db("zora-gift").command({ ping: 1 });
        console.log("Pinged your deployment. Successfully connected to MongoDB!");
        return client;
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
        throw err;
    }
}

module.exports = ConnectMongo;
