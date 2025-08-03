const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 4000;

// Allow requests from any origin
app.use(cors());

// Parse incoming JSON
app.use(express.json());

// Main route to handle API proxying
app.post("/claim-proxy", async (req, res) => {
  try {
    const response = await fetch("https://prod.base-mainnet-v-1-0.intuition.sh/v1/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Proxy error:", error);
    res.status(500).json({ error: "Proxy request failed." });
  }
});

// Optional home route
app.get("/", (req, res) => {
  res.send("Intuition Proxy is running.");
});

// Start server
app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
