export const API_CONFIG = {
    ENDPOINT: "http://localhost:8000/api/mistral", // Centralized API URL
    TIMEOUT: 15000, // 15-second timeout
    ALLOWED_ACTIONS: new Set(["summarize", "explain", "expand"]), // Valid actions
    MAX_TEXT_LENGTH: 10000 // Max allowed text length
};