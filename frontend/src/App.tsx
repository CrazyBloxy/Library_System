import { Routes, Route } from "react-router-dom";
import { Home } from "./components/pages/Home";
import { Login } from "./components/pages/Login";
import { Dashboard } from "./components/pages/Dashboard";
/*import { BookEntryForm } from "./components/forms/BookEntryForm";
import { BorrowForm } from "./components/forms/BorrowForm";
import { ReturnForm } from "./components/forms/ReturnForm";
import { StudentForm } from "./components/forms/StudentForm"; */

function App() {

  return (
    /* Main content */
    <main>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </main>
  )
}

export default App
