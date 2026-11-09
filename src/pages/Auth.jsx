import {useState} from 'react'
import {Link,useNavigate} from 'react-router-dom'
import {Eye,EyeOff,Loader2} from 'lucide-react'
import {PublicLayout,Field} from '../components/ui'
import {API_ON,login,register,forgotPassword} from '../api'
import {DEPARTMENTS} from '../data/mock'
const T={student:{h:'Student login',l:'Matriculation number',idl:'Matriculation number',ph:'e.g. 21/0457',side:['Welcome.','Every note for your courses, in one place.'],note:'Skriva is open to 300 level students only.'},lecturer:{h:'Lecturer login',l:'Lecturer ID or personal email',idl:'Lecturer ID',ph:'e.g. LEC-0231',side:['Lecturer portal.','Upload, organise and update the materials your students rely on.'],note:'Sign in to manage your lecture notes.'}}
export function Login({role}){
  const t=T[role],nav=useNavigate(),[u,setU]=useState(''),[p,setP]=useState(''),[show,setShow]=useState(false),[e,setE]=useState({}),[busy,setBusy]=useState(false)
  const submit=ev=>{ev.preventDefault();const x={u:u.trim()?'':`Enter your ${t.l.toLowerCase()}.`,p:p?'':'Enter your password.'};setE(x);if(x.u||x.p)return
    setBusy(true)
    login(role,u.trim(),p).then(()=>nav(`/${role}/dashboard`)).catch(err=>{setE({f:err.message});setBusy(false)})}
  return <PublicLayout><div className="mx-auto my-12 grid max-w-4xl overflow-hidden rounded-3xl shadow-2xl md:grid-cols-2">
  <aside className="flex flex-col justify-center bg-gradient-to-br from-[#001340] to-navy p-10 text-white"><h2 className="text-4xl !text-white">{t.side[0]}</h2><p className="text-blue-100">{t.side[1]}</p></aside>
  <section className={`bg-white p-10 border-t-8 ${role==='student'?'border-brand':'border-gold'}`}><h1 className="text-3xl">{t.h}</h1><p>{t.note}</p>
  <form onSubmit={submit} noValidate><Field id="u" label={t.l} placeholder={t.ph} value={u} onChange={x=>setU(x.target.value)} error={e.u}/>
  <label htmlFor="p" className="label">Password</label><div className="relative"><input id="p" className="input pr-12" type={show?'text':'password'} value={p} onChange={x=>setP(x.target.value)}/><button type="button" onClick={()=>setShow(!show)} aria-label={show?'Hide password':'Show password'} className="absolute right-3 top-2.5 text-brand">{show?<EyeOff size={20}/>:<Eye size={20}/>}</button></div>
  <div className="err" role="alert">{e.p}</div><div className="err" role="alert">{e.f}</div>
  <button className={`btn w-full ${role==='lecturer'?'btn-gold':''}`} disabled={busy}>{busy?<><Loader2 className="animate-spin" size={18}/>Signing in</>:'Log in'}</button></form>
  <p className="mt-4"><Link className="text-brand underline" to={`/${role}/forgot-password`}>Forgot password?</Link></p><p className="mt-2">New here? <Link className="text-brand underline" to={`/${role}/signup`}>Create an account</Link></p></section></div></PublicLayout>}
export function Forgot({role}){const t=T[role],[sent,setSent]=useState(false),[id,setId]=useState(''),[err,setErr]=useState(''),[busy,setBusy]=useState(false)
  const send=()=>{setErr('');if(!id.trim()){setErr(`Enter your ${t.l.toLowerCase()}.`);return}
    if(!API_ON){setSent(true);return}
    setBusy(true);forgotPassword(role,id.trim()).then(()=>setSent(true)).catch(e=>setErr(e.message)).finally(()=>setBusy(false))}
  return <PublicLayout><section className="card mx-auto my-12 max-w-md"><h1 className="text-3xl">Reset your password</h1><p>Enter your {t.l.toLowerCase()}. {API_ON?'We will send reset steps if the account exists.':'Reset steps will be sent once the backend is connected.'}</p><Field id="r" label={t.l} value={id} onChange={x=>setId(x.target.value)} error={err}/>
  {sent&&<p role="status" className="text-green-700">{API_ON?'If the account exists, reset steps have been sent.':'Reset link simulated.'}</p>}<button className="btn" disabled={busy} onClick={send}>Send reset link</button> <Link className="ml-3 text-brand underline" to={`/${role}/login`}>Back to login</Link></section></PublicLayout>}
export function Signup({role}){
  const t=T[role],nav=useNavigate(),[f,setF]=useState({name:'',id:'',department:DEPARTMENTS[0],email:'',password:'',confirm:''}),[e,setE]=useState({}),[busy,setBusy]=useState(false)
  const set=k=>x=>setF({...f,[k]:x.target.value})
  const submit=ev=>{ev.preventDefault()
    const x={name:f.name.trim()?'':'Enter your full name.',id:f.id.trim()?'':`Enter your ${t.idl.toLowerCase()}.`,email:/^\S+@\S+\.\S+$/.test(f.email.trim())?'':'Enter a valid email address.',password:f.password.length>=6?'':'Use 6 or more characters.',confirm:f.confirm===f.password?'':'The passwords do not match.'}
    setE(x);if(Object.values(x).some(Boolean))return
    setBusy(true)
    register(role,{name:f.name.trim(),id:f.id.trim(),department:f.department,email:f.email.trim(),password:f.password}).then(()=>nav(`/${role}/dashboard`)).catch(err=>{setE({f:err.message});setBusy(false)})}
  return <PublicLayout><div className="mx-auto my-12 grid max-w-4xl overflow-hidden rounded-3xl shadow-2xl md:grid-cols-2">
  <aside className="flex flex-col justify-center bg-gradient-to-br from-[#001340] to-navy p-10 text-white"><h2 className="text-4xl !text-white">{t.side[0]}</h2><p className="text-blue-100">{t.side[1]}</p></aside>
  <section className={`bg-white p-10 border-t-8 ${role==='student'?'border-brand':'border-gold'}`}><h1 className="text-3xl">{role==='student'?'Student sign up':'Lecturer sign up'}</h1><p>{role==='student'?'Skriva is open to 300 level students only.':'Create your account to manage lecture notes.'}</p>
  <form onSubmit={submit} noValidate><Field id="n" label="Full name" value={f.name} onChange={set('name')} error={e.name}/>
  <Field id="i" label={t.idl} placeholder={t.ph} value={f.id} onChange={set('id')} error={e.id}/>
  <Field id="d" label="Department"><select id="d" className="input" value={f.department} onChange={set('department')}>{DEPARTMENTS.map(d=><option key={d}>{d}</option>)}</select></Field>
  <Field id="m" label="Email" type="email" value={f.email} onChange={set('email')} error={e.email}/>
  <Field id="pw" label="Password" type="password" value={f.password} onChange={set('password')} error={e.password}/>
  <Field id="pc" label="Confirm password" type="password" value={f.confirm} onChange={set('confirm')} error={e.confirm}/>
  <div className="err" role="alert">{e.f}</div>
  <button className={`btn w-full ${role==='lecturer'?'btn-gold':''}`} disabled={busy}>{busy?<><Loader2 className="animate-spin" size={18}/>Creating account</>:'Create account'}</button></form>
  <p className="mt-4">Already have an account? <Link className="text-brand underline" to={`/${role}/login`}>Log in</Link></p></section></div></PublicLayout>}
