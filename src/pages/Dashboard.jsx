import React from 'react';
import { Typography, Card, Row, Col, Statistic, Spin } from 'antd';
import { CalendarOutlined, TeamOutlined, AppstoreOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { staffService } from '../services/staffService';
import { servicesService } from '../services/servicesService';
import { reservationService } from '../services/reservationService';
import { useNavigate } from 'react-router-dom';
import { APP_ROUTES } from '../config/navigation';

const { Title, Text } = Typography;

const Dashboard = () => {
  const navigate = useNavigate();

  const { data: staffData, isLoading: staffLoading } = useQuery({
    queryKey: ['staff', 'overview'],
    queryFn: () => staffService.getAll({ limit: 1 }),
  });

  const { data: servicesData, isLoading: servicesLoading } = useQuery({
    queryKey: ['services', 'overview'],
    queryFn: () => servicesService.getAll({ limit: 1 }),
  });

  const { data: resData, isLoading: resLoading } = useQuery({
    queryKey: ['reservations', 'overview'],
    queryFn: () => reservationService.getAll({ limit: 1 }),
  });

  const isLoading = staffLoading || servicesLoading || resLoading;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.15 
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
  };

  const widgets = [
    {
      title: "Active Reservations",
      value: resData?.total || 0,
      icon: <CalendarOutlined style={{ color: '#1677ff', fontSize: 24 }} />,
      route: APP_ROUTES.RESERVATIONS,
      color: 'rgba(22, 119, 255, 0.1)'
    },
    {
      title: "Total Specialists",
      value: staffData?.total || 0,
      icon: <TeamOutlined style={{ color: '#52c41a', fontSize: 24 }} />,
      route: APP_ROUTES.STAFF,
      color: 'rgba(82, 196, 26, 0.1)'
    },
    {
      title: "Offered Services",
      value: servicesData?.total || 0,
      icon: <AppstoreOutlined style={{ color: '#722ed1', fontSize: 24 }} />,
      route: APP_ROUTES.SERVICES,
      color: 'rgba(114, 46, 209, 0.1)'
    }
  ];

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px 0' }}>
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div style={{ 
          background: 'linear-gradient(135deg, #1677ff 0%, #722ed1 100%)',
          padding: '40px',
          borderRadius: '16px',
          color: 'white',
          marginBottom: '32px',
          boxShadow: '0 10px 30px rgba(114, 46, 209, 0.2)'
        }}>
          <Title level={1} style={{ color: 'white', margin: 0 }}>Welcome back!</Title>
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px' }}>
            Here is what's happening at your aesthetic center today.
          </Text>
        </div>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Row gutter={[24, 24]}>
          {widgets.map((widget, index) => (
            <Col xs={24} sm={12} lg={8} key={index}>
              <motion.div variants={itemVariants} whileHover={{ y: -5, transition: { duration: 0.2 } }}>
                <Card 
                  bordered={false} 
                  style={{ 
                    borderRadius: '12px', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    cursor: 'pointer',
                    height: '100%'
                  }}
                  onClick={() => navigate(widget.route)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <Statistic
                        title={<span style={{ fontSize: '14px', color: '#8c8c8c' }}>{widget.title}</span>}
                        value={widget.value}
                        valueStyle={{ fontSize: '32px', fontWeight: 'bold' }}
                      />
                    </div>
                    <div style={{ 
                      width: 56, 
                      height: 56, 
                      borderRadius: '50%', 
                      background: widget.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {widget.icon}
                    </div>
                  </div>
                  <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', color: '#1677ff', fontWeight: 500 }}>
                    View Details <ArrowRightOutlined style={{ marginLeft: '8px' }} />
                  </div>
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>
      </motion.div>
    </div>
  );
};

export default Dashboard;
