import { Layout } from 'antd';
import { Outlet, Link, useLocation } from 'react-router-dom';

const { Header, Content } = Layout;

const V2Layout = () => {
  const location = useLocation();

  const getNavStyle = (path) => {
    const isActive = location.pathname.includes(path);
    return {
      padding: '0 16px',
      margin: '0 8px',
      color: isActive ? '#1677ff' : '#8c8c8c',
      borderBottom: isActive ? '2px solid #1677ff' : '2px solid transparent',
      textDecoration: 'none',
      fontWeight: 500,
      fontSize: '15px',
      display: 'flex',
      alignItems: 'center',
      height: '100%',
      transition: 'all 0.3s'
    };
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#FAFAFA' }}>
      <Header style={{ background: '#fff', borderBottom: '1px solid #EBEBEB', padding: 0, height: '56px', display: 'flex', justifyContent: 'center' }}>
        <nav style={{ display: 'flex', height: '100%' }}>
          <Link to="/v2/schedule" style={getNavStyle('/v2/schedule')}>Schedule</Link>
          <Link to="/v2/staff" style={getNavStyle('/v2/staff')}>Staff</Link>
          <Link to="/v2/services" style={getNavStyle('/v2/services')}>Services</Link>
        </nav>
      </Header>
      
      <Content
        style={{
          margin: location.pathname.includes('/v2/schedule') ? '0px' : '40px auto',
          padding: location.pathname.includes('/v2/schedule') ? '0px' : '0 24px',
          maxWidth: location.pathname.includes('/v2/schedule') ? '100%' : 760,
          width: '100%',
        }}
      >
        <Outlet />
      </Content>
    </Layout>
  );
};

export default V2Layout;
