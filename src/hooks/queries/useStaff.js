import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { staffService } from '../../services/staffService';

export const STAFF_QUERY_KEY = 'staff';

export const useCreateStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values) => staffService.create(values),
    onSuccess: () => {
      message.success('Specialist created successfully');
      queryClient.invalidateQueries({ queryKey: [STAFF_QUERY_KEY] });
    }
  });
};

export const useUpdateStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, values }) => staffService.update(id, values),
    onSuccess: () => {
      message.success('Specialist updated successfully');
      queryClient.invalidateQueries({ queryKey: [STAFF_QUERY_KEY] });
    }
  });
};

export const useDeleteStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => staffService.delete(id),
    onSuccess: () => {
      message.success('Specialist deleted successfully');
      queryClient.invalidateQueries({ queryKey: [STAFF_QUERY_KEY] });
    }
  });
};
