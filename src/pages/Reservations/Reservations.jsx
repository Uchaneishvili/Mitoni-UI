import React, { useState } from 'react';
import { Typography, Card, Button, Space, Tag, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { GenericTable } from '../../components/common/GenericTable';
import { reservationService } from '../../services/reservationService';
import { servicesService } from '../../services/servicesService';
import { useUpdateReservationStatus, RESERVATION_QUERY_KEY } from '../../hooks/queries/useReservations';
import ReservationModal from './ReservationModal';

const { Title } = Typography;

const statusColors = {
  PENDING: 'warning',
  CONFIRMED: 'processing',
  COMPLETED: 'success',
  CANCELLED: 'error',
};

const Reservations = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingReservation, setEditingReservation] = useState(null);
  
  const { mutate: updateStatus } = useUpdateReservationStatus();

  // Fetch services to map serviceId to serviceName in the table
  const { data: servicesData } = useQuery({
    queryKey: ['servicesListAll'],
    queryFn: () => servicesService.getAll({ limit: 100 }),
  });
  const servicesList = servicesData?.data || [];
  const getServiceName = (serviceId) => {
    const service = servicesList.find(s => s.id === serviceId);
    return service ? service.name : serviceId;
  };

  const handleStatusChange = (id, newStatus) => {
    updateStatus({ id, status: newStatus });
  };

  const columns = [
    {
      title: 'Time',
      dataIndex: 'startTime',
      key: 'startTime',
      render: (val) => dayjs(val).format('YYYY-MM-DD HH:mm'),
      sorter: true,
    },
    {
      title: 'Customer',
      key: 'customer',
      render: (_, record) => (
        <div>
          <div>{record.customerName}</div>
          <div style={{ fontSize: '12px', color: 'gray' }}>{record.customerPhone}</div>
        </div>
      )
    },
    {
      title: 'Staff',
      key: 'staff',
      render: (_, record) => record.staff ? `${record.staff.firstName} ${record.staff.lastName}` : 'N/A'
    },
    {
      title: 'Service',
      dataIndex: 'serviceId',
      key: 'serviceId',
      render: (serviceId) => getServiceName(serviceId)
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Tag color={statusColors[status] || 'default'}>{status}</Tag>,
      filters: [
        { text: 'Pending', value: 'PENDING' },
        { text: 'Confirmed', value: 'CONFIRMED' },
        { text: 'Completed', value: 'COMPLETED' },
        { text: 'Cancelled', value: 'CANCELLED' },
      ],
    },
    {
      title: 'Notes',
      dataIndex: 'notes',
      key: 'notes',
      ellipsis: true,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            type="primary" 
            ghost 
            size="small"
            icon={<EditOutlined />} 
            onClick={() => {
              setEditingReservation(record);
              setModalOpen(true);
            }}
          />
          {record.status === 'PENDING' && (
            <Popconfirm title="Confirm reservation?" onConfirm={() => handleStatusChange(record.id, 'CONFIRMED')}>
              <Button size="small" type="dashed" style={{ color: 'green', borderColor: 'green' }} icon={<CheckCircleOutlined />} />
            </Popconfirm>
          )}
          {['PENDING', 'CONFIRMED'].includes(record.status) && (
             <Popconfirm title="Cancel reservation?" onConfirm={() => handleStatusChange(record.id, 'CANCELLED')}>
               <Button size="small" danger icon={<CloseCircleOutlined />} />
             </Popconfirm>
          )}
        </Space>
      )
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>Reservations</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => {
            setEditingReservation(null);
            setModalOpen(true);
          }}
        >
          New Reservation
        </Button>
      </div>

      <Card bordered={false}>
        <GenericTable
          columns={columns}
          fetchData={reservationService.getAll}
          queryKeyPrefix={RESERVATION_QUERY_KEY}
          searchPlaceholder="Search by customer name, phone, or notes..."
        />
      </Card>
      
      {modalOpen && (
        <ReservationModal
          open={modalOpen}
          initialValues={editingReservation}
          onCancel={() => setModalOpen(false)}
        />
      )}
    </div>
  );
};

export default Reservations;
