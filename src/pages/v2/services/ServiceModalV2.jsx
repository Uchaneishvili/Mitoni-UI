import { useEffect, useState } from 'react';
import { Modal, Form, Input, Button, InputNumber, Select } from 'antd';
import { handleBackendError } from '../../../utils/errorHandler';
import { COLORS } from '../../../constants/theme';


export const ServiceModalV2 = ({ open, onCancel, onSubmit, initialValues, customColumns = [] }) => {
  const [form] = Form.useForm();
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);

  useEffect(() => {
    if (open) {
      if (initialValues) {
        form.setFieldsValue(initialValues);
        setSelectedColor(initialValues.color || COLORS[0]);
      } else {
        form.resetFields();
        setSelectedColor(COLORS[0]);
      }
    }
  }, [open, initialValues, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const finalValues = { ...values, color: selectedColor };
      
      onSubmit(finalValues, {
        onError: (error) => handleBackendError(error, form),
      });
    } catch (info) {
      console.error('Validation Failed:', info);
    }
  };

  return (
    <Modal
      open={open}
      title={
        <div style={{ fontSize: '16px', fontWeight: 500, color: '#595959' }}>
          {initialValues ? 'Edit Service' : 'Add New Service'}
        </div>
      }
      onCancel={onCancel}
      width={480}
      centered
      destroyOnClose={true}
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
      styles={{
        header: { marginBottom: '24px' }
      }}
    >
      <Form
        form={form}
        layout="vertical"
        name="service_v2_form"
        requiredMark={(label, info) => (
          <span>
            {info.required && <span style={{ color: '#ff4d4f', marginRight: '4px' }}>*</span>}
            {label}
          </span>
        )}
      >
        <Form.Item
          name="name"
          label={<span style={{ fontWeight: 400, color: '#8c8c8c', fontSize: '13px' }}>Name</span>}
          rules={[{ required: true, message: 'Please input the service name!' }]}
          style={{ marginBottom: '16px' }}
        >
          <Input placeholder="Anti-Wrinkle Injections" style={{ height: '40px', borderRadius: '4px' }} />
        </Form.Item>
        
        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
          <Form.Item
            name="price"
            label={<span style={{ fontWeight: 400, color: '#8c8c8c', fontSize: '13px' }}>Price</span>}
            rules={[{ required: true, message: 'Please input the price!' }]}
            style={{ flex: 1, marginBottom: 0 }}
          >
            <InputNumber 
              min={0} 
              step={0.01} 
              style={{ width: '100%', height: '40px', borderRadius: '4px',}} 
              placeholder="100" 
            />
          </Form.Item>

          <Form.Item
            label={<span style={{ fontWeight: 400, color: '#8c8c8c', fontSize: '13px' }}>Color</span>}
            style={{ flex: 1, marginBottom: 0 }}
          >
            <Select
              value={selectedColor}
              onChange={setSelectedColor}
              style={{ width: '100%', height: '40px' }}
              options={COLORS.map(c => ({
                label: <div style={{ width: '100%', height: '24px', backgroundColor: c, borderRadius: '4px' }} />,
                value: c
              }))}
            />
          </Form.Item>
        </div>

        {customColumns.map(col => (
           <Form.Item
              key={col.dataIndex}
              name={col.dataIndex}
              label={<span style={{ fontWeight: 400, color: '#8c8c8c', fontSize: '13px' }}>{col.title}</span>}
              style={{ marginBottom: '16px' }}
           >
              <Input placeholder={col.title} style={{ height: '40px', borderRadius: '4px' }} />
           </Form.Item>
        ))}

      </Form>
    </Modal>
  );
};
