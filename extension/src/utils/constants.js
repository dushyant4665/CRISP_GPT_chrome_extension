export const API_CONFIG = {
    ENDPOINT: "http://localhost:8000/api/mistral",
    TIMEOUT: 15000, 
    ALLOWED_ACTIONS: new Set(["summarize", "explain", "expand"]), 
    MAX_TEXT_LENGTH: 10000 
};
