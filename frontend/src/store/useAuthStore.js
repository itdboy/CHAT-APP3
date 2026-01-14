import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";


// รับค่า formData จาก form signup แล้วส่งไปที่ backend
export const useAuthStore = create((set) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,

  isCheckingAuth: true,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");

      set({ authUser: res.data });
    } catch (err) {
      set({ authUser: null });
      console.log("Error checking auth:", err);
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signUp: async (data)=> {
    console.log("Signup data received in store:", data);

    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser:  res.data });  
      toast.success("Signup successful! Please log in.");
      
    } catch (err) {
      toast.error(err.response?.data?.message || "Signup failed. Please try again.");
      console.log("Error during signup:", err);
    } finally {
      set({ isSigningUp: false });
    }
  },
  
  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data.user });
      toast.success("Login successful!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed. Please try again.");
      console.log("Error during login:", err);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully.");
    } catch (err) {
      toast.error("Logout failed. Please try again.");
      console.log("Error during logout:", err);
    }
  }

}));
