// Backend connection. Set VITE_API_URL in .env (see .env.example) to turn it on.
// With no VITE_API_URL the app keeps using the in-browser data (src/db.js) and demo login.
// The endpoints and data shapes expected from the backend are listed in API.md.
const BASE=(import.meta.env.VITE_API_URL||'').replace(/\/$/,'')
export const API_ON=!!BASE
const TK='skriva_token',UK='skriva_user',AK='skriva_accounts'

// The logged in user (saved in the browser after login or sign up), or null.
export const getUser=role=>{try{const u=JSON.parse(localStorage.getItem(UK));return u&&u.role===role?u:null}catch{return null}}
export const lecturerKey=()=>getUser('lecturer')?.id
export const logout=()=>{localStorage.removeItem(TK);localStorage.removeItem(UK)}
const setSession=(user,role,token)=>{token?localStorage.setItem(TK,token):localStorage.removeItem(TK);localStorage.setItem(UK,JSON.stringify({...user,role}))}

// Demo accounts (used only when there is no backend). Passwords are stored as hashes in this browser only.
const sha=async x=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(x)))].map(b=>b.toString(16).padStart(2,'0')).join('')
const readAccounts=()=>{try{return JSON.parse(localStorage.getItem(AK))||[]}catch{return[]}}
const saveAccounts=a=>localStorage.setItem(AK,JSON.stringify(a))
const same=(a,b)=>String(a).trim().toLowerCase()===String(b).trim().toLowerCase()
const publicUser=a=>{const {hash,lastLoginAt,...u}=a;return {...u,returning:!!lastLoginAt}}

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
// Sign up has two steps. register() sends a 6-digit code to the user's Gmail address.
// verifyEmail() checks the code and only then creates the account.
// Without a backend no email can be sent, so the demo returns the code (demoCode) to show on screen.
const PK='skriva_pending'
const newCode=()=>String(100000+crypto.getRandomValues(new Uint32Array(1))[0]%900000)
const readPending=()=>{try{return JSON.parse(sessionStorage.getItem(PK))}catch{return null}}
export async function register(role,d){
  if(!API_ON){
    const list=readAccounts()
    if(list.some(a=>a.role===role&&same(a.id,d.id)))throw new Error('An account with this ID already exists. Log in instead.')
    if(list.some(a=>a.role===role&&same(a.email,d.email)))throw new Error('An account with this email already exists. Log in instead.')
    const user={id:d.id,name:d.name,department:d.department,email:d.email,...(role==='student'?{matricNumber:d.id,level:300}:{})},code=newCode()
    sessionStorage.setItem(PK,JSON.stringify({role,user,hash:await sha(d.password),code,expires:Date.now()+600000,tries:0}))
    return {demoCode:code}}
  await req('/auth/register',{method:'POST',body:{role,name:d.name,identifier:d.id,department:d.department,email:d.email,password:d.password}})
  return {}}
export async function verifyEmail(role,email,code){
  if(!API_ON){
    const p=readPending()
    if(!p||p.role!==role||!same(p.user.email,email))throw new Error('Something went wrong. Start the sign up again.')
    if(Date.now()>p.expires)throw new Error('This code has expired. Request a new one.')
    if(p.tries>=5)throw new Error('Too many wrong tries. Request a new code.')
    if(p.code!==String(code).trim()){p.tries++;sessionStorage.setItem(PK,JSON.stringify(p));throw new Error('That code is not right. Check it and try again.')}
    const list=readAccounts();list.push({...p.user,role,hash:p.hash,emailVerified:true,lastLoginAt:Date.now()});saveAccounts(list)
    sessionStorage.removeItem(PK);setSession({...p.user,returning:false},role);return p.user}
  const r=await req('/auth/verify-email',{method:'POST',body:{role,email,code:String(code).trim()}})
  setSession({...r.user,returning:false},role,r.token);return r.user}
export async function resendCode(role,email){
  if(!API_ON){const p=readPending();if(!p)throw new Error('Start the sign up again.');p.code=newCode();p.expires=Date.now()+600000;p.tries=0;sessionStorage.setItem(PK,JSON.stringify(p));return {demoCode:p.code}}
  await req('/auth/resend-code',{method:'POST',body:{role,email}});return {}}
export async function login(role,identifier,password){
  if(!API_ON){
    const list=readAccounts(),acc=list.find(a=>a.role===role&&(same(a.id,identifier)||same(a.email,identifier)))
    if(!acc)throw new Error('No account found with these details. Create an account first.')
    if(acc.hash!==await sha(password))throw new Error('Wrong password. Try again.')
    const user=publicUser(acc);acc.lastLoginAt=Date.now();saveAccounts(list);setSession(user,role);return user}
  const r=await req('/auth/login',{method:'POST',body:{role,identifier,password}})
  const user={...r.user,returning:!!r.user.lastLoginAt};setSession(user,role,r.token);return user}
export const forgotPassword=(role,identifier)=>req('/auth/forgot-password',{method:'POST',body:{role,identifier}})
export async function changePassword(currentPassword,newPassword){
  if(!API_ON){
    const me=JSON.parse(localStorage.getItem(UK)||'null'),list=readAccounts(),acc=me&&list.find(a=>a.role===me.role&&same(a.id,me.id))
    if(!acc)throw new Error('Please log in again.')
    if(acc.hash!==await sha(currentPassword))throw new Error('Current password is wrong.')
    acc.hash=await sha(newPassword);saveAccounts(list);return null}
  return req('/auth/change-password',{method:'POST',body:{currentPassword,newPassword}})}
// Returns the PDF as a Blob: the local copy if there is one, otherwise from the backend (sent with the login token).
export async function getFileBlob(n){
  if(n.blob)return n.blob
  const t=localStorage.getItem(TK),r=await fetch(n.fileUrl,{headers:t?{Authorization:'Bearer '+t}:{}})
  if(!r.ok)throw new Error('The file could not be loaded.');return r.blob()}
