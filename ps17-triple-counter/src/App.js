import React, { useState } from "react";
import Counter from "./components/Counter";
import "./App.css";
export default function App(){const [counts,setCounts]=useState([0,0,0]);
const update=(i,v)=>setCounts(c=>c.map((x,idx)=>idx===i?v:x));
const total=counts.reduce((a,b)=>a+b,0);
return <div className="container"><h1>Triple Counter App</h1>{counts.map((c,i)=><Counter key={i} value={c} onChange={(v)=>update(i,v)} label={`Counter ${i+1}`} />)}<h2>Grand Total: {total}</h2></div>}
