import React from "react";
import "./StudentManagement.css";

import Sidebar from "./Sidebar";

const SUBJECTS = [
  "Operating Systems",
  "Data Base Management Systems",
  "Full Stack Application And Development",
  "FrontEnd Frameorks",
  "Object Oriented Programming",
  "Computer Networks",
  "Cloud Computing",
  "CLOUD InfraStructure And Development",
  "NURAL NETWORK"
];

export default function StudentManagement({ students, setStudents }) {
  const [newStudent, setNewStudent] = React.useState({
    username: "",
    password: "",
    access: true,
    subjects: [],
  });

  const handleStudentInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "subjects") {
      const subject = value;
      setNewStudent((prev) => ({
        ...prev,
        subjects: checked
          ? [...prev.subjects, subject]
          : prev.subjects.filter((s) => s !== subject),
      }));
    } else {
      setNewStudent((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleAddStudent = (e) => {
    e.preventDefault();
    if (!newStudent.username || !newStudent.password || newStudent.subjects.length === 0) return;
    setStudents([
      ...students,
      {
        username: newStudent.username,
        password: newStudent.password,
        access: newStudent.access,
        subjects: newStudent.subjects,
      },
    ]);
    setNewStudent({ username: "", password: "", access: true, subjects: [] });
  };

  const toggleAccess = (index) => {
    setStudents((prev) =>
      prev.map((student, i) =>
        i === index ? { ...student, access: !student.access } : student
      )
    );
  };

  return (
    <div className="sm-container">
      <h2> Add Student</h2>
      <form onSubmit={handleAddStudent} className="sm-form">
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={newStudent.username}
          onChange={handleStudentInputChange}
          className="sm-input"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={newStudent.password}
          onChange={handleStudentInputChange}
          className="sm-input"
        />
        <div className="sm-checkbox-row">
          <input
            type="checkbox"
            name="access"
            checked={newStudent.access}
            onChange={handleStudentInputChange}
            className="sm-checkbox"
          />
          <span>Access Granted</span>
        </div>
        <div className="sm-checkbox-row">
          <span style={{ marginRight: 8 }}>Subjects:</span>
          {SUBJECTS.map((subject) => (
            <label key={subject} style={{ marginRight: 10 }}>
              <input
                type="checkbox"
                name="subjects"
                value={subject}
                checked={newStudent.subjects.includes(subject)}
                onChange={handleStudentInputChange}
              />
              {subject}
            </label>
          ))}
        </div>
        <button
          type="submit"
          className="sm-add-btn"
        >
          Add Student
        </button>
      </form>
      <h2>🔑 Student Access Control</h2>
      <ul className="sm-list">
        {students.map((student, idx) => (
          <li key={student.username} className="sm-list-item">
            <strong>{student.username}</strong> - Access: {" "}
            <span>
              {student.access ? (
                <span className="sm-access-yes">✅</span>
              ) : (
                <span className="sm-access-no">❌</span>
              )}
            </span>
            <span style={{ marginLeft: 10, fontSize: 13, color: '#2563eb' }}>
              Subjects: {student.subjects?.join(", ") || "None"}
            </span>
            <button
              onClick={() => toggleAccess(idx)}
              className="sm-toggle-btn"
            >
              Toggle Access
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
