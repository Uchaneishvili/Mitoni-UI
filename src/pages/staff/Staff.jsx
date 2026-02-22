import { useState } from 'react';
import { Typography, Card, Button, Space, Popconfirm, message, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { GenericTable } from '../../components/common/GenericTable';
import { StaffModal } from './StaffModal';
import { staffService } from '../../services/staffService';

const { Title } = Typography;

const Staff = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refreshTable = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleDelete = async (id) => {
    try {
      await staffService.delete(id);
      message.success('Specialist deleted successfully');
      refreshTable();
    } catch (error) {
      message.error('Failed to delete specialist');
    }
  };

  const handleCreateOrUpdate = async (values) => {
    try {
      if (editingStaff) {
        await staffService.update(editingStaff.id, values);
        message.success('Specialist updated successfully');
      } else {
        await staffService.create(values);
        message.success('Specialist created successfully');
      }
      setModalOpen(false);
      setEditingStaff(null);
      refreshTable(); 
    } catch (error) {
      message.error(editingStaff ? 'Failed to update specialist' : 'Failed to create specialist');
    }
  };

  const openEditModal = (record) => {
    setEditingStaff(record);
    setModalOpen(true);
  };

  const columns = [
    {
      title: 'First Name',
      dataIndex: 'firstName',
      key: 'firstName',
      sorter: true,
    },
    {
      title: 'Last Name',
      dataIndex: 'lastName',
      key: 'lastName',
      sorter: true,
    },
    {
      title: 'Specialization',
      dataIndex: 'specialization',
      key: 'specialization',
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      filters: [
        { text: 'Active', value: true },
        { text: 'Inactive', value: false },
      ],
      render: (isActive) => (
        <Tag color={isActive ? 'success' : 'error'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
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
            onClick={() => openEditModal(record)}
          />
          <Popconfirm
            title="Delete the specialist"
            description="Are you sure to delete this specialist?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>Staff Management</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => {
            setEditingStaff(null);
            setModalOpen(true);
          }}
        >
          Add Specialist
        </Button>
      </div>
      
      <Card bordered={false}>
        <GenericTable
          columns={columns}
          fetchData={staffService.getAll}
          refreshTrigger={refreshTrigger}
          searchPlaceholder="Search specialists by name or specialization..."
        />
      </Card>

      <StaffModal
        open={modalOpen}
        initialValues={editingStaff}
        onCancel={() => setModalOpen(false)}
        onSubmit={handleCreateOrUpdate}
      />
    </div>
  );
};

export default Staff;
