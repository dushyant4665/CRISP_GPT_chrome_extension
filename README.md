# BruhAI_chrome_extension
A feature-rich Chrome extension that allows users to configure and manage multiple AI endpoints (e.g., ChatGPT, Gemini, Grok) along with API keys. This extension not only provides a user-friendly configuration popup but also leverages background and content scripts for advanced functionalities such as context menu integration and in-page interactions.


![Bruh_AI](assets/architecture.png)



## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [File Structure](#file-structure)
- [Installation](#installation)
- [Usage](#usage)
- [Future Enhancements](#future-enhancements)
- [Credits](#credits)
- [License](#license)

## Overview

The **AI Assistant Config Chrome Extension** is designed to help users and developers easily manage and interact with various AI endpoints. The extension provides:
- A **popup UI** to configure endpoints and API keys.
- **Background scripts** for handling context menus and background tasks.
- **Content scripts** to interact with web pages by capturing selected text and performing DOM modifications.

This project is built with modern web technologies including Flowbite, Tailwind CSS, and the Chrome Extension Manifest V3.

## Features

- **Configuration UI:**  
  - Configure endpoints and API keys for multiple AI services (ChatGPT, Gemini, Grok, etc.).
  - Save and load configuration using Chrome's `storage.sync` API.
  - Dark/light mode toggle for improved user experience.

- **Background Script Functionality:**  
  - Creates context menu options (e.g., "Summarize Selected Text") when a user selects text on a webpage.
  - Handles API calls (or simulated API calls) and displays notifications.
  - Processes messages from popup and content scripts.

- **Content Script Functionality:**  
  - Detects and logs text selections on any webpage.
  - Can modify the DOM (e.g., highlight elements) based on interactions.
  - Communicates with background script for further processing.

## Architecture

The project follows a modular design pattern to ensure separation of concerns and scalability:

- **Manifest (`manifest.json`):**  
  - Defines the extension configuration, including permissions, background service worker, and content scripts.
  
- **Popup Layer (`popup.html` & `popup.js`):**  
  - Provides the UI for configuration.
  - Handles user interactions such as saving settings and toggling dark mode.
  
- **Background Layer (`background.js`):**  
  - Runs in the background as a service worker.
  - Manages context menus and background tasks.
  - Listens for messages from both the popup and content scripts to execute tasks like summarization.
  
- **Content Layer (`content.js`):**  
  - Injected into web pages.
  - Captures user interactions (e.g., text selections) and performs inline DOM modifications.
  - Communicates with the background script for additional processing.

## File Structure

```plaintext
ai-assistant-extension/
├── manifest.json         # Extension configuration and permissions
├── popup.html            # Popup UI for configuration
├── popup.js              # Logic for handling user interactions in the popup
├── background.js         # Background script for context menus, notifications, and API calls
├── content.js            # Content script for interacting with webpage DOM
└── icons/                # Icons for the extension (icon16.png, icon48.png, icon128.png)
