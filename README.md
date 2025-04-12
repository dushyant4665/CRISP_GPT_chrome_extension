# CRISP GPT Chrome Extension 

<!--[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/none)](https://developer.chrome.com/docs/webstore)-->

A powerful AI assistant Chrome extension with Mistral AI integration for text explanation, expansion, and summarization. Works with local AI models via Ollama and cloud services.

![CRISP_GPT](assets/demo.png)

## Features 


- **Text Processing Actions**
  - 🔍 Explain technical concepts in simple terms
  - ✨ Expand ideas with examples and details
  - 📋 Summarize long content to key points
  - 🗑️ Auto-cleanup of temporary elements

- **Advanced Integration**
  - Local AI processing with Mistral via Ollama
  - MongoDB caching system for frequent queries
  - Multi-service architecture with Express backend
  - Secure API key management

## Tech Stack 

### Frontend (Extension)
![CRISP_GPT](assets/architecture.png)
- **Core**
  - Chrome Extension Manifest V3
  - HTML5 Semantic Markup
  - CSS3 with Flexbox/Grid layouts
  - Modern JavaScript (ES6+)

### Backend Service
- **Runtime**
  - Node.js v18+ (LTS)
  - Express.js 4.x web framework

- **AI Integration**
  - Mistral 7B via Ollama (local)
  - REST API endpoints
  - Axios for HTTP requests

- **Database**
  - MongoDB Atlas (Cloud)
  - Mongoose ODM
  - TTL Indexes for auto-expiry

### Development Tools
- Build System
  - Webpack 5 (Module bundler)
  - Babel (ES6+ Transpiler)
  
- Code Quality
  - ESLint (Airbnb config)
  - Prettier (Code formatting)
  - npm scripts automation

- Testing
  - Jest (Unit testing)
  - Puppeteer (E2E testing)

## Installation 

### Prerequisites
- Chrome Browser (v115+)
- Node.js v18+ & npm v9+
- MongoDB Atlas account
- Ollama installed locally

### Setup Steps

1. **Clone Repository**
```bash
git clone https://github.com/dushyant4665/CRISP_GPT_chrome_extension.git
cd CRISP_GPT_chrome_extension

```

2. **Install Dependencies** 

*For Frontend*
```bash
cd Extension && npm install
```
*For Backend*
```bash
cd Backend && npm install
```
3. **.env Configuration**

```bash
OLLAMA_API_URL=http://localhost:11434
MISTRAL_MODEL=mistral:7b
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
API_RATE_LIMIT=100/15min
SESSION_SECRET=your_secret_key
```

**4. Install Ollama**


[![Ollama - Mistral](https://img.shields.io/badge/Ollama_Mistral-000000?style=for-the-badge&logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAMAAAC6V+0/AAAAXVBMVEUAAAD///////////////////////////////////////////////////////////////////////////8HjELzAAAAIHRSTlMAESIzS1RlfX+Ag4WInJ+gp7vCxcjKz9DU2uDi6fP3Z4+8VgAAAKdJREFUGNNVzVcSgyAMBtFRKIGY0Pr9r+5/5JkIQs12WLOFz5cPmhMJYiQL2yGHQAYzRziAgKc3c1RWpkk9frU1hkF1RQ4a+uZ7L1usqv11mYd5EXEoIEz95AYMmmbGl9LEKL5YY0CXqpKONR1sNLgAJMsAz3Ysq5Z/4QNYo59++51OHBv1AZwH44WBo09F5gAAAABJRU5ErkJggg==)](https://ollama.com/download)

*Download Mistral*

```bash
ollama pull mistral
```

*Verify Installation*
```bash
ollama list
```

*Basic Usage Test*
```bash
ollama run mistral "Explain quantum computing in simple terms"
```

*Start Ollama Service*

Linux/macOS:

```bash
sudo systemctl start ollama
```
Windows (Auto-starts after install):
```bash
ollama serve
```

**5. Start Servcies**

# Backend Server

```bash
cd backend && npm run dev
```
# Extension (frontend)
```bash
cd Extension && npm run build
```
