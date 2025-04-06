import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import Register from "./components/Register";
import Main from "./components/Main";
import Settings from "./components/Settings";
import Profile from "./components/Profile";
import PlayChoose from "./components/PlayChoose";
import CreateRoom from "./components/CreateRoom";
import JoinRoom from "./components/JoinRoom";

const App = () => {
    return (
        <Router>
            <Navbar />
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/main" element={<Main />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/playChoose" element={<PlayChoose />} />
                <Route path="/create-room" element={<CreateRoom />} />
                <Route path="/join-room" element={<JoinRoom />} />
            </Routes>
        </Router>
    );
};

export default App;
