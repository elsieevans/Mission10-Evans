import { Navigate, Route, Routes } from "react-router-dom";
import AdminBooks from "./AdminBooks.jsx";
import BookstorePage from "./BookstorePage.jsx";
import "./App.css";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<BookstorePage />} />
      <Route path="/adminbooks" element={<AdminBooks />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
