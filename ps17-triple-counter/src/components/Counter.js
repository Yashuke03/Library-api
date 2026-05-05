import React from "react";
export default function Counter({label,value,onChange}){return <div className="card"><h3>{label}</h3><p>{value}</p><button onClick={()=>onChange(value+1)}>Increment</button><button onClick={()=>onChange(value-1)}>Decrement</button><button onClick={()=>onChange(0)}>Reset</button></div>}
