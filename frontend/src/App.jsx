import React from "react";
import { Routes, Route } from "react-router";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import OnboardingPage from "./pages/OnboardingPage";
import NotificationPage from "./pages/NotificationPage";
import ChatPage from "./pages/ChatPage";
import CallPage from "./pages/CallPage";
import Signup from "./pages/Signup";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <div className="h-screen" data-theme="night">
      <Routes>
        <Route path="/" element={<HomePage />}></Route>
        <Route path="/signup" element={<Signup />}></Route>
        <Route path="/login" element={<LoginPage />}></Route>
        <Route path="/onboarding" element={<OnboardingPage />}></Route>
        <Route path="/notification" element={<NotificationPage />}></Route>
        <Route path="/chat" element={<ChatPage />}></Route>
        <Route path="/call" element={<CallPage />}></Route>
      </Routes>

      <Toaster />
    </div>
  );
}

export default App;
