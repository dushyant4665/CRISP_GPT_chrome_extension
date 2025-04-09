import { API_CONFIG } from './src/utils/constants.js';

document.addEventListener("DOMContentLoaded", () => {
    const userInput = document.getElementById("userInput");
    const output = document.getElementById("output");
    const charCounter = document.querySelector(".character-counter");
    const copyBtn = document.querySelector(".copy-btn");
    const loadingIndicator = document.querySelector(".loading-indicator");
    const actionBtns = document.querySelectorAll(".btn");

    const API_URL = API_CONFIG.ENDPOINT;
    const MAX_CHARS = API_CONFIG.MAX_CHARS;
    let currentController = null;
    let isProcessing = false;
 
    console.log("Service Worker Loaded");

chrome.runtime.onInstalled.addListener(() => {
    console.log("Extension installed");
});
    const updateCharCounter = () => {
        const len = userInput.value.length;
        charCounter.textContent = `${len}/${MAX_CHARS}`;
        charCounter.style.color = len > MAX_CHARS ? "#F87171" : "#A1A1AA";
    };

    const toggleLoading = (state) => {
        isProcessing = state;
        loadingIndicator.classList.toggle("hidden", !state);
        if (state) {
            output.textContent = "⏳ Loading...";
        }
        actionBtns.forEach(btn => btn.disabled = state);
    };

    const showError = (msg) => {
        output.innerHTML = `<div class="error-message">${msg}</div>`;
    };

    const validateText = (text) => {
        if (!text.trim()) {
            showError("⚠️ Please enter or select text.");
            return false;
        }
        if (text.length > MAX_CHARS) {
            showError(`❌ Limit exceeded: ${MAX_CHARS} characters`);
            return false;
        }
        return true;
    };

    const handleAIRequest = async (action, text) => {
        if (currentController) {
            console.log("Aborting previous request...");
            currentController.abort();
        }
        const controller = new AbortController();
        currentController = controller;

        toggleLoading(true);

        try {
            const res = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: action,
                    text: text // Raw text
                }),
                signal: controller.signal
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(data.error || "API request failed");
            }

            output.textContent = `✅ Response: ${data.response}`;

        } catch (err) {
            console.error("Error in handleAIRequest:", err);
            showError(`❌ Failed: ${err.message}`);
        } finally {
            toggleLoading(false);
            currentController = null;
        }
    };

    copyBtn.addEventListener("click", async () => {
        try {
            await navigator.clipboard.writeText(output.textContent);
            showTempMessage("✅ Copied to clipboard!", 2000);
        } catch {
            showError("❌ Copy failed");
        }
    });

    actionBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            if (isProcessing) return;
            const text = userInput.value.trim();
            if (!validateText(text)) return;
            handleAIRequest(btn.dataset.action, text);
        });
    });

    userInput.addEventListener("input", updateCharCounter);
    updateCharCounter();
});

function showTempMessage(msg, duration = 2000) {
    const note = document.createElement("div");
    note.textContent = msg;
    Object.assign(note.style, {
        position: "fixed",
        bottom: "80px",
        right: "20px",
        background: "#4ade80",
        color: "#000",
        padding: "10px 16px",
        borderRadius: "6px",
        zIndex: 10000,
        fontWeight: "bold",
        fontSize: "13px"
    });
    document.body.appendChild(note);
    setTimeout(() => note.remove(), duration);
}