import React, { useState } from "react";
import "./App.css";
export default function App(){const [step,setStep]=useState(1);const [form,setForm]=useState({name:"",email:"",username:"",password:""});const [err,setErr]=useState("");
const next=()=>{if(step===1&&(!form.name||!form.email))return setErr("Fill personal details");if(step===2&&(!form.username||!form.password))return setErr("Fill account details");setErr("");setStep(step+1)};
const back=()=>setStep(step-1);
const ch=e=>setForm({...form,[e.target.name]:e.target.value});
return <div className="container"><h1>Multi-Step Form</h1>{err&&<p className="err">{err}</p>}{step===1&&<div><input name="name" placeholder="Name" value={form.name} onChange={ch}/><input name="email" placeholder="Email" value={form.email} onChange={ch}/></div>}{step===2&&<div><input name="username" placeholder="Username" value={form.username} onChange={ch}/><input name="password" type="password" placeholder="Password" value={form.password} onChange={ch}/></div>}{step===3&&<div className="card"><h3>Review</h3><p>{form.name}</p><p>{form.email}</p><p>{form.username}</p></div>}<div>{step>1&&<button onClick={back}>Back</button>}{step<3?<button onClick={next}>Next</button>:<button onClick={()=>alert("Submitted")}>Submit</button>}</div></div>}
