import { API_CONFIG } from './src/utils/constants.js';

console.log("Service Worker Initialized");

chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed");
  chrome.contextMenus.create({
    id: "crispAI",
    title: "Crisp AI Actions",
    contexts: ["selection"]
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'AI_REQUEST') {
    handleAIRequest(request.action, request.text)
      .then(response => sendResponse({ success: true, response }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
});

const handleAIRequest = async (action, text) => {
  let controller = null;
  
  try {
    controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

    const response = await fetch(API_CONFIG.ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, text }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "API request failed");
    }

    return await response.json();

  } catch (error) {
    console.error("Background Error:", error);
    throw error;
  } finally {
    controller?.abort();
  }
  
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "crispAI" && info.selectionText) {
    chrome.tabs.sendMessage(tab.id, {
      type: "SHOW_ACTION_MENU",
      text: info.selectionText
    });
  }
});
