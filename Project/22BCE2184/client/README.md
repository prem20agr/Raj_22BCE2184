# HabitFlow Frontend Client

The React-based frontend client for the HabitFlow Personal Habit Tracking System.

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Running HabitFlow backend server

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm start
```

The client will run on `http://localhost:3000` and automatically connect to the backend API.

## 📱 Features

### Core Components
- **Dashboard**: Main habit overview and daily tracking interface
- **HabitForm**: Create and edit habits with custom settings
- **ProgressView**: Analytics and visual progress tracking
- **SettingsView**: User profile and app preferences
- **Authentication**: Secure login and signup forms

### User Experience
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Real-time Updates**: Live habit completion tracking
- **Interactive Charts**: Visual progress with Recharts library
- **Calendar Integration**: React Calendar for date-based tracking
- **Toast Notifications**: User feedback with react-hot-toast
- **Theme Support**: Light and dark mode options

## 🛠️ Technology Stack

### Core Framework
- **React 18**: Modern component-based UI library
- **React Router DOM**: Client-side routing and navigation

### UI Libraries
- **Recharts**: Interactive data visualization charts
- **React Calendar**: Date picker and calendar components
- **React Hot Toast**: Elegant notification system

### Development Tools
- **Create React App**: Build toolchain and development setup
- **CSS Modules**: Scoped styling with custom CSS

## 📁 Project Structure

```
client/
├── public/                 # Static assets
├── src/
│   ├── components/        # React components
│   │   ├── Dashboard.js   # Main habit dashboard
│   │   ├── HabitForm.js   # Habit creation/editing
│   │   ├── ProgressView.js # Analytics view
│   │   ├── SettingsView.js # User settings
│   │   ├── Login.js       # Authentication
│   │   └── Signup.js      # User registration
│   ├── styles/           # CSS stylesheets
│   ├── App.js           # Main app component
│   └── index.js         # Application entry point
└── package.json         # Dependencies and scripts
```

## 🔧 Available Scripts

```bash
# Development
npm start          # Start development server
npm run build      # Build for production
npm test           # Run test suite
npm run eject      # Eject from Create React App

# Code Quality
npm run lint       # Run ESLint
npm run format     # Format with Prettier
```

## 🎨 Styling Guide

### CSS Architecture
- **Component-specific CSS**: Each component has its own stylesheet
- **Responsive Design**: Mobile-first approach with flexbox/grid
- **Theme Variables**: CSS custom properties for consistent theming

### Design Principles
- **Clean Interface**: Minimalist design focused on usability
- **Accessibility**: ARIA labels and keyboard navigation support
- **Performance**: Optimized components and lazy loading

## 🔌 API Integration

### Backend Communication
- **REST API**: RESTful endpoints for all data operations
- **Authentication**: JWT token-based authentication
- **Error Handling**: Graceful error handling with user feedback

### State Management
- **React Hooks**: useState and useEffect for local state
- **Context API**: Global auth state management
- **Local Storage**: Persistent login sessions

## 📊 Performance Features

### Optimization
- **Component Optimization**: React.memo and useMemo hooks
- **Code Splitting**: Dynamic imports for route-based splitting
- **Asset Optimization**: Optimized images and lazy loading

### User Experience
- **Loading States**: Skeleton screens and loading indicators
- **Offline Support**: Service worker for basic offline functionality
- **Progressive Web App**: PWA capabilities for mobile users

## 🔒 Security

### Client-Side Security
- **Input Sanitization**: XSS prevention and input validation
- **Secure Storage**: JWT tokens in httpOnly cookies
- **HTTPS Enforcement**: Secure communication with backend

## 🌐 Environment Configuration

### Environment Variables
Create a `.env` file in the client directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_VERSION=2.0.0
```

### Build Configuration
- **Development**: Hot reloading and debugging tools
- **Production**: Minified bundles and optimizations

## 📱 Mobile Responsiveness

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px  
- **Desktop**: > 1024px

### Touch Optimization
- **Touch Targets**: Minimum 44px touch areas
- **Gestures**: Swipe support for habit management
- **Performance**: 60fps animations and transitions

## 🧪 Testing

### Test Coverage
- **Unit Tests**: Component testing with React Testing Library
- **Integration Tests**: User flow testing
- **E2E Tests**: End-to-end testing with Cypress

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run E2E tests
npm run cypress:open
```

## 🚀 Deployment

### Build Process
```bash
# Create production build
npm run build

# Serve static files
npm install -g serve
serve -s build
```

### Hosting Options
- **Netlify**: Automatic deployments from Git
- **Vercel**: Optimized for React applications
- **AWS S3**: Static website hosting
- **Traditional Hosting**: Any web server

## 📚 Development Guide

### Component Development
1. **Create Component**: Use functional components with hooks
2. **Add Styling**: Create corresponding CSS file
3. **Add Tests**: Write unit tests for new components
4. **Update Routes**: Add routing if needed

### Best Practices
- **Code Organization**: Keep components small and focused
- **Naming Conventions**: Use PascalCase for components
- **Error Boundaries**: Implement error boundaries for fault tolerance
- **Accessibility**: Include ARIA labels and semantic HTML

## 🤝 Contributing

### Development Workflow
1. **Fork Repository**: Create your feature branch
2. **Local Development**: Set up local environment
3. **Testing**: Ensure all tests pass
4. **Code Review**: Submit pull request for review

### Code Standards
- **ESLint**: Follow configured linting rules
- **Prettier**: Use automated code formatting
- **Git Hooks**: Pre-commit hooks for quality checks

## 📄 License

MIT License - See LICENSE file for details

## 👨‍💻 Author

**Raj Agarwal**  
Email: raj.agarwal@habitflow.app  
GitHub: [@rajagarwal](https://github.com/rajagarwal)

---

*HabitFlow Frontend Client - Building better habits through technology* 🌟
