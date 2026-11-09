// Default courses. They are always present and cannot be deleted in the app.
// To change the list, edit it here. (With a backend, add the same courses to the server's database.)
const c=(code,title)=>({id:code.toLowerCase().replace(/\s+/g,'-'),code,title,department:'Computer Science',level:300,semester:'First',builtIn:true})
export const BUILT_IN=[
  c('BUT-CSC 301','Data Structures and Algorithm'),
  c('BUT-CSC 311','Object-Oriented Programming'),
  c('BUT-CSC 309','Artificial Intelligence'),
  c('BUT-CSC 303','Numerical Computations'),
  c('ICT 323','Introduction to Python Programming'),
  c('SEN 301','Object-Oriented Analysis and Design'),
  c('ICT 305','Data Communication System and Network'),
  c('CYB 201','Introduction to Cyber Security'),
]
