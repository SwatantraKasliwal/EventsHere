-- Creating the admin login table
CREATE TABLE adminlogin (
    id SERIAL PRIMARY KEY,
    admin_id VARCHAR(20) UNIQUE NOT NULL,
    password VARCHAR(50) NOT NULL
);

-- Creating the event categories table
CREATE TABLE event_categories (
    category_id SERIAL PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    category_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Creating the events table
CREATE TABLE event (
    event_id SERIAL PRIMARY KEY,
    event_name VARCHAR(250) NOT NULL,
    event_details TEXT,
    event_date DATE,
    user_id INTEGER REFERENCES adminlogin(id),
    event_venue VARCHAR(250),
    event_time VARCHAR(10),
    event_url VARCHAR(300),
    event_banner TEXT,  -- Changed to match code (stores Cloudinary URL)
    category_tags TEXT[],  -- Array of text tags
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Creating the event-category mapping table
CREATE TABLE event_category_mappings (
    mapping_id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL REFERENCES event(event_id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES event_categories(category_id),
    confidence FLOAT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id, category_id)
);

-- Creating the student table
CREATE TABLE studentlogin (
    id SERIAL PRIMARY KEY,
    s_email VARCHAR(70) UNIQUE NOT NULL,
    s_password TEXT NOT NULL
);