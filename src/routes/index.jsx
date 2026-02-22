import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Dashboard from '../pages/Dashboard';
import { APP_ROUTES } from '../config/navigation';

import Staff from '../pages/Staff';
import Services from '../pages/Services';
import Reservations from '../pages/Reservations';

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
    </Routes>
  );
};

export default AppRoutes;
