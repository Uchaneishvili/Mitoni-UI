import { useState } from 'react';
import { Typography, Card, Button, Space, Popconfirm, Tag, Avatar } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';
import { GenericTable } from '../../components/common/GenericTable';
import { StaffModal } from './StaffModal';
import { staffService } from '../../services/staffService';
import { useCreateStaff, useUpdateStaff, useDeleteStaff, STAFF_QUERY_KEY } from '../../hooks/queries/useStaff';
import { brandColors } from '../../constants/theme';

const { Title } = Typography;

const Staff = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);

  const { mutate: createStaff } = useCreateStaff();
  const { mutate: updateStaff } = useUpdateStaff();
  const { mutate: deleteStaff } = useDeleteStaff();

  const handleDelete = (id) => {
    deleteStaff(id);
  };

  const handleCreateOrUpdate = (values, { onError }) => {
    if (editingStaff) {
      updateStaff({ id: editingStaff.id, values }, {
        onSuccess: () => {
          setModalOpen(false);
          setEditingStaff(null);
        },
        onError
      });
    } else {
      createStaff(values, {
        onSuccess: () => {
          setModalOpen(false);
          setEditingStaff(null);
        },
        onError
      });
    }
  };

  const openEditModal = (record) => {
    setEditingStaff(record);
    setModalOpen(true);
  };

  const columns = [
    {
      title: 'Specialist',
      key: 'name',
      sorter: (a, b) => a.firstName.localeCompare(b.firstName),
      render: (_, record) => {
        const initials = `${record.firstName?.[0] || ''}${record.lastName?.[0] || ''}`.toUpperCase();
        return (
          <Space>
            <Avatar 
              style={{ backgroundColor: brandColors.primary, verticalAlign: 'middle' }} 
              icon={!initials && <UserOutlined />}
            >
              {initials}
            </Avatar>
            <span style={{ fontWeight: 500 }}>{record.firstName} {record.lastName}</span>
          </Space>
        );
      }
    },
    {
      title: 'Specialization',
      dataIndex: 'specialization',
      key: 'specialization',
      render: (text) => <span style={{ color: '#595959' }}>{text}</span>
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
        <Tag color={isActive ? 'success' : 'error'} style={{ borderRadius: '12px', padding: '0 12px' }}>
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
            shape="circle"
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
            <Button danger shape="circle" icon={<DeleteOutlined />} disabled={!record.isActive} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: '16px' }}>
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
      
      <Card bordered={false} style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <GenericTable
          columns={columns}
          fetchData={staffService.getAll}
          queryKeyPrefix={STAFF_QUERY_KEY}
          searchPlaceholder="Search specialists by name or specialization..."
          size="middle"
          emptyText="No specialists found."
          emptyActionText="Add New Specialist"
          onEmptyAction={() => {
            setEditingStaff(null);
            setModalOpen(true);
          }}
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
