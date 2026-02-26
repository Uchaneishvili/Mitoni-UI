import { Modal, Form, Input, Button } from 'antd';

export const AddColumnModalV2 = ({ open, onCancel, onAdd }) => {
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onAdd(values);
      form.resetFields();
      onCancel();
    } catch (info) {
    }
  };

  return (
    <Modal
      open={open}
      title={
        <div style={{ fontSize: '16px', fontWeight: 600, color: '#333', marginBottom: '16px' }}>
          Add New Column
        </div>
      }
      onCancel={onCancel}
      width={400}
      centered
      destroyOnClose
      footer={
        <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
          <Button 
            type="primary" 
            onClick={handleSubmit} 
            style={{ flex: 1, height: '40px', borderRadius: '4px', fontSize: '14px', fontWeight: 500 }}
          >
            Save
          </Button>
          <Button 
            onClick={onCancel}
            style={{ flex: 1, height: '40px', borderRadius: '4px', color: '#1677ff', borderColor: '#1677ff', fontSize: '14px', fontWeight: 500 }}
          >
            Cancel
          </Button>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        name="add_column_v2_form"
      >
        <Form.Item
          name="name"
          label={<span style={{ fontWeight: 400, color: '#8c8c8c', fontSize: '13px' }}>Name (e.g. Duration)</span>}
          rules={[{ required: true, message: 'Please input column name!' }]}
          style={{ marginBottom: '16px' }}
        >
          <Input placeholder="Name" style={{ height: '40px', borderRadius: '4px' }} />
        </Form.Item>

        <Form.Item
          name="dataIndex"
          label={<span style={{ fontWeight: 400, color: '#8c8c8c', fontSize: '13px' }}>Data Index / API Key (e.g. durationMinutes)</span>}
          rules={[{ required: true, message: 'Please input the data index key!' }]}
          style={{ marginBottom: 0 }}
        >
          <Input placeholder="dataIndex" style={{ height: '40px', borderRadius: '4px' }} />
        </Form.Item>
      </Form>
    </Modal>
  );
};
