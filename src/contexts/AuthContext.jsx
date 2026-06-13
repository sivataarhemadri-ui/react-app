import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api, { formatApiErrorDetail } from "../lib/api";
import { pickAvatarId } from "../lib/avatars";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // user: null = checking, false = not authenticated, object = authenticated
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const applyAvatarToUser = (userData) => {
    if (!userData) return userData;
    if (userData.avatar_id) return userData;
    const avatarId = pickAvatarId(userData.email || String(userData.id) || "guest");
    return { ...userData, avatar_id: avatarId };
  };

  const refreshMe = useCallback(async () => {
    try {
      const { data } = await api.get("/auth/me");
      const userWithAvatar = applyAvatarToUser(data.user);
      setUser(userWithAvatar);
      return userWithAvatar;
    } catch (e) {
      setUser(false);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshMe();
  }, [refreshMe]);

  const login = async (email, password, role) => {
    try {
      const payload = { email, password, ...(role ? { role } : {}) };
      const { data } = await api.post("/auth/login", payload);
      if (data.access_token) localStorage.setItem("fb_token", data.access_token);
      const userWithAvatar = applyAvatarToUser(data.user);
      setUser(userWithAvatar);
      return { ok: true, user: userWithAvatar };
    } catch (e) {
      const errorData = e?.response?.data || {};
      const errorMessage = formatApiErrorDetail(errorData.detail || errorData.message || errorData.error || e.message);
      return { ok: false, error: errorMessage };
    }
  };

  const register = async (payload) => {
    try {
      const { data } = await api.post("/auth/register", payload);
      if (data.access_token) localStorage.setItem("fb_token", data.access_token);
      const userWithAvatar = applyAvatarToUser(data.user);
      setUser(userWithAvatar);
      return { ok: true, user: userWithAvatar };
    } catch (e) {
      const errorData = e?.response?.data || {};
      const errorMessage = formatApiErrorDetail(errorData.detail || errorData.message || errorData.error || e.message);
      return { ok: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {}
    localStorage.removeItem("fb_token");
    setUser(false);
  };

  const updateProfile = async (payload) => {
    try {
      const { data } = await api.patch("/users/me", payload);
      setUser(data.user);
      return { ok: true, user: data.user };
    } catch (e) {
      const errorData = e?.response?.data || {};
      const errorMessage = formatApiErrorDetail(errorData.detail || errorData.message || errorData.error || e.message);
      return { ok: false, error: errorMessage };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile, refreshMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
