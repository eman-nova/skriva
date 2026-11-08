# Skriva backend contract

The front end (`src/api.js`) calls these endpoints when `VITE_API_URL` is set in `.env`.
Build the backend to match this, or change `src/api.js` to match the backend. Nothing else needs to change.

All requests send `Authorization: Bearer <token>` after login. Responses are JSON.
Errors: return a non-2xx status and `{ "message": "Text the user can read" }`. A `401` means the token is invalid or expired.
Enable CORS for the front end's address.

## Auth
| Method | Path | Body | Success response |
|---|---|---|---|
| POST | `/auth/login` | `{ role: "student" \| "lecturer", identifier, password }` | `{ token, user }` |
| POST | `/auth/forgot-password` | `{ role, identifier }` | `204` (always, even if the account does not exist) |
| POST | `/auth/change-password` | `{ currentPassword, newPassword }` | `204` |

`identifier` is the matric number for students, and the lecturer ID or personal email for lecturers.

`user`: `{ id, name, department, email, matricNumber (students), level (students, 300) }`

## Courses
| Method | Path | Notes |
|---|---|---|
| GET | `/courses` | Array of courses |
| POST | `/courses` | Body `{ code, title, department, level, semester }`. Lecturers only. Returns the new course. Reject a duplicate `code` with 409. |
| DELETE | `/courses/:id` | Lecturers only. Reject with 409 if the course still has notes. |

Course: `{ id, code, title, department, level: 300, semester: "First" | "Second" }`

## Notes
| Method | Path | Notes |
|---|---|---|
| GET | `/notes` | Array of notes. Students see published notes. Lecturers see all notes. |
| POST | `/notes` | `multipart/form-data`: `title`, `description`, `courseId`, `semester`, `file` (PDF only). Lecturers only. Returns the new note. |
| PUT | `/notes/:id` | Same fields as POST. `file` is optional (only sent when replacing the PDF). Only the note's owner. Returns the updated note. |
| DELETE | `/notes/:id` | Only the note's owner. |
| GET | `fileUrl` | The PDF. Needs the bearer token. Use `Content-Type: application/pdf`. |

Note: `{ id, title, description, courseId, semester, lecturerId, lecturerName, createdAt (ISO date), fileName, fileSize (bytes), fileUrl, status: "Published" }`
