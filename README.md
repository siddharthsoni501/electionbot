# ElectionBot

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.8+](https://img.shields.io/badge/Python-3.8%2B-blue)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109.0-009485)](https://fastapi.tiangolo.com/)

An intelligent, AI-powered conversational assistant designed to streamline the Indian election process. ElectionBot provides real-time voter information, constituency details, election-related guidance, and voter registration assistance through an intuitive chat interface.

## 🎯 Features

- **Real-time Voter Information** - Access current voter registration status and details
- **Constituency Insights** - Get comprehensive information about constituencies, representatives, and election history
- **Voter Registration Guidance** - Step-by-step assistance for voter registration processes
- **Conversational AI** - Natural language understanding for seamless user interactions
- **Multi-language Support** - Accessible to diverse user groups across India
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- **Real-time Updates** - Current election data and announcements

## 🏗️ Architecture

```
electionbot/
├── backend/              # FastAPI application
│   ├── app/
│   ├── models/           # Data models & schemas
│   ├── routes/           # API endpoints
│   ├── services/         # Business logic
│   ├── utils/            # Helper functions
│   └── config.py         # Configuration
├── frontend/             # React application
│   ├── src/
│   ├── components/       # React components
│   ├── pages/            # Page components
│   └── services/         # API client services
├── Dockerfile            # Container configuration
├── cloudbuild.yaml       # Google Cloud Build config
└── README.md             # This file
```

## 🚀 Quick Start

### Prerequisites

- Python 3.8 or higher
- Node.js 16+ and npm
- Docker (optional, for containerized deployment)
- Git

### Local Development Setup

#### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env with your configuration

# Run the FastAPI server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The backend will be available at `http://localhost:8000`

#### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Update API_URL to point to your backend

# Start the development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

## 📦 Docker Deployment

### Build and Run with Docker

```bash
# Build the Docker image
docker build -t electionbot:latest .

# Run the container
docker run -p 8000:8000 \
  -e DATABASE_URL="your_database_url" \
  -e LLM_API_KEY="your_api_key" \
  electionbot:latest
```

### Docker Compose (Recommended)

```bash
docker-compose up -d
```

## ☁️ Cloud Deployment

### Google Cloud Run

The project includes `cloudbuild.yaml` for automated deployment:

```bash
# Deploy to Google Cloud Run
gcloud run deploy electionbot \
  --source . \
  --platform managed \
  --region asia-south1
```

## 🔧 Configuration

Create a `.env` file in the backend directory:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost/electionbot

# LLM Configuration
LLM_MODEL=gpt-4
LLM_API_KEY=your_openai_api_key
LLM_TEMPERATURE=0.7

# API
API_HOST=0.0.0.0
API_PORT=8000
CORS_ORIGINS=["http://localhost:3000", "https://yourdomain.com"]

# Redis (Optional, for caching)
REDIS_URL=redis://localhost:6379
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Chat & Conversations
- `POST /api/chat/message` - Send a message
- `GET /api/chat/history/{conversation_id}` - Get conversation history
- `GET /api/conversations` - List user conversations

### Voter Information
- `GET /api/voter/status` - Get voter registration status
- `POST /api/voter/register` - Voter registration guidance

### Constituency Data
- `GET /api/constituency/{code}` - Get constituency information
- `GET /api/constituency/search` - Search constituencies
- `GET /api/representatives/{constituency_id}` - Get elected representatives

### Elections
- `GET /api/elections/upcoming` - Upcoming elections
- `GET /api/elections/{election_id}` - Election details

For detailed API documentation, visit `http://localhost:8000/docs` (Swagger UI)

## 🛠️ Technology Stack

### Backend
- **Framework**: FastAPI
- **Database**: PostgreSQL
- **ORM**: SQLAlchemy
- **LLM Integration**: OpenAI / Anthropic
- **Caching**: Redis
- **Task Queue**: Celery
- **Deployment**: Docker, Google Cloud Run

### Frontend
- **Framework**: React 18+
- **State Management**: Redux Toolkit / Zustand
- **Styling**: Tailwind CSS / CSS Modules
- **HTTP Client**: Axios
- **Build Tool**: Vite / Create React App

### DevOps
- **Containerization**: Docker
- **CI/CD**: Google Cloud Build
- **Version Control**: Git

## 🤖 AI/LLM Features

- **Conversational AI**: Uses large language models for natural language understanding and generation
- **Context Awareness**: Maintains conversation context for coherent multi-turn interactions
- **Intent Recognition**: Accurately identifies user intents (registration, information lookup, etc.)
- **Response Generation**: Generates accurate, helpful responses about Indian elections

## 🔒 Security

- **Authentication**: JWT-based token authentication
- **Authorization**: Role-based access control (RBAC)
- **Input Validation**: Comprehensive input sanitization
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS**: Configured CORS headers
- **SQL Injection Prevention**: Parameterized queries with SQLAlchemy
- **HTTPS**: SSL/TLS encryption for all endpoints

## 📊 Performance

- **Response Caching**: Redis-based caching for frequently accessed data
- **Database Optimization**: Indexed queries for fast lookups
- **Async Processing**: Async/await for non-blocking operations
- **Load Balancing**: Ready for horizontal scaling

## 🧪 Testing

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test

# Coverage report
pytest --cov=app
```

## 📈 Monitoring & Logging

- **Logging**: Structured logging with Python's logging module
- **Error Tracking**: Integration with Sentry (optional)
- **Metrics**: Prometheus metrics exported
- **Health Checks**: `/api/health` endpoint for monitoring

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Election Commission of India for election data
- OpenAI / Anthropic for LLM capabilities
- FastAPI and React communities for excellent frameworks
- All contributors and users

## 📧 Contact & Support

For questions, issues, or suggestions:

- **GitHub Issues**: [Report a bug](https://github.com/siddharthsoni501/electionbot/issues)
- **Email**: siddharth@example.com
- **LinkedIn**: [Siddharth Soni](https://linkedin.com/in/siddharth-soni)

## 🗺️ Roadmap

- [ ] Multi-language support (Hindi, Tamil, Telugu, etc.)
- [ ] SMS-based interface for low-connectivity areas
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Voice-based interactions
- [ ] Integration with official election commission APIs
- [ ] Real-time election result tracking

---

**Built with ❤️ by [Siddharth Soni](https://github.com/siddharthsoni501)**
