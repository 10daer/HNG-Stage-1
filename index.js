const express = require("express");
const cors = require("cors");
const {
  analyzeString,
  applyFilters,
  computeHash,
  parseNaturalLanguage,
} = require("./helper");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// In-memory storage (replace with MongoDB in production)
const stringsDatabase = new Map();

// 1. POST /strings - Create/Analyze String
app.post("/strings", (req, res) => {
  try {
    const { value } = req.body;

    // Validation
    if (!value && value !== "") {
      return res.status(400).json({
        error: "Bad Request",
        message: 'Missing "value" field in request body',
      });
    }

    if (typeof value !== "string") {
      return res.status(422).json({
        error: "Unprocessable Entity",
        message: 'Invalid data type for "value" (must be string)',
      });
    }

    // Analyze string
    const properties = analyzeString(value);
    const id = properties.sha256_hash;

    // Check if string already exists
    if (stringsDatabase.has(id)) {
      return res.status(409).json({
        error: "Conflict",
        message: "String already exists in the system",
      });
    }

    // Store string
    const stringData = {
      id,
      value,
      properties,
      created_at: new Date().toISOString(),
    };

    stringsDatabase.set(id, stringData);

    console.log(`✓ Created string with ID: ${id}`);
    res.status(201).json(stringData);
  } catch (error) {
    console.error("Error in POST /strings:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "An unexpected error occurred",
    });
  }
});

// 2. GET /strings/:string_value - Get Specific String
app.get("/strings/:string_value", (req, res) => {
  try {
    const { string_value } = req.params;
    const hash = computeHash(string_value);

    const stringData = stringsDatabase.get(hash);

    if (!stringData) {
      return res.status(404).json({
        error: "Not Found",
        message: "String does not exist in the system",
      });
    }

    res.status(200).json(stringData);
  } catch (error) {
    console.error("Error in GET /strings/:string_value:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "An unexpected error occurred",
    });
  }
});

// 3. GET /strings - Get All Strings with Filtering
app.get("/strings", (req, res) => {
  try {
    const filters = {};

    // Parse query parameters
    if (req.query.is_palindrome !== undefined) {
      const value = req.query.is_palindrome.toLowerCase();
      if (value !== "true" && value !== "false") {
        return res.status(400).json({
          error: "Bad Request",
          message: "Invalid value for is_palindrome (must be true or false)",
        });
      }
      filters.is_palindrome = value === "true";
    }

    if (req.query.min_length !== undefined) {
      const value = parseInt(req.query.min_length);
      if (isNaN(value) || value < 0) {
        return res.status(400).json({
          error: "Bad Request",
          message:
            "Invalid value for min_length (must be non-negative integer)",
        });
      }
      filters.min_length = value;
    }

    if (req.query.max_length !== undefined) {
      const value = parseInt(req.query.max_length);
      if (isNaN(value) || value < 0) {
        return res.status(400).json({
          error: "Bad Request",
          message:
            "Invalid value for max_length (must be non-negative integer)",
        });
      }
      filters.max_length = value;
    }

    if (req.query.word_count !== undefined) {
      const value = parseInt(req.query.word_count);
      if (isNaN(value) || value < 0) {
        return res.status(400).json({
          error: "Bad Request",
          message:
            "Invalid value for word_count (must be non-negative integer)",
        });
      }
      filters.word_count = value;
    }

    if (req.query.contains_character !== undefined) {
      const value = req.query.contains_character;
      if (typeof value !== "string" || value.length !== 1) {
        return res.status(400).json({
          error: "Bad Request",
          message:
            "Invalid value for contains_character (must be single character)",
        });
      }
      filters.contains_character = value;
    }

    // Get all strings
    const allStrings = Array.from(stringsDatabase.values());

    // Apply filters
    const filteredStrings = applyFilters(allStrings, filters);

    res.status(200).json({
      data: filteredStrings,
      count: filteredStrings.length,
      filters_applied: filters,
    });
  } catch (error) {
    console.error("Error in GET /strings:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "An unexpected error occurred",
    });
  }
});

// 4. GET /strings/filter-by-natural-language - Natural Language Filtering
app.get("/strings/filter-by-natural-language", (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        error: "Bad Request",
        message: 'Missing "query" parameter',
      });
    }

    // Parse natural language
    const parsedFilters = parseNaturalLanguage(query);

    if (Object.keys(parsedFilters).length === 0) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Unable to parse natural language query",
      });
    }

    // Get all strings
    const allStrings = Array.from(stringsDatabase.values());

    // Apply filters
    const filteredStrings = applyFilters(allStrings, parsedFilters);

    res.status(200).json({
      data: filteredStrings,
      count: filteredStrings.length,
      interpreted_query: {
        original: query,
        parsed_filters: parsedFilters,
      },
    });
  } catch (error) {
    console.error("Error in GET /strings/filter-by-natural-language:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "An unexpected error occurred",
    });
  }
});

// 5. DELETE /strings/:string_value - Delete String
app.delete("/strings/:string_value", (req, res) => {
  try {
    const { string_value } = req.params;
    const hash = computeHash(string_value);

    if (!stringsDatabase.has(hash)) {
      return res.status(404).json({
        error: "Not Found",
        message: "String does not exist in the system",
      });
    }

    stringsDatabase.delete(hash);
    console.log(`✓ Deleted string with ID: ${hash}`);

    res.status(204).send();
  } catch (error) {
    console.error("Error in DELETE /strings/:string_value:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "An unexpected error occurred",
    });
  }
});

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    strings_count: stringsDatabase.size,
  });
});

// Root endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Backend Wizards - Stage 1: String Analyzer API",
    endpoints: {
      create: "POST /strings",
      get_one: "GET /strings/:string_value",
      get_all: "GET /strings",
      natural_language: "GET /strings/filter-by-natural-language",
      delete: "DELETE /strings/:string_value",
      health: "GET /health",
    },
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: "Endpoint not found",
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    error: "Internal Server Error",
    message: "An unexpected error occurred",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║  Backend Wizards - Stage 1 API         ║
║  String Analyzer Service               ║
╚════════════════════════════════════════╝
🚀 Server running on port ${PORT}
📍 API Base: http://localhost:${PORT}
🏥 Health check: http://localhost:${PORT}/health
⏰ Started at: ${new Date().toISOString()}
  `);
});
