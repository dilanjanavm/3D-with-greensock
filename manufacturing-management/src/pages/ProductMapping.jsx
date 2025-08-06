import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Typography,
  message,
  Row,
  Col,
  Table,
  InputNumber,
  Popconfirm,
  Alert,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { ingredientsStore, productsStore, productMappingsStore } from '../data/store';

const { Title, Text } = Typography;
const { Option } = Select;

const ProductMapping = () => {
  const [products, setProducts] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [productMappings, setProductMappings] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isProductModalVisible, setIsProductModalVisible] = useState(false);
  const [editingMapping, setEditingMapping] = useState(null);
  const [form] = Form.useForm();
  const [productForm] = Form.useForm();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setProducts(productsStore.getAll());
    setIngredients(ingredientsStore.getAll().filter(i => i.status === 'active'));
    setProductMappings(productMappingsStore.getAll());
  };

  const handleProductSelect = (productId) => {
    const product = products.find(p => p.id === productId);
    setSelectedProduct(product);
  };

  const handleAddProduct = () => {
    productForm.resetFields();
    setIsProductModalVisible(true);
  };

  const handleCreateProduct = async (values) => {
    try {
      productsStore.create(values);
      loadData();
      setIsProductModalVisible(false);
      message.success('Product created successfully');
    } catch (error) {
      message.error('Failed to create product');
    }
  };

  const handleAddMapping = () => {
    if (!selectedProduct) {
      message.warning('Please select a product first');
      return;
    }
    setEditingMapping(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditMapping = (record) => {
    setEditingMapping(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDeleteMapping = async (id) => {
    try {
      productMappingsStore.delete(id);
      loadData();
      message.success('Ingredient mapping deleted successfully');
    } catch (error) {
      message.error('Failed to delete mapping');
    }
  };

  const handleSubmitMapping = async (values) => {
    try {
      const mappingData = {
        ...values,
        productId: selectedProduct.id,
      };

      if (editingMapping) {
        productMappingsStore.update(editingMapping.id, mappingData);
        message.success('Ingredient mapping updated successfully');
      } else {
        productMappingsStore.create(mappingData);
        message.success('Ingredient mapping created successfully');
      }
      setIsModalVisible(false);
      loadData();
    } catch (error) {
      message.error('Failed to save mapping');
    }
  };

  const handleCloneProduct = (product) => {
    const mappings = productMappings.filter(m => m.productId === product.id);
    
    const newProductName = `${product.name} (Copy)`;
    productForm.setFieldsValue({
      name: newProductName,
      weight: product.weight,
      unit: product.unit,
      status: 'active',
    });
    setIsProductModalVisible(true);
  };

  const getCurrentMappings = () => {
    return selectedProduct 
      ? productMappings.filter(m => m.productId === selectedProduct.id)
      : [];
  };

  const getTotalWeight = () => {
    const mappings = getCurrentMappings();
    return mappings.reduce((total, mapping) => total + (mapping.quantity || 0), 0);
  };

  const getWeightValidation = () => {
    if (!selectedProduct) return null;
    
    const totalMappingWeight = getTotalWeight();
    const targetWeight = selectedProduct.weight || 0;
    const difference = Math.abs(totalMappingWeight - targetWeight);
    
    if (difference < 0.01) {
      return { type: 'success', message: 'Perfect! Ingredient quantities match package weight.' };
    } else if (totalMappingWeight > targetWeight) {
      return { 
        type: 'error', 
        message: `Exceeds package weight by ${difference.toFixed(2)}${selectedProduct.unit || 'g'}` 
      };
    } else {
      return { 
        type: 'warning', 
        message: `Short by ${difference.toFixed(2)}${selectedProduct.unit || 'g'} from package weight` 
      };
    }
  };

  const productColumns = [
    {
      title: 'Product Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Package Weight',
      key: 'weight',
      render: (_, record) => `${record.weight || 0}${record.unit || 'g'}`,
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
    },
    {
      title: 'Mapped Weight',
      key: 'mappedWeight',
      render: (_, record) => {
        const mappings = productMappings.filter(m => m.productId === record.id);
        const totalWeight = mappings.reduce((total, mapping) => total + (mapping.quantity || 0), 0);
        return `${totalWeight.toFixed(2)}${record.unit || 'g'}`;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            onClick={() => handleProductSelect(record.id)}
            style={{ color: '#10B981' }}
          >
            Select
          </Button>
          <Button
            type="text"
            icon={<CopyOutlined />}
            size="small"
            onClick={() => handleCloneProduct(record)}
            style={{ color: '#3B82F6' }}
          />
        </Space>
      ),
    },
  ];

  const mappingColumns = [
    {
      title: 'Ingredient',
      dataIndex: 'ingredientId',
      key: 'ingredient',
      render: (ingredientId) => {
        const ingredient = ingredients.find(i => i.id === ingredientId);
        return ingredient ? ingredient.name : 'Unknown';
      },
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity, record) => {
        const ingredient = ingredients.find(i => i.id === record.ingredientId);
        return `${quantity || 0}${ingredient?.unit || 'g'}`;
      },
    },
    {
      title: 'Percentage',
      key: 'percentage',
      render: (_, record) => {
        const totalWeight = getTotalWeight();
        const percentage = totalWeight > 0 ? (record.quantity / totalWeight * 100) : 0;
        return `${percentage.toFixed(1)}%`;
      },
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
            onClick={() => handleEditMapping(record)}
            style={{ color: '#10B981' }}
          />
          <Popconfirm
            title="Are you sure you want to delete this mapping?"
            onConfirm={() => handleDeleteMapping(record.id)}
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

  const weightValidation = getWeightValidation();

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>Product Ingredient Mapping</Title>
        <Text type="secondary">
          Define product formulations by mapping ingredients with specific quantities.
        </Text>
      </div>

      <Row gutter={[16, 16]}>
        {/* Products List */}
        <Col xs={24} lg={selectedProduct ? 12 : 24}>
          <Card
            title="Products"
            extra={
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddProduct}
              >
                Add Product
              </Button>
            }
          >
            <Table
              dataSource={products}
              columns={productColumns}
              rowKey="id"
              pagination={{ pageSize: 5 }}
              size="small"
              rowClassName={(record) => 
                selectedProduct?.id === record.id ? 'ant-table-row-selected' : ''
              }
            />
          </Card>
        </Col>

        {/* Ingredient Mapping */}
        {selectedProduct && (
          <Col xs={24} lg={12}>
            <Card
              title={`Formulation: ${selectedProduct.name}`}
              extra={
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddMapping}
                  size="small"
                >
                  Add Ingredient
                </Button>
              }
            >
              {/* Weight Validation Alert */}
              {weightValidation && (
                <Alert
                  message={weightValidation.message}
                  type={weightValidation.type}
                  showIcon
                  style={{ marginBottom: '16px' }}
                />
              )}

              {/* Summary */}
              <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#F9FAFB', borderRadius: '6px' }}>
                <Row gutter={[16, 8]}>
                  <Col span={12}>
                    <Text strong>Package Weight:</Text> {selectedProduct.weight || 0}{selectedProduct.unit || 'g'}
                  </Col>
                  <Col span={12}>
                    <Text strong>Mapped Weight:</Text> {getTotalWeight().toFixed(2)}{selectedProduct.unit || 'g'}
                  </Col>
                </Row>
              </div>

              <Table
                dataSource={getCurrentMappings()}
                columns={mappingColumns}
                rowKey="id"
                pagination={false}
                size="small"
              />
            </Card>
          </Col>
        )}
      </Row>

      {/* Add Product Modal */}
      <Modal
        title="Add New Product"
        open={isProductModalVisible}
        onCancel={() => setIsProductModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form
          form={productForm}
          layout="vertical"
          onFinish={handleCreateProduct}
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
            <Col span={12}>
              <Form.Item
                label="Package Weight"
                name="weight"
                rules={[{ required: true, message: 'Please enter weight' }]}
              >
                <InputNumber
                  placeholder="Enter weight"
                  style={{ width: '100%' }}
                  min={0}
                  step={0.1}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
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

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsProductModalVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                Create Product
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Add/Edit Mapping Modal */}
      <Modal
        title={editingMapping ? 'Edit Ingredient Mapping' : 'Add Ingredient Mapping'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmitMapping}
        >
          <Form.Item
            label="Ingredient"
            name="ingredientId"
            rules={[{ required: true, message: 'Please select ingredient' }]}
          >
            <Select placeholder="Select ingredient">
              {ingredients.map(ingredient => (
                <Option key={ingredient.id} value={ingredient.id}>
                  {ingredient.name} ({ingredient.unit})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Quantity"
            name="quantity"
            rules={[{ required: true, message: 'Please enter quantity' }]}
          >
            <InputNumber
              placeholder="Enter quantity"
              style={{ width: '100%' }}
              min={0}
              step={0.1}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsModalVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                {editingMapping ? 'Update' : 'Add'} Mapping
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductMapping;