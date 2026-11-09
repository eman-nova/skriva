import {useEffect,useState} from 'react'
import {Link,useParams} from 'react-router-dom'
import {Download} from 'lucide-react'
import {Shell,NoteRow,Empty,Chip,CourseCard,PagedList,downloadNote,lecturerName} from '../components/ui'
import {getUser,getFileBlob} from '../api'
import {DEPARTMENTS} from '../data/mock'
import {useStore} from '../store'
export function StudentDashboard(){
  const me=getUser('student')||{}
  const {notes,courses,getCourse}=useStore(),[q,setQ]=useState(''),found=notes.filter(n=>(n.title+(getCourse(n.courseId)?.title||'')+lecturerName(n)).toLowerCase().includes(q.toLowerCase())),mine=courses.filter(c=>c.department===me.department&&c.level===(me.level||300))
  return <Shell role="student"><h1 className="text-3xl">{me.returning?'Welcome back':'Welcome'}, {(me.name||'').split(' ')[0]}</h1><p>{me.department} · {me.level||300} Level · {me.matricNumber||me.id}</p>
  <label htmlFor="gs" className="label">Search lecture materials</label><input id="gs" className="input max-w-md" placeholder="Course, note title or lecturer" value={q} onChange={e=>setQ(e.target.value)}/>{q&&<div className="card mt-3">{found.length?found.map(n=><NoteRow key={n.id} n={n} role="student"/>):<Empty title="No matches" text="Try another word."/>}</div>}<h2 className="mt-6 text-2xl">Your courses</h2><div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{mine.length?mine.map(c=><CourseCard key={c.id} c={c} count={notes.filter(n=>n.courseId===c.id).length}/>):<div className="col-span-full"><Empty title="No courses yet" text="Courses appear here once your lecturers add them."/></div>}</div>
  <h2 className="mt-6 text-2xl">Recently added</h2><div className="card mt-3">{notes.length?[...notes].slice(0,4).map(n=><NoteRow key={n.id} n={n} role="student"/>):<Empty title="No notes yet" text="Notes appear here once your lecturers upload them."/>}</div></Shell>}
export function StudentCourses(){
  const {courses}=useStore(),[dept,setDept]=useState((getUser('student')||{}).department||DEPARTMENTS[0]),[q,setQ]=useState('')
  const list=courses.filter(c=>c.department===dept&&c.level===300&&(c.code+c.title).toLowerCase().includes(q.toLowerCase()))
  return <Shell role="student"><h1 className="text-3xl">Courses</h1><div className="my-3 flex flex-wrap gap-2" role="group" aria-label="Department">{DEPARTMENTS.map(d=><Chip key={d} on={d===dept} onClick={()=>setDept(d)}>{d}</Chip>)}</div>
  <p><span className="badge">300 Level</span> Skriva is open to 300 level students.</p><label htmlFor="cq" className="label">Search courses</label><input id="cq" className="input max-w-sm" value={q} onChange={e=>setQ(e.target.value)}/>
  <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{list.length?list.map(c=><CourseCard key={c.id} c={c}/>):<div className="col-span-full"><Empty title="No courses here yet" text="Courses appear here once your lecturers add them."/></div>}</div></Shell>}
export function CourseMaterials(){
  const {courseId}=useParams(),{notes,ready,getCourse}=useStore(),c=getCourse(courseId),[sem,setSem]=useState('All'),[q,setQ]=useState('')
  if(!ready)return <Shell role="student"><p>Loading course…</p></Shell>
  if(!c)return <Shell role="student"><Empty title="Course not found" text="Go back to your courses."/></Shell>
  const list=notes.filter(n=>n.courseId===c.id&&(sem==='All'||(n.semester||c.semester)===sem)&&(n.title+lecturerName(n)).toLowerCase().includes(q.toLowerCase()))
  return <Shell role="student"><Link to="/student/courses" className="text-brand underline">Back to courses</Link><h1 className="mt-2 text-3xl">{c.code} {c.title}</h1><p>{c.department} · {c.level} Level</p>
  <div className="my-3 flex gap-2" role="group" aria-label="Semester">{['All','First','Second'].map(s=><Chip key={s} on={s===sem} onClick={()=>setSem(s)}>{s}</Chip>)}</div>
  <label htmlFor="mq" className="label">Search notes or lecturers</label><input id="mq" className="input max-w-sm" value={q} onChange={e=>setQ(e.target.value)}/>
  <div className="card mt-4">{list.length?<PagedList items={list} render={n=><NoteRow key={n.id} n={n} role="student"/>}/>:<Empty title="No materials yet" text="Notes for this course appear here once your lecturer uploads them."/>}</div></Shell>}
export function NotePage(){
  const {noteId}=useParams(),{notes,ready,say,getCourse}=useStore(),n=notes.find(x=>x.id===noteId),[url,setUrl]=useState('')
  useEffect(()=>{if(!n)return;let u,off=false;getFileBlob(n).then(b=>{if(off)return;u=URL.createObjectURL(b);setUrl(u)}).catch(e=>say(e.message));return()=>{off=true;u&&URL.revokeObjectURL(u)}},[n?.id,n?.fileName])
  if(!ready)return <Shell role="student"><p>Loading note…</p></Shell>
  if(!n)return <Shell role="student"><Empty title="Note not found" text="It may have been removed."/></Shell>
  const c=getCourse(n.courseId)
  if(!c)return <Shell role="student"><Empty title="Note not found" text="Its course may have been removed."/></Shell>
  return <Shell role="student"><Link to={`/student/courses/${c.id}`} className="text-brand underline">Back to {c.code}</Link><h1 className="mt-2 text-3xl">{n.title}</h1><p>{c.code} · {lecturerName(n)} · {n.uploadDate} · {n.fileType}, {n.fileSize}</p>
  {n.description&&<p>{n.description}</p>}
  <div className="my-3 flex flex-wrap gap-2"><button className="btn" onClick={()=>downloadNote(n).then(()=>say('Download started')).catch(e=>say(e.message))}><Download size={18}/>Download PDF</button><a className="btn btn-alt" href={url} target="_blank" rel="noopener noreferrer">Open in new tab</a></div>
  <iframe title={`Preview of ${n.title}`} src={url} className="h-[75vh] w-full max-w-4xl rounded-lg border border-slate/10 bg-white"/></Shell>}
