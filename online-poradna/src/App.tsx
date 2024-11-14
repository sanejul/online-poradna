import React, { useState, useEffect } from 'react';
import './App.css';
import HomePage from './pages/home-page';
import { Route, Routes } from 'react-router-dom';
import DesktopNav from './components/navigation/desktop-nav';
import MobileNav from './components/navigation/mobile-nav';
import Footer from './components/footer/footer';
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

function App() {
  const { isAdmin } = useAuthLogic();
  const { isMobile, isTablet, isDesktop, isBiggerMobile } = useWindowSize();

  return (
    <div className="App">
      {(isTablet || isBiggerMobile || isMobile || isDesktop ) || isAdmin ? <MobileNav /> : <DesktopNav />}
      <div className="main-container">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/registration" element={<Registration />} />
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/usersList" element={<ProtectedRoute><UsersListPage /></ProtectedRoute>} />
          <Route path="/categoryManagement" element={<ProtectedRoute><CategoryManagementPage /></ProtectedRoute>} />
          <Route path="/newQuestionPage" element={<NewQuestionPage />} />
          <Route path="/archivePage" element={<ArchivePage />} />
          <Route path="/profilePage" element={<ProfilePage />} />
          <Route path="/resetPassword" element={<ResetPasswordPage />} />
          <Route path="/questions/:id" element={<QuestionDetailPage />} />
        </Routes>
      </div>
      <div>
      </div>
    </div>
  );
}

export default App;
