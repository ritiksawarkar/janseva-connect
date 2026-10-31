import React, { createContext, useContext, useState, useEffect } from "react";
import { authApi, officerApi } from "../services/api";

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
  const [isLoading, setIsLoading] = useState(() => !localStorage.getItem("officerUser") && !!localStorage.getItem("officerToken"));

  useEffect(() => {
    async function verifyOfficerSession() {
      const activeToken = localStorage.getItem("officerToken");
      if (!activeToken) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await officerApi.getProfile();
        if (res && res.data) {
          const profile = res.data;
          setOfficer(profile);
          localStorage.setItem("officerUser", JSON.stringify(profile));
        }
      } catch (err) {
        console.warn("Officer session verification notice:", err.message);
        // If profile fetch fails but token exists, do not aggressively wipe unless 401
        if (err && (err.status === 401 || err.statusCode === 401)) {
          logout();
        }
      } finally {
        setIsLoading(false);
      }
    }

    if (token) {
      verifyOfficerSession();
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const res = await authApi.login({ email, password });
      if (res && res.data) {
        const userData = res.data.user || res.data;
        if (userData.role !== "DEPARTMENT_OFFICER") {
          throw new Error("Access denied: Department Officer role required. Citizens and Admins should use their respective portals.");
        }
        const jwtToken = res.data.token;
        localStorage.setItem("officerToken", jwtToken);
        localStorage.setItem("officerUser", JSON.stringify(userData));
        setToken(jwtToken);
        setOfficer(userData);
        return { success: true, user: userData };
      }
      throw new Error(res.message || "Officer login failed");
    } catch (err) {
      const msg = err.response?.data?.message || err.message || (typeof err === "string" ? err : "Invalid credentials.");
      return { success: false, message: msg };
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

  const isAuthenticated = Boolean(
    officer && (officer.role === "DEPARTMENT_OFFICER" || Boolean(localStorage.getItem("officerToken")))
  );

  return (
    <OfficerAuthContext.Provider
      value={{
        officer,
        token,
        isAuthenticated,
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

export default OfficerAuthContext;
