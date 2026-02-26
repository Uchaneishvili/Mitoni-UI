import { useEffect, useState } from 'react';
import { Modal, Form, Input, Button, Upload, message } from 'antd';
import { handleBackendError } from '../../../utils/errorHandler';
import { CloseOutlined, PlusOutlined } from '@ant-design/icons';
import RequestHelper from '../../../utils/RequestHelper';

export const StaffModalV2 = ({ open, onCancel, onSubmit, initialValues }) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (open) {
      if (initialValues) {
        form.setFieldsValue({
          firstName: initialValues.firstName,
          lastName: initialValues.lastName,
        });
        
        if (initialValues.avatarUrl) {
           setFileList([
            {
              uid: '-1',
              name: 'profile-photo.png',
              status: 'done',
              url: initialValues.avatarUrl,
            },
          ]);
        } else {
          setFileList([]);
        }
      } else {
        form.resetFields();
        setFileList([]);
      }
    }
  }, [open, initialValues, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      let finalValues = { ...values };
    
      const fileRecord = fileList.length > 0 ? fileList[0] : null;
      const actualFile = fileRecord?.originFileObj || (fileRecord && !fileRecord.url ? fileRecord : null);

      if (actualFile) {
         setUploading(true);
         try {
           const formData = new FormData();
           formData.append('file', actualFile);
           const uploadResponse = await RequestHelper.client.post('/media/upload', formData, {
             headers: { 'Content-Type': 'multipart/form-data' }
           });
           
           const responseData = uploadResponse?.data?.data || uploadResponse?.data || uploadResponse;
           
           if (responseData?.url) {
             finalValues.avatarUrl = responseData.url;
           }
         } catch (error) {
           message.error('Failed to upload photo');
           setUploading(false);
           return;
         } finally {
           setUploading(false);
         }
      } else if (fileList.length > 0 && fileList[0].url) {
        finalValues.avatarUrl = fileList[0].url;
      } else {
        finalValues.avatarUrl = null; 
      }

      onSubmit(finalValues, {
        onError: (error) => handleBackendError(error, form),
      });
    } catch (info) {
      console.log('Failed:', info);
    }
  };

  const uploadProps = {
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: (file) => {
      setFileList([{
        uid: file.uid,
        name: file.name,
        status: 'done',
        originFileObj: file,
      }]); 
      return false;
    },
    fileList,
    maxCount: 1,
    listType: 'picture-card',
    showUploadList: {
       showPreviewIcon: false,
    },
  };

  return (
    <Modal
      open={open}
      title={
        <div style={{ fontSize: '18px', fontWeight: 600, color: '#333' }}>
          {initialValues ? 'Edit Staff Member' : 'Add New Staff Member'}
        </div>
      }
      onCancel={onCancel}
      width={520}
      centered
      destroyOnClose={true}
      closeIcon={
        <div style={{
          width: '32px',
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid #d9d9d9',
          borderRadius: '6px',
          color: '#8c8c8c'
        }}>
          <CloseOutlined style={{ fontSize: '14px' }} />
        </div>
      }
      footer={
        <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
          <Button 
            type="primary" 
            onClick={handleSubmit} 
            loading={uploading}
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
        name="staff_v2_form"
        requiredMark={(label, info) => (
          <span>
            {info.required && <span style={{ color: '#ff4d4f', marginRight: '4px' }}>*</span>}
            {label}
          </span>
        )}
      >
        <div style={{ display: 'flex', gap: '24px' }}>
          <div style={{ flex: 1 }}>
            <Form.Item
              name="firstName"
              label={<span style={{ fontWeight: 400, color: '#595959', fontSize: '14px' }}>First Name</span>}
              rules={[{ required: true, message: 'Please input the name!' }]}
              style={{ marginBottom: '16px' }}
            >
              <Input placeholder="First Name" style={{ height: '40px', borderRadius: '4px' }} />
            </Form.Item>
            
            <Form.Item
              name="lastName"
              label={<span style={{ fontWeight: 400, color: '#595959', fontSize: '14px' }}>Last Name</span>}
              rules={[{ required: true, message: 'Please input the last name!' }]}
              style={{ marginBottom: 0 }}
            >
              <Input placeholder="Last Name" style={{ height: '40px', borderRadius: '4px' }} />
            </Form.Item>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: '8px', fontWeight: 400, color: '#595959', fontSize: '14px' }}>Photo (Optional)</div>
            <div style={{ flex: 1, display: 'flex' }}>
              <div style={{ 
                border: '1px dashed #1677ff', 
                borderRadius: '6px',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                background: '#fff'
              }}>
                <Upload {...uploadProps} style={{ width: '100%', height: '100%' }}>
                  {fileList.length < 1 && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#1677ff', gap: '4px', padding: '24px' }}>
                      <PlusOutlined style={{ fontSize: '24px' }} />
                      <span style={{ fontWeight: 500, fontSize: '14px' }}>Add Photo</span>
                    </div>
                  )}
                </Upload>
              </div>
            </div>
          </div>
        </div>
      </Form>
    </Modal>
  );
};
