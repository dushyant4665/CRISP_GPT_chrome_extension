let currentTooltip = null;

document.addEventListener('mouseup', handleTextSelection);

function handleTextSelection() {
  const selection = window.getSelection().toString().trim();
  if (selection.length > 0) {
    const range = window.getSelection().getRangeAt(0);
    const rect = range.getBoundingClientRect();
    showActionTooltip(selection, rect);
  } else {
    removeTooltip();
  }
}

function showActionTooltip(text, rect) {
  removeTooltip();
  
  currentTooltip = document.createElement('div');
  currentTooltip.className = 'crisp-tooltip';
  currentTooltip.innerHTML = `
    <div class="tooltip-header">
      <span>🤖 Choose Action</span>
    </div>
    <div class="tooltip-actions">
      <button data-action="explain" class="action-btn">🔍 Explain</button>
      <button data-action="expand" class="action-btn">✨ Expand</button>
      <button data-action="summarize" class="action-btn">📋 Summarize</button>
    </div>
  `;

  positionTooltip(currentTooltip, rect);
  addEventListeners(currentTooltip, text);
  document.body.appendChild(currentTooltip);
}

function positionTooltip(tooltip, rect) {
  const x = rect.left + window.scrollX;
  const y = rect.top + window.scrollY - 50;
  tooltip.style.left = `${x}px`;
  tooltip.style.top = `${y}px`;
}

function addEventListeners(tooltip, text) {
  tooltip.querySelectorAll('.action-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      sendRequest(action, text);
      removeTooltip();
    });
  });

  document.addEventListener('click', (e) => {
    if (!tooltip.contains(e.target)) removeTooltip();
  }, { once: true });
}

async function sendRequest(action, text) {
  try {
    const response = await fetch('http://localhost:8000/api/mistral', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, text })
    });

    const data = await response.json();
    
    if (data.success) {
      showPopup(data.response);
    } else {
      showPopup(`❌ Error: ${data.error}`);
    }
  } catch (error) {
    showPopup('⚠️ Failed to connect to server');
  }
}

function showPopup(content) {
  const popup = document.createElement('div');
  popup.className = 'response-popup';
  popup.innerHTML = `
    <div class="popup-content">${content}</div>
    <button class="popup-close">×</button>
  `;
  
  popup.querySelector('.popup-close').addEventListener('click', () => {
    popup.remove();
  });

  document.body.appendChild(popup);
  setTimeout(() => popup.remove(), 8000);
}

function removeTooltip() {
  if (currentTooltip) {
    currentTooltip.remove();
    currentTooltip = null;
  }
}