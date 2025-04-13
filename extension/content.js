// Import your API config
import { API_CONFIG } from './src/utils/constants.js';

let aiButton;
let currentSelection = '';

// Main: Handle selection change
document.addEventListener('selectionchange', () => {
  const selection = window.getSelection().toString().trim();
  if (selection) {
    currentSelection = selection;
    showFloatingButton();
  } else {
    removeFloatingButton();
  }
});

// Show AI floating button
function showFloatingButton() {
  removeFloatingButton();

  aiButton = document.createElement('div');
  aiButton.className = 'crisp-floating-btn';
  aiButton.innerHTML = `
    <button class="ai-trigger">🤖 AI</button>
    <div class="action-menu hidden">
      <button data-action="explain">🔍 Explain</button>
      <button data-action="expand">✨ Expand</button>
      <button data-action="summarize">📋 Summarize</button>
    </div>
  `;

  positionButton();
  document.body.appendChild(aiButton);
  addButtonListeners();
}

// Position AI button near selection
function positionButton() {
  const rect = getSelectionRect();
  aiButton.style.position = 'absolute';
  aiButton.style.left = `${rect.left + window.scrollX}px`;
  aiButton.style.top = `${rect.bottom + window.scrollY + 5}px`;
  aiButton.style.zIndex = 9999;
}

// Button listeners
function addButtonListeners() {
  aiButton.querySelector('.ai-trigger').addEventListener('click', (e) => {
    e.stopPropagation();
    aiButton.querySelector('.action-menu').classList.toggle('hidden');
  });

  aiButton.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      await handleAction(e.target.dataset.action);
    });
  });

  document.addEventListener('click', removeFloatingButton);
}

// Send API request
async function handleAction(action) {
  try {
    showLoading();
    const response = await fetch(API_CONFIG.ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, text: currentSelection })
    });

    const data = await response.json();
    showResultPopup(data.response);
  } catch (error) {
    showErrorPopup(error.message);
  }
}

// Get the selected text bounding box
function getSelectionRect() {
  const selection = window.getSelection();
  if (!selection.rangeCount) return { top: 0, left: 0, bottom: 0 };
  const range = selection.getRangeAt(0);
  return range.getBoundingClientRect();
}

function removeFloatingButton() {
  aiButton?.remove();
}

function showLoading() {
  const loading = document.createElement('div');
  loading.className = 'crisp-loading';
  loading.textContent = 'Processing...';
  Object.assign(loading.style, {
    position: 'fixed',
    bottom: '80px',
    right: '20px',
    background: '#facc15',
    color: '#000',
    padding: '10px 16px',
    borderRadius: '6px',
    zIndex: 10000,
    fontWeight: 'bold',
    fontSize: '13px',
    animation: 'fadeInOut 2s ease-in-out'
  });
  document.body.appendChild(loading);
  setTimeout(() => loading.remove(), 2000);
}

function showResultPopup(content) {
  const result = document.createElement('div');
  result.className = 'crisp-result';
  result.textContent = content;
  Object.assign(result.style, {
    position: 'fixed',
    bottom: '120px',
    right: '20px',
    background: '#4ade80',
    color: '#000',
    padding: '12px 20px',
    borderRadius: '8px',
    zIndex: 10000,
    fontWeight: 'bold',
    maxWidth: '300px',
    fontSize: '14px'
  });
  document.body.appendChild(result);
  setTimeout(() => result.remove(), 6000);
}

function showErrorPopup(message) {
  const error = document.createElement('div');
  error.className = 'crisp-error';
  error.textContent = `❌ ${message}`;
  Object.assign(error.style, {
    position: 'fixed',
    bottom: '120px',
    right: '20px',
    background: '#f87171',
    color: '#fff',
    padding: '12px 20px',
    borderRadius: '8px',
    zIndex: 10000,
    fontWeight: 'bold',
    fontSize: '14px'
  });
  document.body.appendChild(error);
  setTimeout(() => error.remove(), 4000);
}

// Add fade animation style
const style = document.createElement('style');
style.textContent = `
  .crisp-floating-btn button {
    background: #6366f1;
    color: white;
    padding: 8px 12px;
    margin: 2px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 12px;
  }
  .crisp-floating-btn .action-menu {
    margin-top: 5px;
  }
  .hidden {
    display: none;
  }
  @keyframes fadeInOut {
    0% { opacity: 0; transform: translateY(20px); }
    15% { opacity: 1; transform: translateY(0); }
    85% { opacity: 1; transform: translateY(0); }
    100% { opacity: 0; transform: translateY(-20px); }
  }
`;
document.head.appendChild(style);