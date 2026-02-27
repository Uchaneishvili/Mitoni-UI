import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { reservationService } from '../../services/reservationService';

export const RESERVATION_QUERY_KEY = 'reservations';

export const useCreateReservation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values) => reservationService.create(values),
    onSuccess: () => {
      message.success('Reservation created successfully');
      queryClient.invalidateQueries({ queryKey: [RESERVATION_QUERY_KEY] });
    }
  });
};

export const useUpdateReservation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, values }) => reservationService.update(id, values),
    onSuccess: () => {
      message.success('Reservation updated successfully');
      queryClient.invalidateQueries({ queryKey: [RESERVATION_QUERY_KEY] });
    }
  });
};

export const useUpdateReservationStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }) => reservationService.updateStatus(id, status),
    onSuccess: () => {
      message.success('Reservation status updated');
      queryClient.invalidateQueries({ queryKey: [RESERVATION_QUERY_KEY] });
    }
  });
};

export const useDeleteReservation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => reservationService.delete(id),
    onSuccess: () => {
      message.success('Reservation deleted successfully');
      queryClient.invalidateQueries({ queryKey: [RESERVATION_QUERY_KEY] });
    }
  });
};
