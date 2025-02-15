import express from "express";
import bodyParser from "body-parser";
import pkg from "pg";
const { Pool } = pkg;
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import env from "dotenv";
import fileUpload from "express-fileupload";
import nodemailer from "nodemailer";
import cors from "cors";

// Middleware and constants
const app = express();
const port = 3000;
const saltRounds = 10;
env.config();

// Add CORS middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173", // Your React frontend URL
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Create a connection pool instead of a single client
const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));
app.use(fileUpload());

// JWT middleware for protected routes
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
};

// Email service configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  logger: true,
  debug: true,
});

// Send email to all users
async function sendEmailsToUsers(eventDetails) {
  try {
    const result = await pool.query("SELECT s_email FROM studentlogin");
    const emails = result.rows.map((row) => row.s_email);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: emails.join(","),
      subject: `New Event Added: ${eventDetails.eventname}`,
      text: `Hi there, a new event "${eventDetails.eventname}" has been added.\nDetails: ${eventDetails.eventdetails}\nDate: ${eventDetails.eventdate}\nTime: ${eventDetails.eventtime}\nVenue: ${eventDetails.eventvenue}\nURL: ${eventDetails.eventurl}`,
    };

    await transporter.sendMail(mailOptions);
    console.log("Emails sent successfully");
  } catch (error) {
    console.log("Error sending emails:", error);
  }
}

// Authentication Routes
app.post("/adminlogin", async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query(
      "SELECT * FROM adminlogin WHERE admin_id = $1",
      [username]
    );

    if (result.rows.length > 0) {
      const admin = result.rows[0];
      if (password === admin.password) {
        const token = jwt.sign(
          { id: admin.id, admin_id: admin.admin_id, type: "admin" },
          process.env.JWT_SECRET,
          { expiresIn: "24h" }
        );
        return res.json({
          token,
          user: { id: admin.id, admin_id: admin.admin_id },
        });
      }
    }
    res.status(401).json({ message: "Invalid credentials" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/studentlogin", async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query(
      "SELECT * FROM studentlogin WHERE s_email = $1",
      [username]
    );

    if (result.rows.length > 0) {
      const student = result.rows[0];
      const valid = await bcrypt.compare(password, student.s_password);

      if (valid) {
        const token = jwt.sign(
          { id: student.id, email: student.s_email, type: "student" },
          process.env.JWT_SECRET,
          { expiresIn: "24h" }
        );
        return res.json({
          token,
          user: { id: student.id, email: student.s_email },
        });
      }
    }
    res.status(401).json({ message: "Invalid credentials" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Protected Routes
app.get("/adminevent", authenticateToken, async (req, res) => {
  if (req.user.type !== "admin") {
    return res.status(403).json({ message: "Unauthorized" });
  }

  try {
    const data = await pool.query(
      "SELECT e.*,a.admin_id from event e join adminlogin a ON a.id = e.user_id WHERE e.user_id = $1 ORDER BY e.event_id DESC;",
      [req.user.id]
    );
    res.json(data.rows);
  } catch (err) {
    res.status(500).json({ message: "Error loading events" });
  }
});

app.get("/studentevent", authenticateToken, async (req, res) => {
  if (req.user.type !== "student") {
    return res.status(403).json({ message: "Unauthorized" });
  }

  try {
    const data = await pool.query(
      "SELECT e.*,a.admin_id from event e join adminlogin a ON a.id = e.user_id ORDER BY e.event_id DESC"
    );
    res.json(data.rows);
  } catch (err) {
    res.status(500).json({ message: "Error loading events" });
  }
});

app.get("/events", async (req, res)=>{
    const data = await pool.query(
      "SELECT * FROM event"
    );
    res.json(data.rows);
})

// Event Management Routes
app.post("/adminform", authenticateToken, async (req, res) => {
  if (req.user.type !== "admin") {
    return res.status(403).json({ message: "Unauthorized" });
  }

  const {
    eventname,
    eventdetails,
    eventdate,
    eventtime,
    eventvenue,
    eventurl,
  } = req.body;
  const adminId = req.user.id;
  const eventBanner = req.files.eventbanner;

  try {
    await pool.query(
      "INSERT INTO event (event_name, event_details, event_date, user_id, event_venue, event_time, event_url, event_banner, banner_data) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
      [
        eventname,
        eventdetails,
        eventdate,
        adminId,
        eventvenue,
        eventtime,
        eventurl,
        eventBanner.name,
        eventBanner.data,
      ]
    );

    await sendEmailsToUsers({
      eventname,
      eventdetails,
      eventdate,
      eventtime,
      eventvenue,
      eventurl,
    });

    res.json({ message: "Event created successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error adding event" });
  }
});

app.post("/delete", authenticateToken, async (req, res) => {
  if (req.user.type !== "admin") {
    return res.status(403).json({ message: "Unauthorized" });
  }

  const { deleteEventId } = req.body;

  try {
    await pool.query("DELETE FROM event WHERE event_id = $1", [deleteEventId]);
    res.json({ message: "Event deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting event" });
  }
});

// Registration Route
app.post("/registerstudent", async (req, res) => {
  const { username, password } = req.body;

  try {
    const checkResult = await pool.query(
      "SELECT * FROM studentlogin WHERE s_email = $1",
      [username]
    );

    if (checkResult.rows.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hash = await bcrypt.hash(password, saltRounds);
    const result = await pool.query(
      "INSERT INTO studentlogin (s_email, s_password) VALUES ($1, $2) RETURNING *",
      [username, hash]
    );

    const token = jwt.sign(
      { id: result.rows[0].id, email: username, type: "student" },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({ token, user: { id: result.rows[0].id, email: username } });
  } catch (err) {
    res.status(500).json({ message: "Error registering user" });
  }
});

// Image Route
app.get("/images/:imageName", async (req, res) => {
  try {
    const imageName = req.params.imageName;
    const data = await pool.query(
      "SELECT banner_data FROM event WHERE event_banner = $1",
      [imageName]
    );
    if (data.rows.length > 0) {
      const img = data.rows[0].banner_data;
      res.writeHead(200, {
        "Content-Type": "image/jpeg",
        "Content-Length": img.length,
      });
      res.end(img);
    } else {
      res.status(404).json({ message: "Image not found" });
    }
  } catch (err) {
    res.status(500).json({ message: "Error retrieving image" });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
