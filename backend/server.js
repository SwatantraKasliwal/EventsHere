import express from "express";
import bodyParser from "body-parser";
import pkg from "pg";
import bcrypt from "bcrypt";
import env from "dotenv";
import fileUpload from "express-fileupload";
import nodemailer from "nodemailer";
import cors from "cors";
import { v2 as cloudinary } from "cloudinary";

const { Pool } = pkg;
const app = express();
const port = 3000;
const saltRounds = 10;

env.config();

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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
app.use(
  fileUpload({
    useTempFiles: true, // This option is important for Cloudinary
    tempFileDir: "/tmp/",
  })
);

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

    if (emails.length === 0) {
      console.log("No emails to send to");
      return;
    }

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

app.post("/student-login", async (req, res) => {
  const { studentName, studentPass } = req.body;

  try {
    const result = await pool.query(
      "SELECT * FROM studentlogin WHERE s_email = $1",
      [studentName]
    );

    if (result.rows.length > 0) {
      const student = result.rows[0];
      const valid = await bcrypt.compare(studentPass, student.s_password);
      if (valid) {
        return res.json({
          userType: "student",
          user: { id: student.id, email: student.s_email },
          success: true,
        });
      }
    }
    res.status(401).json({ message: "Invalid credentials", success: false });
  } catch (err) {
    res.status(500).json({ message: "Server error", success: false });
  }
});

app.post("/student-register", async (req, res) => {
  const { email, password } = req.body;
  try {
    const userEmail = await pool.query(
      "SELECT * FROM studentlogin WHERE s_email=$1",
      [email]
    );
    if (userEmail.rows.length > 0) {
      return res.status(400).json({
        message: "User already registered, please login",
        success: false,
      });
    } else {
      const hashPass = await bcrypt.hash(password, saltRounds);
      const student = await pool.query(
        "INSERT INTO studentlogin(s_email, s_password) VALUES ($1, $2) RETURNING *",
        [email, hashPass]
      );
      res.json({
        message: "User registered Successfully",
        success: true,
        userType: "student",
        user: { id: student.rows[0].id, email: student.rows[0].s_email },
      });
    }
  } catch (err) {
    res.json({ message: "Error in registering the user", success: false });
  }
});

app.get("/events", async (req, res) => {
  try {
    const data = await pool.query(
      "SELECT e.*, a.admin_id FROM event e JOIN adminlogin a ON a.id = e.user_id ORDER BY e.event_id DESC;"
    );

    res.json(data.rows);
  } catch (err) {
    console.error("Error retrieving events:", err);
    res.status(500).json({ message: "Error retrieving events" });
  }
});

app.post("/admin-form", async (req, res) => {
  console.log("Received event submission request");

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

    // Check if files were uploaded properly
    if (!req.files || !req.files.eventBanner) {
      return res.status(400).json({
        message: "Event banner is required",
        success: false,
      });
    }

    const eventBanner = req.files.eventBanner;

    try {
      // Upload image to Cloudinary
      const cloudinaryUpload = await cloudinary.uploader.upload(
        eventBanner.tempFilePath,
        {
          folder: "event_banners", // Create a folder in Cloudinary
          resource_type: "image",
        }
      );

      console.log("Image uploaded to Cloudinary:", cloudinaryUpload.secure_url);

      // Insert event with the Cloudinary URL instead of storing binary data
      const result = await pool.query(
        "INSERT INTO event (event_name, event_details, event_date, user_id, event_venue, event_time, event_url, event_banner) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING event_id",
        [
          eventName,
          eventDetails,
          eventDate,
          adminId,
          eventVenue,
          eventTime,
          eventUrl,
          cloudinaryUpload.secure_url, // Store URL instead of binary
        ]
      );

      const eventId = result.rows[0].event_id;

      // Send emails to users
      await sendEmailsToUsers({
        eventname: eventName,
        eventdetails: eventDetails,
        eventdate: eventDate,
        eventtime: eventTime,
        eventvenue: eventVenue,
        eventurl: eventUrl,
      });

      res.json({
        message: "Event created successfully",
        success: true,
        eventId,
        imageUrl: cloudinaryUpload.secure_url,
      });
    } catch (err) {
      console.error("Error adding event:", err);
      res.status(500).json({
        message: "Error adding event: " + err.message,
        success: false,
      });
    }
  } else {
    return res.status(403).json({
      message: "Unauthorized - Admin privileges required",
      success: false,
    });
  }
});

app.post("/delete", async (req, res) => {
  const { deleteEventId } = req.body;

  try {
    // First get the event to retrieve the image URL
    const eventResult = await pool.query(
      "SELECT event_banner FROM event WHERE event_id = $1",
      [deleteEventId]
    );

    if (eventResult.rows.length > 0) {
      const imageUrl = eventResult.rows[0].event_banner;

      // Check if this is a Cloudinary URL and extract the public ID
      if (imageUrl && imageUrl.includes("cloudinary.com")) {
        // Extract the public ID from the URL
        const publicIdMatch = imageUrl.match(
          /\/event_banners\/([^/]+)(\.\w+)?/
        );
        if (publicIdMatch) {
          const publicId = `event_banners/${publicIdMatch[1]}`;
          // Delete the image from Cloudinary
          await cloudinary.uploader.destroy(publicId);
          console.log(`Deleted image ${publicId} from Cloudinary`);
        }
      }
    }

    // Delete the event from the database
    await pool.query("DELETE FROM event WHERE event_id = $1", [deleteEventId]);
    res.json({ message: "Event deleted successfully", success: true });
  } catch (err) {
    console.error("Error deleting event:", err);
    res.status(500).json({ message: "Error deleting event", success: false });
  }
});

app.get("/admin-events", async (req, res) => {
  const adminId = req.query.adminId; // Use query params
  try {
    const data = await pool.query("SELECT * FROM event WHERE user_id = $1", [
      adminId,
    ]);

    res.json(data.rows);
  } catch (err) {
    console.error("Error retrieving events:", err);
    res.status(500).json({ message: "Error retrieving events" });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
