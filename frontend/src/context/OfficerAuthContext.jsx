import React, { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "../services/api";

const OfficerAuthContext = createContext(null);

export function OfficerAuthProvider({ children }) {
  const [officer, setOfficer] = useState(() => {
    try {
      const stored = localStorage.getItem("officerUser");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem("officerToken"));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function verifyOfficerSession() {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await authApi.getProfile();
        if (res.success && res.data) {
          if (res.data.role !== "DEPARTMENT_OFFICER") {
            throw new Error("Logged in account is not a Department Officer.");
          }
          setOfficer(res.data);
          localStorage.setItem("officerUser", JSON.stringify(res.data));
        }
      } catch (err) {
        console.warn("Officer session expired or invalid, logging out:", err.message);
        logout();
      } finally {
        setIsLoading(false);
      }
    }

    verifyOfficerSession();
  }, [token]);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const res = await authApi.login({ email, password });
      if (res.success && res.data) {
        if (res.data.user.role !== "DEPARTMENT_OFFICER") {
          throw new Error("Access denied: Department Officer role required. Citizens and Admins should use their respective portals.");
        }
        setToken(res.data.token);
        setOfficer(res.data.user);
        localStorage.setItem("officerToken", res.data.token);
        localStorage.setItem("officerUser", JSON.stringify(res.data.user));
        return { success: true, user: res.data.user };
      }
      throw new Error(res.message || "Officer login failed");
    } catch (err) {
      return { success: false, message: err.message || "Invalid credentials." };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setOfficer(null);
    setToken(null);
    localStorage.removeItem("officerToken");
    localStorage.removeItem("officerUser");
  };

  const updateOfficerState = (updatedFields) => {
    setOfficer((prev) => {
      const next = { ...prev, ...updatedFields };
      localStorage.setItem("officerUser", JSON.stringify(next));
      return next;
    });
  };

  return (
    <OfficerAuthContext.Provider
      value={{
        officer,
        token,
        isAuthenticated: !!officer && officer.role === "DEPARTMENT_OFFICER",
        isLoading,
        login,
        logout,
        updateOfficerState
      }}
    >
      {children}
    </OfficerAuthContext.Provider>
  );
}

export function useOfficerAuth() {
  const context = useContext(OfficerAuthContext);
  if (!context) {
    throw new Error("useOfficerAuth must be used within an OfficerAuthProvider");
  }
  return context;
}
