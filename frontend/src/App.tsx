import { Routes, Route, Navigate } from "react-router-dom";
/* Pages */
import { Home } from "./components/pages/Home";
import { Login } from "./components/pages/Login";
import { Dashboard } from "./components/pages/Dashboard";
import { BookDashboard } from "./components/pages/BookDashboard";
import { StudentDashboard } from "./components/pages/StudentDashboard";
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
          {/* Public Pages */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />

          {/* Admin Pages */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/booksdb" element={<BookDashboard />} />
          <Route path="/dashboard/studentdb" element={<StudentDashboard />} />

          {/* Error Page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default App
