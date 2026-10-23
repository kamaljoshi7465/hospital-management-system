-- =============================================================================
-- Hospital Management System – Seed Data (matching frontend JSON mocks)
-- =============================================================================

USE hospital_management;

-- 1. USERS
INSERT INTO users (id, name, email, role) VALUES
(1, 'Admin User', 'admin@medicare.com', 'ADMIN'),
(2, 'Dr. Amit Sharma', 'amit.sharma@example.com', 'DOCTOR'),
(3, 'Dr. Sneha Kulkarni', 'sneha.kulkarni@example.com', 'DOCTOR'),
(4, 'Dr. Rajesh Mehta', 'rajesh.mehta@example.com', 'DOCTOR'),
(5, 'Rahul Verma', 'rahul.verma@example.com', 'PATIENT'),
(6, 'Priya Singh', 'priya.singh@example.com', 'PATIENT')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 2. DOCTORS
INSERT INTO doctors (id, user_id, name, email, phone, specialization, qualification, experience_years, consultation_fee, rating, total_reviews, bio, image, available, working_days, working_hours_start, working_hours_end, slot_duration_minutes) VALUES
(1, 2, 'Dr. Amit Sharma', 'amit.sharma@example.com', '9000000001', 'General Physician', 'MBBS, MD (Internal Medicine)', 10, 600.00, 4.8, 128, 'Experienced general physician specializing in preventive healthcare, lifestyle diseases, diabetes management, and chronic illness care.', 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400', 1, 'Monday,Tuesday,Wednesday,Thursday,Friday,Saturday', '09:00', '17:00', 30),
(2, 3, 'Dr. Sneha Kulkarni', 'sneha.kulkarni@example.com', '9000000004', 'Cardiologist', 'MBBS, MD, DM (Cardiology)', 12, 900.00, 4.9, 194, 'Senior interventional cardiologist with extensive experience in coronary interventions, hypertension management, and heart failure rehabilitation.', 'https://images.unsplash.com/photo-1594824813682-127dbca03780?auto=format&fit=crop&q=80&w=400', 1, 'Monday,Tuesday,Wednesday,Thursday,Friday', '10:00', '18:00', 30),
(3, 4, 'Dr. Rajesh Mehta', 'rajesh.mehta@example.com', '9000000005', 'Orthopedic Surgeon', 'MBBS, MS (Orthopedics), MCh', 15, 800.00, 4.7, 160, 'Consultant orthopedic and joint replacement surgeon with special interest in arthroscopy and sports injuries.', 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400', 1, 'Tuesday,Wednesday,Thursday,Friday,Saturday', '09:30', '16:30', 30)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 3. DOCTOR AVAILABILITIES
INSERT INTO doctor_availabilities (doctor_id, day_of_week, is_available, start_time, end_time, breaks_json, timezone) VALUES
(1, 'Monday', 1, '09:00', '17:00', '[{"startTime":"13:00","endTime":"14:00"}]', 'Asia/Kolkata'),
(1, 'Tuesday', 1, '09:00', '17:00', '[{"startTime":"13:00","endTime":"14:00"}]', 'Asia/Kolkata'),
(1, 'Wednesday', 1, '09:00', '17:00', '[{"startTime":"13:00","endTime":"14:00"}]', 'Asia/Kolkata'),
(1, 'Thursday', 1, '09:00', '17:00', '[{"startTime":"13:00","endTime":"14:00"}]', 'Asia/Kolkata'),
(1, 'Friday', 1, '09:00', '17:00', '[{"startTime":"13:00","endTime":"14:00"}]', 'Asia/Kolkata'),
(1, 'Saturday', 1, '09:00', '13:00', '[]', 'Asia/Kolkata')
ON DUPLICATE KEY UPDATE is_available=VALUES(is_available);

-- 4. PATIENTS
INSERT INTO patients (id, user_id, full_name, email, phone, date_of_birth, gender, blood_group, city, state, country, emergency_contact_name, emergency_contact_relationship, emergency_contact_phone, allergies, chronic_conditions, bp, heart_rate, blood_sugar, weight_kg, height_cm, temperature_f, vitals_last_updated) VALUES
(1, 5, 'Rahul Verma', 'rahul.verma@example.com', '+91 98765 43210', '1998-05-15', 'MALE', 'B+', 'Noida', 'Uttar Pradesh', 'India', 'Sunita Verma', 'Mother', '+91 98765 43219', 'Penicillin,Dust Mites', 'Mild Hypertension (controlled)', '118/78', 72, 94, 71.5, 178, 98.4, '2026-10-14'),
(2, 6, 'Priya Singh', 'priya.singh@example.com', '+91 98111 22334', '1997-08-20', 'FEMALE', 'O+', 'Ghaziabad', 'Uttar Pradesh', 'India', 'Vikram Singh', 'Spouse', '+91 98111 22330', 'Sulfa drugs', 'None', '112/74', 68, 88, 58.0, 163, 98.6, '2026-10-12')
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name);

-- 5. MEDICATIONS
INSERT INTO medications (patient_id, name, dosage, frequency, doctor_name, refill_status) VALUES
(1, 'Telmisartan 40mg', '1 tablet daily', 'Morning after breakfast', 'Dr. Amit Sharma', 'ACTIVE'),
(1, 'Vitamin D3 60K', '1 capsule weekly', 'Sunday with milk', 'Dr. Amit Sharma', 'REFILL_DUE');

-- 6. APPOINTMENTS
INSERT INTO appointments (id, patient_id, doctor_id, appointment_date, start_time, end_time, status, consultation_type, reason) VALUES
(101, 1, 1, '2026-11-02', '10:00', '10:30', 'CONFIRMED', 'IN_PERSON', 'General health checkup & blood sugar review'),
(102, 1, 2, '2026-11-12', '14:30', '15:00', 'BOOKED', 'ONLINE', 'Cardiology screening & ECG discussion'),
(103, 1, 1, '2026-10-08', '09:30', '10:00', 'COMPLETED', 'IN_PERSON', 'Routine consultation & seasonal allergy review'),
(104, 1, 3, '2026-09-22', '11:30', '12:00', 'COMPLETED', 'ONLINE', 'Dermatology consultation for rash'),
(105, 1, 3, '2026-09-05', '15:00', '15:30', 'CANCELLED', 'IN_PERSON', 'Left knee stiffness follow-up')
ON DUPLICATE KEY UPDATE status=VALUES(status);
