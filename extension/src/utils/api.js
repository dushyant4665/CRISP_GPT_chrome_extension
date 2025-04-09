export const apiRequest = async (action, text) => {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        const response = await fetch(`http://localhost:8000/api/mistral`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Action": action 
            },
            body: JSON.stringify({ 
                text,
                action 
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "API request failed");
        }

        const data = await response.json();
        return data.response || data.explanation;
    } catch (error) {
        console.error("API Error:", error);
        return error.name === "AbortError" 
            ? "⏳ Request timed out - try again!" 
            : "❌ Error: " + error.message;
    }
};
