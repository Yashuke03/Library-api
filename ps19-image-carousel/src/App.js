import React,{useState} from "react";import "./App.css";
const imgs=["https://picsum.photos/id/1015/600/300","https://picsum.photos/id/1025/600/300","https://picsum.photos/id/1035/600/300","https://picsum.photos/id/1045/600/300"];
export default function App(){const [i,setI]=useState(0);const prev=()=>setI((i-1+imgs.length)%imgs.length);const next=()=>setI((i+1)%imgs.length);
return <div className="container"><h1>Image Carousel</h1><img src={imgs[i]} alt="slide"/><p>Slide {i+1} / {imgs.length}</p><button onClick={prev}>Prev</button><button onClick={next}>Next</button></div>}
