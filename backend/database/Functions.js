const ConnectMongo = require("./ConnectMongo");
const { ObjectId } = require("mongodb"); // Import ObjectId for proper ID handling

// Fetch all gift documents, sorted by the most recent (_id descending)
const fetchGifts = async () => {
    try {
        const client = await ConnectMongo();
        const db = client.db("zora-gift");
        const collection = db.collection("gifts");

        // Retrieve all gifts, sorted by _id (newest first)
        const giftsCursor = collection.find().sort({ _id: -1 });
        const giftsArray = await giftsCursor.toArray();

        console.log("Fetched Gifts:", giftsArray.length > 0 ? giftsArray[0] : "No gifts found");
        await client.close();
        return giftsArray;
    } catch (error) {
        console.error("Error in fetchGifts: ", error);
        throw error; // Re-throw error for proper handling in higher-level functions
    }
};

// Fetch a specific gift document by its ObjectId or tokenId
const fetchGiftDetailsFromId = async (tokenId) => {
    try {
        const client = await ConnectMongo();
        const db = client.db("zora-gift");
        const collection = db.collection("gifts");

        // Search for the gift by tokenId
        const data = await collection.findOne({ tokenId: tokenId });

        if (!data) {
            console.error("No gift found with the specified tokenId:", tokenId);
        }

        console.log("Fetched Gift by tokenId: ", data);
        await client.close();
        return data;
    } catch (error) {
        console.error("Error in fetchGiftDetailsFromId: ", error);
        throw error;
    }
};

// Insert or store new gift details
const storeGiftDetails = async (giftData) => {
    try {
        const client = await ConnectMongo();
        const db = client.db("zora-gift");
        const collection = db.collection("gifts");

        // Insert a new gift document
        const result = await collection.insertOne(giftData);
        console.log("Inserted Gift Document:", result.insertedId);

        await client.close();
        return result.insertedId;
    } catch (error) {
        x
        console.error("Error in storeGiftDetails: ", error);
        throw error;
    }
};


// Update existing gift details by tokenId
const storeUpdatedGiftDetails = async (tokenId, updatedData) => {
    try {
        const client = await ConnectMongo();
        const db = client.db("zora-gift");
        const collection = db.collection("gifts");

        // Find the existing gift by tokenId
        const existingGift = await collection.findOne({ tokenId: tokenId });
        if (!existingGift) {
            console.error("No gift found with the specified tokenId:", tokenId);
            throw new Error("Gift not found.");
        }

        // Update the amount
        const newAmount =
            parseFloat(existingGift.amount || "0") +
            parseFloat(updatedData.amount || "0");

        // Append to createdBy if the address is not already present
        const updatedCreatedBy = existingGift.createdBy || [];
        if (!updatedCreatedBy.includes(updatedData.createdBy)) {
            updatedCreatedBy.push(updatedData.createdBy);
        }

        // Update the document in the database
        const result = await collection.updateOne(
            { tokenId: tokenId },
            {
                $set: {
                    amount: newAmount.toString(),
                    createdBy: updatedCreatedBy,
                },
            }
        );

        console.log("Updated Gift Document:", result.modifiedCount);
        if (result.modifiedCount === 0) {
            console.warn("No document updated. Verify tokenId:", tokenId);
        }

        await client.close();
        return result.modifiedCount;
    } catch (error) {
        console.error("Error in storeUpdatedGiftDetails: ", error);
        throw error;
    }
};


const fetchGiftsByCategory = async (category) => {
    try {
        const client = await ConnectMongo();
        const db = client.db("zora-gift");
        const collection = db.collection("gifts");

        // Find gifts matching the category
        const giftsArray = await collection.find({ occasionType: category }).toArray(); // Corrected key name
        console.log(`Fetched Gifts for category '${category}':`, giftsArray.length);

        await client.close();
        return giftsArray;
    } catch (error) {
        console.error("Error in fetchGiftsByCategory: ", error);
        throw error; // Re-throw the error for proper upstream handling
    }
};


module.exports = {
    fetchGifts,
    fetchGiftDetailsFromId,
    storeGiftDetails,
    storeUpdatedGiftDetails,
    fetchGiftsByCategory,
};
