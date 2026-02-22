import { useState, useEffect } from 'react';
import { Table, Input } from 'antd';

const { Search } = Input;

export const GenericTable = ({
  columns = [],
  fetchData,
  refreshTrigger = 0,
  rowKey = 'id',
  searchPlaceholder = 'Search...',
  ...restProps
}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState('');
  const [sortField, setSortField] = useState();
  const [sortOrder, setSortOrder] = useState();
  const [tableFilters, setTableFilters] = useState({});

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const params = {
          page: currentPage,
          limit: pageSize,
          search: searchText,
          sortBy: sortField,
          sortOrder: sortOrder,
        };
        
        if (tableFilters) {
          Object.keys(tableFilters).forEach(key => {
            if (tableFilters[key] !== null && tableFilters[key] !== undefined) {
              params[key] = tableFilters[key].join(',');
            }
          });
        }

        const result = await fetchData(params);
        setData(result?.data || []);
        setTotal(result?.total || 0);
      } catch (error) {
        console.error('Table fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (fetchData) {
      loadData();
    }
  }, [fetchData, currentPage, pageSize, searchText, sortField, sortOrder, tableFilters, refreshTrigger]);

  const handleTableChange = (paginationConfig, filters, sorter) => {
    setCurrentPage(paginationConfig.current);
    setPageSize(paginationConfig.pageSize);
    setTableFilters(filters);

    const currentSorter = Array.isArray(sorter) ? sorter[0] : sorter;

    if (currentSorter && currentSorter.field) {
      setSortField(currentSorter.field);
      setSortOrder(currentSorter.order);
    } else {
      setSortField(undefined);
      setSortOrder(undefined);
    }
  };

  const handleSearch = (value) => {
    setCurrentPage(1);
    setSearchText(value);
  };

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
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
      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        rowKey={rowKey}
        onChange={handleTableChange}
        scroll={{ x: 'max-content' }}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: total,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
        }}
        {...restProps}
      />
    </div>
  );
};
