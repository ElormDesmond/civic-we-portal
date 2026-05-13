-- Create a default administrator account
-- Email: admin@municipality.gov
-- Password: admin123
INSERT INTO users (full_name, email, password_hash, role) 
VALUES ('System Administrator', 'admin@municipality.gov', '$2a$10$Qmr3ayuREodTh31BWFxGLe3TOPqHV6IBdxZFT5ujQBcbB5Rb6HcwW', 'admin')
ON CONFLICT (email) DO NOTHING;
