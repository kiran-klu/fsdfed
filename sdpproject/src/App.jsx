// ─────────────────────────────────────────────
// App.jsx — Main entry point
// All shared state lives here so Teacher and Student share same data
// ─────────────────────────────────────────────

import { useState } from "react";
import RoleSelection from "./components/RoleSelection";
import LoginForm from "./components/LoginForm";

import TeacherDashboard from "./components/TeacherDashboard";
import StudentDashboard from "./components/StudentDashboard";
import { ProjectGroupsProvider } from "./components/ProjectGroupsContext";

// Shared students state (with access control)
const INITIAL_STUDENTS = [
  { username: "student1", password: "student@1", access: true },
  { username: "student2", password: "student@2", access: true },
  { username: "student3", password: "student@3", access: true },
  { username: "student4", password: "student@4", access: true },
  { username: "student5", password: "student@5", access: true },
  { username: "student6", password: "student@6", access: true },
];

// Group management state: { groupName: string, members: [usernames] }
// Example: [{ groupName: "Alpha", members: ["student1", "student2"] }]

export default function App() {
  // Students state (shared)
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [screen, setScreen] = useState("role");
  const [role, setRole] = useState(null);
  const [username, setUsername] = useState("");

  // ── GROUP STATE ──────────────────────────────
  // Subject-specific groups: { [subject]: [ { groupName, members, leader } ] }
  const [subjectGroups, setSubjectGroups] = useState({});
  // Helper: get groups for a subject
  const getGroupsForSubject = (subject) => subjectGroups[subject] || [];
  // Helper: set groups for a subject
  const setGroupsForSubject = (subject, groups) => {
    setSubjectGroups(prev => ({ ...prev, [subject]: groups }));
  };
  // Helper: find group for current user in a subject
  const getUserGroup = (uname, subject) => (subjectGroups[subject] || []).find(g => g.members.includes(uname));
  // Helper: set leader for a group in a subject
  const setGroupLeader = (subject, groupName, leaderName) => {
    setSubjectGroups(prev => ({
      ...prev,
      [subject]: (prev[subject] || []).map(g =>
        g.groupName === groupName ? { ...g, leader: leaderName } : g
      )
    }));
  };

  // ── SHARED STATE ──────────────────────────────

  // Teacher uploads — students can see these
  const [teacherUploads, setTeacherUploads] = useState([
    { subject: "Operating Systems" },
    { subject: "Data Base Management Systems" },
    { subject: "Full Stack Application And Development" },
    { subject: "FrontEnd Frameworks" },
    { subject: "Object Oriented Programming" },
    { subject: "Computer Networks" },
    { subject: "Cloud Computing" },
    { subject: "CLOUD InfraStructure And Development" },
    { subject: "NURAL NETWORK" },
    { subject: "Cloud computing" },
  ]);

  // Student submissions — teacher can see and grade these
  const [studentSubmissions, setStudentSubmissions] = useState([]);

  // Marks given by teacher — key is submissionId, value is { marks, feedback }
  // Example: { "student-OS-0": { marks: "85", feedback: "Good work!" } }
  const [marksData, setMarksData] = useState({});

  // Function to save marks for a specific submission
  // submissionId is a unique key made from studentName + subject + index
  const saveMarks = (submissionId, marks, feedback) => {
    setMarksData((prev) => ({
      ...prev,
      [submissionId]: { marks, feedback }, // Save marks and feedback together
    }));
  };

  const handleRoleSelect = (selectedRole) => { setRole(selectedRole); setScreen("login"); };
  const handleLoginSuccess = (name) => { setUsername(name); setScreen("dashboard"); };
  const handleLogout = () => { setScreen("role"); setRole(null); setUsername(""); };

  return (
    <ProjectGroupsProvider>
      <div>
        {screen === "role" && <RoleSelection onSelectRole={handleRoleSelect} />}

        {screen === "login" && (
          <LoginForm
            role={role}
            onLoginSuccess={handleLoginSuccess}
            onBack={() => setScreen("role")}
            students={students}
          />
        )}

        {/* Teacher gets marksData and saveMarks to give grades */}
        {screen === "dashboard" && role === "teacher" && (
          <TeacherDashboard
            username={username}
            onLogout={handleLogout}
            teacherUploads={teacherUploads}
            setTeacherUploads={setTeacherUploads}
            studentSubmissions={studentSubmissions}
            marksData={marksData}
            saveMarks={saveMarks}
            students={students}
            setStudents={setStudents}
          />
        )}

        {/* Student gets marksData to see their grades */}
        {screen === "dashboard" && role === "student" && (
          <StudentDashboard
            username={username}
            onLogout={handleLogout}
            teacherUploads={teacherUploads}
            studentSubmissions={studentSubmissions}
            setStudentSubmissions={setStudentSubmissions}
            marksData={marksData}
            activeSubject={teacherUploads[0]?.subject || "OS"}
          />
        )}
      </div>
    </ProjectGroupsProvider>
  );
}
