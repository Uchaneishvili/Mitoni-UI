import { useState } from 'react';
import { Input, Button, Space, Avatar, Popconfirm, Spin } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { staffService } from '../../../services/staffService';
import { STAFF_QUERY_KEY, useDeleteStaff, useCreateStaff, useUpdateStaff } from '../../../hooks/queries/useStaff';
import { StaffModalV2 } from './StaffModalV2';



const StaffV2 = () => {
  const [searchText, setSearchText] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);

  const { data: result, isLoading } = useQuery({
    queryKey: [STAFF_QUERY_KEY, { search: searchText, page: 1, limit: 100 }],
    queryFn: () => staffService.getAll({ search: searchText, page: 1, limit: 100 }),
  });

  const { mutate: deleteStaff, isPending: isDeleting } = useDeleteStaff();
  const { mutate: createStaff } = useCreateStaff();
  const { mutate: updateStaff } = useUpdateStaff();

  const staffList = result?.data || [];

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

  const openEditModal = (staff) => {
    setEditingStaff(staff);
    setModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingStaff(null);
    setModalOpen(true);
  };


  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600, color: '#333' }}>Staff</h2>
        <Button 
          icon={<PlusOutlined />} 
          style={{ 
            color: '#1677ff', 
            borderColor: '#1677ff', 
            borderRadius: '6px', 
            fontWeight: 500,
            padding: '4px 16px',
            backgroundColor: '#fff'
          }}
          onClick={openCreateModal}
        >
          Add New
        </Button>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <Input 
          placeholder="Search" 
          prefix={<SearchOutlined style={{ color: '#bfbfbf', fontSize: '16px' }} />} 
          style={{ 
            width: '100%', 
            borderRadius: '6px',
            padding: '8px 12px',
            border: '1px solid #EBEBEB',
            boxShadow: '0 1px 2px rgba(0,0,0,0.01)'
          }}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      <div style={{ 
        background: '#fff', 
        borderRadius: '8px', 
        border: '1px solid #EBEBEB',
        boxShadow: '0 1px 4px rgba(0,0,0,0.03)'
      }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}><Spin /></div>
        ) : staffList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>No staff members found.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {staffList.map((staff, index) => {
              const isLast = index === staffList.length - 1;
              return (
                <div 
                  key={staff.id} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    padding: '16px 20px',
                    borderBottom: isLast ? 'none' : '1px solid #f0f0f0',
                  }}
                >
                  <Space size={16}>
                    <Avatar 
                      size={44}
                      src={staff.avatarUrl}
                      style={{ 
                        backgroundColor: '#f5f5f5', 
                        border: '1px solid #eeeeee' 
                      }}
                    >
                      <div style={{ fontSize: '16px', fontWeight: 500, color: '#333' }}>{staff.firstName?.charAt(0)}</div>
                    </Avatar>
                    <span style={{ fontWeight: 500, fontSize: '15px', color: '#333' }}>
                      {staff.firstName} {staff.lastName}
                    </span>
                  </Space>
                  
                  <Space>
                    <Button 
                      type="text" 
                      icon={<EditOutlined />} 
                      style={{ padding: '0px' }}
                      onClick={() => openEditModal(staff)}
                    />
                    <Popconfirm
                      title="Delete specialist"
                      description="Are you sure to delete this staff member?"
                      onConfirm={() => handleDelete(staff.id)}
                      okText="Yes"
                      cancelText="No"
                      placement="left"
                    >
                      <Button 
                        type="text" 
                        danger 
                        icon={<DeleteOutlined />} 
                        loading={isDeleting}
                        style={{ padding: '0px' }}
                      />
                    </Popconfirm>
                  </Space>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <StaffModalV2
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onSubmit={handleCreateOrUpdate}
        initialValues={editingStaff}
      />
    </div>
  );
};

export default StaffV2;
