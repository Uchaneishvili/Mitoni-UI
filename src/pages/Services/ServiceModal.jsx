import { useEffect } from 'react';
import { Drawer, Form, Input, InputNumber, Switch, Button, Space } from 'antd';
import { useCreateService, useUpdateService } from '../../hooks/queries/useServices';
import { handleBackendError } from '../../utils/errorHandler';

const ServiceModal = ({ open, initialValues, onCancel }) => {
  const [form] = Form.useForm();
  const { mutate: createService } = useCreateService();
  const { mutate: updateService } = useUpdateService();

  useEffect(() => {
    if (open) {
      if (initialValues) {
        form.setFieldsValue(initialValues);
      } else {
        form.resetFields();
        form.setFieldsValue({ isActive: true });
      }
    }
  }, [open, initialValues, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (initialValues) {
        updateService(
          { id: initialValues.id, values },
          { 
            onSuccess: onCancel,
            onError: (error) => handleBackendError(error, form)
          }
        );
      } else {
        createService(values, { 
          onSuccess: onCancel,
          onError: (error) => handleBackendError(error, form)
        });
      }
    } catch (error) {
      console.error('Validation Failed:', error);
    }
  };

  return (
    <Drawer
      title={initialValues ? 'Edit Service' : 'Add New Service'}
      open={open}
      onClose={onCancel}
      width={400}
      placement="right"
      extra={
        <Space>
          <Button onClick={onCancel}>Cancel</Button>
          <Button onClick={handleSubmit} type="primary">
            {initialValues ? 'Update' : 'Create'}
          </Button>
        </Space>
      }
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="Service Name"
          rules={[{ required: true, message: 'Please enter a service name' }]}
        >
          <Input placeholder="e.g. Haircut, Massage" />
        </Form.Item>
        
        <Form.Item
          name="durationMinutes"
          label="Duration (Minutes)"
          rules={[{ required: true, message: 'Please enter duration' }]}
        >
          <InputNumber min={5} step={5} style={{ width: '100%' }} placeholder="30" />
        </Form.Item>

        <Form.Item
          name="price"
          label="Price ($)"
          rules={[{ required: true, message: 'Please enter price' }]}
        >
          <InputNumber min={0} step={0.01} style={{ width: '100%' }} placeholder="50.00" />
        </Form.Item>

        {initialValues && (
          <Form.Item
            name="isActive"
            label="Active Status"
            valuePropName="checked"
          >
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
          </Form.Item>
        )}
      </Form>
    </Drawer>
  );
};

export default ServiceModal;
