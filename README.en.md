<div align="center">
  <img src="./misc/img/logo.png", width="200">
</div>

# LinkBox 📦

An AI-powered intelligent link bookmark application that makes web resource management smarter and more efficient.

## TODO

- [x] Asynchronous bookmarking
- [] Browser extension
- [] Other optimizations
- [x] Docker
- [] i18n

## ✨ Features

### 🤖 AI-Powered Features

- **Smart Resource Preview**: Input a URL, and AI automatically extracts web content and generates titles, tags, and summaries.
- **Intelligent Search**: AI-based multidimensional resource search supporting natural language queries.
- **Smart Tag Generation**: AI intelligently generates classification tags based on web content and existing user tags.
- **Conversational Interaction**: Manage your bookmarks through natural language interactions with the AI assistant.

### 📚 Resource Management

- **One-Click Bookmarking**: Quickly bookmark web resources by entering a URL.
- **Tag Classification**: Flexible tagging system supporting multi-tag classification.
- **Batch Management**: Supports batch editing and deleting of resources.
- **Search and Filter**: Multidimensional search (title, tags, summary).

### 💬 Intelligent Conversations

- **Real-Time Streaming Responses**: AI conversations support real-time streaming output.
- **Tool Invocation**: AI can invoke tools for search, preview, and resource creation.
- **Progress Feedback**: Real-time progress display during tool execution.
- **Context Memory**: Conversations support context memory functionality.

### 🎨 User Experience

- **Modern UI**: Simple and elegant user interface design.
- **Responsive Design**: Perfectly adapts to both desktop and mobile devices.
- **Real-Time Feedback**: Instant feedback on operation results.
- **Seamless Interaction**: Smooth user interaction experience.

## 🏗️ Technical Architecture

### Backend (FastAPI)

- **Web Framework**: FastAPI + Python 3.13
- **Database**: MySQL + SQLAlchemy ORM
- **AI Integration**: LangChain + OpenAI-compatible API
- **Authentication System**: JWT Token Authentication
- **Web Scraping**: Jina AI Reader API
- **Deployment Support**: Supports Gunicorn multi-process deployment

### Frontend (React)

- **UI Framework**: React 19 + TypeScript
- **Routing Management**: React Router v7
- **State Management**: React Hooks + Context
- **HTTP Client**: Alova
- **Styling System**: Tailwind CSS
- **Build Tool**: Vite

### AI Features

- **LLM Model**: Supports OpenAI-compatible APIs
- **Tool Invocation**: LangChain Tools framework
- **Streaming Output**: SSE (Server-Sent Events)
- **Multi-Process Safety**: Stateless progress management design

## 🚀 Quick Start

### Prerequisites

- **Node.js**: 18.0+
- **Python**: 3.13
- **MySQL**: 5.7+ or 8.0+
- **OpenAI API Key** or OpenAI-compatible API

### 1. Clone the Project

```bash
git clone https://github.com/LinkBox-app/LinkBox.git
cd LinkBox
```

### 2. Backend Setup

```bash
cd server

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit the .env file and fill in database and AI API configurations

# Start the service
python main.py
```

The backend service will run at `http://localhost:7032`

### 3. Frontend Setup

```bash
cd web

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend service will run at `http://localhost:5173`

### 4. Database Configuration

Configure the database connection in `server/.env`:

```env
# Database Configuration
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=your_username
MYSQL_PASSWORD=your_password
MYSQL_DB=linkbox

# AI Configuration
AI_BASE_URL=https://api.openai.com/v1
AI_API_KEY=your_api_key
AI_MODEL=gpt-3.5-turbo

# JWT Configuration
JWT_SECRET_KEY=your-secret-key
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=1440
```

Database tables will be automatically created on the first run.

## 📖 User Guide

### 1. User Registration and Login

- Visit the application homepage
- Click the "Login/Register" button
- Complete registration by entering a username and password

### 2. Bookmark Web Resources

- Enter the following in the AI conversation page: `Bookmark this webpage for me: https://example.com`
- The AI will automatically fetch web content and generate a preview
- Confirm or modify the title, tags, and summary before saving

### 3. Search Resources

- Use natural language search on the AI conversation page:
  - `Find some resources about Python`
  - `Search for articles related to machine learning`
  - `Show recently bookmarked webpages`

### 4. Manage Resources

- View all bookmarked resources on the homepage
- Filter resources using tags
- Edit or delete unnecessary resources

## 🛠️ Development Guide

### Project Structure

```
LinkBox/
├── server/                 # Backend code
│   ├── Dockerfile         # Backend Docker configuration
│   ├── main.py            # FastAPI application entry point
│   ├── models.py          # Database models
│   ├── routers/           # API routes
│   ├── crud/              # Database operations
│   ├── utils/             # Utility functions
│   └── requirements.txt   # Python dependencies
├── web/                    # Frontend code
│   ├── Dockerfile         # Frontend Docker configuration
│   ├── .dockerignore      # Docker ignore file
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # UI components
│   │   ├── hooks/         # React Hooks
│   │   └── api/           # API interfaces
│   └── package.json       # Node dependencies
├── docker-compose.yml      # Docker service orchestration
└── README.md               # Project documentation
```

### Key Functional Modules

#### Backend Modules

- **User Authentication** (`user_router.py`): Registration, login, JWT authentication
- **Resource Management** (`resource_router.py`): CRUD operations
- **Tag Management** (`tag_router.py`): Tag creation, deletion, and updates
- **AI Conversations** (`ai_router.py`): Intelligent conversations and tool invocation
- **AI Tools** (`langchain_tools.py`): Resource search, preview, and creation tools

#### Frontend Modules

- **User Interface** (`Layout.tsx`): Overall application layout
- **AI Conversations** (`Chat.tsx`): Intelligent conversation interface
- **Resource Display** (`Home.tsx`): Resource list and management
- **User Settings** (`Setting.tsx`): Personal information and settings

### Development Commands

#### Backend Development

```bash
cd server

# Development mode
python main.py

# Run tests
pytest

# Production deployment
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:7032
```

#### Frontend Development

```bash
cd web

# Development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Code linting
npm run lint
```

## 🔧 Configuration Options

### Environment Variables

| Variable Name          | Description              | Default Value                 |
| ---------------------- | ------------------------ | ----------------------------- |
| `MYSQL_HOST`           | MySQL host address       | -                             |
| `MYSQL_PORT`           | MySQL port               | -                             |
| `MYSQL_USER`           | MySQL username           | -                             |
| `MYSQL_PASSWORD`       | MySQL password           | -                             |
| `MYSQL_DB`             | Database name            | `linkbox`                     |
| `AI_BASE_URL`          | AI API base URL          | -                             |
| `AI_API_KEY`           | AI API key               | -                             |
| `AI_MODEL`             | AI model name            | `moonshotai/Kimi-K2-Instruct` |
| `JWT_SECRET_KEY`       | JWT signing key          | -                             |
| `JWT_EXPIRE_MINUTES`   | Token expiration time    | `1440`                        |

## 🚀 Deployment Guide

### Docker Deployment (Recommended)

```bash
# Build the image
docker-compose build

# Start the service
docker-compose up -d
```

### Manual Deployment

#### Backend Deployment

```bash
# Install dependencies
pip install -r requirements.txt gunicorn

# Start the service
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:7032
```

#### Frontend Deployment

```bash
# Build static files
npm run build

# Serve the dist directory using nginx or another static file server
```

## 📝 Changelog

### v1.0.0

- ✨ Initial release
- 🤖 AI-powered resource preview and search
- 💬 Real-time streaming AI conversations
- 📚 Comprehensive resource management system
- 🎨 Modern user interface
- 🔐 User authentication system
- 🚀 Multi-process deployment support

## 📄 License

This project is open-sourced under the MIT license. See the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [FastAPI](https://fastapi.tiangolo.com/) - Modern, fast web framework
- [React](https://reactjs.org/) - Library for building user interfaces
- [LangChain](https://langchain.com/) - Framework for developing AI applications
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Jina AI](https://jina.ai/) - Web content scraping service

---

<div align="center">
  <strong>LinkBox - Make Bookmarking Smarter 🚀</strong>
</div>