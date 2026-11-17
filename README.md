# 🐛 Bug Tracker (MERN)

A Jira-like issue tracker where teams manage projects, report bugs, assign tickets and move them across a Kanban board.

**Live demo:** https://issue-tracker-three-wheat.vercel.app
**API:**  https://bug-tracker-28z9.onrender.com
## Features
- JWT authentication (register/login, protected routes)
- Projects with team members and roles (admin / manager / developer / viewer)
- Tickets with type, priority, status and assignee
- Drag-and-drop Kanban board (persistent order)
- Threaded comments on every ticket
- Search, filters (status/priority/assignee) and sorting
- Edit/delete with permission checks
- Responsive UI with toasts and loading states

## Tech Stack
React (Vite), Tailwind CSS, React Router, @hello-pangea/dnd, Node.js, Express, MongoDB (Mongoose), JWT, bcrypt, Helmet, CORS

## Run locally
```bash
# Backend
cd server
npm install
# create .env with PORT, MONGO_URI, JWT_SECRET, CLIENT_URL
npm run dev

# Frontend
cd client
npm install
# create .env with VITE_API_URL=http://localhost:5000/api
npm run dev
```

## Environment variables
| Where | Name | Example |
|---|---|---|
| server | PORT | 5000 |
| server | MONGO_URI | mongodb+srv://... |
| server | JWT_SECRET | long-random-string |
| server | CLIENT_URL | http://localhost:5173 |
| client | VITE_API_URL | http://localhost:5000/api |

## Screenshots
![Login](screenshots/login.png)
![Kanban Board](screenshots/board.png)

## API overview
- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET/POST /api/projects`, `GET/PUT/DELETE /api/projects/:id`, `POST/DELETE /api/projects/:id/members`
- `GET/POST /api/tickets`, `PUT/DELETE /api/tickets/:id`, `PATCH /api/tickets/reorder`
- `GET/POST /api/comments`, `DELETE /api/comments/:id`

## Author
Your Name · [GitHub](https://github.com/sooniaarya15) · [LinkedIn](https://www.linkedin.com/in/sonia5555/)