import React from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { NAVIGATION_MENU, APP_ROUTES } from '../../config/navigation';

const { Sider } = Layout;

export const AppSidebar = ({ collapsed, setCollapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  const getSelectedKey = () => {
    const activeItem = NAVIGATION_MENU.find(item => location.pathname.startsWith(item.key));
    return activeItem ? activeItem.key : APP_ROUTES.DASHBOARD;
  };

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      breakpoint="lg"
      onBreakpoint={(broken) => {
        setCollapsed(broken);
      }}
    >
      <div
        className="logo"
        style={{
          height: 32,
          margin: 16,
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
        }}
      >
        {collapsed ? 'AC' : 'Aesthetic Center'}
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[getSelectedKey()]}
        onClick={handleMenuClick}
        items={NAVIGATION_MENU}
      />
    </Sider>
  );
};
