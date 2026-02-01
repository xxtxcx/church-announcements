import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Announcements from "./components/Announcements";
import ObsHelper from "./components/ObsHelper";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/obs-helper" element={<ObsHelper />} />
        <Route path="/announcements" element={<Announcements />} />
        <Route path="/" element={<Navigate to="/obs-helper" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
