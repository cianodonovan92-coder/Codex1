import { NavLink, Route, Routes } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import SimulationPage from './pages/SimulationPage';
import AnalyticsPage from './pages/AnalyticsPage';

const navItems = [
  { to: '/', label: 'Overview' },
  { to: '/simulation', label: 'Simulation' },
  { to: '/analytics', label: 'Analytics' }
];

export default function App() {
  const location = useLocation();

  return (
    <div className="app-shell">
      <header className="top-bar glass-panel">
        <div className="logo-wrap">
          <div className="logo-orb" />
          <div>
            <p className="eyebrow">ApexLab Systems</p>
            <h1>Elite Motion Intelligence</h1>
          </div>
        </div>
        <nav>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `nav-pill ${isActive ? 'active' : ''}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -20, filter: 'blur(8px)' }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <Routes location={location}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/simulation" element={<SimulationPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
          </Routes>
        </motion.main>
      </AnimatePresence>
    </div>
  );
}
