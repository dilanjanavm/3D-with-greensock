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
  Tag,
  Tabs,
  List,
  Empty,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ShoppingOutlined,
  AppstoreOutlined,
  BookOutlined,
} from '@ant-design/icons';
import { productsStore, productMappingsStore, recipesStore, ingredientsStore } from '../data/store';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [productMappings, setProductMappings] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [ingredients, setIngredients] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchText, statusFilter]);

  const loadData = () => {
    setProducts(productsStore.getAll());
    setProductMappings(productMappingsStore.getAll());
    setRecipes(recipesStore.getAll());
    setIngredients(ingredientsStore.getAll());
  };

  const filterProducts = () => {
    let filtered = products;

    if (searchText) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchText.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((product) => product.status === statusFilter);
    }

    setFilteredProducts(filtered);
  };

  const handleAdd = () => {
    setEditingProduct(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingProduct(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      // Also delete related mappings
      productMappingsStore.deleteByProductId(id);
      productsStore.delete(id);
      loadData();
      message.success('Product deleted successfully');
    } catch (error) {
      message.error('Failed to delete product');
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingProduct) {
        productsStore.update(editingProduct.id, values);
        message.success('Product updated successfully');
      } else {
        productsStore.create(values);
        message.success('Product created successfully');
      }
      setIsModalVisible(false);
      loadData();
    } catch (error) {
      message.error('Failed to save product');
    }
  };

  const handleViewDetails = (product) => {
    setSelectedProduct(product);
    setDetailsModalVisible(true);
  };

  const getProductMappings = (productId) => {
    return productMappings.filter(m => m.productId === productId);
  };

  const getProductRecipes = (productId) => {
    return recipes.filter(r => r.productId === productId);
  };

  const getMappedWeight = (productId) => {
    const mappings = getProductMappings(productId);
    return mappings.reduce((total, mapping) => total + (mapping.quantity || 0), 0);
  };

  const getIngredientName = (ingredientId) => {
    const ingredient = ingredients.find(i => i.id === ingredientId);
    return ingredient ? ingredient.name : 'Unknown';
  };

  const columns = [
    {
      title: 'Product Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Weight',
      key: 'weight',
      render: (_, record) => `${record.weight || 0}${record.unit || 'g'}`,
      sorter: (a, b) => (a.weight || 0) - (b.weight || 0),
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
      title: 'Mapped Weight',
      key: 'mappedWeight',
      render: (_, record) => {
        const mappedWeight = getMappedWeight(record.id);
        const targetWeight = record.weight || 0;
        const isComplete = Math.abs(mappedWeight - targetWeight) < 0.01;
        
        return (
          <div>
            <span>{mappedWeight.toFixed(2)}{record.unit || 'g'}</span>
            {mappedWeight > 0 && (
              <Tag color={isComplete ? 'green' : 'orange'} size="small" style={{ marginLeft: '8px' }}>
                {isComplete ? 'Complete' : 'Partial'}
              </Tag>
            )}
          </div>
        );
      },
    },
    {
      title: 'Recipes',
      key: 'recipes',
      render: (_, record) => {
        const productRecipes = getProductRecipes(record.id);
        return productRecipes.length > 0 ? productRecipes.length : '-';
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 180,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            onClick={() => handleViewDetails(record)}
            style={{ color: '#3B82F6' }}
          >
            Details
          </Button>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            style={{ color: '#10B981' }}
          />
          <Popconfirm
            title="Are you sure you want to delete this product? This will also delete all related mappings."
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
    total: products.length,
    active: products.filter((p) => p.status === 'active').length,
    inactive: products.filter((p) => p.status === 'inactive').length,
    mapped: products.filter((p) => getMappedWeight(p.id) > 0).length,
  };

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>Product Management</Title>
        <Text type="secondary">
          Manage product lifecycle with ingredient mappings and recipe connections.
        </Text>
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Products"
              value={stats.total}
              prefix={<ShoppingOutlined style={{ color: '#10B981' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Active"
              value={stats.active}
              valueStyle={{ color: '#10B981' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Inactive"
              value={stats.inactive}
              valueStyle={{ color: '#9CA3AF' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="With Mappings"
              value={stats.mapped}
              valueStyle={{ color: '#3B82F6' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Controls */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Search products..."
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
              Add Product
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Products Table */}
      <Card>
        <Table
          dataSource={filteredProducts}
          columns={columns}
          rowKey="id"
          pagination={{
            total: filteredProducts.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Total ${total} products`,
          }}
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ status: 'active', unit: 'g' }}
        >
          <Form.Item
            label="Product Name"
            name="name"
            rules={[{ required: true, message: 'Please enter product name' }]}
          >
            <Input placeholder="Enter product name" />
          </Form.Item>

          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Package Weight"
                name="weight"
                rules={[{ required: true, message: 'Please enter weight' }]}
              >
                <Input
                  type="number"
                  placeholder="Enter weight"
                  min={0}
                  step={0.1}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Unit"
                name="unit"
                rules={[{ required: true, message: 'Please select unit' }]}
              >
                <Select>
                  <Option value="g">Grams (g)</Option>
                  <Option value="kg">Kilograms (kg)</Option>
                  <Option value="oz">Ounces (oz)</Option>
                  <Option value="lb">Pounds (lb)</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

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

          <Form.Item label="Description" name="description">
            <TextArea 
              placeholder="Enter product description (optional)" 
              rows={3}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsModalVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                {editingProduct ? 'Update' : 'Create'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Product Details Modal */}
      <Modal
        title={`Product Details: ${selectedProduct?.name}`}
        open={detailsModalVisible}
        onCancel={() => setDetailsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailsModalVisible(false)}>
            Close
          </Button>
        ]}
        width={800}
      >
        {selectedProduct && (
          <Tabs defaultActiveKey="overview">
            <Tabs.TabPane tab="Overview" key="overview">
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Card size="small" title="Product Information">
                    <p><strong>Name:</strong> {selectedProduct.name}</p>
                    <p><strong>Weight:</strong> {selectedProduct.weight}{selectedProduct.unit}</p>
                    <p><strong>Status:</strong> 
                      <span className={`status-${selectedProduct.status}`} style={{ marginLeft: '8px' }}>
                        {selectedProduct.status.charAt(0).toUpperCase() + selectedProduct.status.slice(1)}
                      </span>
                    </p>
                    {selectedProduct.description && (
                      <p><strong>Description:</strong> {selectedProduct.description}</p>
                    )}
                  </Card>
                </Col>
                <Col span={12}>
                  <Card size="small" title="Progress">
                    <Statistic
                      title="Mapped Weight"
                      value={getMappedWeight(selectedProduct.id)}
                      suffix={`/ ${selectedProduct.weight}${selectedProduct.unit}`}
                      precision={2}
                    />
                    <div style={{ marginTop: '16px' }}>
                      <Statistic
                        title="Recipes"
                        value={getProductRecipes(selectedProduct.id).length}
                        suffix="created"
                      />
                    </div>
                  </Card>
                </Col>
              </Row>
            </Tabs.TabPane>

            <Tabs.TabPane tab={`Ingredients (${getProductMappings(selectedProduct.id).length})`} key="mappings">
              <Card size="small">
                {getProductMappings(selectedProduct.id).length > 0 ? (
                  <List
                    dataSource={getProductMappings(selectedProduct.id)}
                    renderItem={(mapping) => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<AppstoreOutlined style={{ color: '#10B981' }} />}
                          title={getIngredientName(mapping.ingredientId)}
                          description={`${mapping.quantity} ${ingredients.find(i => i.id === mapping.ingredientId)?.unit || 'g'}`}
                        />
                      </List.Item>
                    )}
                  />
                ) : (
                  <Empty
                    description="No ingredient mappings defined"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                )}
              </Card>
            </Tabs.TabPane>

            <Tabs.TabPane tab={`Recipes (${getProductRecipes(selectedProduct.id).length})`} key="recipes">
              <Card size="small">
                {getProductRecipes(selectedProduct.id).length > 0 ? (
                  <List
                    dataSource={getProductRecipes(selectedProduct.id)}
                    renderItem={(recipe) => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<BookOutlined style={{ color: '#8B5CF6' }} />}
                          title={recipe.name}
                          description={`${recipe.steps?.length || 0} steps${recipe.description ? ` • ${recipe.description}` : ''}`}
                        />
                      </List.Item>
                    )}
                  />
                ) : (
                  <Empty
                    description="No recipes created for this product"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                )}
              </Card>
            </Tabs.TabPane>
          </Tabs>
        )}
      </Modal>
    </div>
  );
};

export default ProductManagement;