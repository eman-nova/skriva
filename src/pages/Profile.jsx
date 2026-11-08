import {useState} from 'react'
import {Shell,Field} from '../components/ui'
import {STUDENT,LECTURER} from '../data/mock'
import {API_ON,getUser,changePassword} from '../api'
import {useStore} from '../store'
export default function Profile({role}){
  const u=getUser(role)||(role==='student'?STUDENT:LECTURER),{say}=useStore(),[a,setA]=useState(''),[b,setB]=useState(''),[err,setErr]=useState('')
  const rows=[['Name',u.name],[role==='student'?'Matric number':'Lecturer ID',u.matricNumber||u.id],['Department',u.department],...(role==='student'?[['Level',(u.level||300)+' Level']]:[]),['Email',u.email]]
  return <Shell role={role}><h1 className="text-3xl">Profile</h1><div className="card mt-4 max-w-md">{rows.map(([k,v])=><div key={k} className="flex justify-between border-b border-slate/10 py-3 last:border-0"><b>{k}</b><span>{v}</span></div>)}</div>
  <form className="card mt-4 max-w-md" noValidate onSubmit={e=>{e.preventDefault();const m=a&&b.length>=6?'':'Fill both fields. The new password needs 6+ characters.';setErr(m);if(m)return;if(!API_ON){say('Password updated (demo only)');setA('');setB('');return}
    changePassword(a,b).then(()=>{say('Password updated');setA('');setB('')}).catch(x=>setErr(x.message))}}><h3>Change password</h3>
  <Field id="a" label="Current password" type="password" value={a} onChange={e=>setA(e.target.value)}/><Field id="b" label="New password" type="password" value={b} onChange={e=>setB(e.target.value)} error={err}/><button className="btn">Update password</button></form></Shell>}
