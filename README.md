# 🧙‍♂️ Backend Wizards - Stage 1: String Analyzer Service

A RESTful API service that analyzes strings, computes various properties, stores them, and provides powerful filtering capabilities including natural language queries.

[![Node.js](https://img.shields.io/badge/Node.js-v14+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18-blue.svg)](https://expressjs.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Deployment](#deployment)
- [Examples](#examples)

## 🎯 Overview

This API analyzes strings and computes the following properties:
- **Length**: Number of characters
- **Palindrome Detection**: Case-insensitive palindrome check
- **Unique Characters**: Count of distinct characters
- **Word Count**: Number of words separated by whitespace
- **SHA-256 Hash**: Unique identifier for each string
- **Character Frequency**: Map of character occurrences

## ✨ Features

- ✅ **CRUD Operations** - Create, Read, Update, Delete strings
- ✅ **Advanced Filtering** - Filter by palindrome, length, word count, character
- ✅ **Natural Language Queries** - Use plain English to filter strings
- ✅ **Duplicate Prevention** - SHA-256 hash-based uniqueness
- ✅ **Comprehensive Error Handling** - Proper HTTP status codes
- ✅ **Input Validation** - Type checking and data validation
- ✅ **RESTful Design** - Follows REST principles

## 🛠️ Tech Stack

- **Runtime:** Node.js (v14.0.0+)
- **Framework:** Express.js 4.18
- **Hashing:** Node.js Crypto module (SHA-256)
- **Storage:** In-memory (Map) - easily replaceable with MongoDB/PostgreSQL
- **Middleware:** CORS

## 📦 Prerequisites

- **Node.js** (v14.0.0 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** - [Download](https://git-scm.com/)

## 🚀 Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/backend-wizards-stage1.git
cd backend-wizards-stage1
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Environment (Optional)

```bash
cp .env.example .env
```

Edit `.env`:
```env
PORT=3000
```

### Step 4: Start the Server

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

## 📡 API Documentation

### Base URL
```
http://localhost:3000
```

---

### 1. Create/Analyze String

**Endpoint:** `POST /strings`

**Request Body:**
```json
{
  "value": "racecar"
}
```

**Success Response:** `201 Created`
```json
{
  "id": "abc123def456...",
  "value": "racecar",
  "properties": {
    "length": 7,
    "is_palindrome": true,
    "unique_characters": 4,
    "word_count": 1,
    "sha256_hash": "abc123def456...",
    "character_frequency_map": {
      "r": 2,
      "a": 2,
      "c": 2,
      "e": 1
    }
  },
  "created_at": "2025-10-19T12:34:56.789Z"
}
```

**Error Responses:**
- `400 Bad Request` - Missing "value" field
- `409 Conflict` - String already exists
- `422 Unprocessable Entity` - Invalid data type

---

### 2. Get Specific String

**Endpoint:** `GET /strings/:string_value`

**Example:** `GET /strings/racecar`

**Success Response:** `200 OK`
```json
{
  "id": "abc123def456...",
  "value": "racecar",
  "properties": { /* ... */ },
  "created_at": "2025-10-19T12:34:56.789Z"
}
```

**Error Response:**
- `404 Not Found` - String does not exist

---

### 3. Get All Strings with Filtering

**Endpoint:** `GET /strings`

**Query Parameters:**
- `is_palindrome` - boolean (true/false)
- `min_length` - integer (minimum length)
- `max_length` - integer (maximum length)
- `word_count` - integer (exact word count)
- `contains_character` - string (single character)

**Examples:**

```bash
# Get all palindromes
GET /strings?is_palindrome=true

# Get strings with 2 words
GET /strings?word_count=2

# Get strings longer than 10 characters
GET /strings?min_length=11

# Get strings containing 'a'
GET /strings?contains_character=a

# Combine filters
GET /strings?is_palindrome=true&min_length=5&max_length=20
```

**Success Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "hash1",
      "value": "racecar",
      "properties": { /* ... */ },
      "created_at": "2025-10-19T12:34:56.789Z"
    }
  ],
  "count": 1,
  "filters_applied": {
    "is_palindrome": true,
    "min_length": 5,
    "max_length": 20
  }
}
```

**Error Response:**
- `400 Bad Request` - Invalid query parameter

---

### 4. Natural Language Filtering

**Endpoint:** `GET /strings/filter-by-natural-language`

**Query Parameter:** `query` (URL-encoded string)

**Supported Queries:**

| Query | Parsed Filters |
|-------|----------------|
| "all single word palindromic strings" | `word_count=1`, `is_palindrome=true` |
| "strings longer than 10 characters" | `min_length=11` |
| "strings containing the letter z" | `contains_character=z` |
| "palindromic strings that contain the first vowel" | `is_palindrome=true`, `contains_character=a` |

**Example:**

```bash
GET /strings/filter-by-natural-language?query=all%20single%20word%20palindromic%20strings
```

**Success Response:** `200 OK`
```json
{
  "data": [ /* matching strings */ ],
  "count": 3,
  "interpreted_query": {
    "original": "all single word palindromic strings",
    "parsed_filters": {
      "word_count": 1,
      "is_palindrome": true
    }
  }
}
```

**Error Responses:**
- `400 Bad Request` - Missing query or unable to parse
- `422 Unprocessable Entity` - Conflicting filters

---

### 5. Delete String

**Endpoint:** `DELETE /strings/:string_value`

**Example:** `DELETE /strings/racecar`

**Success Response:** `204 No Content`

**Error Response:**
- `404 Not Found` - String does not exist

---

### Health Check

**Endpoint:** `GET /health`

**Response:** `200 OK`
```json
{
  "status": "healthy",
  "timestamp": "2025-10-19T12:34:56.789Z",
  "strings_count": 42
}
```

## 🧪 Testing

### Run Automated Tests

```bash
npm test
```

The test suite covers:
- ✅ String creation and validation
- ✅ Duplicate detection (409)
- ✅ Missing field validation (400)
- ✅ Invalid data type (422)
- ✅ String retrieval
- ✅ Non-existent string (404)
- ✅ Filtering by multiple criteria
- ✅ Natural language parsing
- ✅ String deletion

### Manual Testing with cURL

**Create a string:**
```bash
curl -X POST http://localhost:3000/strings \
  -H "Content-Type: application/json" \
  -d '{"value": "racecar"}'
```

**Get a string:**
```bash
curl http://localhost:3000/strings/racecar
```

**Filter strings:**
```bash
curl "http://localhost:3000/strings?is_palindrome=true&word_count=1"
```

**Natural language query:**
```bash
curl "http://localhost:3000/strings/filter-by-natural-language?query=all%20palindromic%20strings"
```

**Delete a string:**
```bash
curl -X DELETE http://localhost:3000/strings/racecar
```

## 🚢 Deployment

### Supported Platforms

**Note:** Vercel and Render are not allowed.

#### Option 1: Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

#### Option 2: Heroku

```bash
heroku create your-app-name
git push heroku main
```

#### Option 3: AWS (EC2)

1. Launch EC2 instance
2. Install Node.js
3. Clone repository
4. Use PM2 for process management

```bash
npm install -g pm2
pm2 start server.js --name string-analyzer
pm2 startup
pm2 save
```

#### Option 4: DigitalOcean App Platform

1. Connect GitHub repository
2. Configure build settings
3. Deploy from dashboard

### Deployment Checklist

- [ ] Server accessible from internet
- [ ] Health check endpoint working
- [ ] CORS configured properly
- [ ] All endpoints tested
- [ ] Error logging enabled

## 📝 Examples

### Example 1: Analyze a Palindrome

**Request:**
```bash
POST /strings
{
  "value": "A man a plan a canal Panama"
}
```

**Response:**
```json
{
  "id": "hash...",
  "value": "A man a plan a canal Panama",
  "properties": {
    "length": 30,
    "is_palindrome": true,
    "unique_characters": 11,
    "word_count": 6,
    "sha256_hash": "hash...",
    "character_frequency_map": {
      "A": 2,
      " ": 5,
      "m": 2,
      "a": 10,
      "n": 3,
      "p": 2,
      "l": 2,
      "c": 1,
      "P": 1
    }
  },
  "created_at": "2025-10-19T12:34:56.789Z"
}
```

### Example 2: Filter by Multiple Criteria

**Request:**
```bash
GET /strings?is_palindrome=true&min_length=5&word_count=1
```

**Response:**
```json
{
  "data": [
    {
      "id": "hash1",
      "value": "racecar",
      "properties": { /* ... */ },
      "created_at": "2025-10-19T12:00:00.000Z"
    },
    {
      "id": "hash2",
      "value": "level",
      "properties": { /* ... */ },
      "created_at": "2025-10-19T12:05:00.000Z"
    }
  ],
  "count": 2,
  "filters_applied": {
    "is_palindrome": true,
    "min_length": 5,
    "word_count": 1
  }
}
```

### Example 3: Natural Language Query

**Request:**
```bash
GET /strings/filter-by-natural-language?query=strings longer than 10 characters
```

**Response:**
```json
{
  "data": [ /* strings with length > 10 */ ],
  "count": 5,
  "interpreted_query": {
    "original": "strings longer than 10 characters",
    "parsed_filters": {
      "min_length": 11
    }
  }
}
```

## 🔧 Advanced Features

### Palindrome Detection Logic

The palindrome checker:
- Converts to lowercase
- Removes spaces and punctuation
- Checks if string equals its reverse

```javascript
const cleanStr = value.toLowerCase().replace(/[^a-z0-9]/g, '');
const is_palindrome = cleanStr === cleanStr.split('').reverse().join('');
```

### Natural Language Parser

Supports patterns like:
- "single word" → `word_count=1`
- "longer than X" → `min_length=X+1`
- "containing the letter X" → `contains_character=X`
- "palindrome/palindromic" → `is_palindrome=true`

### Character Frequency Map

Tracks every character including spaces:
```json
{
  "h": 1,
  "e": 1,
  "l": 2,
  "o": 1,
  " ": 1,
  "w": 1,
  "r": 1,
  "d": 1
}
```

## 📁 Project Structure

```
backend-wizards-stage1/
├── server.js          # Main application
├── test.js            # Test suite
├── package.json       # Dependencies
├── .env.example       # Environment template
├── .gitignore        # Git ignore rules
└── README.md         # Documentation
```

## 🛡️ Error Handling

All endpoints return appropriate HTTP status codes:

- `200 OK` - Successful GET request
- `201 Created` - Successful POST request
- `204 No Content` - Successful DELETE request
- `400 Bad Request` - Invalid input
- `404 Not Found` - Resource not found
- `409 Conflict` - Duplicate resource
- `422 Unprocessable Entity` - Invalid data type
- `500 Internal Server Error` - Server error

## 🎯 API Design Principles

- ✅ RESTful conventions
- ✅ Proper HTTP methods and status codes
- ✅ Consistent JSON response structure
- ✅ Comprehensive error messages
- ✅ Input validation
- ✅ Idempotent operations where appropriate

## 👤 Author

**Your Name**
- Email: your.email@example.com
- GitHub: [@yourusername](https://github.com/yourusername)

## 📄 License

MIT License

## 🙏 Acknowledgments

Backend Wizards Program - Stage 1 Challenge

---

**Built with ❤️ for Backend Wizards Stage 1**