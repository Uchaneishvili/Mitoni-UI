import React, { useEffect, useMemo } from 'react';
import { Modal, Form, Select, DatePicker, TimePicker, Button, Popconfirm, Spin, message, Space, Avatar, Input } from 'antd';
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
          serviceIds: initialValues.services?.map(s => s.serviceId) || (initialValues.serviceId ? [initialValues.serviceId] : []),
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
      if (staff && values.serviceIds?.length) {
        const providesAllServices = Array.isArray(staff.services) 
          ? values.serviceIds.every(sid => staff.services.some(s => s.serviceId === sid))
          : true;
        
        if (staff.isActive === false || !providesAllServices) {
          form.setFields([
            {
              name: 'serviceIds',
              errors: ['Selected staff member does not provide all selected services or is inactive'],
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
        serviceIds: values.serviceIds, 
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

  const selectedServiceIds = Form.useWatch('serviceIds', form) || [];
  const selectedStaffId = Form.useWatch('staffId', form);

  const totalCost = useMemo(() => {
    if (!servicesList.length || !selectedServiceIds.length) return 0;
    return selectedServiceIds.reduce((sum, id) => {
      const srv = servicesList.find(s => s.id === id);
      return sum + (srv ? Number(srv.price) : 0);
    }, 0);
  }, [selectedServiceIds, servicesList]);

  const totalDuration = useMemo(() => {
    if (!servicesList.length || !selectedServiceIds.length) return 0;
    return selectedServiceIds.reduce((sum, id) => {
      const srv = servicesList.find(s => s.id === id);
      const minutes = srv ? (Number(srv.durationTime) || Number(srv.durationMinutes) || Number(srv.duration) || 0) : 0;
      return sum + minutes;
    }, 0);
  }, [selectedServiceIds, servicesList]);

  useEffect(() => {
    if (totalDuration > 0) {
      form.setFieldValue('duration', String(totalDuration));
    }
  }, [totalDuration, form]);

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
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
            <span style={{ fontWeight: 600, fontSize: '15px', color: '#333' }}>Total: <span style={{ color: '#1677ff' }}>${totalCost.toFixed(2)}</span></span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button 
              type="primary" 
              onClick={handleSubmit} 
              loading={isSubmitting}
              style={{ flex: 1, height: '40px', borderRadius: '4px', fontSize: '14px', fontWeight: 500, boxShadow: 'none' }}
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
        </div>
      }
      styles={{
        header: { marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #f0f0f0' },
        body: { paddingBottom: '0px' },
        content: { padding: '24px' } // Adjusted padding for cleaner look
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
          label={<span style={{ fontWeight: 600, color: '#8c8c8c', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Name</span>}
          rules={[{ required: true, message: 'Select specialist' }]}
        >
          <Select 
            placeholder="Select specialist" 
            style={{ height: '42px' }}
            loading={isStaffLoading}
            optionLabelProp="label"
          >
            {staffList.map(staff => (
              <Option 
                key={staff.id} 
                value={staff.id} 
                label={
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Avatar size={24} src={staff.avatarUrl}>{staff.firstName.charAt(0)}</Avatar>
                    <span>{`${staff.firstName} ${staff.lastName}`}</span>
                  </div>
                }
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Avatar size={24} src={staff.avatarUrl}>{staff.firstName.charAt(0)}</Avatar>
                  {`${staff.firstName} ${staff.lastName}`}
                </div>
              </Option>
            ))}
          </Select>
        </Form.Item>

        <div style={{ display: 'flex', gap: '16px' }}>
          <Form.Item
            name="date"
            label={<span style={{ fontWeight: 600, color: '#8c8c8c', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date</span>}
            style={{ flex: 1 }}
            rules={[{ required: true }]}
          >
            <DatePicker style={{ width: '100%', height: '42px' }} format="DD.MM.YY" />
          </Form.Item>

          <Form.Item
            name="time"
            label={<span style={{ fontWeight: 600, color: '#8c8c8c', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Appt Time</span>}
            style={{ flex: 1 }}
            rules={[{ required: true }]}
          >
            <TimePicker style={{ width: '100%', height: '42px' }} format="HH:mm" minuteStep={15} />
          </Form.Item>

          <Form.Item
            name="duration"
            label={<span style={{ fontWeight: 600, color: '#8c8c8c', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Duration</span>}
            style={{ flex: 1 }}
            rules={[{ required: true }]}
          >
            <Input 
              readOnly 
              style={{ height: '42px', backgroundColor: '#fcfcfc', color: '#595959', border: '1px solid #e8e8e8' }} 
              suffix={<span style={{ color: '#bfbfbf', fontSize: '12px', fontWeight: 500 }}>MIN</span>}
            />
          </Form.Item>
        </div>

        <Form.Item
          name="serviceIds"
          style={{ marginBottom: '16px' }}
          rules={[{ required: true, message: 'Please select at least one service' }]}
        >
          <Select
            mode="multiple"
            placeholder="Search and select services"
            style={{ width: '100%', minHeight: '42px' }}
            loading={isServicesLoading}
            optionLabelProp="label"
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            // tagRender={() => null}
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

        <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', borderRadius: '4px', overflow: 'hidden' }}>
          {selectedServiceIds.map((id, index) => {
            const srv = servicesList.find(s => s.id === id);
            if (!srv) return null;
            const bgHex = `${srv.color || '#1677ff'}20`; // Light background
            const isLast = index === selectedServiceIds.length - 1;
            
            return (
              <div key={srv.id} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                background: bgHex, 
                alignItems: 'stretch', 
                borderBottom: isLast ? 'none' : '2px solid #ffffff', // Thicker white separator
                height: '40px'
              }}>
                <div style={{ display: 'flex', flex: 1, padding: '0 16px', alignItems: 'center' }}>
                    <span style={{ color: srv.color || '#1677ff', fontWeight: 600, fontSize: '12px' }}>{srv.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ color: '#333', fontWeight: 600, fontSize: '13px', marginRight: '16px' }}>${Number(srv.price).toFixed(2)}</span>
                  <div 
                    style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '40px',
                      cursor: 'pointer',
                      height: '100%',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    onClick={() => {
                        const newIds = selectedServiceIds.filter(sid => sid !== srv.id);
                        form.setFieldsValue({ serviceIds: newIds });
                    }} 
                  >
                    <CloseOutlined style={{ color: '#333', fontSize: '12px', fontWeight: 'bold' }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {initialValues?.id && (
          <div style={{ marginTop: '0px' }}>
            <Popconfirm title="Delete this reservation?" onConfirm={() => onDelete(initialValues.id)}>
              <Button danger type="text" icon={<DeleteOutlined />} loading={isDeleting} style={{ padding: 0 }}>Delete Reservation</Button>
            </Popconfirm>
          </div>
        )}

      </Form>
    </Modal>
  );
};
