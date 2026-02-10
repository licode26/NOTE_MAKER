# NoteSaver - Hashnode-like Publishing Platform

A full-stack publishing platform where users can create accounts, write and publish notes/articles, and build their audience.

## Features

- User Authentication (Register/Login)
- Rich Text Editor for writing posts
- Dashboard to manage your posts
- Public feed of all published posts
- User profiles with their posts
- Like posts and track views
- Tags for categorization
- Cover images for posts
- Draft/Publish toggle

## Tech Stack

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- bcryptjs for password hashing

### Frontend
- React 18
- React Router v6
- React Quill (Rich Text Editor)
- Vite

## Getting Started

### Prerequisites
- Node.js installed
- MongoDB installed and running

### Installation

1. **Clone the repository and navigate to the project**
   ```bash
   cd PROJECT_NOTE_MAKER
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

1. **Start MongoDB**
   Make sure MongoDB is running on your local machine (default: mongodb://localhost:27017)

2. **Start the backend server**
   ```bash
   cd backend
   npm run dev
   ```
   Backend will run on http://localhost:5000

3. **Start the frontend development server**
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend will run on http://localhost:3000

### Environment Variables

Backend uses these environment variables (already configured in `.env`):
- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Notes
- `GET /api/notes` - Get all published notes
- `GET /api/notes/my-notes` - Get current user's notes (auth required)
- `POST /api/notes` - Create new note (auth required)
- `GET /api/notes/:slug` - Get single note by slug
- `PUT /api/notes/:id` - Update note (auth required)
- `DELETE /api/notes/:id` - Delete note (auth required)
- `POST /api/notes/:id/like` - Like/unlike note (auth required)

## Usage

1. Visit http://localhost:3000
2. Click "Sign Up" to create an account
3. Login with your credentials
4. Click "New Post" to write your first article
5. Your posts will appear on your dashboard and public feed

## Project Structure

```
PROJECT_NOTE_MAKER/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   └── Note.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── notes.js
│   ├── middleware/
│   │   └── auth.js
│   ├── server.js
│   ├── .env
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Navbar.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── CreateNote.jsx
│   │   │   ├── NoteView.jsx
│   │   │   └── Profile.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```
