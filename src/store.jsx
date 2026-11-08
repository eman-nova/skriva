import {createContext,useContext,useEffect,useState} from 'react'
import Toast from './components/Toast'
import * as db from './db'
import {API_ON,api} from './api'
const Ctx=createContext()
export const useStore=()=>useContext(Ctx)
const byCode=(a,b)=>a.code.localeCompare(b.code)
// One data source: the backend when VITE_API_URL is set, otherwise the browser (IndexedDB).
const src=API_ON?api:{
  loadCourses:db.loadCourses,createCourse:async c=>{await db.saveCourse(c);return c},deleteCourse:db.deleteCourse,
  loadNotes:db.loadNotes,createNote:async n=>{await db.saveNote(n);return n},updateNote:async(n)=>{await db.saveNote(n);return n},deleteNote:db.deleteNote}
export function Provider({children}){
  const [notes,setNotes]=useState([]),[courses,setCourses]=useState([]),[ready,setReady]=useState(false),[toast,setToast]=useState('')
  const say=m=>{setToast(m);setTimeout(()=>setToast(''),2600)}
  const load=()=>Promise.all([src.loadNotes(),src.loadCourses()]).then(([n,c])=>{
    if(!API_ON){const ids=new Set(c.map(x=>x.id));n.filter(x=>!ids.has(x.courseId)).forEach(x=>db.deleteNote(x.id));n=n.filter(x=>ids.has(x.courseId))} // drop leftovers from the old example courses
    setCourses(c.sort(byCode));setNotes(n.sort((a,b)=>b.createdAt-a.createdAt))}).catch(e=>say(API_ON?e.message:'Saved data could not be loaded in this browser.')).finally(()=>setReady(true))
  useEffect(()=>{load()},[])
  const getCourse=id=>courses.find(c=>c.id===id)
  const addCourse=async c=>{const s=await src.createCourse(c);setCourses(l=>[...l,s].sort(byCode))}
  const removeCourse=async id=>{await src.deleteCourse(id);setCourses(l=>l.filter(x=>x.id!==id))}
  const addNote=async n=>{const s=await src.createNote(n);setNotes(l=>[s,...l])}
  const updateNote=async(id,patch)=>{const n={...notes.find(x=>x.id===id),...patch},s=await src.updateNote(n,patch);setNotes(l=>l.map(x=>x.id===id?s:x))}
  const removeNote=async id=>{await src.deleteNote(id);setNotes(l=>l.filter(x=>x.id!==id))}
  return <Ctx.Provider value={{notes,courses,ready,reload:load,getCourse,addCourse,removeCourse,addNote,updateNote,removeNote,say}}>{children}<Toast text={toast}/></Ctx.Provider>}
