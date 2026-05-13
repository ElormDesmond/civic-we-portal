-- This table stores all our users including citizens and admins
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'citizen', -- can be 'citizen' or 'admin'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- This table tracks permit applications submitted by citizens
CREATE TABLE permits (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    permit_type TEXT NOT NULL, -- e.g., 'building', 'marriage'
    status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected
    payload JSONB NOT NULL, -- stores the specific form data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Municipal Departments (e.g., Planning, Finance, Health)
CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    icon TEXT -- Name of the icon to display
);

-- Elected and Appointed Officials
CREATE TABLE officials (
    id SERIAL PRIMARY KEY,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL,
    bio TEXT,
    image_url TEXT,
    department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- News Articles and Press Releases
CREATE TABLE news (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author TEXT NOT NULL,
    image_url TEXT,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Municipal Development Projects
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Ongoing', -- Ongoing, Completed, Planning
    budget DECIMAL(15, 2),
    end_date DATE,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Search Indexes (Full-Text Search)
CREATE INDEX idx_news_search ON news USING GIN(to_tsvector('english', title || ' ' || content));
CREATE INDEX idx_projects_search ON projects USING GIN(to_tsvector('english', title || ' ' || description));
