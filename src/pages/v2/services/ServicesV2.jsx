import React, { useState, useEffect } from 'react';
import { Input, Button, Space, Popconfirm, Spin, Table } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, DragOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { DndContext, PointerSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core';
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers';
import { SortableContext, arrayMove, horizontalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { servicesService } from '../../../services/servicesService';
import { SERVICES_QUERY_KEY, useDeleteService, useCreateService, useUpdateService } from '../../../hooks/queries/useServices';
import { ServiceModalV2 } from './ServiceModalV2';
import { AddColumnModalV2 } from './AddColumnModalV2';

const DraggableHeaderCell = (props) => {
  const { id, className, children, ...restProps } = props;
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: id,
  });

  const style = {
    ...restProps.style,
    transform: CSS.Translate.toString(transform),
    transition,
    cursor: 'move',
    ...(isDragging ? { position: 'relative', zIndex: 9999, userSelect: 'none', background: '#fafafa' } : {}),
  };

  if (!id || id === 'actions') {
    return <th {...restProps} className={className}>{children}</th>;
  }

  return (
    <th {...restProps} ref={setNodeRef} style={style} className={className} {...attributes} {...listeners}>
      {children}
    </th>
  );
};

const BASE_COLUMNS = [
  {
    key: 'service',
    dataIndex: 'name',
    title: <span style={{ color: '#8c8c8c', fontWeight: 500 }}><DragOutlined style={{ marginRight: 6 }}/>Service</span>,
    render: (text, record) => (
      <Space size={12}>
        <div style={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: record.color || '#1677ff' }} />
        <span style={{ fontWeight: 500, color: '#333' }}>{text}</span>
      </Space>
    ),
  },
  {
    key: 'price',
    dataIndex: 'price',
    title: <span style={{ color: '#8c8c8c', fontWeight: 500 }}><DragOutlined style={{ marginRight: 6 }}/>Price</span>,
    render: (val) => <span style={{ color: '#1677ff', fontWeight: 500 }}>${Number(val).toFixed(2)}</span>,
  }
];

const ServicesV2 = () => {
  const [searchText, setSearchText] = useState('');
  
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [addColumnModalOpen, setAddColumnModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);

  const [customColumns, setCustomColumns] = useState([]);
  const [columnOrder, setColumnOrder] = useState(['service', 'price', 'actions']);
  const { data: result, isLoading } = useQuery({
    queryKey: [SERVICES_QUERY_KEY, { search: searchText, page: 1, limit: 100 }],
    queryFn: () => servicesService.getAll({ search: searchText, page: 1, limit: 100 }),
  });

  const { mutate: deleteService, isPending: isDeleting } = useDeleteService();
  const { mutate: createService } = useCreateService();
  const { mutate: updateService } = useUpdateService();

  const servicesList = result?.data || [];

  useEffect(() => {
    const savedCustomCols = localStorage.getItem('mitoni_v2_custom_columns');
    const savedOrder = localStorage.getItem('mitoni_v2_column_order');
    
    if (savedCustomCols) {
      try {
        setCustomColumns(JSON.parse(savedCustomCols));
      } catch (e) {}
    }
    
    if (savedOrder) {
      try {
        setColumnOrder(JSON.parse(savedOrder));
      } catch (e) {}
    }
  }, []);

  const handleAddCustomColumn = (values) => {
    const { name, dataIndex } = values;
    
    const key = dataIndex;
    const newCol = { key, title: name };
    
    if (customColumns.find(c => c.key === key)) {
      return;
    }

    const newCustomCols = [...customColumns, newCol];
    setCustomColumns(newCustomCols);
    localStorage.setItem('mitoni_v2_custom_columns', JSON.stringify(newCustomCols));
    
    const newOrder = [...columnOrder];
    const actionsIdx = newOrder.indexOf('actions');
    if (actionsIdx !== -1) {
      newOrder.splice(actionsIdx, 0, key);
    } else {
      newOrder.push(key);
    }
    setColumnOrder(newOrder);
    localStorage.setItem('mitoni_v2_column_order', JSON.stringify(newOrder));
  };

  const handleDelete = (id) => {
    deleteService(id);
  };

  const handleCreateOrUpdate = (values, { onError }) => {
    if (editingService) {
      updateService({ id: editingService.id, values }, {
        onSuccess: () => {
          setServiceModalOpen(false);
          setEditingService(null);
        },
        onError
      });
    } else {
      createService(values, {
        onSuccess: () => {
          setServiceModalOpen(false);
          setEditingService(null);
        },
        onError
      });
    }
  };

  const openEditModal = (service) => {
    setEditingService(service);
    setServiceModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingService(null);
    setServiceModalOpen(true);
  };

  const columnsMap = {};
  
  BASE_COLUMNS.forEach(col => {
    columnsMap[col.key] = {
      ...col,
      onHeaderCell: () => ({ id: col.key })
    };
  });

  customColumns.forEach(col => {
    columnsMap[col.key] = {
      key: col.key,
      dataIndex: col.key,
      title: <span style={{ color: '#8c8c8c', fontWeight: 500 }}><DragOutlined style={{ marginRight: 6 }}/>{col.title}</span>,
      onHeaderCell: () => ({ id: col.key }),
      render: (val) => <span style={{ color: '#595959' }}>{val || '-'}</span>
    };
  });

  columnsMap['actions'] = {
    key: 'actions',
    title: (
       <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
         <Button 
           size="small"
           icon={<PlusOutlined />} 
           onClick={() => setAddColumnModalOpen(true)}
           style={{ color: '#1677ff', borderColor: '#1677ff', borderRadius: '4px' }}
         />
       </div>
    ),
    width: 100,
    align: 'right',
    onHeaderCell: () => ({ id: 'actions' }),
    render: (_, record) => (
      <Space size={16}>
        <Button 
          type="text" 
          icon={<EditOutlined />} 
          style={{ padding: '0px', color: '#8c8c8c' }}
          onClick={() => openEditModal(record)}
        />
        <Popconfirm
          title="Delete service"
          description="Are you sure to delete this service?"
          onConfirm={() => handleDelete(record.id)}
          okText="Yes"
          cancelText="No"
          placement="left"
        >
          <Button 
            type="text" 
            danger 
            icon={<DeleteOutlined />} 
            loading={isDeleting}
            style={{ padding: '0px', color: '#ff4d4f' }}
          />
        </Popconfirm>
      </Space>
    )
  };

  let finalColumns = columnOrder.map(key => columnsMap[key]).filter(Boolean);
  
  if (!columnOrder.includes('actions')) {
    finalColumns.push(columnsMap['actions']);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 1,
      },
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id && over?.id !== 'actions') {
      const activeIndex = columnOrder.indexOf(active.id);
      const overIndex = columnOrder.indexOf(over.id);
      
      const newOrder = arrayMove(columnOrder, activeIndex, overIndex);
      setColumnOrder(newOrder);
      localStorage.setItem('mitoni_v2_column_order', JSON.stringify(newOrder));
    }
  };

  return (
    <div style={{ maxWidth: 860, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600, color: '#333' }}>Services</h2>
        <Button 
          icon={<PlusOutlined />} 
          style={{ 
            color: '#1677ff', 
            borderColor: '#1677ff', 
            borderRadius: '6px', 
            fontWeight: 500,
            padding: '4px 16px',
            backgroundColor: '#fff'
          }}
          onClick={openCreateModal}
        >
          Add New
        </Button>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <Input 
          placeholder="Search" 
          prefix={<SearchOutlined style={{ color: '#bfbfbf', fontSize: '16px' }} />} 
          style={{ 
            width: '100%', 
            borderRadius: '6px',
            padding: '8px 12px',
            border: '1px solid #EBEBEB',
            boxShadow: '0 1px 2px rgba(0,0,0,0.01)'
          }}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      <div style={{ 
        background: '#fff', 
        borderRadius: '8px', 
        border: '1px solid #EBEBEB',
        boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
        overflow: 'hidden'
      }}>
        <DndContext
          sensors={sensors}
          modifiers={[restrictToHorizontalAxis]}
          onDragEnd={handleDragEnd}
          collisionDetection={closestCenter}
        >
          <SortableContext items={columnOrder.filter(k => k !== 'actions')} strategy={horizontalListSortingStrategy}>
            <Table
              components={{
                header: {
                  cell: DraggableHeaderCell,
                },
              }}
              columns={finalColumns}
              dataSource={servicesList}
              rowKey="id"
              pagination={false}
              loading={isLoading}
              size="middle"
            />
          </SortableContext>
        </DndContext>
      </div>

      <ServiceModalV2
        open={serviceModalOpen}
        onCancel={() => setServiceModalOpen(false)}
        onSubmit={handleCreateOrUpdate}
        initialValues={editingService}
        customColumns={customColumns.map(c => ({ title: c.title, dataIndex: c.key }))}
      />

      <AddColumnModalV2
        open={addColumnModalOpen}
        onCancel={() => setAddColumnModalOpen(false)}
        onAdd={handleAddCustomColumn}
      />
    </div>
  );
};

export default ServicesV2;
