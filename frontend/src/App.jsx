import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import DepartmentPage from './pages/DepartmentPage';
import ProcessPage from './pages/ProcessPage';
import AdminPage from './pages/AdminPage';
import ManagerPage from './pages/ManagerPage';
import ManagerArchetypePage from './pages/ManagerArchetypePage';
import TesterPage from './pages/TesterPage';
import DepartmentDossierPage from './pages/DepartmentDossierPage';
import DataFlowPage from './pages/DataFlowPage';
import HolyNavPage from './pages/HolyNavPage';
import './styles/global.css';
import './styles/sidebar.css';
import './styles/topbar.css';
import './styles/content.css';
import './styles/cards.css';
import './styles/tables.css';
import './styles/tabs.css';
import './styles/charts.css';
import './styles/process.css';
import './styles/forms.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/data-flow" element={<DataFlowPage />} />
          <Route path="/holy" element={<HolyNavPage />} />
          <Route path="/holy/:departmentId" element={<HolyNavPage />} />
          <Route path="/:departmentId" element={<DepartmentPage />} />
          <Route path="/:departmentId/admin" element={<AdminPage />} />
          <Route path="/:departmentId/manager" element={<ManagerPage />} />
          <Route path="/:departmentId/manager/archetype/:archetypeId" element={<ManagerArchetypePage />} />
          <Route path="/:departmentId/tester" element={<TesterPage />} />
          <Route path="/:departmentId/dossier" element={<DepartmentDossierPage />} />
          <Route path="/:departmentId/:processId" element={<ProcessPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
