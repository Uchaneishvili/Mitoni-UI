import { useEffect } from 'react';
import { Modal, Form, Input, Switch } from 'antd';
import { handleBackendError } from '../../utils/errorHandler';

export const StaffModal = ({ open, onCancel, onSubmit, initialValues }) => {
  const [form] = Form.useForm();

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

  const handleOk = () => {
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
    <Modal
      open={open}
      title={initialValues ? 'Edit Specialist' : 'Add New Specialist'}
      okText={initialValues ? 'Update' : 'Create'}
      cancelText="Cancel"
      onCancel={onCancel}
      onOk={handleOk}
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
          name="isActive"
          label="Active Status"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
};
