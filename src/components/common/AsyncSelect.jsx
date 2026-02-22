import React, { useMemo, useState, useEffect } from 'react';
import { Select, Spin } from 'antd';
import debounce from 'lodash.debounce';
import { useQuery } from '@tanstack/react-query';

export const AsyncSelect = ({
  fetchData,
  queryKeyPrefix,
  debounceTimeout = 500,
  labelKey = 'name',
  valueKey = 'id',
  renderOption,
  ...props
}) => {
  const [searchText, setSearchText] = useState('');

  const debouncedSearch = useMemo(() => {
    return debounce((value) => {
      setSearchText(value);
    }, debounceTimeout);
  }, [debounceTimeout]);

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const { data, isLoading } = useQuery({
    queryKey: [queryKeyPrefix, searchText],
    queryFn: () => fetchData({ search: searchText, limit: 20 }),
    enabled: !!fetchData,
  });

  const options = data?.data || [];

  return (
    <Select
      showSearch
      filterOption={false}
      onSearch={debouncedSearch}
      notFoundContent={isLoading ? <Spin size="small" /> : null}
      {...props}
    >
      {options.map((option) => (
        <Select.Option key={option[valueKey]} value={option[valueKey]}>
          {renderOption ? renderOption(option) : option[labelKey]}
        </Select.Option>
      ))}
    </Select>
  );
};
