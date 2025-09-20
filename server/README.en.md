# LinkBox Backend API 🚀

A FastAPI backend service for LinkBox, providing intelligent resource management and AI-powered chat features.

## 🏗️ Tech Stack

- **Python**: 3.13
- **Web Framework**: FastAPI
- **ORM Framework**: SQLAlchemy 2.0
- **AI Framework**: LangChain
- **Data Validation**: Pydantic
- **Database**: MySQL
- **Authentication**: JWT (PyJWT)
- **Web Scraping**: Jina AI Reader API
- **Deployment**: Uvicorn + Gunicorn

## 📁 Project Structure

```
server/
├── main.py                 # FastAPI application entry point
├── models.py               # SQLAlchemy database models
├── database.py             # Database connection and session management
├── config.py               # Application configuration management
├── errors.py               # Global exception handling
├── requirements.txt        # Project dependencies
│
├── routers/                # API route modules
│   ├── user_router.py      # User authentication routes
│   ├── resource_router.py  # Resource management routes
│   ├── tag_router.py       # Tag management routes
│   └── ai_router.py        # AI chat routes
│
├── crud/                   # Database operations layer
│   ├── user_crud.py        # User data operations
│   ├── resource_crud.py    # Resource data operations
│   └── tag_crud.py         # Tag data operations
│
├── schemas/                # Pydantic data models
│   ├── user_schemas.py     # User-related models
│   ├── resource_schemas.py # Resource-related models
│   ├── tag_schemas.py      # Tag-related models
│   └── ai_schemas.py       # AI chat models
│
├── utils/                  # Utility functions
│   ├── jwt_utils.py        # JWT utilities
│   ├── auth.py             # Authentication dependencies
│   ├── ai_generator.py     # AI content generation
│   ├── web_scraper.py      # Web content scraping
│   └── langchain_tools.py  # LangChain tool definitions
│
└── test/                   # Test files
    ├── test_user_auth.py   # User authentication tests
    ├── test_resource_api.py # Resource management tests
    └── test_ai_router.py   # AI feature tests
```

## 🗄️ Database Design

### Core Table Structures

#### Users Table (`users`)

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE
);
```

#### Resources Table (`resources`)

```sql
CREATE TABLE resources (
    id INT AUTO_INCREMENT PRIMARY KEY,
    url VARCHAR(2048) NOT NULL,
    title VARCHAR(500) NOT NULL,
    digest TEXT NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    INDEX idx_user_id (user_id),
    INDEX idx_user_id_created_at (user_id, created_at)
);
```

#### Tags Table (`tags`)

```sql
CREATE TABLE tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    UNIQUE KEY unique_user_tag (user_id, name),
    INDEX idx_user_id (user_id)
);
```

#### Resource-Tags Association Table (`resource_tags`)

```sql
CREATE TABLE resource_tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    resource_id INT NOT NULL,
    tag_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    UNIQUE KEY unique_resource_tag (resource_id, tag_id),
    INDEX idx_resource_id (resource_id),
    INDEX idx_tag_id (tag_id),
    INDEX idx_user_id_tag_id (user_id, tag_id)
);
```

### Design Features

- **No Foreign Key Constraints**: Data consistency is maintained at the application layer.
- **Soft Deletes**: All tables include an `is_deleted` field.
- **User Isolation**: All data is isolated by `user_id`.
- **Query Optimization**: Composite indexes are created for common query scenarios.

## 🚀 Quick Start

### 1. Environment Configuration

Create a `.env` file:

```env
# Database Configuration
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=your_username
MYSQL_PASSWORD=your_password
MYSQL_DB=linkbox (This database must be created in MySQL beforehand)

# AI Configuration
AI_BASE_URL=Your_OpenAI_compatible_API_endpoint
AI_API_KEY=Your_API_key
AI_MODEL=Model_name

# JWT Configuration
JWT_SECRET_KEY=your-super-secret-key-change-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=1440
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Start the Service

#### Development Mode

```bash
python main.py
```

#### Production Mode

```bash
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:7032
```

### 4. Access API Documentation

- **Swagger UI**: http://localhost:7032/docs
- **ReDoc**: http://localhost:7032/redoc

## 📡 API Endpoints

### 🔐 Auth Module (`/auth`)

#### User Registration

```http
POST /auth/register
Content-Type: application/json

{
  "username": "your_username",
  "password": "your_password"
}
```

#### User Login

```http
POST /auth/login
Content-Type: application/json

{
  "username": "your_username",
  "password": "your_password"
}
```

#### Get User Profile

```http
GET /auth/profile
Authorization: Bearer <token>
```

### 📚 Resource Management (`/resources`)

#### Create Resource

```http
POST /resources
Authorization: Bearer <token>
Content-Type: application/json

{
  "url": "https://example.com",
  "title": "Resource Title",
  "digest": "Resource Digest",
  "tags": ["tag1", "tag2"]
}
```

#### Get Resource List

```http
GET /resources?page=1&size=20
Authorization: Bearer <token>
```

#### Get Resources by Tag

```http
GET /resources/by-tag/{tag_name}?page=1&size=20
Authorization: Bearer <token>
```

#### Multi-dimensional Resource Search

```http
GET /resources/search?query=keyword&page=1&size=20
Authorization: Bearer <token>
```

### 🏷️ Tag Management (`/tags`)

#### Get User Tags

```http
GET /tags
Authorization: Bearer <token>
```

#### Create Tag

```http
POST /tags
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Tag Name"
}
```

### 🤖 AI Chat (`/ai`)

#### Standard Streaming Chat

```http
POST /ai/chat/stream
Authorization: Bearer <token>
Content-Type: application/json

{
  "messages": [
    {
      "role": "user",
      "content": "Hello"
    }
  ]
}
```

#### AI Agent with Tool Calling

```http
POST /ai/chat/agent
Authorization: Bearer <token>
Content-Type: application/json

{
  "messages": [
    {
      "role": "user",
      "content": "Help me save this webpage: https://example.com"
    }
  ]
}
```

## 🤖 AI Features Explained

### LangChain Tools

#### 1. Resource Search Tool (`search_resources`)

- **Function**: Intelligently searches a user's saved resources.
- **Input**: A natural language query.
- **Workflow**: AI analyzes tags → Filters resources → Returns matching results.

#### 2. Resource Preview Tool (`preview_resource`)

- **Function**: Generates a resource preview from a URL.
- **Input**: URL + user notes.
- **Workflow**: Scrapes webpage → AI generates title/tags/summary.

#### 3. Create Resource Tool (`create_resource`)

- **Function**: Saves a resource to the collection.
- **Input**: URL + title + tags + summary.
- **Output**: Save confirmation.

### Streaming Support

- **SSE (Server-Sent Events)** for real-time streaming responses.
- **Progress Feedback**: Real-time updates on tool execution progress.
- **Multi-process Safe**: Stateless progress management design.

## 🔧 Development Guide

### Coding Standards

- **Naming Convention**: Use snake_case for files and functions.
- **Type Hinting**: All function parameters and return values must have type hints.
- **Docstrings**: Important functions require Chinese docstrings.
- **Error Handling**: Use custom exception classes and global exception handling.

### Adding New Features

1.  **Define Data Models**: Define Pydantic models in `schemas/`.
2.  **Implement CRUD Operations**: Implement database operations in `crud/`.
3.  **Create Routes**: Define API routes in `routers/`.
4.  **Register Routes**: Register new routes in `main.py`.
5.  **Write Tests**: Add test cases in `test/`.

## 🛡️ Security Features

- **JWT Authentication**: Stateless identity verification.
- **Password Encryption**: Hashing is recommended for production environments.
- **Input Validation**: Pydantic data validation.
- **SQL Injection Protection**: SQLAlchemy ORM protection.
- **CORS Support**: Cross-Origin Resource Sharing configuration.
- **Global Exception Handling**: Unified error response format.

## 📊 Performance Optimization

### Database Optimization

- **Indexing Strategy**: Optimize indexes based on query patterns.
- **Query Optimization**: Avoid N+1 query problems.
- **Connection Pooling**: SQLAlchemy connection pool management.

### Application Optimization

- **Asynchronous Processing**: FastAPI's async support.
- **Caching Strategy**: Use caching appropriately to reduce database queries.
- **Batch Operations**: Support for bulk data operations.

## 🚀 Deployment Configuration

### Docker Deployment

```dockerfile
FROM python:3.13-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
CMD ["gunicorn", "main:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:7032"]
```

### Environment Variables

- **Development**: Use a `.env` file.
- **Production**: Use environment variables or a configuration management service.
- **Sensitive Information**: Avoid hardcoding sensitive data in the code.

## 🐛 Troubleshooting

### Common Issues

1.  **Database Connection Failure**
    - Check if the MySQL service is running.
    - Verify that the connection information is correct.
    - Confirm that the database exists.

2.  **JWT Token Validation Failure**
    - Check the `JWT_SECRET_KEY` configuration.
    - Confirm the token format is correct.
    - Verify that the token has not expired.

3.  **AI API Call Failure**
    - Check if the `AI_API_KEY` is valid.
    - Confirm the `AI_BASE_URL` is configured correctly.
    - Check network connectivity and proxy settings.

### Logging Configuration

```python
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
```

## 📈 Monitoring and Operations

### Health Check

```http
GET /health
```

### Application Metrics

- Request/response times
- Database connection status
- Memory and CPU usage
- Error rate statistics

## 🤝 Contribution Guide

1.  **Fork the project**
2.  **Create a feature branch**: `git checkout -b feature/new-feature`
3.  **Commit your changes**: `git commit -m 'Add new feature'`
4.  **Push to the branch**: `git push origin feature/new-feature`
5.  **Create a Pull Request**

## 📝 Changelog

### v1.0.0

- ✨ Complete user authentication system
- 📚 Resource management CRUD functionality
- 🏷️ Tag system and association management
- 🤖 AI-powered chat and tool calling
- 🔄 Real-time streaming responses
- 🚀 Support for multi-process deployment
- 📖 Comprehensive API documentation

---

<div align="center">
  <strong>LinkBox Backend - The Core Engine for Intelligent Resource Management 🚀</strong>
</div>
