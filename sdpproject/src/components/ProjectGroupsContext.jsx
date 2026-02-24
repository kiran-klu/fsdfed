// ProjectGroupsContext.jsx
// Provides project-based group management for the app

import React, { createContext, useContext, useState } from "react";

const ProjectGroupsContext = createContext();

export function ProjectGroupsProvider({ children }) {
  // { [projectTitle]: [ { groupName, members, leader } ] }
  const [projectGroups, setProjectGroups] = useState({});

  // Get groups for a project
  const getGroupsForProject = (projectTitle) => projectGroups[projectTitle] || [];

  // Set groups for a project
  const setGroupsForProject = (projectTitle, groups) => {
    setProjectGroups((prev) => ({ ...prev, [projectTitle]: groups }));
  };

  // Find group for user in a project
  const getUserGroup = (username, projectTitle) =>
    (projectGroups[projectTitle] || []).find((g) => g.members.includes(username));

  // Set leader for a group in a project
  const setGroupLeader = (projectTitle, groupName, leaderName) => {
    setProjectGroups((prev) => ({
      ...prev,
      [projectTitle]: (prev[projectTitle] || []).map((g) =>
        g.groupName === groupName ? { ...g, leader: leaderName } : g
      ),
    }));
  };

  return (
    <ProjectGroupsContext.Provider
      value={{
        getGroupsForProject,
        setGroupsForProject,
        getUserGroup,
        setGroupLeader,
      }}
    >
      {children}
    </ProjectGroupsContext.Provider>
  );
}

export function useProjectGroups() {
  return useContext(ProjectGroupsContext);
}
