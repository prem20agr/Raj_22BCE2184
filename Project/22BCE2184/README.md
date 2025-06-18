# 🎯 HabitFlow - Personal Habit Tracking System

> Transform your daily routines into powerful habits with intelligent tracking and motivational insights.

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/YOUR_USERNAME/habitflow-personal-tracker)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/react-19.1.0-61dafb.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/database-MongoDB-green.svg)](https://mongodb.com/)

## 🌟 Overview

HabitFlow is a comprehensive personal development platform designed to help individuals build sustainable habits, track their progress, and achieve their wellness goals. Built with modern web technologies, it provides an intuitive interface for habit management with powerful analytics and motivational features.

### ✨ Key Features
- 🎯 **Smart Habit Management** - Create custom habits with flexible scheduling
- 📊 **Advanced Analytics** - Real-time progress tracking with interactive charts  
- 🎨 **Personalized Experience** - Customizable dashboard and themes
- 🔐 **Secure & Reliable** - JWT authentication and encrypted passwords

### 🎬 Demo
- **Screenshots**: See [Screenshots(Working).docx](./Screenshots(Working).docx)
- **Test Scenarios**: See [TESTING_SCENARIO.md](./TESTING_SCENARIO.md)

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local installation or Atlas cloud account)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/habitflow-personal-tracker.git
   cd habitflow-personal-tracker
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Environment Setup**
   ```bash
   cp server/.env.example server/.env
   ```
   
   Edit `server/.env`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/habitflow
   JWT_SECRET=your_secure_jwt_secret_key_here
   PORT=5001
   NODE_ENV=development
   ```

4. **Start the application**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:3002
   - Backend API: http://localhost:5001

## 🏗️ Architecture

### Backend (Node.js/Express)
```
server/
├── models/           # MongoDB schemas (User, Habit, HabitCompletion)
├── routes/           # API endpoints
└── server.js         # Express app configuration
```

### Frontend (React)
```
client/src/
├── components/       # React components
└── styles/          # CSS modules
```

## 🔧 API Endpoints

### Authentication
- `POST /api/v1/users/register` - User registration
- `POST /api/v1/users/login` - User authentication
- `GET /api/v1/users/profile` - Get user profile
- `PUT /api/v1/users/change-password` - Change password
- `PUT /api/v1/users/deactivate` - Deactivate account

### Habits
- `GET /api/v1/habits` - Fetch user habits
- `POST /api/v1/habits` - Create new habit
- `PUT /api/v1/habits/:id` - Update habit
- `DELETE /api/v1/habits/:id` - Delete habit

### Tracking
- `POST /api/v1/completions` - Mark habit completion
- `GET /api/v1/completions/today` - Today's completions
- `GET /api/v1/completions/stats` - Progress statistics
- `GET /api/v1/completions/weekly-progress` - Weekly analytics
- `GET /api/v1/completions/calendar` - Calendar heatmap data

### Example API Usage
```javascript
// Register a new user
const response = await fetch('/api/v1/users/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    firstname: "John",
    lastname: "Smith",
    email: "john@example.com",
    username: "johnsmith",
    password: "securepass123"
  })
});

// Create a new habit
const habitResponse = await fetch('/api/v1/habits', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    name: "Daily Exercise",
    category: "Fitness",
    frequency: { type: "daily", days: ["monday", "tuesday", "wednesday", "thursday", "friday"] },
    icon: "💪",
    color: "#4CAF50"
  })
});
```

## 📋 Testing

Run the application and test using the sample data:

```bash
# Backend tests
cd server && npm test

# Frontend tests  
cd client && npm test

# Test with sample users (see TESTING_SCENARIO.md)
# Username: johnsmith, Password: securepass123
```

## 🚀 Deployment

### Local Development
Already covered in Quick Start section above.

### Production Deployment Options

#### Option 1: Heroku
```bash
# Install Heroku CLI and login
heroku create habitflow-app
heroku config:set MONGODB_URI=your_mongodb_atlas_connection_string
heroku config:set JWT_SECRET=your_secure_jwt_secret
git push heroku main
```

#### Option 2: Digital Ocean/VPS
```bash
# On your server
git clone https://github.com/YOUR_USERNAME/habitflow-personal-tracker.git
cd habitflow-personal-tracker
npm run install-all
cd client && npm run build
# Set up environment variables
# Use PM2 or similar for process management
```

#### Option 3: Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY server/package*.json ./
RUN npm ci --only=production
COPY server/ .
EXPOSE 5001
CMD ["node", "server.js"]
```

### Environment Variables for Production
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/habitflow
JWT_SECRET=your_super_secure_jwt_secret_min_32_chars
PORT=5001
NODE_ENV=production
```

## 🛠️ Technologies Used

- **Frontend**: React 19, React Router, Recharts, React Calendar
- **Backend**: Node.js, Express.js, JWT Authentication
- **Database**: MongoDB with Mongoose ODM
- **Security**: bcrypt password hashing, rate limiting
- **Styling**: Modern CSS with responsive design

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository**
2. **Create your feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Development Guidelines
- Use 2 spaces for indentation
- Add comments for complex logic
- Test your changes thoroughly
- Update documentation as needed

### Bug Reports
Report bugs by [opening a new issue](../../issues/new) with:
- Quick summary and background
- Steps to reproduce
- Expected vs actual behavior
- Sample code if applicable

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 👨‍💻 Author

**Raj Agarwal**

## 🙏 Acknowledgments

- Inspired by behavioral psychology and habit formation research
- Built with modern web development best practices
- Special thanks to the open-source community

---

⭐ **Star this repository if HabitFlow helps you build better habits!**
