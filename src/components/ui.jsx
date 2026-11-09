import {useState} from 'react'
import {Link,NavLink,Navigate} from 'react-router-dom'
import {useStore} from '../store'
import {LayoutDashboard,BookOpen,User,Upload,FileText,LogOut,Download,Pencil,Trash2} from 'lucide-react'
import logo from '../assets/logo.png'
import logoDark from '../assets/logo-dark.png'
import {getUser,logout,getFileBlob} from '../api'
export const lecturerName=n=>n.lecturerName||''
export const Logo=({className='',dark})=><img src={dark?logoDark:logo} alt="Skriva: Learn, Access, Grow" className={className}/>
export function PublicLayout({children,dark}){
  return <><header className={`z-10 ${dark?'absolute inset-x-0':'border-b border-slate/10 bg-white'}`}><div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3"><Link to="/"><Logo dark={dark} className="h-14"/></Link><nav className="flex gap-2"><Link to="/student/signup" className="btn btn-gold btn-sm">Student sign up</Link><Link to="/lecturer/signup" className={`btn btn-sm ${dark?'btn-ghost':'btn-alt'}`}>Lecturer sign up</Link></nav></div></header><main>{children}</main></>}
export function Shell({role,children}){
  if(!getUser(role))return <Navigate to={`/${role}/login`} replace/>
  const nav=role==='student'?[['/student/dashboard','Dashboard',LayoutDashboard],['/student/courses','Courses',BookOpen],['/student/profile','Profile',User]]:[['/lecturer/dashboard','Dashboard',LayoutDashboard],['/lecturer/notes','My notes',FileText],['/lecturer/courses','Courses',BookOpen],['/lecturer/notes/upload','Upload',Upload],['/lecturer/profile','Profile',User]]
  return <div className="md:grid md:min-h-screen md:grid-cols-[240px_1fr]"><aside className="flex flex-wrap items-center gap-1 bg-gradient-to-b from-[#001340] to-navy p-4 md:sticky md:top-0 md:h-screen md:flex-col md:items-stretch"><Link to="/"><Logo dark className="mb-3 w-32 md:w-full"/></Link>
    <nav aria-label={`${role} portal`} className="flex flex-wrap gap-1 md:flex-col">{nav.map(([to,t,I])=><NavLink key={to} to={to} end className={({isActive})=>`flex items-center gap-2 rounded-lg px-3 py-2 font-medium text-white ${isActive?'bg-brand shadow-lg':'hover:bg-white/10'}`}><I size={18}/>{t}</NavLink>)}</nav>
    <Link to="/" onClick={logout} className="flex items-center gap-2 px-3 py-2 text-white md:mt-auto"><LogOut size={18}/>Sign out</Link></aside><main className="min-w-0 p-5 md:p-8">{children}</main></div>}
export const Empty=({title,text})=><div className="rounded-2xl border-2 border-dashed border-slate/20 p-10 text-center"><h3>{title}</h3><p>{text}</p></div>
export function NoteRow({n,role,onDelete}){
  const {say,getCourse}=useStore(),c=getCourse(n.courseId)||{}
  return <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate/10 py-3 last:border-0"><div><h3 className="text-lg">{n.title}</h3><small>{c.code} · {lecturerName(n)} · {n.uploadDate} · {n.fileType}, {n.fileSize} · {n.semester||c.semester} semester</small></div>
  <div className="flex items-center gap-2">{role==='student'?<><Link className="btn btn-alt btn-sm" to={`/student/notes/${n.id}`}>Preview</Link><button className="btn btn-sm" onClick={()=>downloadNote(n).then(()=>say('Download started')).catch(e=>say(e.message))}><Download size={15}/>Download</button></>:<><span className="badge bg-blue-100">{n.status}</span><Link className="btn btn-alt btn-sm" to={`/lecturer/notes/${n.id}/edit`}><Pencil size={15}/>Edit</Link><button className="btn btn-danger btn-sm" onClick={()=>onDelete(n)}><Trash2 size={15}/>Delete</button></>}</div></div>}
export const Chip=({on,...p})=><button aria-pressed={on} className={`rounded-full border-2 px-3 py-1 ${on?'border-navy bg-navy text-white':'border-slate/15 bg-white'}`} {...p}/>
export const Field=({label,id,error,children,...p})=><><label htmlFor={id} className="label">{label}</label>{children||<input id={id} className="input" {...p}/>}<div className="err" role="alert">{error}</div></>
export const CourseCard=({c,count})=><Link to={`/student/courses/${c.id}`} className="card block transition hover:-translate-y-1"><span className="badge">{c.code}</span><h3 className="mt-1">{c.title}</h3><small>{c.semester} semester{count!=null&&` · ${count} notes`}</small></Link>
export const ConfirmDialog=({title,text,action,onConfirm,onCancel})=><div role="dialog" aria-modal="true" aria-labelledby="dd" className="fixed inset-0 z-40 grid place-items-center bg-navy/60 p-4"><div className="card max-w-sm"><h3 id="dd">{title}</h3><p>{text}</p><div className="flex justify-end gap-2"><button className="btn btn-alt" onClick={onCancel}>Cancel</button><button className="btn btn-danger" onClick={onConfirm}>{action}</button></div></div></div>
export function PagedList({items,render,size=4}){const [n,setN]=useState(size);return <>{items.slice(0,n).map(render)}{n<items.length&&<button className="btn btn-alt btn-sm mt-3" onClick={()=>setN(n+size)}>Show more ({items.length-n} left)</button>}</>}
export async function downloadNote(n){const u=URL.createObjectURL(await getFileBlob(n)),a=document.createElement('a');a.href=u;a.download=n.fileName;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),2000)}
