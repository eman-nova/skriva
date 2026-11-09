# Skriva backend contract

The front end (`src/api.js`) calls these endpoints when `VITE_API_URL` is set in `.env`.
Build the backend to match this, or change `src/api.js` to match the backend. Nothing else needs to change.

All requests send `Authorization: Bearer <token>` after login. Responses are JSON.
Errors: return a non-2xx status and `{ "message": "Text the user can read" }`. A `401` means the token is invalid or expired.
Enable CORS for the front end's address.

## Auth
| Method | Path | Body | Success response |
|---|---|---|---|
| POST | `/auth/register` | `{ role, name, identifier, department, email, password }` (`identifier` is the matric number or lecturer ID) | `{ token, user }`. Reject a duplicate identifier or email with 409. |
| POST | `/auth/login` | `{ role: "student" \| "lecturer", identifier, password }` | `{ token, user }` |
| POST | `/auth/forgot-password` | `{ role, identifier }` | `204` (always, even if the account does not exist) |
| POST | `/auth/change-password` | `{ currentPassword, newPassword }` | `204` |

`identifier` is the matric number for students, and the lecturer ID or personal email for lecturers.

`user`: `{ id, name, department, email, matricNumber (students), level (students, 300), lastLoginAt }`

`lastLoginAt` is the time of the user's previous session (set it when the account is created, and update it on every login), or `null` if there was none. The dashboard says "Welcome back" only when it has a value, and "Welcome" otherwise. Update it on every login.

## Courses
| Method | Path | Notes |
|---|---|---|
| GET | `/courses` | Array of courses |
| POST | `/courses` | Body `{ code, title, department, level, semester }`. Lecturers only. Returns the new course. Reject a duplicate `code` with 409. |
| DELETE | `/courses/:id` | Lecturers only. Reject with 409 if the course still has notes. |

Course: `{ id, code, title, department, level: 300, semester: "First" | "Second" }`

Seed these courses in the database (all Computer Science, 300 level, First semester). Without a backend, the app already includes them (`src/data/courses.js`):
BUT-CSC 301 Data Structures and Algorithm, BUT-CSC 311 Object-Oriented Programming, BUT-CSC 309 Artificial Intelligence, BUT-CSC 303 Numerical Computations, ICT 323 Introduction to Python Programming, SEN 301 Object-Oriented Analysis and Design, ICT 305 Data Communication System and Network, CYB 201 Introduction to Cyber Security.

## Notes
| Method | Path | Notes |
|---|---|---|
| GET | `/notes` | Array of notes. Students see published notes. Lecturers see all notes. |
| POST | `/notes` | `multipart/form-data`: `title`, `description`, `courseId`, `semester`, `file` (PDF only). Lecturers only. Returns the new note. |
| PUT | `/notes/:id` | Same fields as POST. `file` is optional (only sent when replacing the PDF). Only the note's owner. Returns the updated note. |
| DELETE | `/notes/:id` | Only the note's owner. |
| GET | `fileUrl` | The PDF. Needs the bearer token. Use `Content-Type: application/pdf`. |

Note: `{ id, title, description, courseId, semester, lecturerId, lecturerName, createdAt (ISO date), fileName, fileSize (bytes), fileUrl, status: "Published" }`
