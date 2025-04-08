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

// app.post("/admin-form", async (req, res) => {
//   console.log("Received event submission request");

//   if (req.body.type === "admin") {
//     const {
//       eventName,
//       eventDetails,
//       eventDate,
//       eventTime,
//       eventVenue,
//       eventUrl,
//     } = req.body;
//     const adminId = req.body.adminId;

//     // Check if files were uploaded properly
//     if (!req.files || !req.files.eventBanner) {
//       return res.status(400).json({
//         message: "Event banner is required",
//         success: false,
//       });
//     }

//     const eventBanner = req.files.eventBanner;

//     try {
//       // Upload image to Cloudinary
//       const cloudinaryUpload = await cloudinary.uploader.upload(
//         eventBanner.tempFilePath,
//         {
//           folder: "event_banners", // Create a folder in Cloudinary
//           resource_type: "image",
//         }
//       );

//       console.log("Image uploaded to Cloudinary:", cloudinaryUpload.secure_url);

//       // Insert event with the Cloudinary URL instead of storing binary data
//       const result = await pool.query(
//         "INSERT INTO event (event_name, event_details, event_date, user_id, event_venue, event_time, event_url, event_banner) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING event_id",
//         [
//           eventName,
//           eventDetails,
//           eventDate,
//           adminId,
//           eventVenue,
//           eventTime,
//           eventUrl,
//           cloudinaryUpload.secure_url, // Store URL instead of binary
//         ]
//       );

//       const eventId = result.rows[0].event_id;

//       // Send emails to users
//       await sendEmailsToUsers({
//         eventname: eventName,
//         eventdetails: eventDetails,
//         eventdate: eventDate,
//         eventtime: eventTime,
//         eventvenue: eventVenue,
//         eventurl: eventUrl,
//       });

//       res.json({
//         message: "Event created successfully",
//         success: true,
//         eventId,
//         imageUrl: cloudinaryUpload.secure_url,
//       });
//     } catch (err) {
//       console.error("Error adding event:", err);
//       res.status(500).json({
//         message: "Error adding event: " + err.message,
//         success: false,
//       });
//     }
//   } else {
//     return res.status(403).json({
//       message: "Unauthorized - Admin privileges required",
//       success: false,
//     });
//   }
// });

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

//------------------------------- ML Integration begins here -----------------------------------------------
import natural from "natural";
import fetch from "node-fetch";

async function setupEventCategorizationSystem() {
  try {
    // Create categories table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS event_categories (
        category_id SERIAL PRIMARY KEY,
        category_name VARCHAR(100) NOT NULL UNIQUE,
        category_description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create event_category mapping table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS event_category_mappings (
        mapping_id SERIAL PRIMARY KEY,
        event_id INTEGER NOT NULL REFERENCES event(event_id) ON DELETE CASCADE,
        category_id INTEGER NOT NULL REFERENCES event_categories(category_id),
        confidence FLOAT NOT NULL,
        is_primary BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(event_id, category_id)
      )
    `);

    // Add column to event table if it doesn't exist
    try {
      await pool.query(`
        ALTER TABLE event ADD COLUMN IF NOT EXISTS category_tags TEXT[]
      `);
    } catch (error) {
      console.log("Category tags column might already exist:", error.message);
    }
    // Seed default categories if they don't exist
    const defaultCategories = [
      {
        name: "Academic",
        description: "Academic lectures, seminars, and educational events",
      },
      {
        name: "Social",
        description: "Social gatherings, parties, and networking events",
      },
      {
        name: "Cultural",
        description: "Cultural performances, exhibitions, and celebrations",
      },
      {
        name: "Professional",
        description: "Career fairs, workshops, and industry events",
      },
      {
        name: "Sports",
        description: "Athletic competitions, games, and sporting events",
      },
      {
        name: "Technology",
        description: "Tech conferences, hackathons, and meetups",
      },
      {
        name: "Arts",
        description: "Art exhibitions, performances, and creative workshops",
      },
      {
        name: "Charity",
        description: "Fundraising events and volunteer opportunities",
      },
      {
        name: "Entertainment",
        description: "Concerts, shows, and performances",
      },
    ];
    for (const category of defaultCategories) {
      await pool.query(
        `
        INSERT INTO event_categories (category_name, category_description)
        VALUES ($1, $2)
        ON CONFLICT (category_name) DO NOTHING
      `,
        [category.name, category.description]
      );
    }
    console.log("Event categorization system set up successfully");
  } catch (error) {
    console.error("Error setting up categorization system:", error);
  }
}

// Initialize categorization system
setupEventCategorizationSystem();

// Natural Language Processing tools
const tokenizer = new natural.WordTokenizer();
const stemmer = natural.PorterStemmer;

// Preprocess text for classification
function preprocessText(text) {
  if (!text) return "";
  // Convert to lowercase
  text = text.toLowerCase();
  // Tokenize
  const tokens = tokenizer.tokenize(text);
  // Remove stopwords and stem words
  const stopwords = ['a', 'about', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'how', 'in', 'is', 'it', 'of', 'on', 'or', 'that', 'the', 'this', 'to', 'was', 'what', 'when', 'where', 'who', 'will', 'with'];
  const filteredTokens = tokens.filter(token => !stopwords.includes(token) && token.length > 2);
  // Stem words
  const stemmedTokens = filteredTokens.map(token => stemmer.stem(token));
  return stemmedTokens.join(' ');
}

// Knowledge base for rule-based classification
const categoryKeywords = {
  'Academic': ['lecture', 'seminar', 'workshop', 'class', 'course', 'education', 'academic', 'learn', 'study', 'research', 'university', 'college', 'professor', 'faculty', 'school', 'teach', 'student'],
  'Social': ['party', 'social', 'networking', 'meetup', 'gathering', 'mixer', 'reception', 'happy hour', 'social hour', 'mingle', 'connect', 'socialize'],
  'Cultural': ['culture', 'cultural', 'art', 'heritage', 'tradition', 'festival', 'celebration', 'exhibit', 'dance', 'music', 'performance', 'language', 'diversity'],
  'Professional': ['career', 'job', 'professional', 'industry', 'business', 'corporate', 'employment', 'recruiting', 'resume', 'interview', 'networking', 'skills'],
  'Sports': ['sport', 'game', 'match', 'tournament', 'athletic', 'competition', 'play', 'team', 'fitness', 'exercise', 'league', 'championship'],
  'Technology': ['tech', 'technology', 'coding', 'programming', 'developer', 'software', 'hardware', 'computer', 'digital', 'innovation', 'startup', 'hackathon', 'ai', 'machine learning', 'data'],
  'Arts': ['art', 'arts', 'exhibition', 'gallery', 'creative', 'design', 'paint', 'draw', 'photography', 'sculpture', 'craft', 'artistic', 'museum'],
  'Charity': ['charity', 'fundraiser', 'donate', 'volunteer', 'nonprofit', 'cause', 'community service', 'giving', 'philanthropy', 'help', 'support'],
  'Entertainment': ['entertainment', 'concert', 'show', 'performance', 'movie', 'film', 'theater', 'comedy', 'fun', 'enjoy', 'amusement', 'recreation']
};

// Rule-based classifier
function classifyEventByRules(eventName, eventDetails) {
  const combinedText = `${eventName} ${eventDetails}`.toLowerCase();
  const preprocessedText = preprocessText(combinedText);
  
  const scores = {};
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    scores[category] = 0;
    
    for (const keyword of keywords) {
      const regex = new RegExp(`\\b${keyword}\\b|\\b${stemmer.stem(keyword)}\\b`, 'gi');
      const matches = (preprocessedText.match(regex) || []).length;
      scores[category] += matches;
    }
  }
  // Sort categories by score
  const sortedCategories = Object.entries(scores)
    .map(([category, score]) => ({ category, score }))
    .sort((a, b) => b.score - a.score);
  
  return sortedCategories.map(({ category, score }) => ({
    category,
    confidence: score > 0 ? Math.min(score / 5, 1) : 0, // Normalize score to [0,1]
  }));
}

// Extract keywords/tags from event text
function extractKeywords(text) {
  if (!text) return [];
  
  // Preprocess
  const preprocessedText = preprocessText(text);
  const tokens = preprocessedText.split(' ');
  
  // Count token frequency
  const tokenFreq = {};
  tokens.forEach(token => {
    tokenFreq[token] = (tokenFreq[token] || 0) + 1;
  });
  
  // Get top keywords by frequency
  const sortedTokens = Object.entries(tokenFreq)
    .filter(([token, freq]) => token.length > 3) // Filter out short tokens
    .sort((a, b) => b[1] - a[1]) // Sort by frequency
    .slice(0, 5) // Take top 5
    .map(([token]) => token);
  
  return sortedTokens;
}
async function categorizeEvent(eventId, eventName, eventDetails) {
  try {
    console.log(`Categorizing event ${eventId}: ${eventName}`);

    // Method 1: Rule-based classification
    const categories = classifyEventByRules(eventName, eventDetails);

    console.log("Classified categories:", categories);

    // Extract keywords/tags
    const combinedText = `${eventName} ${eventDetails}`;
    const keywords = extractKeywords(combinedText);

    // Update event with tags
    await pool.query(
      "UPDATE event SET category_tags = $1 WHERE event_id = $2",
      [keywords, eventId]
    );

    // Clear existing category mappings
    await pool.query(
      "DELETE FROM event_category_mappings WHERE event_id = $1",
      [eventId]
    );

    // Store top 3 category mappings
    const topCategories = categories
      .slice(0, 3)
      .filter((cat) => cat.confidence > 0.1);

    for (let i = 0; i < topCategories.length; i++) {
      const { category, confidence } = topCategories[i];

      // Get category ID
      const categoryResult = await pool.query(
        "SELECT category_id FROM event_categories WHERE category_name = $1",
        [category]
      );

      if (categoryResult.rows.length > 0) {
        const categoryId = categoryResult.rows[0].category_id;

        // Insert mapping
        await pool.query(
          "INSERT INTO event_category_mappings (event_id, category_id, confidence, is_primary) VALUES ($1, $2, $3, $4)",
          [eventId, categoryId, confidence, i === 0] // First category is primary
        );
      }
    }

    console.log(`Event ${eventId} categorized successfully`);
    return { categories: topCategories, tags: keywords };
  } catch (error) {
    console.error("Error categorizing event:", error);
    return null;
  }
}

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

      // Automatically categorize the event using ML
      const categorization = await categorizeEvent(
        eventId,
        eventName,
        eventDetails
      );

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
        categorization,
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

app.get("/events/category/:categoryName", async (req, res) => {
  const { categoryName } = req.params;
  try {
    const events = await pool.query(
      `
      SELECT e.* FROM event e
      JOIN event_category_mappings ecm ON e.event_id = ecm.event_id
      JOIN event_categories ec ON ecm.category_id = ec.category_id
      WHERE ec.category_name = $1
      ORDER BY ecm.confidence DESC, e.event_date ASC
    `,
      [categoryName]
    );

    res.json({
      category: categoryName,
      events: events.rows,
      success: true,
    });
  } catch (error) {
    console.error("Error getting events by category:", error);
    res
      .status(500)
      .json({ message: "Error retrieving events", success: false });
  }
});

// Get all available categories
app.get("/event-categories", async (req, res) => {
  try {
    const categories = await pool.query(`
      SELECT ec.*, COUNT(ecm.event_id) as event_count
      FROM event_categories ec
      LEFT JOIN event_category_mappings ecm ON ec.category_id = ecm.category_id
      GROUP BY ec.category_id
      ORDER BY event_count DESC
    `);

    res.json({
      categories: categories.rows,
      success: true,
    });
  } catch (error) {
    console.error("Error getting categories:", error);
    res
      .status(500)
      .json({ message: "Error retrieving categories", success: false });
  }
});

// Endpoint to suggest related events
app.get("/related-events/:eventId", async (req, res) => {
  const { eventId } = req.params;
  try {
    // Get the categories of the specified event
    const eventCategories = await pool.query(
      `
      SELECT ec.category_id, ec.category_name
      FROM event_category_mappings ecm
      JOIN event_categories ec ON ecm.category_id = ec.category_id
      WHERE ecm.event_id = $1
    `,
      [eventId]
    );

    if (eventCategories.rows.length === 0) {
      return res.json({
        relatedEvents: [],
        success: true,
      });
    }

    // Get category IDs
    const categoryIds = eventCategories.rows.map((row) => row.category_id);

    // Find events in the same categories, excluding the current event
    const relatedEvents = await pool.query(
      `
      SELECT DISTINCT e.*, ec.category_name,
             COUNT(DISTINCT ecm.category_id) as category_matches
      FROM event e
      JOIN event_category_mappings ecm ON e.event_id = ecm.event_id
      JOIN event_categories ec ON ecm.category_id = ec.category_id
      WHERE ecm.category_id = ANY($1)
      AND e.event_id != $2
      AND e.event_date >= CURRENT_DATE
      GROUP BY e.event_id, ec.category_name
      ORDER BY category_matches DESC, e.event_date ASC
      LIMIT 5
    `,
      [categoryIds, eventId]
    );

    res.json({
      relatedEvents: relatedEvents.rows,
      success: true,
    });
  } catch (error) {
    console.error("Error getting related events:", error);
    res
      .status(500)
      .json({ message: "Error retrieving related events", success: false });
  }
});

// Endpoint to analyze text and suggest event categories (for frontend use during event creation)
app.post("/analyze-event-text", async (req, res) => {
  const { eventName, eventDetails } = req.body;

  try {
    if (!eventName) {
      return res
        .status(400)
        .json({ message: "Event name is required", success: false });
    }

    // Classify event text
    const categories = classifyEventByRules(eventName, eventDetails || "");

    // Extract keywords
    const keywords = extractKeywords(`${eventName} ${eventDetails || ""}`);

    res.json({
      suggestedCategories: categories.slice(0, 3),
      suggestedTags: keywords,
      success: true,
    });
  } catch (error) {
    console.error("Error analyzing event text:", error);
    res.status(500).json({ message: "Error analyzing text", success: false });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
