import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './styles/globals.css';
import HomePage from './pages/HomePage/HomePage';
import LoginPage from './pages/LoginPage/LoginPage';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import ForgotPasswordPage from "./pages/ForgotPasswordPage/ForgotPasswordPage.tsx";
import AdminPage from "./pages/AdminPage/AdminPage.tsx";
// Остальные страницы добавляй по мере создания:
// import ChooseTestPage from './pages/ChooseTestPage/ChooseTestPage';
// import DashboardPage from './pages/DashboardPage/DashboardPage';
// import AdminPage from './pages/AdminPage/AdminPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage/>}/>
        {/* <Route path="/chooseTest" element={<ChooseTestPage />} /> */}
        {/* <Route path="/dashboard" element={<DashboardPage />} /> */}
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
