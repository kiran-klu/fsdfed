// ─────────────────────────────────────────────
// TeacherDashboard.jsx — Teacher main page
// Teacher can upload projects and give marks to student submissions
// ─────────────────────────────────────────────

// ...existing code...
import StudentManagement from "./StudentManagement";

import Sidebar from "./Sidebar";
import "./TeacherDashboard.css";


import { useState } from "react";
import { useProjectGroups } from "./ProjectGroupsContext";

export default function TeacherDashboard({
  username, onLogout,
  teacherUploads, setTeacherUploads,
  studentSubmissions,
  marksData,   // { submissionId: { marks, feedback } } — shared from App.jsx
  saveMarks,   // function to save marks — shared from App.jsx
  students, setStudents,
}) {
  // Project-based group management
  const {
    getGroupsForProject,
    setGroupsForProject,
    setGroupLeader,
  } = useProjectGroups();
  const [activeSubject, setActiveSubject] = useState("Operating Systems");
  const [showStudentManagement, setShowStudentManagement] = useState(false);
  const [uploadType, setUploadType] = useState("pdf");
  const [projectTitle, setProjectTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [fileInput, setFileInput] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [newStudent, setNewStudent] = useState({
    username: "",
    password: "",
    access: true,
  });

  // Local state for marks inputs — { submissionId: { marks, feedback } }
  // Tracks what teacher is currently typing before saving
  const [inputMarks, setInputMarks] = useState({});

  // Add student form handlers
  const handleStudentInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewStudent((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  const handleAddStudent = (e) => {
    e.preventDefault();
    if (!newStudent.username || !newStudent.password) return;
    setStudents([
      ...students,
      { username: newStudent.username, password: newStudent.password, access: newStudent.access },
    ]);
    setNewStudent({ username: "", password: "", access: true });
  };
  const toggleAccess = (index) => {
    setStudents((prev) =>
      prev.map((student, i) =>
        i === index ? { ...student, access: !student.access } : student
      )
    );
  };

  // Handle teacher project upload
  const handleUpload = () => {
    if (!projectTitle.trim()) { alert("Please enter a project title."); return; }
    if (uploadType === "url" && !urlInput.trim()) { alert("Please enter a URL."); return; }
    if (uploadType === "pdf" && !fileInput) { alert("Please choose a PDF file."); return; }

    const newUpload = {
      subject: activeSubject, title: projectTitle,
      description, type: uploadType,
      value: uploadType === "url" ? urlInput : fileInput?.name,
      deadline,
    };
    setTeacherUploads([...teacherUploads, newUpload]);
    setSuccessMsg(`Project \"${projectTitle}\" uploaded for ${activeSubject}!`);
    setProjectTitle(""); setDescription(""); setUrlInput(""); setFileInput(null); setDeadline("");
    setTimeout(() => setSuccessMsg("") , 3000);
  };

  // Update local input state as teacher types marks or feedback
  const handleMarkInput = (submissionId, field, value) => {
    setInputMarks((prev) => ({
      ...prev,
      [submissionId]: { ...prev[submissionId], [field]: value },
    }));
  };

  // Save marks to shared state when teacher clicks "Save Marks"
  const handleSaveMarks = (submissionId) => {
    const data = inputMarks[submissionId] || {};
    const marks = data.marks || "";
    const feedback = data.feedback || "";

    if (!marks.trim()) { alert("Please enter marks before saving."); return; }

    // Save to shared App.jsx state — student will see this
    saveMarks(submissionId, marks, feedback);
    alert("Marks saved successfully! Student can now see their grade.");
  };

  // Filter by active subject
  const subjectUploads = teacherUploads.filter((u) => u.subject === activeSubject);
  // Show all submissions for this subject, regardless of project
  const subjectSubmissions = studentSubmissions.filter((s) => s.subject === activeSubject);

  // Project-based groups: key is project title, but allow for 'No Project' as well
  const [selectedProject, setSelectedProject] = useState("");
  const [groupCreateCount, setGroupCreateCount] = useState(1);
  const [groupFormationDeadline, setGroupFormationDeadline] = useState("");
  // If no project is selected, use a special key for the subject
  const effectiveProjectTitle = selectedProject || `__NO_PROJECT__${activeSubject}`;
  // Only students enrolled in the active subject
  const subjectStudents = students.filter(s => s.subjects && s.subjects.includes(activeSubject));
  const groups = getGroupsForProject(effectiveProjectTitle);

  const handleCreateGroup = () => {
    const newName = `Group ${groups.length + 1}`;
    setGroupsForProject(effectiveProjectTitle, [...groups, { groupName: newName, members: [], leader: null }]);
    setGroupCreateCount(groupCreateCount + 1);
  };

  // Delete a group
  const handleDeleteGroup = (groupName) => {
    if (window.confirm(`Are you sure you want to delete ${groupName}?`)) {
      setGroupsForProject(effectiveProjectTitle, groups.filter(g => g.groupName !== groupName));
    }
  };
    return (
      <div className="td-wrapper">
        <div style={{ display: "flex", minHeight: "100vh" }}>
          {/* Sidebar Navigation */}
          <div className="td-sidebar">
            <Sidebar activeSubject={activeSubject} onSelectSubject={setActiveSubject} />
          </div>
          {/* Main Content */}
          <div className="td-main">
            {/* Top Bar */}
            <div className="td-topbar">
              <div>Teacher Dashboard</div>
              <div>
                Welcome, {username}
                <button className="td-logout-btn" onClick={onLogout}>Logout</button>
              </div>
            </div>

            {/* Student Management Navigation Button */}
            <button
              style={{ background: "#36a2eb", color: "#fff", border: "none", borderRadius: 12, padding: "0.75rem 2rem", fontWeight: "bold", fontSize: "1.1rem", marginBottom: 24, alignSelf: "flex-start" }}
              onClick={() => setShowStudentManagement(true)}
            >
              Go to Student Management
            </button>

            {/* Student Management Page Modal */}
            {showStudentManagement && (
              <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.2)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.16)", padding: 0, minWidth: 650, maxWidth: "90vw", maxHeight: "90vh", overflowY: "auto", position: "relative" }}>
                  <button
                    style={{ position: "absolute", top: 12, right: 18, background: "#ef4444", color: "#fff", border: "none", borderRadius: 8, padding: "6px 18px", fontWeight: 600, fontSize: 16, cursor: "pointer" }}
                    onClick={() => setShowStudentManagement(false)}
                  >
                    Close
                  </button>
                  <div style={{ padding: 32 }}>
                    {/* StudentManagement component */}
                    <StudentManagement students={students} setStudents={setStudents} />
                  </div>
                </div>
              </div>
            )}
            {/* Group Management Section */}
            <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", padding: "28px", marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#2563eb" }}>Group Management for <span style={{ color: '#1e293b' }}>{activeSubject}</span></div>
                <div>
                  <label style={{ fontWeight: 500, marginRight: 8 }}>Group Formation Deadline:</label>
                  <input type="datetime-local" value={groupFormationDeadline} onChange={e => setGroupFormationDeadline(e.target.value)} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #cbd5e1' }} />
                </div>
              </div>
              {/* Project selection dropdown, with 'No Project' option */}
              <select value={selectedProject} onChange={e => setSelectedProject(e.target.value)} style={{ marginRight: 12, padding: '6px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 15 }}>
                <option value="">No Project (Subject Only)</option>
                {subjectUploads.map((proj, idx) => (
                  <option key={proj.title} value={proj.title}>{proj.title}</option>
                ))}
              </select>
              <button style={{ background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, padding: "10px 24px", fontWeight: 600, fontSize: 15, marginBottom: 18, cursor: "pointer" }} onClick={handleCreateGroup}>Create New Group</button>
              {groups.length === 0 ? (
                <div style={{ color: '#64748b', fontSize: 15 }}>No groups created yet.</div>
              ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "18px" }}>
                  {groups.map((g) => (
                    <div key={g.groupName} style={{ background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 12, padding: "18px 22px", minWidth: 260, flex: '1 1 260px', display: "flex", flexDirection: "column", gap: 8 }}>
                      <div style={{ fontSize: 17, fontWeight: 700, color: "#2563eb" }}>👥 {g.groupName}</div>
                      <div style={{ fontSize: 14, color: "#475569" }}>Members: {g.members.length > 0 ? g.members.join(", ") : <span style={{ color: '#dc2626' }}>None</span>}</div>
                      {/* Add member dropdown for subject students not already in group */}
                      <div style={{ marginTop: 6 }}>
                        <select
                          onChange={e => {
                            const selected = e.target.value;
                            if (!selected) return;
                            setGroupsForProject(effectiveProjectTitle, groups.map(grp =>
                              grp.groupName === g.groupName && !grp.members.includes(selected)
                                ? { ...grp, members: [...grp.members, selected] }
                                : grp
                            ));
                            e.target.value = "";
                          }}
                          style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
                          defaultValue=""
                        >
                          <option value="">Add member...</option>
                          {subjectStudents.filter(s => !g.members.includes(s.username)).map(s => (
                            <option key={s.username} value={s.username}>{s.username}</option>
                          ))}
                        </select>
                      </div>
                      <div style={{ fontSize: 14, color: "#475569" }}>Leader: {g.leader || <span style={{ color: '#dc2626' }}>None</span>}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <select
                          value={g.leader || ''}
                          onChange={e => setGroupLeader(effectiveProjectTitle, g.groupName, e.target.value)}
                          style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
                        >
                          <option value="">Select leader</option>
                          {g.members.map(m => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                        <button style={{ padding: '6px 12px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }} onClick={() => handleDeleteGroup(g.groupName)}>
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Project Upload Section */}
            <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", padding: "28px", marginBottom: 24 }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#1e293b", marginBottom: 18 }}>📤 Upload Project for <span style={{ color: "#2563eb" }}>{activeSubject}</span></div>
              <div style={{ display: "flex", gap: 18, marginBottom: 12 }}>
                <input style={{ flex: 1, minWidth: 220, padding: '12px 16px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 15 }} placeholder="Project Title" value={projectTitle} onChange={e => setProjectTitle(e.target.value)} />
                <input type="datetime-local" value={deadline} onChange={e => setDeadline(e.target.value)} style={{ width: 220, padding: '12px 16px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 15 }} />
              </div>

              <textarea style={{ width: '100%', marginTop: 8, padding: '12px 16px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 15 }} placeholder="Project Description (optional)" value={description} onChange={e => setDescription(e.target.value)} rows={2} />
              <div style={{ display: "flex", gap: 16, alignItems: "center", marginTop: 8 }}>
                <span style={{ fontSize: 15, color: '#475569', fontWeight: 500 }}>Upload via:</span>
                <button style={{ background: uploadType === "url" ? "#2563eb" : "#e2e8f0", color: uploadType === "url" ? "#fff" : "#475569", border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }} onClick={() => setUploadType("url")}>🔗 URL</button>
                <button style={{ background: uploadType === "pdf" ? "#2563eb" : "#e2e8f0", color: uploadType === "pdf" ? "#fff" : "#475569", border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }} onClick={() => setUploadType("pdf")}>📄 PDF</button>
              </div>
              {uploadType === "url" && <input style={{ width: '100%', marginTop: 8, padding: '12px 16px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 15 }} placeholder="Paste project URL here..." value={urlInput} onChange={e => setUrlInput(e.target.value)} />}
              {uploadType === "pdf" && (
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
                  <input type="file" accept=".pdf" onChange={e => setFileInput(e.target.files[0])} />
                  <span style={{ fontSize: 13, color: "#94a3b8" }}>PDF files only</span>
                </div>
              )}
              {successMsg && <p style={{ color: "#16a34a", fontSize: 15, fontWeight: 500, margin: 0 }}>{successMsg}</p>}
              <button style={{ background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, padding: "12px 0", fontWeight: 600, fontSize: 16, marginTop: 12, cursor: "pointer", width: '100%' }} onClick={handleUpload}>Upload Project</button>
            </div>
            {/* Uploaded Projects List */}
            {subjectUploads.length > 0 && (
              <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", padding: "28px", marginBottom: 24 }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#1e293b", marginBottom: 18 }}>📁 Uploaded Projects for <span style={{ color: "#2563eb" }}>{activeSubject}</span></div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "18px" }}>
                  {subjectUploads.map((item, index) => (
                    <div key={index} style={{ background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 12, padding: "18px 22px", minWidth: 260, flex: '1 1 260px', display: "flex", flexDirection: "column", gap: 8 }}>
                      <div style={{ fontSize: 17, fontWeight: 700, color: "#1e293b" }}>📌 {item.title}</div>
                      {item.description && <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>{item.description}</p>}
                      <div style={{ fontSize: 13, color: "#475569" }}>
                        {item.type === "url"
                          ? <span>🔗 <a href={item.value} target="_blank" rel="noreferrer" style={{ color: '#2563eb', textDecoration: 'none' }}>{item.value}</a></span>
                          : <span>📄 {item.value}</span>}
                      </div>
                      <div style={{ fontSize: 13, color: '#475569', marginTop: 6 }}>
                        <span>⏰ Deadline: {item.deadline ? new Date(item.deadline).toLocaleString() : "Not set"}</span>
                        <input
                          type="datetime-local"
                          value={item.deadline || ""}
                          onChange={e => {
                            const newDeadline = e.target.value;
                            setTeacherUploads(teacherUploads.map((u, i) =>
                              i === index ? { ...u, deadline: newDeadline } : u
                            ));
                          }}
                          style={{ marginLeft: 8, padding: '4px 8px', borderRadius: 8, border: '1px solid #cbd5e1' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Student Submissions with Marks */}
            <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", padding: "28px", marginBottom: 24 }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#1e293b", marginBottom: 18 }}>📥 Student Submissions for <span style={{ color: "#2563eb" }}>{activeSubject}</span></div>
              {subjectSubmissions.length > 0 ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "18px" }}>
                  {subjectSubmissions.map((s, index) => {
                    // Use groupName for submissionId if present, else fallback to studentName
                    const submissionId = `${s.groupName || s.studentName}-${s.subject}-${index}`;
                    const savedMarks = marksData[submissionId];
                    const currentInput = inputMarks[submissionId] || {};
                    return (
                      <div key={index} style={{ background: "#eff6ff", border: "1px solid #bbf7d0", borderRadius: 12, padding: "18px 22px", minWidth: 260, flex: '1 1 260px', display: "flex", flexDirection: "column", gap: 8 }}>
                        <div style={{ fontSize: 16, fontWeight: 700, color: "#1d4ed8" }}>
                          {s.groupName ? (
                            <>
                              👥 Group: {s.groupName}
                              <div style={{ fontSize: 13, color: "#475569", marginTop: 2 }}>
                                Members: {Array.isArray(s.members) ? s.members.join(", ") : s.members}
                              </div>
                            </>
                          ) : (
                            <>👤 {s.studentName}</>
                          )}
                        </div>
                        {s.projectTitle && (
                          <div style={{ fontSize: 13, color: "#2563eb", fontWeight: 500, marginBottom: 2 }}>
                            🏷️ Project: {s.projectTitle}
                          </div>
                        )}
                        <div style={{ fontSize: 15, fontWeight: 600, color: "#1e293b" }}>📎 {s.title}</div>
                        <div style={{ fontSize: 13, color: "#475569" }}>
                          {s.type === "url"
                            ? <span>🔗 <a href={s.value} target="_blank" rel="noreferrer" style={{ color: '#2563eb', textDecoration: 'none' }}>{s.value}</a></span>
                            : <span>📄 {s.value} <a href={`/${s.value}`} download style={{ color: '#2563eb', textDecoration: 'underline', marginLeft: 8 }}>⬇️ Download</a></span>}
                        </div>
                        <div style={{ fontSize: 12, color: "#94a3b8" }}>Submitted on: {s.date}</div>
                        <div style={{ background: "#dcfce7", border: "1px solid #bbf7d0", borderRadius: 10, padding: "14px", marginTop: "6px", display: "flex", flexDirection: "column", gap: "10px" }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: "#15803d" }}>🎯 Give Marks</div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            <label style={{ fontSize: 12, color: "#475569", fontWeight: 500 }}>Marks (out of 100):</label>
                            <input
                              style={{ width: "140px", padding: "8px 12px", borderRadius: 8, border: "1px solid #86efac", fontSize: 14 }}
                              type="number"
                              min="0"
                              max="100"
                              placeholder="e.g. 85"
                              value={savedMarks ? savedMarks.marks : (currentInput.marks || "")}
                              onChange={e => handleMarkInput(submissionId, "marks", e.target.value)}
                            />
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            <label style={{ fontSize: 12, color: "#475569", fontWeight: 500 }}>Feedback:</label>
                            <textarea
                              style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #86efac", fontSize: 13, resize: "vertical" }}
                              placeholder={s.groupName ? "Write feedback for the group..." : "Write feedback for the student..."}
                              rows={2}
                              value={savedMarks ? savedMarks.feedback : (currentInput.feedback || "")}
                              onChange={e => handleMarkInput(submissionId, "feedback", e.target.value)}
                            />
                          </div>
                          {savedMarks ? (
                            <div style={{ fontSize: 13, fontWeight: 600, color: "#15803d", background: "#dcfce7", padding: "7px 14px", borderRadius: 8, alignSelf: "flex-start" }}>✅ Marks Saved — {savedMarks.marks}/100</div>
                          ) : (
                            <button style={{ padding: "9px 20px", background: "#16a34a", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", alignSelf: "flex-start" }} onClick={() => handleSaveMarks(submissionId)}>
                              💾 Save Marks
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ color: "#94a3b8", fontSize: 15, textAlign: "center", padding: "12px 0" }}>No submissions from students for {activeSubject} yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
}

