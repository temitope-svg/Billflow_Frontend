import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import LandingPage from './pages/LandingPage'
import OnboardingPage from './pages/auth/OnboardingPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'
import DashboardPage from './pages/DashboardPage'
import DocumentsPage from './pages/DocumentsPage'
import DocumentDetailPage from './pages/DocumentDetailPage'
import ClientsPage from './pages/ClientsPage'
import ClientDetailPage from './pages/ClientDetailPage'
import ClientFormPage from './pages/ClientFormPage'
import SettingsPage from './pages/SettingsPage'
import PublicDocumentPage from './pages/PublicDocumentPage'
import TermsPage from './pages/TermsPage'
import PrivacyPage from './pages/PrivacyPage'
import NewDocumentPage from './pages/create/NewDocumentPage'
import TemplatePickerPage from './pages/create/TemplatePickerPage'
import DocumentDetailsPage from './pages/create/DocumentDetailsPage'
import DocumentPreviewPage from './pages/create/DocumentPreviewPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/d/:slug" element={<PublicDocumentPage />} />

          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/documents" element={<ProtectedRoute><DocumentsPage /></ProtectedRoute>} />
          <Route path="/documents/:id" element={<ProtectedRoute><DocumentDetailPage /></ProtectedRoute>} />
          <Route path="/clients" element={<ProtectedRoute><ClientsPage /></ProtectedRoute>} />
          <Route path="/clients/new" element={<ProtectedRoute><ClientFormPage /></ProtectedRoute>} />
          <Route path="/clients/:id" element={<ProtectedRoute><ClientDetailPage /></ProtectedRoute>} />
          <Route path="/clients/:id/edit" element={<ProtectedRoute><ClientFormPage /></ProtectedRoute>} />
          <Route path="/settings/*" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="/new" element={<ProtectedRoute><NewDocumentPage /></ProtectedRoute>} />
          <Route path="/new/:type/template" element={<ProtectedRoute><TemplatePickerPage /></ProtectedRoute>} />
          <Route path="/new/:type/details" element={<ProtectedRoute><DocumentDetailsPage /></ProtectedRoute>} />
          <Route path="/new/:type/preview" element={<ProtectedRoute><DocumentPreviewPage /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
