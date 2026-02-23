import  { useState } from 'react';
import { Typography, Card, Button, Space, Tag, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { GenericTable } from '../../components/common/GenericTable';
import { servicesService } from '../../services/servicesService';
import { useDeleteService, SERVICES_QUERY_KEY } from '../../hooks/queries/useServices';
import ServiceModal from './ServiceModal';

const { Title } = Typography;

const Services = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const { mutate: deleteService } = useDeleteService();

  const handleDelete = (id) => {
    deleteService(id);
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
    },
    {
      title: 'Duration (Mins)',
      dataIndex: 'durationMinutes',
      key: 'durationMinutes',
      sorter: true,
    },
    {
      title: 'Price ($)',
      dataIndex: 'price',
      key: 'price',
      sorter: true,
      render: (val) => `$${Number(val).toFixed(2)}`,
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => (
        <Tag color={isActive ? 'success' : 'default'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
      filters: [
        { text: 'Active', value: true },
        { text: 'Inactive', value: false },
      ],
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            ghost
            icon={<EditOutlined />}
            onClick={() => {
              setEditingService(record);
              setModalOpen(true);
            }}
          />
          <Popconfirm
            title="Are you sure you want to delete this service?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger icon={<DeleteOutlined />} disabled={!record.isActive} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>Services</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingService(null);
            setModalOpen(true);
          }}
        >
          Add Service
        </Button>
      </div>

      <Card bordered={false}>
        <GenericTable
          columns={columns}
          fetchData={servicesService.getAll}
          queryKeyPrefix={SERVICES_QUERY_KEY}
          searchPlaceholder="Search services by name..."
        />
      </Card>

      <ServiceModal
        open={modalOpen}
        initialValues={editingService}
        onCancel={() => setModalOpen(false)}
      />
    </div>
  );
};

export default Services;
