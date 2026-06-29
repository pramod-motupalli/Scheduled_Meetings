# Multi-Tenant SaaS API Key Management System

This directory contains the central Django backend for business logic and the multi-tenant API key system.

## Setup Steps

### 1. Database Migrations
Run the following commands to create the new tables (`Company`, `Meeting`, `Participant`):
```bash
.\venv\Scripts\python.exe manage.py makemigrations meetings
.\venv\Scripts\python.exe manage.py migrate
```

### 2. Seed Test Data
Run the seeding script to create a test company (`test@huddle.com` with password `password123`):
```bash
.\venv\Scripts\python.exe C:\Users\Ranga\.gemini\antigravity-ide\brain\c29b5d72-0766-455a-b9a3-6059163bfd92\scratch\seed.py
```

### 3. Launching Django Development Server
Start the server on port 8000:
```bash
.\venv\Scripts\python.exe manage.py runserver 8000
```

---

## Security Notes

### 1. Key Masking (GET /company/api-key)
- **Design Rule**: Full API keys are only readable within **24 hours** of creation.
- **Goal**: Protects keys from unauthorized exposure. If a key was generated more than 24 hours ago, the endpoint masks it as `t_***abcd`. If the user loses their key, they are forced to regenerate a new one instead of viewing the plaintext version.

### 2. Rate Limiting
- **Design Rule**: Max 5 regenerations per hour per company.
- **Goal**: Prevents denial of service (DoS) and brute-force key exhaustion attacks. Enforced using Django's default caching mechanism with sliding-window history tracking.

### 3. Masked Logging
- **Design Rule**: Plaintext API keys must **never** be logged to stdout, files, or telemetry.
- **Goal**: In the `ApiKeyAuthentication` class, only the last 4 characters are logged (e.g., `t_***abcd`).

### 4. Frontend Key Storage Recommendations
- Currently, the dashboard saves the JWT token in `localStorage`.
- **Recommendation**: For production environments, utilize secure, `HttpOnly` and `SameSite=Strict` cookies to transmit JWT tokens. This mitigates Cross-Site Scripting (XSS) risks since JavaScript cannot access `HttpOnly` cookies.
- Avoid storing raw API keys in the client's `localStorage` unless necessary, and ensure secure TLS/SSL encryption for all network transmissions.

---

## Running Verification Tests

To verify the system's security features and functionality automatically, run:
```bash
# Verify login, key generation, API-key authentication, tenant isolation, and rate-limiting
.\venv\Scripts\python.exe test_api_key_flow.py

# Verify inactive company block (returns 403 Forbidden)
.\venv\Scripts\python.exe test_inactive_company.py
```
Both scripts will run requests against `http://localhost:8000` and assert correct status codes and payloads.
