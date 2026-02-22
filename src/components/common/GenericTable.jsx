import React, { useState } from 'react';
import { Table, Input, Button, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const { Search } = Input;

export const GenericTable = ({
  columns = [],
  dataSource = [],
  loading = false,
  onSearch,
  onChange,
  pagination = { defaultPageSize: 10, showSizeChanger: true },
  rowKey = 'id',
  searchPlaceholder = 'Search...',
  ...restProps
}) => {
  const [searchText, setSearchText] = useState('');

  const handleSearch = (value) => {
    setSearchText(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      {onSearch && (
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
          <Search
            placeholder={searchPlaceholder}
            allowClear
            value={searchText}
            onSearch={handleSearch}
            onChange={(e) => {
              setSearchText(e.target.value);
              if (e.target.value === '') {
                handleSearch('');
              }
            }}
            style={{ width: 300 }}
          />
        </div>
      )}
      <Table
        columns={columns}
        dataSource={dataSource}
        loading={loading}
        rowKey={rowKey}
        onChange={onChange}
        scroll={{ x: 'max-content' }}
        pagination={
          pagination
            ? {
                ...pagination,
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
              }
            : false
        }
        {...restProps}
      />
    </div>
  );
};
