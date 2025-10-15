import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider, Layout } from 'antd';
import { BuildOutlined } from '@ant-design/icons';
import Sidebar from './components/Layout/Sidebar';
import Dashboard from './pages/Dashboard';
import IngredientsManagement from './pages/IngredientsManagement';
import ProductMapping from './pages/ProductMapping';
import RecipeManagement from './pages/RecipeManagement';
import ProductManagement from './pages/ProductManagement';
import IngredientsImport from './pages/IngredientsImport';
import './App.css';

const { Header, Content } = Layout;

const theme = {
  token: {
    colorPrimary: '#10B981',
    colorBgContainer: '#ffffff',
    colorBgLayout: '#F3F4F6',
    borderRadius: 8,
  },
};

function App() {
  return (
    <ConfigProvider theme={theme}>
      <Router>
        <Layout style={{ minHeight: '100vh' }}>
          <Sidebar />
          <Layout>
            <Header style={{ 
              background: '#ffffff', 
              padding: '0 24px',
              display: 'flex',
              alignItems: 'center',
              borderBottom: '1px solid #f0f0f0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', fontSize: '20px', fontWeight: 600, color: '#111827' }}>
                <BuildOutlined style={{ marginRight: '12px', color: '#10B981' }} />
                Manufacturing Management System
              </div>
            </Header>
            <Content style={{ 
              margin: '24px',
              padding: '24px',
              background: '#ffffff',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/ingredients" element={<IngredientsManagement />} />
                <Route path="/product-mapping" element={<ProductMapping />} />
                <Route path="/recipes" element={<RecipeManagement />} />
                <Route path="/products" element={<ProductManagement />} />
                <Route path="/import" element={<IngredientsImport />} />
              </Routes>
            </Content>
          </Layout>
        </Layout>
      </Router>
    </ConfigProvider>
  );
}

export default App;
