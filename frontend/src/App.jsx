import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { OfficerAuthProvider } from "./context/OfficerAuthContext";
import { ToastProvider } from "./context/ToastContext";
import ScrollToTop from "./components/ScrollToTop";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <OfficerAuthProvider>
          <ToastProvider>
            <ScrollToTop />
            <AppRoutes />
          </ToastProvider>
        </OfficerAuthProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export { App };
export default App;
