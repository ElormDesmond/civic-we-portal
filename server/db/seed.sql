-- Seed Departments
INSERT INTO departments (name, description, icon) VALUES 
('Public Works', 'Responsible for infrastructure, roads, and waste management.', 'truck'),
('Finance', 'Manages municipal budgets, taxes, and financial planning.', 'credit-card'),
('Health', 'Oversees public health initiatives and community clinics.', 'heart-pulse');

-- Seed Officials
INSERT INTO officials (full_name, role, bio, department_id) VALUES 
('John Doe', 'Director of Public Works', 'Expert in urban planning and infrastructure.', 1),
('Jane Smith', 'Chief Financial Officer', 'Dedicated to transparent fiscal management.', 2),
('Dr. Akosua Mensah', 'Health Director', 'Public health advocate with 15 years experience.', 3);

-- Seed News
INSERT INTO news (title, content, author) VALUES 
('New Community Park Opening', 'We are excited to announce the opening of the Green Valley Park this weekend.', 'Admin'),
('Budget Hearing Next Tuesday', 'Join us for a public hearing on the upcoming annual budget proposal.', 'Finance Dept'),
('Vaccination Drive Starts Monday', 'Free health screenings and vaccinations will be available at the city hall.', 'Health Dept');

-- Seed Projects
INSERT INTO projects (title, description, status, budget, end_date, latitude, longitude) VALUES 
('Main Street Paving', 'Resurfacing of the primary commercial corridor.', 'Ongoing', 500000.00, '2026-08-15', 5.6037, -0.1870),
('Smart Street Lighting', 'Installation of energy-efficient LED lights with sensors.', 'Completed', 120000.00, '2026-03-01', 5.6145, -0.1982),
('Community Center Expansion', 'Adding a new youth wing to the central community hub.', 'Planning', 850000.00, '2027-01-20', 5.5921, -0.1743);
