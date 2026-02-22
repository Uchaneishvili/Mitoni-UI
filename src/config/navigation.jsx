import {
  DashboardOutlined,
  TeamOutlined,
  AppstoreOutlined,
  CalendarOutlined,
} from '@ant-design/icons';

export const APP_ROUTES = {
  DASHBOARD: '/dashboard',
  RESERVATIONS: '/reservations',
  STAFF: '/staff',
  SERVICES: '/services',
};

export const NAVIGATION_MENU = [
  {
    key: APP_ROUTES.DASHBOARD,
    icon: <DashboardOutlined />,
    label: 'Dashboard',
  },
  {
    key: APP_ROUTES.RESERVATIONS,
    icon: <CalendarOutlined />,
    label: 'Reservations',
  },
  {
    key: APP_ROUTES.STAFF,
    icon: <TeamOutlined />,
    label: 'Specialists',
  },
  {
    key: APP_ROUTES.SERVICES,
    icon: <AppstoreOutlined />,
    label: 'Services',
  },
];
