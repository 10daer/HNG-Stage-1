const crypto = require("crypto");

// Helper: Compute SHA-256 hash
function computeHash(str) {
  return crypto.createHash("sha256").update(str).digest("hex");
}

// Helper: Analyze string properties
function analyzeString(value) {
  // Length
  const length = value.length;

  // Is palindrome (case-insensitive, ignore spaces and punctuation)
  const cleanStr = value.toLowerCase().replace(/[^a-z0-9]/g, "");
  const is_palindrome = cleanStr === cleanStr.split("").reverse().join("");

  // Unique characters
  const unique_characters = new Set(value).size;

  // Word count
  const word_count = value
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;

  // SHA-256 hash
  const sha256_hash = computeHash(value);

  // Character frequency map
  const character_frequency_map = {};
  for (const char of value) {
    character_frequency_map[char] = (character_frequency_map[char] || 0) + 1;
  }

  return {
    length,
    is_palindrome,
    unique_characters,
    word_count,
    sha256_hash,
    character_frequency_map,
  };
}

// Helper: Parse natural language query
function parseNaturalLanguage(query) {
  const filters = {};
  const lowerQuery = query.toLowerCase();

  // Palindrome detection
  if (lowerQuery.includes("palindrome") || lowerQuery.includes("palindromic")) {
    filters.is_palindrome = true;
  }

  // Word count detection
  if (lowerQuery.includes("single word")) {
    filters.word_count = 1;
  } else if (lowerQuery.includes("two word") || lowerQuery.includes("2 word")) {
    filters.word_count = 2;
  } else if (
    lowerQuery.includes("three word") ||
    lowerQuery.includes("3 word")
  ) {
    filters.word_count = 3;
  }

  // Length detection
  const longerThanMatch = lowerQuery.match(/longer than (\d+)/);
  if (longerThanMatch) {
    filters.min_length = parseInt(longerThanMatch[1]) + 1;
  }

  const shorterThanMatch = lowerQuery.match(/shorter than (\d+)/);
  if (shorterThanMatch) {
    filters.max_length = parseInt(shorterThanMatch[1]) - 1;
  }

  // Character containment
  const containsMatch = lowerQuery.match(
    /contain(?:s|ing)? (?:the letter |the character )?([a-z])/
  );
  if (containsMatch) {
    filters.contains_character = containsMatch[1];
  }

  // Vowel detection
  if (lowerQuery.includes("first vowel")) {
    filters.contains_character = "a";
  } else if (lowerQuery.includes("second vowel")) {
    filters.contains_character = "e";
  }

  return filters;
}

// Helper: Apply filters to strings
function applyFilters(strings, filters) {
  return strings.filter((item) => {
    const { properties, value } = item;

    // is_palindrome filter
    if (filters.is_palindrome !== undefined) {
      if (properties.is_palindrome !== filters.is_palindrome) return false;
    }

    // min_length filter
    if (filters.min_length !== undefined) {
      if (properties.length < filters.min_length) return false;
    }

    // max_length filter
    if (filters.max_length !== undefined) {
      if (properties.length > filters.max_length) return false;
    }

    // word_count filter
    if (filters.word_count !== undefined) {
      if (properties.word_count !== filters.word_count) return false;
    }

    // contains_character filter
    if (filters.contains_character !== undefined) {
      if (
        !value.toLowerCase().includes(filters.contains_character.toLowerCase())
      )
        return false;
    }

    return true;
  });
}

module.exports = {
  analyzeString,
  applyFilters,
  computeHash,
  parseNaturalLanguage,
};
