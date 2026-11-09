import {Routes,Route,Navigate} from 'react-router-dom'
import Landing from './pages/Landing'
import {Login,Signup,Forgot} from './pages/Auth'
import {StudentDashboard,StudentCourses,CourseMaterials,NotePage} from './pages/Student'
import {LecturerDashboard,ManageNotes,NoteForm,ManageCourses} from './pages/Lecturer'
import Profile from './pages/Profile'
export default function App(){return <>
<Routes>
<Route path="/" element={<Landing/>}/>
<Route path="/student/login" element={<Login role="student"/>}/>
<Route path="/lecturer/login" element={<Login role="lecturer"/>}/>
<Route path="/student/signup" element={<Signup role="student"/>}/>
<Route path="/lecturer/signup" element={<Signup role="lecturer"/>}/>
<Route path="/student/forgot-password" element={<Forgot role="student"/>}/>
<Route path="/lecturer/forgot-password" element={<Forgot role="lecturer"/>}/>
<Route path="/student/dashboard" element={<StudentDashboard/>}/>
<Route path="/student/courses" element={<StudentCourses/>}/>
<Route path="/student/courses/:courseId" element={<CourseMaterials/>}/>
<Route path="/student/notes/:noteId" element={<NotePage/>}/>
<Route path="/student/profile" element={<Profile role="student"/>}/>
<Route path="/lecturer/dashboard" element={<LecturerDashboard/>}/>
<Route path="/lecturer/notes" element={<ManageNotes/>}/>
<Route path="/lecturer/courses" element={<ManageCourses/>}/>
<Route path="/lecturer/notes/upload" element={<NoteForm/>}/>
<Route path="/lecturer/notes/:noteId/edit" element={<NoteForm/>}/>
<Route path="/lecturer/profile" element={<Profile role="lecturer"/>}/>
<Route path="*" element={<Navigate to="/" replace/>}/>
</Routes></>}
