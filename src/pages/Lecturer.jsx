import {useState} from 'react'
import {Link,useNavigate,useParams} from 'react-router-dom'
import {Trash2} from 'lucide-react'
import {Shell,NoteRow,Empty,Field,ConfirmDialog,PagedList} from '../components/ui'
import {DEPARTMENTS} from '../data/mock'
import {getUser,lecturerKey} from '../api'
import {useStore} from '../store'
const useDelete=()=>{const {removeNote,say}=useStore(),[target,setTarget]=useState(null)
  const dialog=target&&<ConfirmDialog title="Delete this note?" text={`"${target.title}" will be removed from your materials.`} action="Delete note" onCancel={()=>setTarget(null)} onConfirm={()=>{removeNote(target.id);say('Note deleted');setTarget(null)}}/>
  return [setTarget,dialog]}
export function LecturerDashboard(){
  const {notes,courses}=useStore(),me=getUser('lecturer')||{},mine=notes.filter(n=>n.lecturerId===lecturerKey()),[del,dialog]=useDelete()
  return <Shell role="lecturer"><h1 className="text-3xl">{me.returning?'Welcome back':'Welcome'}, {me.name}</h1><p>{me.id}</p>
  <div className="mt-4 grid gap-4 sm:grid-cols-3"><div className="card bg-ivory"><div className="text-4xl font-extrabold text-navy">{mine.length}</div>notes uploaded</div><div className="card"><div className="text-4xl font-extrabold text-navy">{courses.length}</div>courses added</div><div className="card grid place-items-center"><Link to="/lecturer/notes/upload" className="btn btn-gold">Upload a note</Link></div></div>
  <h2 className="mt-6 text-2xl">Recent notes</h2><div className="card mt-3">{mine.length?mine.slice(0,4).map(n=><NoteRow key={n.id} n={n} role="lecturer" onDelete={del}/>):<Empty title="No notes yet" text="Upload your first lecture note."/>}</div>{dialog}</Shell>}
export function ManageNotes(){
  const {notes,courses}=useStore(),[q,setQ]=useState(''),[cf,setCf]=useState(''),[del,dialog]=useDelete(),list=notes.filter(n=>n.lecturerId===lecturerKey()&&(!cf||n.courseId===cf)&&n.title.toLowerCase().includes(q.toLowerCase()))
  return <Shell role="lecturer"><div className="flex items-center justify-between"><h1 className="text-3xl">My notes</h1><Link to="/lecturer/notes/upload" className="btn btn-gold">Upload a note</Link></div>
  <div className="flex flex-wrap gap-4"><div><label htmlFor="lq" className="label">Search my notes</label><input id="lq" className="input w-64" value={q} onChange={e=>setQ(e.target.value)}/></div><div><label htmlFor="cf" className="label">Filter by course</label><select id="cf" className="input w-64" value={cf} onChange={e=>setCf(e.target.value)}><option value="">All courses</option>{courses.map(c=><option key={c.id} value={c.id}>{c.code}</option>)}</select></div></div>
  <div className="card mt-4">{list.length?<PagedList items={list} render={n=><NoteRow key={n.id} n={n} role="lecturer" onDelete={del}/>}/>:<Empty title="No notes found" text="Upload a note or change your filters."/>}</div>{dialog}</Shell>}
export function NoteForm(){const {ready}=useStore();return ready?<NoteFormInner/>:<Shell role="lecturer"><p>Loading notes…</p></Shell>}
function NoteFormInner(){
  const {noteId}=useParams(),{notes,courses,getCourse,addNote,updateNote,say}=useStore(),nav=useNavigate(),old=notes.find(n=>n.id===noteId),oc=old&&getCourse(old.courseId)
  const [f,setF]=useState({title:old?.title||'',description:old?.description||'',courseId:old?.courseId||'',semester:oc?.semester||''}),[file,setFile]=useState(null),[fk,setFk]=useState(0),[e,setE]=useState({}),[pct,setPct]=useState(null)
  const set=k=>x=>setF({...f,[k]:x.target.value}),opts=courses
  const pick=x=>{const c=getCourse(x.target.value);setF({...f,courseId:x.target.value,semester:c?c.semester:f.semester})}
  const size=b=>(b/1048576).toFixed(1)+' MB'
  const submit=ev=>{ev.preventDefault();const x={title:f.title.trim()?'':'Enter a title.',courseId:f.courseId?'':'Choose a course.',semester:f.semester?'':'Choose a semester.',file:(old&&!file)||(file&&file.type==='application/pdf')?'':file?'Only PDF files are accepted.':'Choose a PDF file.'};setE(x);if(Object.values(x).some(Boolean))return
    const meta=file?{fileName:file.name,fileSize:size(file.size),fileType:'PDF',blob:file}:{}
    if(old){updateNote(noteId,{title:f.title,description:f.description,courseId:f.courseId,semester:f.semester,...meta}).then(()=>{say('Changes saved');nav('/lecturer/notes')});return}
    setPct(1);addNote({id:'n'+Date.now(),createdAt:Date.now(),title:f.title,description:f.description,courseId:f.courseId,semester:f.semester,level:300,lecturerId:lecturerKey(),lecturerName:(getUser('lecturer')||{}).name,uploadDate:new Date().toISOString().slice(0,10),status:'Published',...meta}).then(()=>{say('Note uploaded successfully.');nav('/lecturer/notes')}).catch(()=>{setPct(null);setE({file:'The file could not be saved in this browser. Try again.'})})}
  return <Shell role="lecturer"><h1 className="text-3xl">{old?'Edit note details':'Upload a note'}</h1><form onSubmit={submit} noValidate className="card mt-4 max-w-xl">
  <Field id="ti" label="Title" value={f.title} onChange={set('title')} error={e.title}/><Field id="de" label="Description (optional)"><textarea id="de" rows="2" className="input" value={f.description} onChange={set('description')}/></Field>
  <Field id="lv" label="Academic level"><input id="lv" className="input bg-cloud" value="300 Level" readOnly/></Field>
  <Field id="co" label="Course" error={e.courseId}><select id="co" className="input" value={f.courseId} onChange={pick}><option value="">Choose a course</option>{opts.map(c=><option key={c.id} value={c.id}>{c.code} {c.title}</option>)}</select>{!opts.length&&<p className="mt-1 text-sm">No courses yet. <Link to="/lecturer/courses" className="text-brand underline">Add a course</Link></p>}</Field>
  <Field id="sm" label="Semester" error={e.semester}><select id="sm" className="input" value={f.semester} onChange={set('semester')}><option value="">Choose a semester</option><option>First</option><option>Second</option></select></Field>
  <label htmlFor="fi" className="label">{old?'Replace PDF (optional)':'PDF file'}</label><input key={fk} id="fi" type="file" accept="application/pdf" className="input" onChange={x=>setFile(x.target.files[0]||null)}/>
  {file&&<p className="mt-1">{file.name} ({size(file.size)}) <button type="button" className="btn btn-alt btn-sm" onClick={()=>{setFile(null);setFk(k=>k+1)}}>Remove</button></p>}{old&&!file&&<p className="mt-1 text-sm">Current file: {old.fileName}</p>}<div className="err" role="alert">{e.file}</div>
  <p className="mt-4 flex gap-2"><button className="btn btn-gold" disabled={pct!=null}>{pct!=null?'Uploading…':old?'Save changes':'Upload note'}</button><Link to="/lecturer/notes" className="btn btn-alt">Cancel</Link></p></form></Shell>}

export function ManageCourses(){
  const {courses,notes,ready,addCourse,removeCourse,say}=useStore(),[f,setF]=useState({code:'',title:'',semester:''}),[e,setE]=useState({}),[target,setTarget]=useState(null)
  const set=k=>x=>setF({...f,[k]:x.target.value}),count=id=>notes.filter(n=>n.courseId===id).length,flat=s=>s.replace(/\s/g,'').toLowerCase()
  const submit=ev=>{ev.preventDefault();const code=f.code.trim().replace(/\s+/g,' ').toUpperCase(),title=f.title.trim()
    const x={code:!code?'Enter a course code.':courses.some(c=>flat(c.code)===flat(code))?'This course code already exists.':'',title:title?'':'Enter a course title.',semester:f.semester?'':'Choose a semester.'};setE(x);if(Object.values(x).some(Boolean))return
    addCourse({id:'c'+Date.now(),code,title,department:DEPARTMENTS[0],level:300,semester:f.semester}).then(()=>{say('Course added');setF({...f,code:'',title:'',semester:''})}).catch(()=>say('The course could not be saved in this browser.'))}
  const ask=c=>count(c.id)?say('Delete the notes in this course first.'):setTarget(c)
  return <Shell role="lecturer"><h1 className="text-3xl">Courses</h1><p>Add the 300 level courses your students will see. Notes are uploaded under a course.</p>
  <form onSubmit={submit} noValidate className="card mt-4 max-w-xl"><h3>Add a course</h3>
  <Field id="cc" label="Course code" value={f.code} onChange={set('code')} error={e.code}/>
  <Field id="ct" label="Course title" value={f.title} onChange={set('title')} error={e.title}/>
  <Field id="cs" label="Semester" error={e.semester}><select id="cs" className="input" value={f.semester} onChange={set('semester')}><option value="">Choose a semester</option><option>First</option><option>Second</option></select></Field>
  <p className="mt-4"><button className="btn btn-gold">Add course</button></p></form>
  <h2 className="mt-6 text-2xl">All courses</h2><div className="card mt-3">{!ready?<p>Loading courses…</p>:courses.length?courses.map(c=><div key={c.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-slate/10 py-3 last:border-0"><div><h3 className="text-lg">{c.code} {c.title}</h3><small>{c.level} Level · {c.semester} semester · {count(c.id)} notes</small></div>{c.builtIn?<small>Default course</small>:<button className="btn btn-danger btn-sm" onClick={()=>ask(c)}><Trash2 size={15}/>Delete</button>}</div>):<Empty title="No courses yet" text="Add your first course above."/>}</div>
  {target&&<ConfirmDialog title="Delete this course?" text={`${target.code} ${target.title} will be removed.`} action="Delete course" onCancel={()=>setTarget(null)} onConfirm={()=>{removeCourse(target.id);say('Course deleted');setTarget(null)}}/>}</Shell>}
