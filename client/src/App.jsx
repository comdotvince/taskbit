// src/App.js
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import TodoApp from "./pages/TodoApp";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TodoApp />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </Router>
  );
}

export default App;
