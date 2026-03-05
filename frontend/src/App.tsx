import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import AppLayout from './components/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './LandingPage';
import LoginPage from './components/LoginPage';
import Home from './components/Home';
import SyllabusUpload from './components/SyllabusUpload';
import CoursePage from './components/CoursePage';
import QuizPage from './components/QuizPage';
import WeeklyPlanPage from './components/WeeklyPlanPage';

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/home" replace /> : <LoginPage />}
      />

      <Route element={
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      }>
        <Route path="/home" element={<Home />} />
        <Route path="/upload" element={<SyllabusUpload />} />
        <Route path="/courses/:id" element={<CoursePage />} />
        <Route path="/courses/:id/quiz/:topicId" element={<QuizPage />} />
        <Route path="/plan" element={<WeeklyPlanPage />} />
      </Route>

      <Route path="*" element={<Navigate to={isAuthenticated ? "/home" : "/"} replace />} />
    </Routes>
  );
}

export default App;
