import React, { useEffect, useMemo } from 'react';
import { Modal, Form, Select, DatePicker, TimePicker, Button, Popconfirm, Spin, message, Space, Avatar } from 'antd';
import { CloseOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useQuery } from '@tanstack/react-query';
import { staffService } from '../../../services/staffService';
import { servicesService } from '../../../services/servicesService';
import { handleBackendError } from '../../../utils/errorHandler';

const { Option } = Select;

export const ReservationModalV2 = ({ 
  open, 
  onCancel, 
  onSubmit, 
  onDelete,
  initialValues, 
  isDeleting, 
  isSubmitting 
}) => {
  const [form] = Form.useForm();

  const { data: staffData, isLoading: isStaffLoading } = useQuery({
    queryKey: ['staff', 'reservation_modal'],
    queryFn: () => staffService.getAll({ limit: 100 }),
  });

  const { data: servicesData, isLoading: isServicesLoading } = useQuery({
    queryKey: ['services', 'reservation_modal'],
    queryFn: () => servicesService.getAll({ limit: 100 }),
  });

  const staffList = staffData?.data || [];
  const servicesList = servicesData?.data || [];

  useEffect(() => {
    if (open) {
      if (initialValues) {
        let startDayjs = dayjs(initialValues.startTime);
        
        let duration = 60; 
        if (initialValues.startTime && initialValues.endTime) {
           duration = dayjs(initialValues.endTime).diff(startDayjs, 'minute');
        }

        form.setFieldsValue({
          staffId: initialValues.staffId,
          date: startDayjs,
          time: startDayjs,
          duration: String(duration), 
          serviceId: initialValues.serviceId || initialValues.service?.id || null,
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, initialValues, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      const staff = staffList.find(s => s.id === values.staffId);
      if (staff) {
        const providesService = Array.isArray(staff.services) 
          ? staff.services.some(s => s.serviceId === values.serviceId) 
          : true;
        
        if (staff.isActive === false || !providesService) {
          form.setFields([
            {
              name: 'serviceId',
              errors: ['Selected staff member does not provide this service or is inactive'],
            },
          ]);
          return; 
        }
      }

      const dateStr = values.date.format('YYYY-MM-DD');
      const timeStr = values.time.format('HH:mm:ss');
      const startTimeIso = dayjs(`${dateStr}T${timeStr}`).toISOString();
      const endTimeIso = dayjs(startTimeIso).add(Number(values.duration), 'minute').toISOString();

      const finalPayload = {
        staffId: values.staffId,
        serviceId: values.serviceId, 
        startTime: startTimeIso,
        endTime: endTimeIso,
        customerName: initialValues?.customerName || "Walk-in Client" 
      };

      onSubmit(finalPayload, {
        onError: (error) => handleBackendError(error, form),
      });
    } catch (info) {
      console.log('Validation failed:', info);
    }
  };

  const selectedServiceId = Form.useWatch('serviceId', form);
  const selectedStaffId = Form.useWatch('staffId', form);

  const totalCost = useMemo(() => {
    if (!servicesList.length || !selectedServiceId) return 0;
    const srv = servicesList.find(s => s.id === selectedServiceId);
    return srv ? Number(srv.price) : 0;
  }, [selectedServiceId, servicesList]);

  return (
    <Modal
      open={open}
      title={
        <div style={{ fontSize: '16px', fontWeight: 600, color: '#333' }}>
          {initialValues?.id ? 'Edit Reservation' : 'New Reservation'}
        </div>
      }
      onCancel={onCancel}
      width={480}
      centered
      destroyOnClose={true}
      closeIcon={
        <CloseOutlined style={{ color: '#8c8c8c', fontSize: '14px' }} />
      }
      footer={
        <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
          <Button 
            type="primary" 
            onClick={handleSubmit} 
            loading={isSubmitting}
            style={{ flex: 1, height: '44px', borderRadius: '8px', fontSize: '15px', fontWeight: 600, boxShadow: 'none' }}
          >
            Save
          </Button>
          <Button 
            onClick={onCancel}
            style={{ flex: 1, height: '44px', borderRadius: '8px', color: '#1677ff', borderColor: '#e6f4ff', background: '#e6f4ff', fontSize: '15px', fontWeight: 600 }}
          >
            Cancel
          </Button>
        </div>
      }
      styles={{
        header: { marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #f0f0f0' },
        body: { paddingBottom: '0px' }
      }}
    >
      <Form
        form={form}
        layout="vertical"
        name="reservation_v2_form"
        requiredMark={false}
      >
        <Form.Item
          name="staffId"
          label={<span style={{ fontWeight: 500, color: '#8c8c8c', fontSize: '12px', textTransform: 'uppercase' }}>Name</span>}
          rules={[{ required: true, message: 'Select specialist' }]}
        >
          <Select 
            placeholder="Select specialist" 
            style={{ height: '42px' }}
            loading={isStaffLoading}
            optionLabelProp="label"
          >
            {staffList.map(staff => (
              <Option key={staff.id} value={staff.id} label={`${staff.firstName} ${staff.lastName}`}>
                <Space>
                  <Avatar size={24} src={staff.avatarUrl}>{staff.firstName.charAt(0)}</Avatar>
                  {`${staff.firstName} ${staff.lastName}`}
                </Space>
              </Option>
            ))}
          </Select>
        </Form.Item>

        <div style={{ display: 'flex', gap: '16px' }}>
          <Form.Item
            name="date"
            label={<span style={{ fontWeight: 500, color: '#8c8c8c', fontSize: '12px', textTransform: 'uppercase' }}>Date</span>}
            style={{ flex: 1 }}
            rules={[{ required: true }]}
          >
            <DatePicker style={{ width: '100%', height: '42px' }} format="DD.MM.YY" />
          </Form.Item>

          <Form.Item
            name="time"
            label={<span style={{ fontWeight: 500, color: '#8c8c8c', fontSize: '12px', textTransform: 'uppercase' }}>Appt Time</span>}
            style={{ flex: 1 }}
            rules={[{ required: true }]}
          >
            <TimePicker style={{ width: '100%', height: '42px' }} format="HH:mm" minuteStep={15} />
          </Form.Item>

          <Form.Item
            name="duration"
            label={<span style={{ fontWeight: 500, color: '#8c8c8c', fontSize: '12px', textTransform: 'uppercase' }}>Duration</span>}
            style={{ flex: 1 }}
            rules={[{ required: true }]}
          >
            <Select style={{ height: '42px' }}>
              <Option value="15">15</Option>
              <Option value="30">30</Option>
              <Option value="45">45</Option>
              <Option value="60">60</Option>
              <Option value="90">90</Option>
              <Option value="120">120</Option>
            </Select>
          </Form.Item>
        </div>

        <Form.Item
          name="serviceId"
          style={{ marginBottom: '16px' }}
          rules={[{ required: true, message: 'Please select a service' }]}
        >
          <Select
            placeholder="Search service"
            style={{ width: '100%', height: '42px' }}
            loading={isServicesLoading}
            optionLabelProp="label"
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
          >
            {servicesList.map(srv => (
              <Option key={srv.id} value={srv.id} label={srv.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>
                    <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', backgroundColor: srv.color || '#1677ff', marginRight: 8 }}></span>
                    {srv.name}
                  </span>
                  <span style={{ color: '#8c8c8c' }}>${Number(srv.price).toFixed(2)}</span>
                </div>
              </Option>
            ))}
          </Select>
        </Form.Item>

        <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {selectedServiceId && (() => {
            const srv = servicesList.find(s => s.id === selectedServiceId);
            if (!srv) return null;
            const bgHex = `${srv.color || '#1677ff'}15`; 
            return (
              <div key={srv.id} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                padding: '12px 16px', 
                background: bgHex, 
                borderRadius: '6px',
                alignItems: 'center'
              }}>
                <span style={{ color: srv.color || '#1677ff', fontWeight: 500, fontSize: '13px' }}>{srv.name}</span>
                <Space size="middle">
                  <span style={{ color: srv.color || '#1677ff', fontWeight: 600, fontSize: '13px' }}>${Number(srv.price).toFixed(2)}</span>
                  <CloseOutlined 
                    style={{ color: '#8c8c8c', cursor: 'pointer', fontSize: '12px' }} 
                    onClick={() => {
                        form.setFieldsValue({ serviceId: null });
                    }} 
                  />
                </Space>
              </div>
            );
          })()}
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: '16px', marginBottom: '8px', borderTop: '1px solid #f0f0f0', paddingTop: '16px' }}>
          <span style={{ fontWeight: 600, fontSize: '16px', color: '#333' }}>Total: <span style={{ color: '#1677ff' }}>${totalCost.toFixed(2)}</span></span>
        </div>

        {initialValues?.id && (
          <div style={{ marginTop: '16px' }}>
            <Popconfirm title="Delete this reservation?" onConfirm={() => onDelete(initialValues.id)}>
              <Button danger type="text" icon={<DeleteOutlined />} loading={isDeleting}>Delete Reservation</Button>
            </Popconfirm>
          </div>
        )}

      </Form>
    </Modal>
  );
};
