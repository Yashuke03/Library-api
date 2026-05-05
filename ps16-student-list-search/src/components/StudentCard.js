import React from "react";

export default function StudentCard({ student }) {
  return (
    <div className="card">
      <h3>{student.name}</h3>
      <p>Roll: {student.roll}</p>
      <p>Branch: {student.branch}</p>
      <p>CGPA: {student.cgpa}</p>
    </div>
  );
}
