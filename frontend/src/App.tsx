import { useState } from 'react';
import Login from './pages/Login';
import Registration from './pages/Registration';
import Dashboard from './pages/Dashboard';
import FindInterviewer from './pages/FindInterviewer';
import HostSession from './pages/HostSession';

type Page = 'login' | 'register' | 'dashboard' | 'find-interviewer' | 'host-session';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('login');

  const handleNavigate = (page: string) => {
    setCurrentPage(page as Page);
  };

  return (
    <>
      {currentPage === 'login' && <Login onNavigate={handleNavigate} />}
      {currentPage === 'register' && <Registration onNavigate={handleNavigate} />}
      {currentPage === 'dashboard' && <Dashboard onNavigate={handleNavigate} />}
      {currentPage === 'find-interviewer' && <FindInterviewer onNavigate={handleNavigate} />}
      {currentPage === 'host-session' && <HostSession onNavigate={handleNavigate} />}
    </>
  );
}

export default App;
