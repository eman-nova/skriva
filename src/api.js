// Backend connection. Set VITE_API_URL in .env (see .env.example) to turn it on.
// With no VITE_API_URL the app keeps using the in-browser data (src/db.js) and demo login.
// The endpoints and data shapes expected from the backend are listed in API.md.
import {STUDENT,LECTURER} from './data/mock'
const BASE=(import.meta.env.VITE_API_URL||'').replace(/\/$/,'')
export const API_ON=!!BASE
const TK='skriva_token',UK='skriva_user'

export const getUser=role=>{
  if(!API_ON)return role==='student'?STUDENT:LECTURER
  try{const u=JSON.parse(localStorage.getItem(UK));return u&&u.role===role?u:null}catch{return null}}
export const lecturerKey=()=>API_ON?getUser('lecturer')?.id:'l1'
export const logout=()=>{localStorage.removeItem(TK);localStorage.removeItem(UK)}

async function req(path,{method='GET',body,form}={}){
  const h={},t=localStorage.getItem(TK)
  if(t)h.Authorization='Bearer '+t
  if(body)h['Content-Type']='application/json'
  let r
  try{r=await fetch(BASE+path,{method,headers:h,body:form||(body?JSON.stringify(body):undefined)})}
  catch{throw new Error('Cannot reach the server. Check your connection and try again.')}
  if(r.status===401&&!path.startsWith('/auth/')){logout();throw new Error('Your session has expired. Please log in again.')}
  if(!r.ok){let m='Something went wrong. Try again.';try{m=(await r.json()).message||m}catch{}throw new Error(m)}
  return r.status===204?null:r.json()}

const mb=b=>typeof b==='number'?(b/1048576).toFixed(1)+' MB':b
const toNote=n=>({...n,fileType:n.fileType||'PDF',fileSize:mb(n.fileSize),uploadDate:String(n.uploadDate||n.createdAt||'').slice(0,10),createdAt:n.createdAt?new Date(n.createdAt).getTime():0,status:n.status||'Published',level:n.level||300})
const noteForm=(n,file)=>{const f=new FormData();['title','description','courseId','semester'].forEach(k=>f.append(k,n[k]??''));if(file)f.append('file',file);return f}

export const api={
  loadCourses:()=>req('/courses'),
  createCourse:c=>req('/courses',{method:'POST',body:{code:c.code,title:c.title,department:c.department,level:c.level,semester:c.semester}}),
  deleteCourse:id=>req(`/courses/${id}`,{method:'DELETE'}),
  loadNotes:async()=>(await req('/notes')).map(toNote),
  createNote:async n=>toNote(await req('/notes',{method:'POST',form:noteForm(n,n.blob)})),
  updateNote:async(n,patch)=>toNote(await req(`/notes/${n.id}`,{method:'PUT',form:noteForm(n,patch.blob)})),
  deleteNote:id=>req(`/notes/${id}`,{method:'DELETE'}),
}
export async function login(role,identifier,password){
  const r=await req('/auth/login',{method:'POST',body:{role,identifier,password}})
  localStorage.setItem(TK,r.token);localStorage.setItem(UK,JSON.stringify({...r.user,role}));return r.user}
export const forgotPassword=(role,identifier)=>req('/auth/forgot-password',{method:'POST',body:{role,identifier}})
export const changePassword=(currentPassword,newPassword)=>req('/auth/change-password',{method:'POST',body:{currentPassword,newPassword}})
// Returns the PDF as a Blob: the local copy if there is one, otherwise from the backend (sent with the login token).
export async function getFileBlob(n){
  if(n.blob)return n.blob
  const t=localStorage.getItem(TK),r=await fetch(n.fileUrl,{headers:t?{Authorization:'Bearer '+t}:{}})
  if(!r.ok)throw new Error('The file could not be loaded.');return r.blob()}
