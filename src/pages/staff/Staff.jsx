import React, { useState, useEffect } from 'react';
import { Typography, Card, Button, Space, Popconfirm, message, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { GenericTable } from '../../components/common/GenericTable';
import { StaffModal } from './StaffModal';
import { staffService } from '../../services/staffService';

const { Title } = Typography;

const Staff = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);

  const fetchStaff = async (page = currentPage, limit = pageSize, search = searchText) => {
    setLoading(true);
    try {
      const result = await staffService.getAll({ page, limit, search });
      
      setData(result?.data || []);
      setTotal(result?.total || 0);
    } catch (error) {
      console.error(error);
      message.error('Failed to fetch staff data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff(currentPage, pageSize, searchText);
  }, [currentPage, pageSize, searchText]);

  const handleTableChange = (paginationConfig) => {
    setCurrentPage(paginationConfig.current);
    setPageSize(paginationConfig.pageSize);
  };

  const handleSearch = (value) => {
    setCurrentPage(1);
    setSearchText(value);
  };

  const handleDelete = async (id) => {
    try {
      await staffService.delete(id);
      message.success('Specialist deleted successfully');
      fetchStaff(); 
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
      fetchStaff(); 
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
          dataSource={data}
          loading={loading}
          onChange={handleTableChange}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
          }}
          onSearch={handleSearch}
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
