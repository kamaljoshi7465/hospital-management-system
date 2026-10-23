-- =============================================================================
-- Hospital Management System – Relational Database Schema (MySQL 8.0+)
-- Designed from Frontend UI components, TypeScript types, and JSON mocks.
-- =============================================================================

CREATE DATABASE IF NOT EXISTS hospital_management
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE hospital_management;

-- -----------------------------------------------------------------------------
-- 1. USERS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (email),
    INDEX idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 2. DOCTORS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS doctors (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNIQUE,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(25) NOT NULL,
    specialization VARCHAR(100) NOT NULL,
    qualification VARCHAR(200) NOT NULL,
    experience_years INT NOT NULL DEFAULT 0,
    consultation_fee DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    rating DECIMAL(2, 1) NOT NULL DEFAULT 5.0,
    total_reviews INT NOT NULL DEFAULT 0,
    bio TEXT,
    image VARCHAR(500),
    available BOOLEAN NOT NULL DEFAULT TRUE,
    working_days VARCHAR(200),
    working_hours_start VARCHAR(10),
    working_hours_end VARCHAR(10),
    slot_duration_minutes INT NOT NULL DEFAULT 30,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_doctors_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_doctors_specialization (specialization),
    INDEX idx_doctors_available (available),
    INDEX idx_doctors_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 3. DOCTOR AVAILABILITY TABLE (Weekly schedule & break times)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS doctor_availabilities (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    doctor_id BIGINT NOT NULL,
    day_of_week VARCHAR(15) NOT NULL,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    start_time VARCHAR(5) NOT NULL,
    end_time VARCHAR(5) NOT NULL,
    breaks_json TEXT,
    timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_availability_doctor FOREIGN KEY (doctor_id)
        REFERENCES doctors(id) ON DELETE CASCADE,
    CONSTRAINT uq_doctor_day UNIQUE (doctor_id, day_of_week),
    INDEX idx_availability_doctor (doctor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 4. PATIENTS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS patients (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(25) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(15) NOT NULL,
    blood_group VARCHAR(5) NOT NULL,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'India',
    emergency_contact_name VARCHAR(150),
    emergency_contact_relationship VARCHAR(50),
    emergency_contact_phone VARCHAR(25),
    allergies TEXT,
    chronic_conditions TEXT,
    bp VARCHAR(20),
    heart_rate INT,
    blood_sugar INT,
    weight_kg DOUBLE,
    height_cm DOUBLE,
    temperature_f DOUBLE,
    vitals_last_updated DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_patients_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_patients_email (email),
    INDEX idx_patients_phone (phone),
    INDEX idx_patients_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 5. MEDICATIONS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS medications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    name VARCHAR(200) NOT NULL,
    dosage VARCHAR(100),
    frequency VARCHAR(200),
    doctor_name VARCHAR(150),
    refill_status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_medications_patient FOREIGN KEY (patient_id)
        REFERENCES patients(id) ON DELETE CASCADE,
    INDEX idx_medications_patient (patient_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 6. APPOINTMENTS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS appointments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    doctor_id BIGINT NOT NULL,
    appointment_date DATE NOT NULL,
    start_time VARCHAR(5) NOT NULL,
    end_time VARCHAR(5) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'BOOKED',
    consultation_type VARCHAR(20) NOT NULL DEFAULT 'IN_PERSON',
    reason VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_appointments_patient FOREIGN KEY (patient_id)
        REFERENCES patients(id) ON DELETE CASCADE,
    CONSTRAINT fk_appointments_doctor FOREIGN KEY (doctor_id)
        REFERENCES doctors(id) ON DELETE CASCADE,
    CONSTRAINT chk_appointment_status CHECK (status IN ('BOOKED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW')),
    CONSTRAINT chk_consultation_type CHECK (consultation_type IN ('IN_PERSON', 'ONLINE')),
    INDEX idx_appointments_patient (patient_id),
    INDEX idx_appointments_doctor (doctor_id),
    INDEX idx_appointments_date (appointment_date),
    INDEX idx_appointments_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
