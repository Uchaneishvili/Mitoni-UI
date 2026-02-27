import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { staffService } from '../../services/staffService';

export const STAFF_QUERY_KEY = 'staff';

export const useCreateStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values) => {
      const { serviceIds, ...staffData } = values;
      const response = await staffService.create(staffData);
      const newStaffId = response.data?.id || response.id;
      
      if (serviceIds && newStaffId) {
        await staffService.assignServices(newStaffId, serviceIds);
      }
      return response;
    },
    onSuccess: () => {
      message.success('Specialist created successfully');
      queryClient.invalidateQueries({ queryKey: [STAFF_QUERY_KEY] });
    }
  });
};

export const useUpdateStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, values }) => {
      const { serviceIds, ...staffData } = values;
      const response = await staffService.update(id, staffData);
      
      if (serviceIds) {
        await staffService.assignServices(id, serviceIds);
      }
      return response;
    },
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
