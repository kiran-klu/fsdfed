// ─────────────────────────────────────────────
// StudentDashboard.jsx — Student main page
// Students can view projects, submit work, and see their marks
// ─────────────────────────────────────────────

import { useState, useEffect } from "react";
import TopBar from "./TopBar";
import Sidebar from "./Sidebar";
import "./StudentDashboard.css";
import { useProjectGroups } from "./ProjectGroupsContext";

export default function StudentDashboard({
  username, onLogout,
  teacherUploads,
  studentSubmissions, setStudentSubmissions,
  marksData,
  activeSubject: initialSubject,
  students = [], // pass students prop from parent
}) {

  const [activeSubject, setActiveSubject] = useState(initialSubject || "OS");
  const [selectedProject, setSelectedProject] = useState("");
  // Find this student in the list
  const currentStudent = students.find(s => s.username === username);
  // Group management is now open to all students for any subject
  const isEnrolled = true;
  const [submitTitle, setSubmitTitle] = useState("");
  const [selectedProjectIndex, setSelectedProjectIndex] = useState(0);
  const [submitFile, setSubmitFile] = useState(null);
  const [submitUrl, setSubmitUrl] = useState("");
  const [submitType, setSubmitType] = useState("pdf");
  const [successMsg, setSuccessMsg] = useState("");

  const [groupNameInput, setGroupNameInput] = useState("");
  const [groupError, setGroupError] = useState("");

  // Project-based group logic
  const {
    getGroupsForProject,
    setGroupsForProject,
    getUserGroup,
    setGroupLeader,
  } = useProjectGroups();
  const subjectProjects = teacherUploads.filter((u) => u.subject === activeSubject);
  const effectiveProjectTitle = selectedProject || `__NO_PROJECT__${activeSubject}`;

  // Reset project selection when subject changes
  useEffect(() => {
    setSelectedProject("");
  }, [activeSubject]);
  const groups = getGroupsForProject(effectiveProjectTitle);
  const setGroups = (newGroups) => setGroupsForProject(effectiveProjectTitle, newGroups);
  const userGroup = getUserGroup(username, effectiveProjectTitle);

  // Create a new group (project-based)
  const handleCreateGroup = () => {
    const name = groupNameInput.trim();
    if (!name) { setGroupError("Enter a group name."); return; }
    if (groups.some(g => g.groupName === name)) { setGroupError("Group name already exists."); return; }
    setGroups([...groups, { groupName: name, members: [username], leader: null }]);
    setGroupNameInput(""); setGroupError("");
  };

  // Join an existing group (max 3 members, project-based)
  const handleJoinGroup = (name) => {
    setGroups(groups.map(g =>
      g.groupName === name && !g.members.includes(username) && g.members.length < 3
        ? { ...g, members: [...g.members, username] }
        : g
    ));
    setGroupError("");
  };

  // Leave group (project-based)
  const handleLeaveGroup = () => {
    setGroups(groups.map(g =>
      g.groupName === userGroup.groupName
        ? { ...g, members: g.members.filter(m => m !== username) }
        : g
    ).filter(g => g.members.length > 0));
  };

  // Filter this group's submissions for selected project
  const subjectSubmissions = userGroup
    ? studentSubmissions.filter(
        (s) => s.subject === activeSubject && s.projectTitle === effectiveProjectTitle && s.groupName === userGroup.groupName
      )
    : [];

  // Handle group submission (only one per group per project)
  const handleSubmit = () => {
    if (!userGroup) { alert("Join or create a group first."); return; }
    if (!submitTitle.trim()) { alert("Please enter a submission title."); return; }
    if (submitType === "pdf" && !submitFile) { alert("Please choose a file to submit."); return; }
    if (submitType === "url" && !submitUrl.trim()) { alert("Please enter a URL."); return; }
    // Only one submission per group per project
    if (studentSubmissions.some(s => s.subject === activeSubject && s.projectTitle === effectiveProjectTitle && s.groupName === userGroup.groupName)) {
      alert("Your group has already submitted for this project.");
      return;
    }
    const newSubmission = {
      subject: activeSubject,
      projectTitle: effectiveProjectTitle,
      title: submitTitle,
      type: submitType,
      value: submitType === "url" ? submitUrl : submitFile?.name,
      date: new Date().toLocaleDateString(),
      groupName: userGroup.groupName,
      members: userGroup.members,
    };
    setStudentSubmissions([...studentSubmissions, newSubmission]);
    setSuccessMsg(`Group "${userGroup.groupName}" submitted for ${effectiveProjectTitle}!`);
    setSubmitTitle(""); setSubmitFile(null); setSubmitUrl("");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  return (
    <div className="sd-wrapper">
      <TopBar username={username} role="Student" onLogout={onLogout} />
      <div className="sd-body">
        <Sidebar activeSubject={activeSubject} onSelectSubject={setActiveSubject} />
        <div className="sd-content">
          {/* ── Group Management ── */}
          <div className="sd-section">
            <h3 className="sd-section-title">👥 Group Management</h3>
            {/* Project selection dropdown for group management */}
            {isEnrolled && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>
                  Select the project under which you want to join or create a group:
                </div>
                <label style={{ fontSize: 14, color: '#475569', fontWeight: 500, marginRight: 8 }}>
                  Project:
                </label>
                <select
                  style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
                  value={selectedProject}
                  onChange={e => setSelectedProject(e.target.value)}
                >
                  <option value="">No Project (Subject Only)</option>
                  {subjectProjects.map((proj, idx) => (
                    <option key={idx} value={proj.title}>{proj.title}</option>
                  ))}
                </select>
              </div>
            )}
            {userGroup ? (
              <>
                <div style={{ marginBottom: 8 }}>You are in group: <b>{userGroup.groupName}</b></div>
                <div style={{ marginBottom: 8 }}>Members: {userGroup.members.join(", ")}</div>
                <div style={{ marginBottom: 8 }}>
                  Leader: <b>{userGroup.leader ? userGroup.leader : "Not assigned"}</b>
                  {userGroup.leader === username && <span style={{ color: '#16a34a', marginLeft: 8 }}>(You are the leader)</span>}
                </div>
                <button className="sd-submit-btn" onClick={handleLeaveGroup}>Leave Group</button>
              </>
            ) : (
              <>
                <div style={{ margin: '12px 0 0 0', fontWeight: 500 }}>Join a group:</div>
                {groups.length === 0 && <div className="sd-empty">No groups yet.</div>}
                {groups.filter(g => !g.members.includes(username) && g.members.length < 3).map(g => (
                  <div key={g.groupName} style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                    <span>{g.groupName} ({g.members.length} members)</span>
                    <button className="sd-submit-btn" onClick={() => handleJoinGroup(g.groupName)}>Join</button>
                  </div>
                ))}
                {groupError && <div style={{ color: 'red', marginTop: 8 }}>{groupError}</div>}
              </>
            )}
          </div>

          {/* ── Teacher Uploaded Projects ── */}
          <div className="sd-section">
            <h3 className="sd-section-title">
              📚 Projects for: <span className="sd-subject">{activeSubject}</span>
            </h3>
            {subjectProjects.length > 0 ? (
              subjectProjects.map((item, index) => (
                <div key={index} className="sd-project-card">
                  <div className="sd-card-title">📌 {item.title}</div>
                  {item.description && <p className="sd-card-desc">{item.description}</p>}
                  <div className="sd-btn-row">
                    {item.type === "pdf"
                      ? <a href={`/${item.value}`} download className="sd-download-btn">⬇️ Download PDF</a>
                      : <a href={item.value} target="_blank" rel="noreferrer" className="sd-preview-btn">🔗 Preview URL</a>}
                  </div>
                </div>
              ))
            ) : (
              <p className="sd-empty">No projects uploaded for {activeSubject} yet.</p>
            )}
          </div>

          {/* ── Submit Work Section (only for group leader) ── */}
          {userGroup && userGroup.leader === username && (
            <div className="sd-section">
              <h3 className="sd-section-title">
                📤 Submit Your Work for: <span className="sd-subject">{activeSubject}</span>
              </h3>
              <input className="sd-input" placeholder="Submission Title" value={submitTitle} onChange={(e) => setSubmitTitle(e.target.value)} />
              <div className="sd-toggle-row">
                <span className="sd-toggle-label">Submit via:</span>
                <button
                  className="sd-toggle-btn"
                  style={{ background: submitType === "pdf" ? "#2563eb" : "#e2e8f0", color: submitType === "pdf" ? "#fff" : "#475569" }}
                  onClick={() => setSubmitType("pdf")}
                >📄 File</button>
                <button
                  className="sd-toggle-btn"
                  style={{ background: submitType === "url" ? "#2563eb" : "#e2e8f0", color: submitType === "url" ? "#fff" : "#475569" }}
                  onClick={() => setSubmitType("url")}
                >🔗 URL</button>
              </div>
              {submitType === "pdf" && <input type="file" accept=".pdf,.zip,.doc,.docx" onChange={(e) => setSubmitFile(e.target.files[0])} className="sd-file-input" />}
              {submitType === "url" && <input className="sd-input" placeholder="Paste your project URL (GitHub, Drive, etc.)" value={submitUrl} onChange={(e) => setSubmitUrl(e.target.value)} />}
              {successMsg && <p className="sd-success">✅ {successMsg}</p>}
              <button className="sd-submit-btn" onClick={handleSubmit}>Submit Work</button>
            </div>
          )}

          {/* ── My Submissions with Marks ── */}
          {subjectSubmissions.length > 0 && (
            <div className="sd-section">
              <h3 className="sd-section-title">✅ Your Submissions for {activeSubject}</h3>

              {subjectSubmissions.map((s, index) => {
                // Use groupName for submissionId to match teacher's marks logic
                const submissionId = `${s.groupName}-${s.subject}-${index}`;
                const myMarks = marksData[submissionId];
                // Find the project for deadline
                const project = teacherUploads.find(
                  (p) => p.subject === s.subject && p.title === s.projectTitle
                );
                let status = "On Time";
                if (project && project.deadline) {
                  const deadlineDate = new Date(project.deadline);
                  const submittedDate = new Date(s.date);
                  // If submission date is after deadline, mark as missed
                  if (!isNaN(deadlineDate) && submittedDate > deadlineDate) {
                    status = "Missed Deadline";
                  }
                }
                return (
                  <div key={index} className="sd-submission-card">
                    <div className="sd-card-title">📎 {s.title}</div>
                    <div className="sd-card-meta">
                      {s.type === "url"
                        ? `🔗 ${s.value}`
                        : <span>📄 {s.value} <a href={`/${s.value}`} download style={{ color: '#2563eb', textDecoration: 'underline', marginLeft: 8 }}>⬇️ Download</a></span>}
                    </div>
                    <div className="sd-card-date">Submitted on: {s.date}</div>
                    {/* Submission status */}
                    <div style={{ fontSize: 13, fontWeight: 600, color: status === "On Time" ? "#16a34a" : "#dc2626" }}>
                      {status}
                    </div>
                    {/* ── Show Marks if Teacher has graded ── */}
                    {myMarks ? (
                      <div className="sd-marks-box">
                        <div className="sd-marks-title">🎯 Your Result</div>
                        <div className="sd-marks-score">
                          {myMarks.marks}
                          <span style={styles.marksOutOf}>/100</span>
                        </div>
                        {myMarks.feedback && (
                          <div style={styles.feedbackBox}>
                            <span style={styles.feedbackLabel}>Teacher Feedback: </span>
                            {myMarks.feedback}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={styles.pendingBadge}>⏳ Marks Pending</div>
                    )}
                  </div>
                );
              })}
                      {/* ── Submission History ── */}
                      {studentSubmissions.length > 0 && (
                        <div style={styles.section}>
                          <h3 style={styles.sectionTitle}>📜 Submission History</h3>
                          {studentSubmissions
                            .filter((s) => s.studentName === username)
                            .map((s, index) => {
                              const project = teacherUploads.find(
                                (p) => p.subject === s.subject && p.title === s.projectTitle
                              );
                              let status = "On Time";
                              if (project && project.deadline) {
                                const deadlineDate = new Date(project.deadline);
                                const submittedDate = new Date(s.date);
                                if (!isNaN(deadlineDate) && submittedDate > deadlineDate) {
                                  status = "Missed Deadline";
                                }
                              }
                              return (
                                <div key={index} style={styles.submissionCard}>
                                  <div style={styles.cardTitle}>📎 {s.title}</div>
                                  <div style={styles.cardMeta}>{s.type === "url" ? `🔗 ${s.value}` : `📄 ${s.value}`}</div>
                                  <div style={styles.cardDate}>Subject: {s.subject}</div>
                                  <div style={styles.cardDate}>Project: {s.projectTitle}</div>
                                  <div style={styles.cardDate}>Submitted on: {s.date}</div>
                                  <div style={{ fontSize: 13, fontWeight: 600, color: status === "On Time" ? "#16a34a" : "#dc2626" }}>
                                    {status}
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// ── Styles ──────────────────────────────────────
const styles = {
  wrapper: { minHeight: "100vh", background: "#f1f5f9", fontFamily: "'Segoe UI', sans-serif" },
  body: { display: "flex" },
  content: { flex: 1, padding: "28px", display: "flex", flexDirection: "column", gap: "24px" },
  section: { background: "#ffffff", borderRadius: "12px", padding: "24px", boxShadow: "0 1px 6px rgba(0,0,0,0.07)", display: "flex", flexDirection: "column", gap: "12px" },
  sectionTitle: { fontSize: "17px", fontWeight: "700", color: "#1e293b", margin: 0 },
  subject: { color: "#2563eb" },
  projectCard: { background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "14px 18px", display: "flex", flexDirection: "column", gap: "6px" },
  cardTitle: { fontSize: "15px", fontWeight: "600", color: "#1e293b" },
  cardDesc: { fontSize: "13px", color: "#64748b", margin: 0 },
  cardMeta: { fontSize: "13px", color: "#475569" },
  cardDate: { fontSize: "12px", color: "#94a3b8" },
  btnRow: { display: "flex", gap: "10px", marginTop: "4px" },
  downloadBtn: { padding: "7px 16px", background: "#2563eb", color: "#fff", borderRadius: "7px", textDecoration: "none", fontSize: "13px", fontWeight: "600" },
  previewBtn: { padding: "7px 16px", background: "#0891b2", color: "#fff", borderRadius: "7px", textDecoration: "none", fontSize: "13px", fontWeight: "600" },
  input: { width: "100%", padding: "11px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px", fontFamily: "'Segoe UI', sans-serif", color: "#1e293b", outline: "none" },
  toggleRow: { display: "flex", alignItems: "center", gap: "10px" },
  toggleLabel: { fontSize: "14px", color: "#475569", fontWeight: "500" },
  toggleBtn: { padding: "8px 18px", borderRadius: "8px", border: "none", fontSize: "13px", fontWeight: "600", cursor: "pointer", fontFamily: "'Segoe UI', sans-serif" },
  fileInput: { fontSize: "13px", fontFamily: "'Segoe UI', sans-serif" },
  success: { color: "#16a34a", fontSize: "14px", fontWeight: "500", margin: 0 },
  submitBtn: { padding: "12px 0", background: "#2563eb", color: "#ffffff", border: "none", borderRadius: "8px", fontSize: "15px", fontWeight: "600", cursor: "pointer", fontFamily: "'Segoe UI', sans-serif", width: "100%" },
  submissionCard: { background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "10px", padding: "14px 18px", display: "flex", flexDirection: "column", gap: "6px" },
  empty: { fontSize: "14px", color: "#94a3b8", textAlign: "center", padding: "12px 0" },

  // Marks display styles
  marksBox: { background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "10px", padding: "14px", marginTop: "6px", display: "flex", flexDirection: "column", gap: "8px" },
  marksTitle: { fontSize: "13px", fontWeight: "700", color: "#1d4ed8" },
  marksScore: { fontSize: "36px", fontWeight: "800", color: "#1d4ed8", lineHeight: 1 },
  marksOutOf: { fontSize: "16px", fontWeight: "500", color: "#64748b", marginLeft: "4px" },
  feedbackBox: { fontSize: "13px", color: "#334155", background: "#dbeafe", padding: "8px 12px", borderRadius: "8px", lineHeight: 1.5 },
  feedbackLabel: { fontWeight: "600", color: "#1d4ed8" },
  pendingBadge: { fontSize: "12px", color: "#92400e", background: "#fef3c7", padding: "6px 12px", borderRadius: "8px", alignSelf: "flex-start", fontWeight: "600" },
};
