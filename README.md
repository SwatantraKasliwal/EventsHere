
```markdown
# 🎓 EventsHere - Full Stack Event Management System

EventsHere is a full-stack event management platform built for college campuses. It allows admins to post events and students to view, filter, and register for them easily.

---

## 🌐 Tech Stack

### 🔧 Backend:
- Node.js + Express.js
- PostgreSQL
- Cloudinary (for event banner hosting)
- JWT (Authentication)
- Nodemailer (Emails)

### 🎨 Frontend:
- React.js
- React Router
- Axios

---

## ⚙️ Features

- ✅ Admin & Student Authentication (JWT-based)
- ✅ Student Registration & Login
- ✅ Admin Login & Event Management (Create, Delete)
- ✅ Cloudinary for event banner uploads
- ✅ Event filtering by category
- ✅ Modal-based event detail viewer
- ✅ Related events display
- ✅ Protected registration links for students only

---

---
```

/client         → React frontend (Vite)
/server         → Express.js backend
/database       → PostgreSQL schema & setup
.env            → Environment variables (not committed)

```

---

## 🛠️ Setup Instructions

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/SwatantraKasliwal/EventsHere.git
cd EventsHere
````

---

### 2️⃣ Backend Setup (Express + PostgreSQL)

```bash
cd server
npm install
```

#### ✅ Create `.env` file

Create a `.env` file inside `/server` folder:

```env
# PostgreSQL Database Settings
PG_USER=your_postgres_username
PG_HOST=localhost
PG_DATABASE=your_database_name
PG_PASSWORD=your_postgres_password
PG_PORT=5432

# JWT Secret Key
JWT_SECRET=your_jwt_secret

# Email Settings
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_email_app_password

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Cloudinary Settings
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

#### ✅ Start the Backend Server

```bash
node server.js
# Or use nodemon
npm install -g nodemon
nodemon server.js
```

Make sure your PostgreSQL database is up and running. You may use pgAdmin or CLI.

---

### 3️⃣ Frontend Setup (React)

```bash
cd ../client
npm install
npm run dev
```

This will start the frontend on [http://localhost:5173](http://localhost:5173)

---

## 🔐 Authentication Flows

### 👤 Student

* Register using email and password.
* Login to view & register for events.
* Stored in `localStorage`: `studentId`, `userType=student`

### 🧑‍💼 Admin

* Login using credentials.
* Can view, manage, and delete events.
* Stored in `localStorage`: `adminId`, `userType=admin`

---

## 🖼️ Event Flow

* Admin adds event details, uploads banner (Cloudinary).
* Events are categorized and filterable.
* Clicking on an event opens a modal with full info.
* Related events show up below.

---

## 🧪 API Endpoints (Backend)

| Method | Endpoint                   | Description                      |
| ------ | -------------------------- | -------------------------------- |
| POST   | `/student-register`        | Register a new student           |
| POST   | `/student-login`           | Login as student                 |
| POST   | `/adminlogin`              | Admin login                      |
| GET    | `/events`                  | Fetch all upcoming events        |
| GET    | `/event-categories`        | Fetch available event categories |
| GET    | `/events/category/:name`   | Events by category               |
| GET    | `/related-events/:eventId` | Related events                   |
| POST   | `/delete`                  | Delete event (Admin only)        |
| GET    | `/admin-events`            | Get events created by admin      |

---


## 🚀 Future Improvements

* Add event creation UI for admin
* Edit event functionality
* Advanced search & filtering
* RSVP management and attendance tracker

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## 🙋‍♂️ Developed by

**Swatantra Kasliwal**
[GitHub](https://github.com/SwatantraKasliwal)
**Disha Holmukhe**
[GitHub](https://github.com/SwatantraKasliwal)
---


