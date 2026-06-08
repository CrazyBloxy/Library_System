import { Routes, Route, Navigate } from "react-router-dom";
/* Pages */
import { Home } from "./components/pages/Home";
import { Login } from "./components/pages/Login";
import { Dashboard } from "./components/pages/Dashboard";
/* Navigation */
import { Navbar }  from "./components/navbar/nav";

function App() {

  return (
    <div>
      {/* Navigation Bar */}
      <Navbar />

      {/* Main Content */}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default App
