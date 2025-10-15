import React, { useState } from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  ExperimentOutlined,
  AppstoreOutlined,
  BookOutlined,
  ShoppingOutlined,
  ImportOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/ingredients',
      icon: <ExperimentOutlined />,
      label: 'Ingredients',
    },
    {
      key: '/product-mapping',
      icon: <AppstoreOutlined />,
      label: 'Product Mapping',
    },
    {
      key: '/recipes',
      icon: <BookOutlined />,
      label: 'Recipes',
    },
    {
      key: '/products',
      icon: <ShoppingOutlined />,
      label: 'Products',
    },
    {
      key: '/import',
      icon: <ImportOutlined />,
      label: 'Import Data',
    },
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      breakpoint="lg"
      collapsedWidth={80}
      width={260}
      style={{
        background: '#ffffff',
        position: 'relative',
      }}
      onBreakpoint={(broken) => {
        setCollapsed(broken);
      }}
    >
      <div
        style={{
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          padding: collapsed ? '0' : '0 16px',
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        {!collapsed && (
          <div
            style={{
              fontSize: '16px',
              fontWeight: 600,
              color: '#10B981',
            }}
          >
            MMS
          </div>
        )}
        <div
          style={{
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#666',
            transition: 'all 0.2s',
          }}
          onClick={() => setCollapsed(!collapsed)}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#f5f5f5';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
          }}
        >
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </div>
      </div>
      
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={handleMenuClick}
        style={{
          borderRight: 'none',
          height: 'calc(100vh - 64px)',
          fontSize: '14px',
        }}
      />
    </Sider>
  );
};

export default Sidebar;