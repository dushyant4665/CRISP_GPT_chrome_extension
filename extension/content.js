// Add at the top
import { API_CONFIG } from "./src/utils/constants";
const API_URL = API_CONFIG.ENDPOINT;
// Modified sendToAI function
async function sendToAI(text) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

  try {
    const response = await fetch(API_CONFIG.ENDPOINT, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "X-Action": "explain" // Default action
      },
      body: JSON.stringify({
        model: "mistral",
        prompt: `explain: ${text}`,
        stream: false
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "API request failed");
    }

    const data = await response.json();
    showPopup(data.response || data.explanation);
  } catch (error) {
    console.error("API Error:", error);
    showPopup(error.name === "AbortError" 
      ? "⌛ Request timed out. Please try again!" 
      : "❌ Error: " + error.message);
  }
}

// Modified showPopup with better styling
function showPopup(responseText) {
  const popup = document.createElement("div");
  popup.innerHTML = `
    <div class="popup-header">
      <span>🤖 AI Response</span>
      <button class="close-btn">×</button>
    </div>
    <div class="popup-content">${responseText}</div>
  `;
  
  // Add styling classes
  popup.className = "crisp-popup";
  popup.querySelector(".close-btn").addEventListener("click", () => popup.remove());
  
  document.body.appendChild(popup);
  setTimeout(() => popup.remove(), 7000);
}

document.addEventListener("mouseup", () => {
  const selectedText = window.getSelection().toString().trim();
  if (selectedText.length > 0) {
    showFloatingButton(selectedText);
  } else {
    removeFloatingButton();
  }
});

let aiButton;

function showFloatingButton(text) {
  removeFloatingButton(); // Remove previous instance

  aiButton = document.createElement("button");
  aiButton.innerText = "🤖 AI";
  aiButton.style.position = "absolute";
  aiButton.style.background = "#007bff";
  aiButton.style.color = "#fff";
  aiButton.style.border = "none";
  aiButton.style.padding = "8px 12px";
  aiButton.style.borderRadius = "5px";
  aiButton.style.cursor = "pointer";
  aiButton.style.fontSize = "14px";
  aiButton.style.boxShadow = "0px 2px 5px rgba(0, 0, 0, 0.3)";

  const { x, y } = getSelectionCoords();
  aiButton.style.left = `${x}px`;
  aiButton.style.top = `${y + 20}px`;

  aiButton.addEventListener("click", () => sendToAI(text));

  document.body.appendChild(aiButton);
}

function removeFloatingButton() {
  if (aiButton) {
    aiButton.remove();
    aiButton = null;
  }
}

function getSelectionCoords() {
  const selection = window.getSelection();
  if (!selection.rangeCount) return { x: 0, y: 0 };

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  return { x: rect.left + window.scrollX, y: rect.bottom + window.scrollY };
}

// Update sendToAI function
function sendToAI(text) {
  // Get selected action from somewhere (need to add UI)
  const action = "explain"; // Temporary default
  
  fetch("http://localhost:8000/api/mistral", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: action, // Add action parameter
      text: text
    }),
  })
  // ... rest unchanged
  .then(response => response.json())
  .then(data => showPopup(data.explanation))
  .catch(error => console.error("Error:", error));
}
 


function showPopup(responseText) {
  const popup = document.createElement("div");
  popup.innerText = responseText;
  popup.style.position = "fixed";
  popup.style.bottom = "20px";
  popup.style.right = "20px";
  popup.style.background = "#333";
  popup.style.color = "#fff";
  popup.style.padding = "15px";
  popup.style.borderRadius = "8px";
  popup.style.boxShadow = "0px 4px 8px rgba(0, 0, 0, 0.2)";
  popup.style.maxWidth = "300px";
  popup.style.zIndex = "10000";

  document.body.appendChild(popup);
  setTimeout(() => popup.remove(), 5000);
}
