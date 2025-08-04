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
  res.status(200).json({ 
    status: "ok", 
    message: "Intuition Proxy Service is running",
    timestamp: new Date().toISOString() 
  });
});

// GraphQL proxy endpoint
app.post("/claim-proxy", async (req, res) => {
  try {
    // Validate request
    if (!req.body || !req.body.query) {
      return res.status(400).json({ 
        errors: [{ 
          message: "Invalid request format - missing query" 
        }] 
      });
    }

    // Prepare headers (add authentication if needed)
    const headers = {
      "Content-Type": "application/json",
      // "x-hasura-admin-secret": process.env.HASURA_SECRET
    };

    // Forward to Intuition API
    const apiResponse = await fetch("https://prod.base-mainnet-v-1-0.intuition.sh/v1/graphql", {
      method: "POST",
      headers,
      body: JSON.stringify(req.body)
    });

    const result = await apiResponse.json();

    // Handle GraphQL errors
    if (result.errors) {
      console.error("GraphQL Errors:", result.errors);
      return res.status(400).json(result);
    }

    // Handle HTTP errors
    if (!apiResponse.ok) {
      return res.status(apiResponse.status).json({
        errors: [{
          message: `API responded with ${apiResponse.status}`,
          details: result
        }]
      });
    }

    // Successful response
    res.json(result);

  } catch (error) {
    console.error("Proxy Error:", error);
    res.status(500).json({ 
      errors: [{ 
        message: "Internal server error",
        details: error.message 
      }] 
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    errors: [{ message: "Endpoint not found" }] 
  });
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
  console.log(`Health check at http://localhost:${PORT}/health`);
});
