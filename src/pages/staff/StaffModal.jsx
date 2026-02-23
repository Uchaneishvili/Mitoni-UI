import { useEffect } from 'react';
import { Drawer, Form, Input, Switch, Button, Space } from 'antd';
import { handleBackendError } from '../../utils/errorHandler';
import { AsyncSelect } from '../../components/common/AsyncSelect';
import { servicesService } from '../../services/servicesService';

export const StaffModal = ({ open, onCancel, onSubmit, initialValues }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      if (initialValues) {
        form.setFieldsValue({
          ...initialValues,
          services: initialValues.services?.map(s => s.serviceId) || []
        });
      } else {
        form.resetFields();
        form.setFieldsValue({ isActive: true, services: [] });
      }
    }
  }, [open, initialValues, form]);

  const handleSubmit = () => {
    form
      .validateFields()
      .then((values) => {
        onSubmit(values, {
          onError: (error) => handleBackendError(error, form),
        });
      })
      .catch((info) => {
        console.log('Validate Failed:', info);
      });
  };

  return (
    <Drawer
      open={open}
      title={initialValues ? 'Edit Specialist' : 'Add New Specialist'}
      onClose={onCancel}
      width={400}
      destroyOnClose={true}
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
      <Form
        form={form}
        layout="vertical"
        name="staff_form"
      >
        <Form.Item
          name="firstName"
          label="First Name"
          rules={[{ required: true, message: 'Please input the first name!' }]}
        >
          <Input placeholder="e.g. Jane" />
        </Form.Item>
        <Form.Item
          name="lastName"
          label="Last Name"
          rules={[{ required: true, message: 'Please input the last name!' }]}
        >
          <Input placeholder="e.g. Smith" />
        </Form.Item>
        <Form.Item
          name="specialization"
          label="Specialization"
          rules={[{ required: true, message: 'Please input a specialization!' }]}
        >
          <Input placeholder="e.g. Dermatologist" />
        </Form.Item>
        <Form.Item
          name="services"
          label="Provided Services"
        >
          <AsyncSelect 
            placeholder="Search and select services..."
            fetchData={servicesService.getAll}
            queryKeyPrefix={'services'}
            labelKey="name"
            mode="multiple"
            allowClear
          />
        </Form.Item>
        <Form.Item
          name="isActive"
          label="Active Status"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
      </Form>
    </Drawer>
  );
};
