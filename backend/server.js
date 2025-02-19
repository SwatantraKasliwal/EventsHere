import express from "express";
import bodyParser from "body-parser";
import pkg from "pg";
import bcrypt from "bcrypt";
import env from "dotenv";
import fileUpload from "express-fileupload";
import nodemailer from "nodemailer";
import cors from "cors";

const { Pool } = pkg;
const app = express();
const port = 3000;
const saltRounds = 10;

env.config();

// CORS Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
  })
);

// PostgreSQL Connection Pool
const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));
app.use(fileUpload());

// Email Service Configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  logger: true,
  debug: true,
});

// Send Event Emails to Users
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
        return res.json({
          userType: "admin",
          user: { id: admin.id, admin_id: admin.admin_id },
          success: true,
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
        return res.json({
          userType: "student",
          user: { id: student.id, email: student.s_email },
        });
      }
    }
    res.status(401).json({ message: "Invalid credentials" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Event Management Routes
app.get("/events", async (req, res) => {
  try {
    const data = await pool.query("SELECT * FROM event");
    res.json(data.rows);
  } catch (err) {
    res.status(500).json({ message: "Error retrieving events" });
  }
});

app.post("/admin-form", async (req, res) => {
  if (req.body.type === "admin") {
    const {
      eventName,
      eventDetails,
      eventDate,
      eventTime,
      eventVenue,
      eventUrl,
    } = req.body;
    const adminId = req.body.adminId;

    const eventBanner = req.files?.eventBanner;
    if (!eventBanner) {
      return res.status(400).json({ message: "Event banner is required" });
    }

    try {
      await pool.query(
        "INSERT INTO event (event_name, event_details, event_date, user_id, event_venue, event_time, event_url, event_banner, banner_data) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
        [
          eventName,
          eventDetails,
          eventDate,
          adminId,
          eventVenue,
          eventTime,
          eventUrl,
          eventBanner.name,
          eventBanner.data,
        ]
      );

      await sendEmailsToUsers({
        eventName,
        eventDetails,
        eventDate,
        eventTime,
        eventVenue,
        eventUrl,
      });

      res.json({ message: "Event created successfully", success: true });
    } catch (err) {
      console.error("Error adding event:", err);
      res.status(500).json({ message: "Error adding event", success: false });
    }
  } else {
    return res.status(403).json({ message: "Unauthorized" });
  }
});

app.post("/delete", async (req, res) => {
  const { deleteEventId } = req.body;

  try {
    await pool.query("DELETE FROM event WHERE event_id = $1", [deleteEventId]);
    res.json({ message: "Event deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting event" });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
