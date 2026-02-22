import { useState, useMemo, useEffect } from 'react';
import { Table, Input } from 'antd';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import debounce from 'lodash.debounce';

const { Search } = Input;

export const GenericTable = ({
  columns = [],
  fetchData,
  rowKey = 'id',
  searchPlaceholder = 'Search...',
  queryKeyPrefix = 'genericTable',
  ...restProps
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearchText, setDebouncedSearchText] = useState('');
  const [sortField, setSortField] = useState();
  const [sortOrder, setSortOrder] = useState();
  const [tableFilters, setTableFilters] = useState({});

  const debouncedSetSearch = useMemo(
    () => debounce((value) => {
      setDebouncedSearchText(value);
      setCurrentPage(1); 
    }, 500),
    []
  );

  useEffect(() => {
    return () => {
      debouncedSetSearch.cancel();
    };
  }, [debouncedSetSearch]);

  const queryParams = useMemo(() => {
    const params = {
      page: currentPage,
      limit: pageSize,
      search: debouncedSearchText,
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
    return params;
  }, [currentPage, pageSize, debouncedSearchText, sortField, sortOrder, tableFilters]);

  const { data: result, isLoading, isError, error } = useQuery({
    queryKey: [queryKeyPrefix, queryParams],
    queryFn: () => fetchData(queryParams),
    enabled: !!fetchData,
    placeholderData: keepPreviousData,
  });

  const tableData = result?.data || [];
  const totalItems = result?.total || 0;

  if (isError) {
    console.error('Table fetch error:', error);
  }

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

  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchText(value);
    debouncedSetSearch(value);
  };

  const handleSearchSubmit = (value) => {
    setSearchText(value);
    setDebouncedSearchText(value);
    setCurrentPage(1);
    debouncedSetSearch.cancel(); 
  };

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <Search
          placeholder={searchPlaceholder}
          allowClear
          value={searchText}
          onSearch={handleSearchSubmit}
          onChange={handleSearchInputChange}
          style={{ width: 300 }}
        />
      </div>
      <Table
        columns={columns}
        dataSource={tableData}
        loading={isLoading}
        rowKey={rowKey}
        onChange={handleTableChange}
        scroll={{ x: 'max-content' }}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: totalItems,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
        }}
        {...restProps}
      />
    </div>
  );
};
