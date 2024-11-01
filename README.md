Building a website for my brother's wedding :)

Valid URL format:
https://nick-and-tash-wedding.web.app/invite/<MongoDB_ID>

Tech Stack:
- Frontend: React
- Backend: NodeJS
- Database: MongoDB
- Photos DB: Cloudinary
- Frontend Hosting: Firebase
- Backend Hosting: Render

## Test Locally:
### Start Frontend
- cd frontend && npm start
### Start Backend
- cd server && nodemon server.js
- Note: Ensure server URL is set to localhost:3003

## Deploy:
### Firebase (frontend)
- cd frontend && npm run build
- firebase deploy
### Render (backend)
- Push to github --> CI/CD pipeline should already be set-up