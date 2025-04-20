import Navbar from "./components/Navbar";

import HomePage from "./pages/HomePage";
import SingUpPage from "./pages/SingUpPage";
import LoginPage from "./pages/LoginPage";
import SettingPage from "./pages/SettingPage";
import ProfilePage from "./pages/ProfilePage";

import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import { useThemeStore } from "./store/useThemeStore";
import { useEffect } from "react";

import {Loader} from "lucide-react";
import { Toaster } from "react-hot-toast";

const App = () => {
  const {authUser, checkAuth, isCheckingAuth, onlineUsers} = useAuthStore()
  const { theme } = useThemeStore()

  console.log({ onlineUsers });
  
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  console.log("Auth User:", authUser);

  if (isCheckingAuth && !authUser)
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );

  return (
    <div data-theme={theme}>
      <Navbar />

      <Routes>
        <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" /> } />
        <Route path="/singup" element={!authUser ? <SingUpPage />: <Navigate to="/" /> } />
        <Route path="/login" element={!authUser ? <LoginPage />: <Navigate to="/" /> } />
        <Route path="/settings" element={<SettingPage />} />
        <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" /> } />
      </Routes>
      
      <Toaster />
    </div>
  );
};

export default App;
