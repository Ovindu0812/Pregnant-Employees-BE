# Pregnant-Employees-BE

Spring Boot backend for the Pregnant Employees platform.

## Stack
- Java 17
- Spring Boot 3
- Spring Web
- Spring Data JPA
- Validation
- MySQL

## Run locally
1. Create a MySQL database named `pregnant_employees_db`.
2. Update `src/main/resources/application.properties` with your MySQL username and password.
3. Run the app with Maven:

```bash
mvn spring-boot:run
```

## API endpoints
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/users`
- `PATCH /api/users/{id}/toggle-status`
- `GET /api/profile/{id}`
- `PUT /api/profile/{id}`
- `GET /api/legal-rights`
- `POST /api/legal-rights`
- `PUT /api/legal-rights/{id}`
- `DELETE /api/legal-rights/{id}`
- `GET /api/assessments`
- `GET /api/assessments/user/{userId}`
- `POST /api/assessments/submit`
- `GET /api/feedback`
- `POST /api/feedback`# Pregnant-Employees-BE