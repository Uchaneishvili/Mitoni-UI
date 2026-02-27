import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import V2Layout from '../layouts/V2Layout';
import Dashboard from '../pages/Dashboard';
import { APP_ROUTES } from '../config/navigation';
import Staff from '../pages/staff/Staff';
import StaffV2 from '../pages/v2/staff/StaffV2';
import ServicesV2 from '../pages/v2/services/ServicesV2';
import ScheduleV2 from '../pages/v2/schedule/ScheduleV2';
import Services from '../pages/Services/Services';
import Reservations from '../pages/Reservations/Reservations';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate to={APP_ROUTES.DASHBOARD} replace />} />
        <Route path={APP_ROUTES.DASHBOARD} element={<Dashboard />} />
        <Route path={APP_ROUTES.STAFF} element={<Staff />} />
        <Route path={APP_ROUTES.SERVICES} element={<Services />} />
        <Route path={APP_ROUTES.RESERVATIONS} element={<Reservations />} />
      </Route>

      <Route path="/v2" element={<V2Layout />}>
        <Route path="staff" element={<StaffV2 />} />
        <Route path="services" element={<ServicesV2 />} />
        <Route path="schedule" element={<ScheduleV2 />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
