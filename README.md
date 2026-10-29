# Hospital Management System

A hospital appointment management platform built with React,
TypeScript, Java Spring Boot microservices, and MySQL.

## Applications

- Frontend: React + TypeScript + Vite
- Auth Service: Spring Boot
- Doctor Service: Spring Boot
- Appointment Service: Spring Boot
- Consultation Service: Spring Boot
- API Gateway: Spring Cloud Gateway
- Database: MySQL

## Frontend Setup

cd frontend
npm install
npm run dev

## Backend Setup

Configure the required environment variables, then run the Spring Boot API with its Maven Wrapper. Authentication is stateless; the API requires a random `JWT_SECRET` of at least 32 characters and the database credentials for MySQL.

```sh
export JWT_SECRET="$(openssl rand -base64 48)"
export DB_URL="jdbc:mysql://localhost:3306/hospital_management?createDatabaseIfNotExist=true&serverTimezone=Asia/Kolkata"
export DB_USERNAME="hospital_user"
export DB_PASSWORD="<database-password>"
cd backend/hospital-management-system
./mvnw spring-boot:run
```

To bootstrap the first administrator, set `ADMIN_BOOTSTRAP_EMAIL` and `ADMIN_BOOTSTRAP_PASSWORD` (at least 12 characters) for the initial run. If that email matches the seeded `ADMIN` account and its password is unset, it securely sets the password; it never promotes an existing non-admin account. Unset the bootstrap password after provisioning. Public signup creates Patient accounts only. Admins create staff accounts with `POST /api/users` and link Doctor profiles using `userId`; existing seeded accounts without a password must have one set by an admin before they can log in.

## Authentication API

- `POST /api/auth/signup` — create a patient account and patient profile.
- `POST /api/auth/login` — verify credentials and return a 30-minute HS256 bearer token.
- `POST /api/auth/logout` — revoke the presented token until expiry.
- `GET /api/auth/me` — return the current user's account and linked profile IDs.

Passwords are stored as BCrypt hashes. Keep bearer tokens only in the browser's tab-scoped session storage; send them in the `Authorization: Bearer` header. Tokens are checked for signature, issuer, expiration, revocation, account existence, and current role. Set `JWT_TTL_SECONDS` to change token lifetime.

Roles are `ADMIN`, `DOCTOR`, `RECEPTIONIST`, and `PATIENT`. All non-public APIs require a valid token, and controller checks restrict access by role and record ownership. Doctor directory and availability reads remain public for appointment discovery. Staff and admin interfaces are role gated in the frontend; a generic login accepts any role and redirects to its workspace.
