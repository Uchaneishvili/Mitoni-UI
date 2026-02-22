import  { useEffect } from 'react';
import { Modal, Form, Input, DatePicker } from 'antd';
import dayjs from 'dayjs';
import { useCreateReservation, useUpdateReservation } from '../../hooks/queries/useReservations';
import { staffService } from '../../services/staffService';
import { servicesService } from '../../services/servicesService';
import { AsyncSelect } from '../../components/common/AsyncSelect';

const ReservationModal = ({ open, initialValues, onCancel }) => {
  const [form] = Form.useForm();
  const { mutate: createRes } = useCreateReservation();
  const { mutate: updateRes } = useUpdateReservation();

  useEffect(() => {
    if (open) {
      if (initialValues) {
        form.setFieldsValue({
          ...initialValues,
          startTime: initialValues.startTime ? dayjs(initialValues.startTime) : null,
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, initialValues, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const formattedValues = {
        ...values,
        startTime: values.startTime ? values.startTime.toISOString() : null,
      };

      if (initialValues) {
        updateRes({ id: initialValues.id, values: formattedValues }, {
          onSuccess: onCancel
        });
      } else {
        createRes(formattedValues, {
          onSuccess: onCancel
        });
      }
    } catch (error) {
      console.error('Validation Failed:', error);
    }
  };

  return (
    <Modal
      title={initialValues ? 'Edit Reservation' : 'New Reservation'}
      open={open}
      onOk={handleSubmit}
      onCancel={onCancel}
      okText="Save"
    >
      <Form form={form} layout="vertical">
        <Form.Item name="staffId" label="Staff Member" rules={[{ required: true, message: 'Please select a staff member' }]}>
          <AsyncSelect 
            placeholder="Search staff..."
            fetchData={staffService.getAll}
            queryKeyPrefix={'staff'}
            renderOption={(s) => `${s.firstName} ${s.lastName}`}
          />
        </Form.Item>
        <Form.Item name="serviceId" label="Service" rules={[{ required: true, message: 'Please select a service' }]}>
          <AsyncSelect 
            placeholder="Search services..."
            fetchData={servicesService.getAll}
            queryKeyPrefix={'services'}
            labelKey="name"
          />
        </Form.Item>
        <Form.Item name="customerName" label="Customer Name" rules={[{ required: true }]}>
          <Input placeholder="John Doe" />
        </Form.Item>
        <Form.Item name="customerPhone" label="Customer Phone" rules={[{ required: true }]}>
          <Input placeholder="+123456789" />
        </Form.Item>
        <Form.Item name="startTime" label="Reservation Time" rules={[{ required: true }]}>
          <DatePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="notes" label="Notes">
          <Input.TextArea rows={3} placeholder="Any special requests or details..." />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ReservationModal;
