import { Routes, Route, Navigate, useLocation } from "react-router-dom";
/* Pages */
import { Home } from "./components/pages/Home";
import { Login } from "./components/pages/Login";
import { Dashboard } from "./components/pages/Dashboard";
/* Forms */
/*import { BookEntryForm } from "./components/forms/BookEntryForm";
import { BorrowForm } from "./components/forms/BorrowForm";
import { ReturnForm } from "./components/forms/ReturnForm";
import { StudentForm } from "./components/forms/StudentForm"; */
import { Navbar }  from "./components/navbar/nav";

function App() {
  const location = useLocation();


  return (
    <div>
      {/* Navigation Bar (Public) */}
      {location.pathname !== '/login' && <Navbar />}

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
