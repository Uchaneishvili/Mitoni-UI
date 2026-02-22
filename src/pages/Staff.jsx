import React, { useState } from 'react';
import { Typography, Card, Button, Space, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { GenericTable } from '../components/common/GenericTable';

const { Title } = Typography;

const mockData = [
  { id: 1, name: 'test 1', role: 'role 1', email: 'test1@aesthetic.com', phone: '+9955555556' },
  { id: 2, name: 'test 2', role: 'role 2', email: 'test2@aesthetic.com', phone: '+9955555557' },
  { id: 3, name: 'test 3', role: 'role 3', email: 'test3@aesthetic.com', phone: '+9955555558' },
];

const Staff = () => {
  const [data, setData] = useState(mockData);
  const [searchText, setSearchText] = useState('');
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Role / Specialty',
      dataIndex: 'role',
      key: 'role',
      filters: [
        { text: 'Dermatologist', value: 'Dermatologist' },
        { text: 'Laser Technician', value: 'Laser Technician' },
        { text: 'Esthetician', value: 'Esthetician' },
        { text: 'Nurse Injector', value: 'Nurse Injector' },
      ],
      onFilter: (value, record) => record.role.includes(value),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
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
            onClick={() => console.log('Edit', record)}
          />
          <Popconfirm
            title="Delete the specialist"
            description="Are you sure to delete this specialist?"
            onConfirm={() => {
              setData(data.filter(item => item.id !== record.id));
            }}
            okText="Yes"
            cancelText="No"
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const filteredData = data.filter((item) => {
    if (!searchText) return true;
    const lowerSearch = searchText.toLowerCase();
    return (
      item.name.toLowerCase().includes(lowerSearch) ||
      item.role.toLowerCase().includes(lowerSearch) ||
      item.email.toLowerCase().includes(lowerSearch) ||
      item.phone.toLowerCase().includes(lowerSearch)
    );
  });

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>Staff Management (Demo)</Title>
      </div>
      
      <Card bordered={false}>
        <GenericTable
          columns={columns}
          dataSource={filteredData}
          onSearch={(v) => setSearchText(v)}
          searchPlaceholder="Search specialists by name, email, or role..."
        />
      </Card>
    </div>
  );
};

export default Staff;
