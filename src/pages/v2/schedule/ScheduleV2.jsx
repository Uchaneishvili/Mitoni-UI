import React, { useState, useMemo } from 'react';
import { Button, Space, Typography, Avatar } from 'antd';
import { Calendar, dayjsLocalizer } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import './schedule.css';
import dayjs from 'dayjs';
import updateLocale from 'dayjs/plugin/updateLocale';
import { LeftOutlined, RightOutlined, CalendarOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { message } from 'antd';
import { staffService } from '../../../services/staffService';
import { reservationService } from '../../../services/reservationService';
import { useCreateReservation, useUpdateReservation, useDeleteReservation } from '../../../hooks/queries/useReservations';
import { ReservationModalV2 } from './ReservationModalV2';

dayjs.extend(updateLocale);
dayjs.updateLocale('en', {
  weekStart: 1,
});
const localizer = dayjsLocalizer(dayjs);
const DnDCalendar = withDragAndDrop(Calendar);

const ScheduleV2 = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const { data: staffData, isLoading: isLoadingStaff } = useQuery({
    queryKey: ['staff', 'schedule_v2'],
    queryFn: () => staffService.getAll({ limit: 100 }),
  });

  const { data: resData, isLoading: isLoadingRes } = useQuery({
    queryKey: ['reservations', 'schedule_v2'], 
    queryFn: () => reservationService.getAll({ limit: 1000 }), 
  });

  const resources = useMemo(() => {
    const rawStaff = staffData?.data || [];
    return rawStaff.map(staff => ({
      id: staff.id,
      title: `${staff.firstName} ${staff.lastName}`,
      avatarUrl: staff.avatarUrl,
    }));
  }, [staffData]);

  const events = useMemo(() => {
    const rawRes = resData?.data || [];
    return rawRes.map(res => {
      const start = new Date(res.startTime);
      const end = res.endTime ? new Date(res.endTime) : dayjs(start).add(1, 'hour').toDate();
      
      return {
        id: res.id,
        title: res.customerName,
        start,
        end,
        resourceId: res.staffId,
        resource: res,
      };
    });
  }, [resData]);

  const { mutate: createReservation, isPending: isCreating } = useCreateReservation();
  const { mutate: updateReservation, isPending: isUpdating } = useUpdateReservation();
  const { mutate: deleteReservation, isPending: isDeleting } = useDeleteReservation();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const handleNavigate = (action) => {
    let newDate = dayjs(currentDate);
    if (action === 'PREV') newDate = newDate.subtract(1, 'day');
    else if (action === 'NEXT') newDate = newDate.add(1, 'day');
    else newDate = dayjs();
    setCurrentDate(newDate.toDate());
  };

  const handleSelectSlot = ({ start, end, resourceId }) => {
    const isPast = dayjs(start).isBefore(dayjs().startOf('minute'));
    if (isPast) {
      message.warning('Cannot create reservations in the past');
      return;
    }

    setSelectedEvent({
      staffId: resourceId,
      startTime: dayjs(start).toISOString(),
      endTime: dayjs(end).toISOString() 
    });
    setModalOpen(true);
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event.resource); 
    setModalOpen(true);
  };

  const handleModalSubmit = (values, ops) => {
    if (selectedEvent?.id) {
       updateReservation({ id: selectedEvent.id, values }, {
         onSuccess: () => { setModalOpen(false); setSelectedEvent(null); },
         onError: ops.onError
       });
    } else {
       createReservation(values, {
         onSuccess: () => { setModalOpen(false); setSelectedEvent(null); },
         onError: ops.onError
       });
    }
  };

  const handleDelete = (id) => {
    deleteReservation(id, {
      onSuccess: () => { setModalOpen(false); setSelectedEvent(null); }
    });
  };

  const handleEventDrop = ({ event, start, end, resourceId }) => {
    const isOverlapping = events.some(existingEvent => {
      if (existingEvent.id === event.id) return false; 
      if (existingEvent.resourceId !== resourceId) return false; 
      
      return (start < existingEvent.end) && (end > existingEvent.start);
    });

    if (isOverlapping) {
      message.error('Time slot is unavailable for this specialist. Dropping back.');
      return;
    }

    const payload = {
      staffId: resourceId,
      startTime: dayjs(start).toISOString(),
      endTime: dayjs(end).toISOString(),
    };

    updateReservation({ id: event.id, values: payload });
  };

  const eventStyleGetter = (event) => {
    const bgColor = event.resource?.service?.color || '#1677ff';
    
    return {
      style: {
        backgroundColor: `${bgColor}20`, 
        borderLeft: `4px solid ${bgColor}`,
        borderTop: 'none',
        borderRight: 'none',
        borderBottom: 'none',
        borderRadius: '4px',
        color: '#333',
        display: 'block',
      }
    };
  };

  const CustomEvent = ({ event }) => {
    const mainService = event.resource?.service?.name || 'Service';
    const startTimeFormatted = dayjs(event.start).format('HH:mm');
    const endTimeFormatted = dayjs(event.end).format('HH:mm');
    const staffName = event.resource?.staff ? `${event.resource.staff.firstName} ${event.resource.staff.lastName?.charAt(0)}.` : 'Staff';
    
    const color = event.resource?.service?.color || '#1677ff';

    return (
      <div style={{ padding: '4px', height: '100%', display: 'flex', flexDirection: 'column', fontSize: '12px' }}>
        <div style={{ fontWeight: 600, color: color, marginBottom: '4px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
          {mainService}
        </div>

        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#8c8c8c', fontSize: '11px' }}>
          <span>{startTimeFormatted} - {endTimeFormatted}</span>
          <span style={{ 
            background: `${color}15`, 
            color: color, 
            padding: '2px 6px', 
            borderRadius: '4px', 
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <Avatar size={12} src={event.resource?.staff?.avatarUrl} style={{ background: color }} />
            {staffName}
          </span>
        </div>
      </div>
    );
  };

  const CustomResourceHeader = ({ resource }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', justifyContent: 'center' }}>
      <Avatar src={resource.avatarUrl} size={32} style={{ backgroundColor: '#f0f0f0', border: '1px solid #d9d9d9' }}>
        <span style={{ color: '#595959', fontSize: '14px' }}>{resource.title.charAt(0)}</span>
      </Avatar>
      <span style={{ fontWeight: 500, fontSize: '14px', color: '#333' }}>{resource.title}</span>
    </div>
  );

  return (
    <div style={{ height: 'calc(100vh - 56px)', display: 'flex', flexDirection: 'column', background: '#f5f5f5', padding: '24px 32px' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '16px' }}>
        <Space size="small">
          <Button 
            type="text" 
            icon={<LeftOutlined style={{ fontSize: '14px', color: '#8c8c8c' }} />} 
            onClick={() => handleNavigate('PREV')} 
          />
          <Button 
            type="text" 
            icon={<CalendarOutlined style={{ color: '#1677ff' }} />} 
            onClick={() => handleNavigate('TODAY')}
            style={{ fontWeight: 600, color: '#333', fontSize: '15px' }}
          >
            {dayjs(currentDate).format('MMMM D, YYYY')}
          </Button>
          <Button 
            type="text" 
            icon={<RightOutlined style={{ fontSize: '14px', color: '#8c8c8c' }}/>} 
            onClick={() => handleNavigate('NEXT')} 
          />
        </Space>
      </div>

      <div style={{ flex: 1, background: '#fff', padding: '0px', borderRadius: '12px', border: '1px solid #EBEBEB', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
        <div style={{ height: '100%', position: 'relative' }}>
          {(isLoadingStaff || isLoadingRes) && (
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255,255,255,0.7)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               Loading...
            </div>
          )}
          <DnDCalendar
            localizer={localizer}
            events={events} 
            resources={resources}
            resourceIdAccessor="id"
            resourceTitleAccessor="title"
            date={currentDate}
            onNavigate={(date) => setCurrentDate(date)}
            defaultView="day"
            views={['day']}
            step={30}
            timeslots={2}
            selectable
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            resizable={false} 
            toolbar={false} 
            min={new Date(0, 0, 0, 8, 0, 0)} 
            max={new Date(0, 0, 0, 22, 0, 0)} 
            style={{ height: '100%' }}
            eventPropGetter={eventStyleGetter}
            onEventDrop={handleEventDrop}
            components={{
              event: CustomEvent,
              resourceHeader: CustomResourceHeader,
            }}
          />
        </div>
      </div>
      
      <ReservationModalV2 
        open={modalOpen}
        initialValues={selectedEvent}
        onCancel={() => { setModalOpen(false); setSelectedEvent(null); }}
        onSubmit={handleModalSubmit}
        onDelete={handleDelete}
        isSubmitting={isCreating || isUpdating}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default ScheduleV2;
