// Stores courses, uploaded notes (metadata and the PDF file itself) in the browser's IndexedDB.
// Replace with API calls when the backend exists.
const open=()=>new Promise((res,rej)=>{const r=indexedDB.open('skriva',2);r.onupgradeneeded=()=>{const d=r.result;['notes','courses'].forEach(s=>{if(!d.objectStoreNames.contains(s))d.createObjectStore(s,{keyPath:'id'})})};r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})
const run=async(store,mode,fn)=>{const db=await open();return new Promise((res,rej)=>{const t=db.transaction(store,mode),q=fn(t.objectStore(store));t.oncomplete=()=>res(q&&q.result);t.onerror=()=>rej(t.error)})}
export const loadNotes=()=>run('notes','readonly',s=>s.getAll())
export const saveNote=n=>run('notes','readwrite',s=>s.put(n))
export const deleteNote=id=>run('notes','readwrite',s=>s.delete(id))
export const loadCourses=()=>run('courses','readonly',s=>s.getAll())
export const saveCourse=c=>run('courses','readwrite',s=>s.put(c))
export const deleteCourse=id=>run('courses','readwrite',s=>s.delete(id))
