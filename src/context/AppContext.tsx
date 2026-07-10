/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";
import toast from "react-hot-toast";

interface UserType {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "user" | "admin" | "owner";
}

interface AppContextType {
  user: UserType | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    name: string,
    email: string,
    password: string,
    phone?: string,
    role?: string,
  ) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<UserType>) => Promise<boolean>;
}

const AppContext = createContext<AppContextType | null>(null);

interface Props {
  children: React.ReactNode;
}

export const AppContextProvider = ({ children }: Props) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token"),
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setAuthModalOpen] = useState<boolean>(false);

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data } = await api.post("/auth/login/", { email, password });
      const { token, user } = data;
      localStorage.setItem("token", token);
      setToken(token);
      setUser(user);
      toast.success("Logged in successfully!");
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Login failed");
      return false;
    }
  };

  // Register function
  const register = async (
    name: string,
    email: string,
    password: string,
    phone?: string,
    role?: string,
  ): Promise<boolean> => {
    try {
      const { data } = await api.post("/auth/register/", {
        name,
        email,
        password,
        phone,
        role,
      });
      const { token, user } = data;
      localStorage.setItem("token", token);
      setToken(token);
      setUser(user);
      toast.success("Registered successfully!");
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Registration failed");
      return false;
    }
  };

  // Update profile function
  const updateProfile = async (data: Partial<UserType>): Promise<boolean> => {
    try {
      const response = await api.patch("/auth/me/", data);
      setUser(response.data);
      toast.success("Profile updated successfully!");
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Update failed");
      return false;
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    toast.success("Logged out");
    window.location.href = "/";
  };

  // Load user on token change
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const { data } = await api.get("/auth/me/");
          setUser(data);
        } catch (error) {
          localStorage.removeItem("token");
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };
    loadUser();
  }, [token]);

  const value: AppContextType = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    isAuthModalOpen,
    setAuthModalOpen,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppContextProvider");
  }
  return context;
};
