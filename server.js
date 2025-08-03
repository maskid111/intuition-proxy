const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
const PORT = process.env.PORT || 3000;

// Enhanced CORS configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// GraphQL proxy endpoint
app.post("/claim-proxy", async (req, res) => {
  try {
    // Validate request
    if (!req.body || !req.body.query) {
      return res.status(400).json({ 
        errors: [{ message: "Invalid request format" }] 
      });
    }

    // Forward to Intuition API
    const apiResponse = await fetch("https://prod.base-mainnet-v-1-0.intuition.sh/v1/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Add any required authentication headers here
        // "x-hasura-admin-secret": process.env.HASURA_SECRET
      },
      body: JSON.stringify(req.body)
    });

    const result = await apiResponse.json();

    if (!apiResponse.ok) {
      console.error("API Error:", result);
      return res.status(apiResponse.status).json(result);
    }

    res.json(result);

  } catch (error) {
    console.error("Proxy Error:", error);
    res.status(500).json({ 
      errors: [{ message: "Internal server error" }] 
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res.status(500).json({ 
    errors: [{ message: "Something went wrong" }] 
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
