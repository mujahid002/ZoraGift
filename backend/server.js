require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const ConnectMongo = require("./database/ConnectMongo.js");

// Import MongoDB functions
const {
    fetchGifts,
    fetchGiftDetailsFromId,
    storeGiftDetails,
    storeUpdatedGiftDetails,
    fetchGiftsByCategory,
} = require("./database/Functions.js");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Routes
app.get("/", (req, res) => {
    res.send("Hello, I am running on port 5555!");
});

// API to fetch all gifts
app.get("/gifts", async (req, res) => {
    try {
        const gifts = await fetchGifts();
        res.status(200).json(gifts);
    } catch (error) {
        console.error("Error fetching gifts:", error);
        res.status(500).json({ error: "Error fetching gifts." });
    }
});

// API to fetch a gift by tokenId
app.get("/gifts/:tokenId", async (req, res) => {
    const { tokenId } = req.params;
    try {
        const gift = await fetchGiftDetailsFromId(tokenId);
        if (gift) {
            res.status(200).json(gift);
        } else {
            res.status(404).json({ error: "Gift not found." });
        }
    } catch (error) {
        console.error(`Error fetching gift with tokenId ${tokenId}:`, error);
        res.status(500).json({ error: "Error fetching gift." });
    }
});

// API to fetch gifts by category
app.get("/gifts/category/:category", async (req, res) => {
    const { category } = req.params;
    try {
        const gifts = await fetchGiftsByCategory(category);
        res.status(200).json(gifts);
    } catch (error) {
        console.error(`Error fetching gifts for category ${category}:`, error);
        res.status(500).json({ error: "Error fetching gifts by category." });
    }
});

// API to add a new gift
app.post("/store-gift", async (req, res) => {
    const giftData = req.body;
    try {
        const insertedId = await storeGiftDetails(giftData);
        res.status(201).json({ message: "Gift added successfully.", id: insertedId });
    } catch (error) {
        console.error("Error adding gift:", error);
        res.status(500).json({ error: "Error adding gift." });
    }
});

// API to update an existing gift by tokenId
app.put("/gifts/:tokenId", async (req, res) => {
    const { tokenId } = req.params;
    const updatedData = req.body; // Expect `amount` and `createdBy` in the body

    try {
        const modifiedCount = await storeUpdatedGiftDetails(tokenId, updatedData);
        if (modifiedCount > 0) {
            res.status(200).json({ message: "Gift updated successfully." });
        } else {
            res.status(404).json({ error: "Gift not found or no changes made." });
        }
    } catch (error) {
        console.error(`Error updating gift with tokenId ${tokenId}:`, error);
        res.status(500).json({ error: "Error updating gift." });
    }
});


// Start the server and listen on port 5555
app.listen(5555, () => {
    console.log("App listening on port 5555");
    // ConnectMongo();
});
