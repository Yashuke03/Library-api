import React, { useMemo, useState } from "react";
import StudentCard from "./components/StudentCard";
import "./App.css";

const studentsData = [
  { name: "Aisha", roll: "101", branch: "CSE", cgpa: 8.9 },
  { name: "Rahul", roll: "102", branch: "ECE", cgpa: 8.2 },
  { name: "Meera", roll: "103", branch: "ME", cgpa: 7.8 },
  { name: "Kiran", roll: "104", branch: "CSE", cgpa: 9.1 },
];

export default function App() {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => studentsData.filter((s) =>
    `${s.name} ${s.roll} ${s.branch}`.toLowerCase().includes(query.toLowerCase())
  ), [query]);

  return (
    <div className="container">
      <h1>Student List with Search</h1>
      <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search by name, roll, branch" />
      <div className="grid">{filtered.map((s)=><StudentCard key={s.roll} student={s} />)}</div>
    </div>
  );
}
