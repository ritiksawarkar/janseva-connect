import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import ScrollToTop from "./components/ScrollToTop";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import ServicesList from "./pages/ServicesList";
import ServiceDetail from "./pages/ServiceDetail";
import SchemesList from "./pages/SchemesList";
import SchemeDetail from "./pages/SchemeDetail";
import EligibilityChecker from "./pages/EligibilityChecker";
import EligibilityResults from "./pages/EligibilityResults";
import HelpFaq from "./pages/HelpFaq";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import AppRoutes from "./routes/AppRoutes";

function PublicRoutes() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<ServicesList />} />
          <Route path="/services/:id" element={<ServiceDetail />} />
          <Route path="/schemes" element={<SchemesList />} />
          <Route path="/schemes/:id" element={<SchemeDetail />} />
          <Route path="/eligibility-checker" element={<EligibilityChecker />} />
          <Route path="/eligibility-results" element={<EligibilityResults />} />
          <Route path="/help" element={<HelpFaq />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <ScrollToTop />
          <Routes>
            <Route path="/citizen/*" element={<AppRoutes />} />
            <Route path="/login" element={<AppRoutes />} />
            <Route path="/register" element={<AppRoutes />} />
            <Route path="/track-complaint" element={<AppRoutes />} />
            <Route path="*" element={<PublicRoutes />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export { App };
export default App;
