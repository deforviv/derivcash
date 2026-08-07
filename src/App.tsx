import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';

const MainLayout = lazy(() => import('./components/layout/MainLayout'));
const Home = lazy(() => import('./pages/Home/Home'));
const Apply = lazy(() => import('./pages/Apply/Apply'));
const Register = lazy(() => import('./pages/Register/Register'));
const Login = lazy(() => import('./pages/Login/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const BasicCardPayment = lazy(() => import('./pages/Payment/BasicCardPayment'));

const pageFallback = (
  <div
    style={{
      minHeight: '100vh',
      display: 'grid',
      placeItems: 'center',
      background: 'var(--color-bg-main)',
      color: 'var(--color-primary)',
      fontFamily: 'var(--font-family)',
      fontSize: '1.35rem',
      fontWeight: 900,
    }}
  >
    Derivcash
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <ErrorBoundary>
          <Suspense fallback={pageFallback}>
            <Routes>
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/admin" element={<Dashboard />} />
              <Route path="/payment/basic-card" element={<BasicCardPayment />} />
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Home />} />
                <Route path="apply" element={<Apply />} />
                {/* <Route path="dashboard" element={<Dashboard />} /> */}
              </Route>
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </Router>
    </AuthProvider>
  );
}


export default App;
