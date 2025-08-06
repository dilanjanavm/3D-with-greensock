import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Button, Table, Typography, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  ExperimentOutlined,
  AppstoreOutlined,
  BookOutlined,
  ShoppingOutlined,
  PlusOutlined,
  RiseOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { ingredientsStore, productsStore, recipesStore, initializeSampleData } from '../data/store';

const { Title, Text } = Typography;

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    ingredients: { total: 0, active: 0, inactive: 0 },
    products: { total: 0, active: 0, inactive: 0 },
    recipes: { total: 0 },
  });
  const [recentIngredients, setRecentIngredients] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);

  useEffect(() => {
    // Initialize sample data if needed
    initializeSampleData();
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    const ingredients = ingredientsStore.getAll();
    const products = productsStore.getAll();
    const recipes = recipesStore.getAll();

    setStats({
      ingredients: {
        total: ingredients.length,
        active: ingredients.filter(i => i.status === 'active').length,
        inactive: ingredients.filter(i => i.status === 'inactive').length,
      },
      products: {
        total: products.length,
        active: products.filter(p => p.status === 'active').length,
        inactive: products.filter(p => p.status === 'inactive').length,
      },
      recipes: {
        total: recipes.length,
      },
    });

    // Get recent items (last 5)
    setRecentIngredients(
      ingredients
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
    );
    
    setRecentProducts(
      products
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
    );
  };

  const quickActions = [
    {
      title: 'Add Ingredient',
      icon: <ExperimentOutlined />,
      action: () => navigate('/ingredients'),
      color: '#10B981',
    },
    {
      title: 'Create Product',
      icon: <ShoppingOutlined />,
      action: () => navigate('/products'),
      color: '#3B82F6',
    },
    {
      title: 'New Recipe',
      icon: <BookOutlined />,
      action: () => navigate('/recipes'),
      color: '#8B5CF6',
    },
    {
      title: 'Product Mapping',
      icon: <AppstoreOutlined />,
      action: () => navigate('/product-mapping'),
      color: '#F59E0B',
    },
  ];

  const ingredientColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
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
  ];

  const productColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Weight',
      dataIndex: 'weight',
      key: 'weight',
      render: (weight, record) => `${weight}${record.unit || 'g'}`,
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
  ];

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>Dashboard</Title>
        <Text type="secondary">
          Welcome to the Manufacturing Management System. Here's an overview of your operations.
        </Text>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '32px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card className="dashboard-card">
            <Statistic
              title="Total Ingredients"
              value={stats.ingredients.total}
              prefix={<ExperimentOutlined />}
              valueStyle={{ color: 'white' }}
            />
            <div style={{ marginTop: '8px', fontSize: '12px', opacity: 0.8 }}>
              {stats.ingredients.active} active, {stats.ingredients.inactive} inactive
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', color: 'white', border: 'none' }}>
            <Statistic
              title="Total Products"
              value={stats.products.total}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: 'white' }}
            />
            <div style={{ marginTop: '8px', fontSize: '12px', opacity: 0.8 }}>
              {stats.products.active} active, {stats.products.inactive} inactive
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)', color: 'white', border: 'none' }}>
            <Statistic
              title="Total Recipes"
              value={stats.recipes.total}
              prefix={<BookOutlined />}
              valueStyle={{ color: 'white' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', color: 'white', border: 'none' }}>
            <Statistic
              title="Production Ready"
              value={stats.products.active}
              prefix={<RiseOutlined />}
              valueStyle={{ color: 'white' }}
            />
            <div style={{ marginTop: '8px', fontSize: '12px', opacity: 0.8 }}>
              Products with complete mapping
            </div>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Card title="Quick Actions" style={{ marginBottom: '32px' }}>
        <Row gutter={[16, 16]}>
          {quickActions.map((action, index) => (
            <Col xs={24} sm={12} md={6} key={index}>
              <Button
                type="default"
                size="large"
                icon={action.icon}
                onClick={action.action}
                style={{
                  width: '100%',
                  height: '80px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderColor: action.color,
                  color: action.color,
                }}
              >
                <div style={{ marginTop: '8px' }}>{action.title}</div>
              </Button>
            </Col>
          ))}
        </Row>
      </Card>

      {/* Recent Activity */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            title="Recent Ingredients"
            extra={
              <Button 
                type="link" 
                onClick={() => navigate('/ingredients')}
                style={{ color: '#10B981' }}
              >
                View All
              </Button>
            }
          >
            {recentIngredients.length > 0 ? (
              <Table
                dataSource={recentIngredients}
                columns={ingredientColumns}
                pagination={false}
                size="small"
                rowKey="id"
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#9CA3AF' }}>
                <ExperimentOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                <div>No ingredients yet</div>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => navigate('/ingredients')}
                  style={{ marginTop: '16px' }}
                >
                  Add First Ingredient
                </Button>
              </div>
            )}
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card
            title="Recent Products"
            extra={
              <Button 
                type="link" 
                onClick={() => navigate('/products')}
                style={{ color: '#10B981' }}
              >
                View All
              </Button>
            }
          >
            {recentProducts.length > 0 ? (
              <Table
                dataSource={recentProducts}
                columns={productColumns}
                pagination={false}
                size="small"
                rowKey="id"
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#9CA3AF' }}>
                <ShoppingOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                <div>No products yet</div>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => navigate('/products')}
                  style={{ marginTop: '16px' }}
                >
                  Create First Product
                </Button>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Alerts */}
      {stats.ingredients.inactive > 0 && (
        <Card 
          style={{ 
            marginTop: '24px', 
            borderLeft: '4px solid #F59E0B',
            backgroundColor: '#FFFBEB'
          }}
        >
          <Space>
            <WarningOutlined style={{ color: '#F59E0B' }} />
            <Text>
              You have {stats.ingredients.inactive} inactive ingredient{stats.ingredients.inactive > 1 ? 's' : ''}.
              <Button type="link" onClick={() => navigate('/ingredients')}>
                Review ingredients
              </Button>
            </Text>
          </Space>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;