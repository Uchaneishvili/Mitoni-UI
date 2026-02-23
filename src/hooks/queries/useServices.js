import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { servicesService } from '../../services/servicesService';

export const SERVICES_QUERY_KEY = 'services';

export const useCreateService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values) => servicesService.create(values),
    onSuccess: () => {
      message.success('Service created successfully');
      queryClient.invalidateQueries({ queryKey: [SERVICES_QUERY_KEY] });
    }
  });
};

export const useUpdateService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, values }) => servicesService.update(id, values),
    onSuccess: () => {
      message.success('Service updated successfully');
      queryClient.invalidateQueries({ queryKey: [SERVICES_QUERY_KEY] });
    }
  });
};

export const useDeleteService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => servicesService.delete(id),
    onSuccess: () => {
      message.success('Service deactivated successfully');
      queryClient.invalidateQueries({ queryKey: [SERVICES_QUERY_KEY] });
    }
  });
};
