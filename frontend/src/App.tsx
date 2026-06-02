import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './styles/globals.css';
import HomePage from './pages/HomePage/HomePage';
import LoginPage from './pages/LoginPage/LoginPage';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import ForgotPasswordPage from "./pages/ForgotPasswordPage/ForgotPasswordPage.tsx";
import AdminPage from "./pages/AdminPage/AdminPage.tsx";
import ProfilePage from "./pages/ProfilePage/ProfilePage.tsx";
import ChooseTestPage from "./pages/ChooseTestPage/ChooseTestPage.tsx";
import TestPage from "./pages/TestPage/TestPage.tsx";
import ResultPage from "./pages/ResultPage/ResultPage.tsx";
import AdminResultPage from "./pages/AdminResultPage/AdminResultPage.tsx";


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage/>}/>
        <Route path="/chooseTest" element={<ChooseTestPage />} />
        <Route path="/test/:userTestId" element={<TestPage />} />
        <Route path="/dashboard" element={<ProfilePage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/result/:userTestId" element={<ResultPage />} />
        <Route path="/admin/results/:userTestId" element={<AdminResultPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
