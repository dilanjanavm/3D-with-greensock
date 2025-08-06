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
  Tag,
  List,
  Collapse,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  BookOutlined,
  ClockCircleOutlined,
  DragOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { recipesStore, productsStore } from '../data/store';

const { Title, Text } = Typography;
const { Option } = Select;
const { Panel } = Collapse;
const { TextArea } = Input;

// Sortable Step Component
const SortableStepItem = ({ step, index, onEdit, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: step.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={`sortable-item ${isDragging ? 'is-dragging' : ''}`}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <div {...attributes} {...listeners} style={{ cursor: 'grab', marginRight: '12px', color: '#9CA3AF' }}>
            <DragOutlined />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 500, marginBottom: '4px' }}>
              Step {index + 1}: {step.description}
            </div>
            {step.waitTime && (
              <div style={{ color: '#9CA3AF', fontSize: '12px' }}>
                <ClockCircleOutlined /> Wait {step.waitTime} minutes
              </div>
            )}
          </div>
        </div>
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => onEdit(step)}
            style={{ color: '#10B981' }}
          />
          <Popconfirm
            title="Are you sure you want to delete this step?"
            onConfirm={() => onDelete(step.id)}
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
      </div>
    </div>
  );
};

const RecipeManagement = () => {
  const [recipes, setRecipes] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [isRecipeModalVisible, setIsRecipeModalVisible] = useState(false);
  const [isStepModalVisible, setIsStepModalVisible] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [editingStep, setEditingStep] = useState(null);
  const [recipeForm] = Form.useForm();
  const [stepForm] = Form.useForm();
  const [previewModalVisible, setPreviewModalVisible] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setRecipes(recipesStore.getAll());
    setProducts(productsStore.getAll());
  };

  const handleAddRecipe = () => {
    setEditingRecipe(null);
    recipeForm.resetFields();
    setIsRecipeModalVisible(true);
  };

  const handleEditRecipe = (recipe) => {
    setEditingRecipe(recipe);
    recipeForm.setFieldsValue(recipe);
    setIsRecipeModalVisible(true);
  };

  const handleDeleteRecipe = async (id) => {
    try {
      recipesStore.delete(id);
      if (selectedRecipe?.id === id) {
        setSelectedRecipe(null);
      }
      loadData();
      message.success('Recipe deleted successfully');
    } catch (error) {
      message.error('Failed to delete recipe');
    }
  };

  const handleSubmitRecipe = async (values) => {
    try {
      const recipeData = {
        ...values,
        steps: editingRecipe?.steps || [],
      };

      if (editingRecipe) {
        recipesStore.update(editingRecipe.id, recipeData);
        message.success('Recipe updated successfully');
      } else {
        recipesStore.create(recipeData);
        message.success('Recipe created successfully');
      }
      setIsRecipeModalVisible(false);
      loadData();
    } catch (error) {
      message.error('Failed to save recipe');
    }
  };

  const handleAddStep = () => {
    if (!selectedRecipe) {
      message.warning('Please select a recipe first');
      return;
    }
    setEditingStep(null);
    stepForm.resetFields();
    setIsStepModalVisible(true);
  };

  const handleEditStep = (step) => {
    setEditingStep(step);
    stepForm.setFieldsValue(step);
    setIsStepModalVisible(true);
  };

  const handleDeleteStep = (stepId) => {
    const updatedSteps = selectedRecipe.steps.filter(step => step.id !== stepId);
    const updatedRecipe = { ...selectedRecipe, steps: updatedSteps };
    
    recipesStore.update(selectedRecipe.id, updatedRecipe);
    setSelectedRecipe(updatedRecipe);
    loadData();
    message.success('Step deleted successfully');
  };

  const handleSubmitStep = async (values) => {
    try {
      const stepData = {
        id: editingStep?.id || Date.now().toString(),
        order: editingStep?.order || (selectedRecipe.steps?.length || 0) + 1,
        ...values,
      };

      let updatedSteps;
      if (editingStep) {
        updatedSteps = selectedRecipe.steps.map(step =>
          step.id === editingStep.id ? stepData : step
        );
      } else {
        updatedSteps = [...(selectedRecipe.steps || []), stepData];
      }

      const updatedRecipe = { ...selectedRecipe, steps: updatedSteps };
      recipesStore.update(selectedRecipe.id, updatedRecipe);
      setSelectedRecipe(updatedRecipe);
      setIsStepModalVisible(false);
      loadData();
      message.success(editingStep ? 'Step updated successfully' : 'Step added successfully');
    } catch (error) {
      message.error('Failed to save step');
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = selectedRecipe.steps.findIndex(step => step.id === active.id);
      const newIndex = selectedRecipe.steps.findIndex(step => step.id === over.id);
      
      const newSteps = arrayMove(selectedRecipe.steps, oldIndex, newIndex);
      const updatedRecipe = { ...selectedRecipe, steps: newSteps };
      
      recipesStore.update(selectedRecipe.id, updatedRecipe);
      setSelectedRecipe(updatedRecipe);
      loadData();
    }
  };

  const handlePreviewRecipe = (recipe) => {
    setSelectedRecipe(recipe);
    setPreviewModalVisible(true);
  };

  const recipeColumns = [
    {
      title: 'Recipe Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Product',
      dataIndex: 'productId',
      key: 'product',
      render: (productId) => {
        const product = products.find(p => p.id === productId);
        return product ? product.name : 'No product linked';
      },
    },
    {
      title: 'Steps',
      key: 'steps',
      render: (_, record) => record.steps?.length || 0,
    },
    {
      title: 'Total Time',
      key: 'totalTime',
      render: (_, record) => {
        const totalWaitTime = record.steps?.reduce((total, step) => total + (step.waitTime || 0), 0) || 0;
        return totalWaitTime > 0 ? `${totalWaitTime} min` : 'No wait time';
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
            icon={<EyeOutlined />}
            onClick={() => handlePreviewRecipe(record)}
            style={{ color: '#3B82F6' }}
          />
          <Button
            type="text"
            onClick={() => setSelectedRecipe(record)}
            style={{ color: '#10B981' }}
          >
            Edit Steps
          </Button>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEditRecipe(record)}
            style={{ color: '#F59E0B' }}
          />
          <Popconfirm
            title="Are you sure you want to delete this recipe?"
            onConfirm={() => handleDeleteRecipe(record.id)}
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

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>Recipe Management</Title>
        <Text type="secondary">
          Define step-by-step manufacturing procedures with optional wait times.
        </Text>
      </div>

      <Row gutter={[16, 16]}>
        {/* Recipes List */}
        <Col xs={24} lg={selectedRecipe ? 12 : 24}>
          <Card
            title="Recipes"
            extra={
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddRecipe}
              >
                Add Recipe
              </Button>
            }
          >
            <Table
              dataSource={recipes}
              columns={recipeColumns}
              rowKey="id"
              pagination={{ pageSize: 5 }}
              size="small"
              rowClassName={(record) => 
                selectedRecipe?.id === record.id ? 'ant-table-row-selected' : ''
              }
            />
          </Card>
        </Col>

        {/* Recipe Steps */}
        {selectedRecipe && (
          <Col xs={24} lg={12}>
            <Card
              title={`Steps: ${selectedRecipe.name}`}
              extra={
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddStep}
                  size="small"
                >
                  Add Step
                </Button>
              }
            >
              {selectedRecipe.steps && selectedRecipe.steps.length > 0 ? (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={selectedRecipe.steps.map(step => step.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div>
                      {selectedRecipe.steps.map((step, index) => (
                        <SortableStepItem
                          key={step.id}
                          step={step}
                          index={index}
                          onEdit={handleEditStep}
                          onDelete={handleDeleteStep}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#9CA3AF' }}>
                  <BookOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                  <div>No steps added yet</div>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAddStep}
                    style={{ marginTop: '16px' }}
                  >
                    Add First Step
                  </Button>
                </div>
              )}
            </Card>
          </Col>
        )}
      </Row>

      {/* Add/Edit Recipe Modal */}
      <Modal
        title={editingRecipe ? 'Edit Recipe' : 'Add New Recipe'}
        open={isRecipeModalVisible}
        onCancel={() => setIsRecipeModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={recipeForm}
          layout="vertical"
          onFinish={handleSubmitRecipe}
        >
          <Form.Item
            label="Recipe Name"
            name="name"
            rules={[{ required: true, message: 'Please enter recipe name' }]}
          >
            <Input placeholder="Enter recipe name" />
          </Form.Item>

          <Form.Item
            label="Link to Product"
            name="productId"
          >
            <Select placeholder="Select a product (optional)" allowClear>
              {products.map(product => (
                <Option key={product.id} value={product.id}>
                  {product.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Description" name="description">
            <TextArea 
              placeholder="Enter recipe description (optional)" 
              rows={3}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsRecipeModalVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                {editingRecipe ? 'Update' : 'Create'} Recipe
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Add/Edit Step Modal */}
      <Modal
        title={editingStep ? 'Edit Step' : 'Add New Step'}
        open={isStepModalVisible}
        onCancel={() => setIsStepModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form
          form={stepForm}
          layout="vertical"
          onFinish={handleSubmitStep}
        >
          <Form.Item
            label="Step Description"
            name="description"
            rules={[{ required: true, message: 'Please enter step description' }]}
          >
            <TextArea 
              placeholder="Describe what to do in this step" 
              rows={3}
            />
          </Form.Item>

          <Form.Item
            label="Wait Time (minutes)"
            name="waitTime"
            help="Optional wait time after completing this step"
          >
            <InputNumber
              placeholder="Enter wait time in minutes"
              style={{ width: '100%' }}
              min={0}
              step={1}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsStepModalVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                {editingStep ? 'Update' : 'Add'} Step
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Recipe Preview Modal */}
      <Modal
        title={`Recipe Preview: ${selectedRecipe?.name}`}
        open={previewModalVisible}
        onCancel={() => setPreviewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setPreviewModalVisible(false)}>
            Close
          </Button>
        ]}
        width={700}
      >
        {selectedRecipe && (
          <div>
            {selectedRecipe.description && (
              <div style={{ marginBottom: '24px' }}>
                <Text strong>Description:</Text>
                <div style={{ marginTop: '8px' }}>{selectedRecipe.description}</div>
              </div>
            )}

            <div style={{ marginBottom: '16px' }}>
              <Text strong>Manufacturing Steps:</Text>
            </div>

            <List
              dataSource={selectedRecipe.steps || []}
              renderItem={(step, index) => (
                <List.Item>
                  <div style={{ width: '100%' }}>
                    <div style={{ fontWeight: 500, marginBottom: '8px' }}>
                      Step {index + 1}: {step.description}
                    </div>
                    {step.waitTime && (
                      <Tag icon={<ClockCircleOutlined />} color="orange">
                        Wait {step.waitTime} minutes
                      </Tag>
                    )}
                  </div>
                </List.Item>
              )}
            />

            {(!selectedRecipe.steps || selectedRecipe.steps.length === 0) && (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#9CA3AF' }}>
                No steps defined for this recipe yet.
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default RecipeManagement;