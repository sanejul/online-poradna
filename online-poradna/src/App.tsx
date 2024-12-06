import React from 'react';
import './App.css';
import HomePage from './pages/home-page';
import { Route, Routes } from 'react-router-dom';
import DesktopNav from './components/navigation/desktop-nav';
import MobileNav from './components/navigation/mobile-nav';
import Login from './pages/login-page';
import Registration from './pages/registration-page';
import UsersListPage from './pages/admin/users-list-page';
import Logout from './pages/logout-page';
import NewQuestionPage from './pages/questions/new-question-page';
import ArchivePage from './pages/questions/archive-page';
import ProfilePage from './pages/profile-page';
import ResetPasswordPage from './pages/reset-psswd-page';
import QuestionDetailPage from './pages/questions/question-detail-page';
import CategoryManagementPage from './pages/admin/category-management-page';
import ProtectedRoute from './components/navigation/protected-route';
import { useAuthLogic } from './hooks/use-auth';
import { useWindowSize } from './hooks/use-window-size';
import ErrorBoundary from './components/error-boundary';
import NotFoundPage from './pages/not-found';
import ScrollToTop from './components/scroll-to-top';

function App() {
  const { isAdmin } = useAuthLogic();
  const { isMobile, isTablet, isDesktop, isBiggerMobile } = useWindowSize();

  return (
    <ErrorBoundary>
      <div className="App">
        {isTablet || isBiggerMobile || isMobile || isDesktop || isAdmin ? (
          <MobileNav />
        ) : (
          <DesktopNav />
        )}
        <div className="main-container" tabIndex={0}>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/registrace" element={<Registration />} />
            <Route path="/prihlaseni" element={<Login />} />
            <Route path="/odhlaseni" element={<Logout />} />
            <Route
              path="/seznam-uzivatelu"
              element={
                <ProtectedRoute>
                  <UsersListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/sprava-kategorii"
              element={
                <ProtectedRoute>
                  <CategoryManagementPage />
                </ProtectedRoute>
              }
            />
            <Route path="/novy-dotaz" element={<NewQuestionPage />} />
            <Route path="/vsechny-dotazy" element={<ArchivePage />} />
            <Route path="/profil" element={<ProfilePage />} />
            <Route path="/obnoveni-hesla" element={<ResetPasswordPage />} />
            <Route path="/dotazy/:id" element={<QuestionDetailPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
        <div></div>
      </div>
    </ErrorBoundary>
  );
}

export default App;
