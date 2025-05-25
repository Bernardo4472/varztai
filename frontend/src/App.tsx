import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Main from './pages/Main';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import PlayChoose from './pages/PlayChoose';
import Lobby from './pages/Lobby';
import Rules from './pages/Rules';
import Room from './pages/Room'; // Import the Room component
import { SettingsProvider } from "./context/settingsContext";

const App = () => {
  return (
    <SettingsProvider> {/* Wrap the app with SettingsProvider */}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/main" element={<Main />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/playChoose" element={<PlayChoose />} />
        <Route path="/lobby" element={<Lobby />} />
        <Route path="/rules" element={<Rules />} />
        <Route path="/room/:roomId" element={<Room />} /> {/* Add route for Room */}
      </Routes>
    </SettingsProvider>
  );
};

export default App;
