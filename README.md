# TaskManagerApp

A full-stack task management application built with Node.js/Express backend and React/Vite frontend in a monorepo structure.

## 🏗️ Architecture

This is a monorepo containing two main applications:

- **TaskManager** - Backend API (Node.js + Express + TypeScript + MongoDB)
- **TaskManagerWeb** - Frontend Web App (React + TypeScript + Vite)

## 🚀 Tech Stack

### Backend (TaskManager)
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with bcryptjs
- **Validation**: Zod schemas
- **Documentation**: Swagger/OpenAPI
- **Security**: Helmet, CORS, Rate Limiting
- **File Upload**: Multer
- **Development**: ts-node-dev, ESLint, Prettier

### Frontend (TaskManagerWeb)
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **HTTP Client**: Axios
- **Styling**: CSS

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB (local installation or Docker)
- Git

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd TaskManagerApp
```

### 2. Backend Setup (TaskManager)

```bash
cd TaskManager

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your configuration

# Start MongoDB (if using Docker)
docker-compose up -d

# Run database seeds (optional)
npm run seed

# Start development server
npm run dev
```

### 3. Frontend Setup (TaskManagerWeb)

```bash
cd ../TaskManagerWeb

# Install dependencies
npm install

# Start development server
npm run dev
```

## ⚙️ Environment Configuration

### Backend (.env)
```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/taskmanager
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=your-secret-key
```

### Frontend (.env.development)
```env
VITE_API_URL=http://localhost:4000
```

## 🏃‍♂️ Development

### Starting the Development Environment

1. **Start MongoDB**:
   ```bash
   cd TaskManager
   docker-compose up -d
   ```

2. **Start Backend** (Terminal 1):
   ```bash
   cd TaskManager
   npm run dev
   ```
   Backend will run on `http://localhost:4000`

3. **Start Frontend** (Terminal 2):
   ```bash
   cd TaskManagerWeb
   npm run dev
   ```
   Frontend will run on `http://localhost:5173`

### Available Scripts

#### Backend (TaskManager)
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run seed` - Seed database with sample data
- `npm run seed:clear` - Clear database
- `npm run seed:reset` - Clear and reseed database

#### Frontend (TaskManagerWeb)
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 📁 Project Structure

```
TaskManagerApp/
├── .gitignore                 # Root gitignore
├── README.md                  # This file
├── AGENTS.md                  # Agent documentation
├── TaskManager/               # Backend application
│   ├── src/
│   │   ├── app.ts            # Express app configuration
│   │   ├── server.ts         # Server entry point
│   │   ├── config/           # Database and environment config
│   │   ├── controllers/      # Route controllers
│   │   ├── middleware/       # Custom middleware
│   │   ├── models/           # Mongoose models
│   │   ├── routes/           # API routes and schemas
│   │   ├── services/         # Business logic
│   │   ├── scripts/          # Database scripts
│   │   ├── types/            # TypeScript type definitions
│   │   └── utils/            # Utility functions
│   ├── uploads/              # File upload directory
│   ├── docker-compose.yml    # MongoDB container
│   ├── package.json
│   └── tsconfig.json
└── TaskManagerWeb/           # Frontend application
    ├── src/
    │   ├── App.tsx           # Main App component
    │   ├── main.tsx          # React entry point
    │   ├── api/              # API client configuration
    │   ├── components/       # React components
    │   ├── hooks/            # Custom React hooks
    │   ├── services/         # API service functions
    │   ├── styles/           # CSS styles
    │   └── types/            # TypeScript interfaces
    ├── index.html
    ├── package.json
    ├── vite.config.ts
    └── tsconfig.json
```

## 🔌 API Documentation

When the backend is running, visit:
- **Swagger UI**: `http://localhost:4000/api-docs`
- **Postman Collection**: Import `TaskManager/TaskManager.postman_collection.json`

## 🚀 Production Deployment

### Backend Deployment
```bash
cd TaskManager

# Build the application
npm run build

# Start production server
npm start
```

### Frontend Deployment
```bash
cd TaskManagerWeb

# Build for production
npm run build

# The dist/ folder contains the built application
# Deploy the contents to your web server
```

### Docker Deployment (Backend)
```bash
cd TaskManager

# Build and start services
docker-compose up -d

# Your backend will be available at http://localhost:4000
```

## 🧪 Testing

### Backend Tests
```bash
cd TaskManager
npm test
```

### Code Quality
```bash
# Backend linting and formatting
cd TaskManager
npm run lint
npm run format

# Frontend type checking
cd TaskManagerWeb
npm run build  # Includes TypeScript compilation
```

## 🔧 Database Management

### Seeding Data
```bash
cd TaskManager

# Add sample data
npm run seed

# Clear all data
npm run seed:clear

# Reset (clear + seed)
npm run seed:reset
```

### MongoDB Connection
- **Local**: `mongodb://localhost:27017/taskmanager`
- **Docker**: Automatically configured via docker-compose

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 🆘 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**:
   - Ensure MongoDB is running: `docker-compose up -d`
   - Check connection string in `.env`

2. **CORS Issues**:
   - Verify `CORS_ORIGIN` in backend `.env` matches frontend URL
   - Default: `http://localhost:5173`

3. **Port Conflicts**:
   - Backend default: `4000`
   - Frontend default: `5173`
   - MongoDB default: `27017`

4. **Build Errors**:
   - Clear node_modules: `rm -rf node_modules && npm install`
   - Check Node.js version compatibility

### Getting Help

- Check the API documentation at `/api-docs`
- Review the Postman collection for API examples
- Ensure all environment variables are properly configured

---

**Happy Coding! 🎉**