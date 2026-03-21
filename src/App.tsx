// src/App.tsx
import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppStore } from './store/useAppStore';
import { useAutoSave } from './hooks/useAutoSave';
import { useGoogleDrive } from './hooks/useGoogleDrive';

// CORRECCIÓN: Se eliminaron las extensiones .tsx
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { FloatingNav } from './components/layout/FloatingNav';
import { LandingScreen } from './components/landing/LandingScreen';
import { Toast } from './components/common/Toast';
import { Modal } from './components/common/Modal';
import { ResumenPage } from './components/resumen/ResumenPage';
import { ActividadesPage } from './components/config/ActividadesPage';
import { AttendancePage } from './components/attendance/AttendancePage';
import { GradesPage } from './components/grades/GradesPage';
import { TrackingPage } from './components/tracking/TrackingPage';
import { ObservationsPage } from './components/tracking/ObservationsPage';
import { CourseReportPage } from './components/reports/CourseReportPage';
import { IndividualReportPage } from './components/reports/IndividualReportPage';
import { CalendarPage } from './components/calendar/CalendarPage';

function AppContent() {
  const currentSection = useAppStore(s => s.currentSection);
  const isDarkMode = useAppStore(s => s.isDarkMode);

  useAutoSave();
  useGoogleDrive();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const renderSection = () => {
    switch (currentSection) {
      case 'resumen':       return <ResumenPage />;
      case 'config':        return <ActividadesPage />;
      case 'informe-curso': return <CourseReportPage />;
      case 'informe-ind':   return <IndividualReportPage />;
      case 'att1':          return <AttendancePage trim={1} />;
      case 'att2':          return <AttendancePage trim={2} />;
      case 'att3':          return <AttendancePage trim={3} />;
      case 'cal1':          return <GradesPage trim={1} />;
      case 'cal2':          return <GradesPage trim={2} />;
      case 'cal3':          return <GradesPage trim={3} />;
      case 'seg':           return <TrackingPage />;
      case 'obs1':          return <ObservationsPage trim={1} />;
      case 'obs2':          return <ObservationsPage trim={2} />;
      case 'obs3':          return <ObservationsPage trim={3} />;
      case 'calendario':    return <CalendarPage />;
      default:              return <ResumenPage />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Header />
      <div style={{ display: 'flex' }}>
        <Sidebar />
        <main style={{ flex: 1, minWidth: 0, overflowX: 'auto' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSection}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              {renderSection()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <FloatingNav />
      <Toast />
      <Modal />
    </div>
  );
}

export default function App() {
  const loadFromLocalStorage = useAppStore(s => s.loadFromLocalStorage);
  const appData = useAppStore(s => s.appData);
  const hasData = Object.keys(appData.courses).length > 0;

  useEffect(() => {
    loadFromLocalStorage();
  }, []);

  return (
    <AnimatePresence mode="wait">
      {hasData ? (
        <motion.div
          key="app"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <AppContent />
        </motion.div>
      ) : (
        <motion.div
          key="landing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Header />
          <LandingScreen />
          <Toast />
          <Modal />
        </motion.div>
      )}
    </AnimatePresence>
  );
}