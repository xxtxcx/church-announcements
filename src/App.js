import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Announcements from "./components/Announcements";
import ConferenceLanding from "./components/ConferenceLanding";
import ObsHelper from "./obs-helper/ObsHelper";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/obs-helper" element={<ObsHelper />} />
        <Route path="/announcements" element={<Announcements />} />
        <Route path="/conference" element={<ConferenceLanding />} />
        <Route path="/" element={<Navigate to="/obs-helper" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
