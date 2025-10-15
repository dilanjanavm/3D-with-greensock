import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Typography,
  Popconfirm,
  message,
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ExperimentOutlined,
} from '@ant-design/icons';
import { ingredientsStore } from '../data/store';

const { Title } = Typography;
const { Option } = Select;

const IngredientsManagement = () => {
  const [ingredients, setIngredients] = useState([]);
  const [filteredIngredients, setFilteredIngredients] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadIngredients();
  }, []);

  useEffect(() => {
    filterIngredients();
  }, [ingredients, searchText, statusFilter]);

  const loadIngredients = () => {
    const data = ingredientsStore.getAll();
    setIngredients(data);
  };

  const filterIngredients = () => {
    let filtered = ingredients;

    if (searchText) {
      filtered = filtered.filter(
        (ingredient) =>
          ingredient.name.toLowerCase().includes(searchText.toLowerCase()) ||
          ingredient.code?.toLowerCase().includes(searchText.toLowerCase()) ||
          ingredient.supplier?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((ingredient) => ingredient.status === statusFilter);
    }

    setFilteredIngredients(filtered);
  };

  const handleAdd = () => {
    setEditingIngredient(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingIngredient(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      ingredientsStore.delete(id);
      loadIngredients();
      message.success('Ingredient deleted successfully');
    } catch (error) {
      message.error('Failed to delete ingredient');
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingIngredient) {
        ingredientsStore.update(editingIngredient.id, values);
        message.success('Ingredient updated successfully');
      } else {
        ingredientsStore.create(values);
        message.success('Ingredient created successfully');
      }
      setIsModalVisible(false);
      loadIngredients();
    } catch (error) {
      message.error('Failed to save ingredient');
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
      sorter: (a, b) => (a.code || '').localeCompare(b.code || ''),
    },
    {
      title: 'Unit',
      dataIndex: 'unit',
      key: 'unit',
    },
    {
      title: 'Supplier',
      dataIndex: 'supplier',
      key: 'supplier',
      sorter: (a, b) => (a.supplier || '').localeCompare(b.supplier || ''),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <span className={`status-${status}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      ),
      filters: [
        { text: 'Active', value: 'active' },
        { text: 'Inactive', value: 'inactive' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            style={{ color: '#10B981' }}
          />
          <Popconfirm
            title="Are you sure you want to delete this ingredient?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="text"
              icon={<DeleteOutlined />}
              style={{ color: '#EF4444' }}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const stats = {
    total: ingredients.length,
    active: ingredients.filter((i) => i.status === 'active').length,
    inactive: ingredients.filter((i) => i.status === 'inactive').length,
  };

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>Ingredients Management</Title>
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={8} md={6}>
          <Card>
            <Statistic
              title="Total Ingredients"
              value={stats.total}
              prefix={<ExperimentOutlined style={{ color: '#10B981' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8} md={6}>
          <Card>
            <Statistic
              title="Active"
              value={stats.active}
              valueStyle={{ color: '#10B981' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8} md={6}>
          <Card>
            <Statistic
              title="Inactive"
              value={stats.inactive}
              valueStyle={{ color: '#9CA3AF' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Controls */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Search ingredients..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: '100%' }}
            >
              <Option value="all">All Status</Option>
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
              style={{ width: '100%' }}
            >
              Add Ingredient
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Ingredients Table */}
      <Card>
        <Table
          dataSource={filteredIngredients}
          columns={columns}
          rowKey="id"
          pagination={{
            total: filteredIngredients.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Total ${total} ingredients`,
          }}
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={editingIngredient ? 'Edit Ingredient' : 'Add New Ingredient'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ status: 'active' }}
        >
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Ingredient Name"
                name="name"
                rules={[{ required: true, message: 'Please enter ingredient name' }]}
              >
                <Input placeholder="Enter ingredient name" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Code" name="code">
                <Input placeholder="Enter ingredient code" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Unit"
                name="unit"
                rules={[{ required: true, message: 'Please select unit' }]}
              >
                <Select placeholder="Select unit">
                  <Option value="g">Grams (g)</Option>
                  <Option value="kg">Kilograms (kg)</Option>
                  <Option value="ml">Milliliters (ml)</Option>
                  <Option value="l">Liters (l)</Option>
                  <Option value="oz">Ounces (oz)</Option>
                  <Option value="lb">Pounds (lb)</Option>
                  <Option value="pcs">Pieces (pcs)</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Status"
                name="status"
                rules={[{ required: true, message: 'Please select status' }]}
              >
                <Select>
                  <Option value="active">Active</Option>
                  <Option value="inactive">Inactive</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Supplier" name="supplier">
            <Input placeholder="Enter supplier name (optional)" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsModalVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                {editingIngredient ? 'Update' : 'Create'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default IngredientsManagement;