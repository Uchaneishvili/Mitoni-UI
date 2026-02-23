import React, { useMemo, useState } from 'react';
import { Calendar, dayjsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useQuery } from '@tanstack/react-query';
import { Card, Spin, Space, Typography, message } from 'antd';
import dayjs from 'dayjs';
import updateLocale from 'dayjs/plugin/updateLocale';
import { reservationService } from '../../services/reservationService';
import { staffService } from '../../services/staffService';
import { AsyncSelect } from '../../components/common/AsyncSelect';

dayjs.extend(updateLocale);
dayjs.updateLocale('en', {
  weekStart: 1,
});

const localizer = dayjsLocalizer(dayjs);
const { Text } = Typography;

const statusColors = {
  PENDING: '#faad14', 
  CONFIRMED: '#1677ff', 
  COMPLETED: '#52c41a',
  CANCELLED: '#ff4d4f', 
};

const ReservationCalendar = ({ onEventClick, onDateSelect }) => {
  const [selectedStaffId, setSelectedStaffId] = useState(null);

  const { data: resData, isLoading: isLoadingRes } = useQuery({
    queryKey: ['reservations', 'calendar-view', selectedStaffId],
    queryFn: () => reservationService.getAll({ 
      limit: 1000,
      staffId: selectedStaffId || undefined 
    }),
  });

  const { data: staffData, isLoading: isLoadingStaff } = useQuery({
    queryKey: ['staff', 'all-for-calendar'],
    queryFn: () => staffService.getAll({ limit: 100 }),
  });

  const reservations = resData?.data || [];
  const staffList = staffData?.data || [];

  const events = useMemo(() => {
    return reservations.map((res) => {
      const end = res.endTime ? res.endTime : dayjs(res.startTime).add(1, 'hour').toISOString();
      return {
        id: res.id,
        title: `${res.customerName} - ${res.service?.name || 'Service'}`,
        start: new Date(res.startTime),
        end: new Date(end),
        resourceId: res.staffId, 
        data: res, 
      };
    });
  }, [reservations]);

  const resourceMap = useMemo(() => {
    let mapped = staffList;
    if (selectedStaffId) {
      mapped = mapped.filter(s => s.id === selectedStaffId);
    }
    return mapped.map(s => ({
      resourceId: s.id,
      resourceTitle: `${s.firstName} ${s.lastName}`
    }));
  }, [staffList, selectedStaffId]);

  const handleSelectEvent = (event) => {
    if (onEventClick) {
      onEventClick(event.data);
    }
  };

  const handleSelectSlot = ({ start, end, resourceId }) => {
    const selectedDay = dayjs(start);

    if (selectedDay < dayjs().startOf('day')) {
      message.warning('Reservations cannot be made in the past.');
      return;
    }

    if (onDateSelect) {
      onDateSelect({
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        staffId: resourceId || selectedStaffId 
      });
    }
  };

  const eventStyleGetter = (event) => {
    const status = event.data.status;
    const bgColor = statusColors[status] || '#1677ff';
    return {
      style: {
        backgroundColor: bgColor,
        borderColor: bgColor,
        borderRadius: '5px',
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  const isLoading = isLoadingRes || isLoadingStaff;

  const CustomEvent = ({ event }) => (
    <div style={{
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap', 
      fontSize: '11px',
      padding: '2px', 
    }}>
      {event.title}
    </div>
  );

  return (
    <Card bordered={false}>
      <div style={{ marginBottom: 16 }}>
        <Space align="center" size="middle">
          <Text strong>Filter by Staff:</Text>
          <AsyncSelect 
            style={{ width: 250 }}
            placeholder="All Specialists"
            allowClear
            value={selectedStaffId}
            onChange={setSelectedStaffId}
            fetchData={staffService.getAll}
            queryKeyPrefix={'reservation'}
            renderOption={(s) => `${s.firstName} ${s.lastName}`}
          />
        </Space>
      </div>

      <div style={{ position: 'relative', height: '600px' }}>
        {isLoading && (
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10 }}>
            <Spin size="large" />
          </div>
        )}
        <div style={{ height: '100%', opacity: isLoading ? 0.5 : 1, transition: 'opacity 0.3s' }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            resources={resourceMap}
            resourceIdAccessor="resourceId"
            resourceTitleAccessor="resourceTitle"
            step={30}
            timeslots={2}
            defaultView="day"
            views={['day', 'week', 'month']}
            min={new Date(0, 0, 0, 10, 0, 0)} 
            max={new Date(0, 0, 0, 20, 0, 0)} 
            selectable
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            eventPropGetter={eventStyleGetter}
            components={{
              event: CustomEvent
            }}
            style={{ width: '100%' }}
          />
        </div>
      </div>
    </Card>
  );
};

export default ReservationCalendar;
