import React from "react";
import { Routes, Route, Navigate } from "react-router";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import OnboardingPage from "./pages/OnboardingPage";
import NotificationPage from "./pages/NotificationPage";
import ChatPage from "./pages/ChatPage";
import CallPage from "./pages/CallPage";
// import
import Signup from "./pages/Signup";
import { Toaster } from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "./lib/axios";

function App() {
  //tanstack query

  const {
    data: authData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      const res = await axiosInstance.get("/auth/me");
      return res.data;
    },
    retry: false,
  });

  const authUser = authData?.user;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="h-screen" data-theme="night">
      <Routes>
        <Route
          path="/"
          element={authUser ? <HomePage /> : <Navigate to="/signup" />}
        ></Route>
        <Route
          path="/signup"
          element={!authUser ? <Signup /> : <Navigate to="/" />}
        ></Route>
        <Route
          path="/login"
          element={authUser ? <LoginPage /> : <Navigate to="/" />}
        ></Route>
        <Route
          path="/onboarding"
          element={authUser ? <OnboardingPage /> : <Navigate to="/" />}
        ></Route>
        <Route
          path="/notification"
          element={authUser ? <NotificationPage /> : <Navigate to="/" />}
        ></Route>
        <Route
          path="/chat"
          element={authUser ? <ChatPage /> : <Navigate to="/" />}
        ></Route>
        <Route
          path="/call"
          element={authUser ? <CallPage /> : <Navigate to="/" />}
        ></Route>
      </Routes>

      <Toaster />
    </div>
  );
}

export default App;
