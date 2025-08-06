import React, { useState } from 'react';
import {
  Card,
  Button,
  Upload,
  Table,
  Form,
  Input,
  Select,
  Space,
  Typography,
  message,
  Row,
  Col,
  Alert,
  Steps,
  Divider,
  Tag,
  Modal,
} from 'antd';
import {
  UploadOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import Papa from 'papaparse';
import { ingredientsStore } from '../data/store';

const { Title, Text } = Typography;
const { Option } = Select;
const { Step } = Steps;
const { Dragger } = Upload;

const IngredientsImport = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [csvData, setCsvData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [mappedColumns, setMappedColumns] = useState({});
  const [validationResults, setValidationResults] = useState([]);
  const [importResults, setImportResults] = useState(null);
  const [isManualModalVisible, setIsManualModalVisible] = useState(false);
  const [form] = Form.useForm();

  const requiredFields = [
    { key: 'name', label: 'Ingredient Name', required: true },
    { key: 'code', label: 'Code', required: false },
    { key: 'unit', label: 'Unit', required: true },
    { key: 'supplier', label: 'Supplier', required: false },
    { key: 'status', label: 'Status', required: true },
  ];

  const unitOptions = ['g', 'kg', 'ml', 'l', 'oz', 'lb', 'pcs'];
  const statusOptions = ['active', 'inactive'];

  const handleFileUpload = (file) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data && results.data.length > 0) {
          setHeaders(Object.keys(results.data[0]));
          setCsvData(results.data);
          setCurrentStep(1);
          message.success(`Successfully parsed ${results.data.length} rows`);
        } else {
          message.error('No data found in CSV file');
        }
      },
      error: (error) => {
        message.error(`Error parsing CSV: ${error.message}`);
      },
    });
    return false; // Prevent default upload behavior
  };

  const handleColumnMapping = () => {
    const requiredMappings = requiredFields.filter(field => field.required);
    const missingMappings = requiredMappings.filter(field => !mappedColumns[field.key]);
    
    if (missingMappings.length > 0) {
      message.error(`Please map required fields: ${missingMappings.map(f => f.label).join(', ')}`);
      return;
    }

    validateData();
    setCurrentStep(2);
  };

  const validateData = () => {
    const results = csvData.map((row, index) => {
      const errors = [];
      const warnings = [];
      
      // Validate required fields
      requiredFields.forEach(field => {
        if (field.required && mappedColumns[field.key]) {
          const value = row[mappedColumns[field.key]];
          if (!value || value.trim() === '') {
            errors.push(`${field.label} is required`);
          }
        }
      });

      // Validate unit
      if (mappedColumns.unit) {
        const unit = row[mappedColumns.unit];
        if (unit && !unitOptions.includes(unit.toLowerCase())) {
          errors.push(`Invalid unit: ${unit}. Must be one of: ${unitOptions.join(', ')}`);
        }
      }

      // Validate status
      if (mappedColumns.status) {
        const status = row[mappedColumns.status];
        if (status && !statusOptions.includes(status.toLowerCase())) {
          errors.push(`Invalid status: ${status}. Must be 'active' or 'inactive'`);
        }
      }

      // Check for duplicate names in current batch
      if (mappedColumns.name) {
        const currentName = row[mappedColumns.name];
        const duplicateIndex = csvData.findIndex((otherRow, otherIndex) => 
          otherIndex !== index && 
          otherRow[mappedColumns.name] === currentName
        );
        if (duplicateIndex !== -1) {
          warnings.push(`Duplicate name found at row ${duplicateIndex + 1}`);
        }
      }

      return {
        rowIndex: index,
        data: row,
        errors,
        warnings,
        isValid: errors.length === 0,
      };
    });

    setValidationResults(results);
  };

  const handleImport = async () => {
    const validRows = validationResults.filter(result => result.isValid);
    
    if (validRows.length === 0) {
      message.error('No valid rows to import');
      return;
    }

    try {
      const importData = validRows.map(result => {
        const ingredient = {};
        requiredFields.forEach(field => {
          if (mappedColumns[field.key]) {
            let value = result.data[mappedColumns[field.key]];
            if (field.key === 'status' || field.key === 'unit') {
              value = value.toLowerCase();
            }
            ingredient[field.key] = value;
          }
        });
        return ingredient;
      });

      const newIngredients = ingredientsStore.bulkCreate(importData);
      
      setImportResults({
        total: csvData.length,
        successful: newIngredients.length,
        failed: csvData.length - newIngredients.length,
        ingredients: newIngredients,
      });
      
      setCurrentStep(3);
      message.success(`Successfully imported ${newIngredients.length} ingredients`);
    } catch (error) {
      message.error('Failed to import ingredients');
    }
  };

  const handleManualAdd = async (values) => {
    try {
      ingredientsStore.create(values);
      setIsManualModalVisible(false);
      form.resetFields();
      message.success('Ingredient added successfully');
    } catch (error) {
      message.error('Failed to add ingredient');
    }
  };

  const downloadSampleCSV = () => {
    const sampleData = [
      {
        'Ingredient Name': 'Wheat Flour',
        'Code': 'WF001',
        'Unit': 'g',
        'Supplier': 'ABC Flour Mill',
        'Status': 'active',
      },
      {
        'Ingredient Name': 'Olive Oil',
        'Code': 'OO001',
        'Unit': 'ml',
        'Supplier': 'Mediterranean Oils',
        'Status': 'active',
      },
      {
        'Ingredient Name': 'Sea Salt',
        'Code': 'SS001',
        'Unit': 'g',
        'Supplier': 'Ocean Harvest',
        'Status': 'inactive',
      },
    ];

    const csv = Papa.unparse(sampleData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'ingredients_sample.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetImport = () => {
    setCurrentStep(0);
    setCsvData([]);
    setHeaders([]);
    setMappedColumns({});
    setValidationResults([]);
    setImportResults(null);
  };

  const validationColumns = [
    {
      title: 'Row',
      key: 'row',
      width: 60,
      render: (_, record) => record.rowIndex + 1,
    },
    {
      title: 'Name',
      key: 'name',
      render: (_, record) => mappedColumns.name ? record.data[mappedColumns.name] : '-',
    },
    {
      title: 'Unit',
      key: 'unit',
      render: (_, record) => mappedColumns.unit ? record.data[mappedColumns.unit] : '-',
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => {
        const status = mappedColumns.status ? record.data[mappedColumns.status] : null;
        return status ? (
          <span className={`status-${status.toLowerCase()}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        ) : '-';
      },
    },
    {
      title: 'Validation',
      key: 'validation',
      render: (_, record) => (
        <div>
          {record.isValid ? (
            <Tag icon={<CheckCircleOutlined />} color="success">Valid</Tag>
          ) : (
            <Tag icon={<CloseCircleOutlined />} color="error">Invalid</Tag>
          )}
          {record.warnings.length > 0 && (
            <Tag icon={<ExclamationCircleOutlined />} color="warning">
              {record.warnings.length} Warning{record.warnings.length > 1 ? 's' : ''}
            </Tag>
          )}
          {record.errors.length > 0 && (
            <div style={{ marginTop: '4px', fontSize: '12px', color: '#ff4d4f' }}>
              {record.errors.join(', ')}
            </div>
          )}
          {record.warnings.length > 0 && (
            <div style={{ marginTop: '4px', fontSize: '12px', color: '#faad14' }}>
              {record.warnings.join(', ')}
            </div>
          )}
        </div>
      ),
    },
  ];

  const validCount = validationResults.filter(r => r.isValid).length;
  const invalidCount = validationResults.length - validCount;

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>Import Ingredients</Title>
        <Text type="secondary">
          Add ingredients in bulk via CSV import or manually one by one.
        </Text>
      </div>

      {/* Import Methods */}
      <Row gutter={[16, 16]} style={{ marginBottom: '32px' }}>
        <Col xs={24} md={12}>
          <Card
            title="Manual Entry"
            extra={
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsManualModalVisible(true)}
              >
                Add Ingredient
              </Button>
            }
          >
            <Text type="secondary">
              Add ingredients one by one using a form interface. Perfect for small batches or single items.
            </Text>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="CSV Import">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text type="secondary">
                Upload a CSV file to import multiple ingredients at once. Download the sample format first.
              </Text>
              <Space>
                <Button
                  icon={<DownloadOutlined />}
                  onClick={downloadSampleCSV}
                >
                  Download Sample CSV
                </Button>
                <Button
                  type="primary"
                  onClick={() => setCurrentStep(0)}
                  disabled={currentStep > 0}
                >
                  Start CSV Import
                </Button>
              </Space>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* CSV Import Process */}
      {currentStep > 0 && (
        <Card title="CSV Import Process">
          <Steps current={currentStep} style={{ marginBottom: '32px' }}>
            <Step title="Upload File" description="Select and parse CSV file" />
            <Step title="Map Columns" description="Map CSV columns to fields" />
            <Step title="Validate Data" description="Review and validate data" />
            <Step title="Import Complete" description="Import results" />
          </Steps>

          {/* Step 1: Column Mapping */}
          {currentStep === 1 && (
            <div>
              <Alert
                message={`Found ${csvData.length} rows with columns: ${headers.join(', ')}`}
                type="info"
                style={{ marginBottom: '24px' }}
              />
              
              <Title level={4}>Map CSV Columns to Fields</Title>
              <Row gutter={[16, 16]}>
                {requiredFields.map(field => (
                  <Col xs={24} sm={12} md={8} key={field.key}>
                    <Form.Item
                      label={
                        <span>
                          {field.label}
                          {field.required && <span style={{ color: 'red' }}> *</span>}
                        </span>
                      }
                    >
                      <Select
                        placeholder="Select column"
                        value={mappedColumns[field.key]}
                        onChange={(value) => setMappedColumns({
                          ...mappedColumns,
                          [field.key]: value
                        })}
                        allowClear
                      >
                        {headers.map(header => (
                          <Option key={header} value={header}>{header}</Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                ))}
              </Row>
              
              <Space style={{ marginTop: '24px' }}>
                <Button onClick={resetImport}>Cancel</Button>
                <Button type="primary" onClick={handleColumnMapping}>
                  Next: Validate Data
                </Button>
              </Space>
            </div>
          )}

          {/* Step 2: Data Validation */}
          {currentStep === 2 && (
            <div>
              <div style={{ marginBottom: '16px' }}>
                <Space>
                  <Tag color="success">{validCount} Valid</Tag>
                  <Tag color="error">{invalidCount} Invalid</Tag>
                  <Tag color="default">{csvData.length} Total</Tag>
                </Space>
              </div>

              {invalidCount > 0 && (
                <Alert
                  message="Data Validation Issues"
                  description={`${invalidCount} rows have validation errors. Only valid rows will be imported.`}
                  type="warning"
                  style={{ marginBottom: '16px' }}
                />
              )}

              <Table
                dataSource={validationResults}
                columns={validationColumns}
                rowKey="rowIndex"
                pagination={{ pageSize: 10 }}
                size="small"
                className="csv-preview"
                rowClassName={(record) => 
                  record.isValid ? 'import-success' : 'import-error'
                }
              />

              <Space style={{ marginTop: '24px' }}>
                <Button onClick={() => setCurrentStep(1)}>Back</Button>
                <Button onClick={resetImport}>Cancel</Button>
                <Button 
                  type="primary" 
                  onClick={handleImport}
                  disabled={validCount === 0}
                >
                  Import {validCount} Valid Rows
                </Button>
              </Space>
            </div>
          )}

          {/* Step 3: Import Results */}
          {currentStep === 3 && importResults && (
            <div>
              <Alert
                message="Import Completed"
                description={`Successfully imported ${importResults.successful} out of ${importResults.total} ingredients.`}
                type="success"
                style={{ marginBottom: '24px' }}
              />

              <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                <Col span={8}>
                  <Card>
                    <Statistic title="Total Rows" value={importResults.total} />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card>
                    <Statistic 
                      title="Successful" 
                      value={importResults.successful} 
                      valueStyle={{ color: '#3f8600' }}
                    />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card>
                    <Statistic 
                      title="Failed" 
                      value={importResults.failed} 
                      valueStyle={{ color: '#cf1322' }}
                    />
                  </Card>
                </Col>
              </Row>

              <Button type="primary" onClick={resetImport}>
                Import More Ingredients
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* CSV Upload Area (Step 0) */}
      {currentStep === 0 && (
        <Card title="Upload CSV File">
          <Dragger
            name="file"
            multiple={false}
            beforeUpload={handleFileUpload}
            accept=".csv"
            showUploadList={false}
          >
            <p className="ant-upload-drag-icon">
              <UploadOutlined />
            </p>
            <p className="ant-upload-text">Click or drag CSV file to this area to upload</p>
            <p className="ant-upload-hint">
              Only CSV files are supported. Make sure your file includes column headers.
            </p>
          </Dragger>
        </Card>
      )}

      {/* Manual Entry Modal */}
      <Modal
        title="Add New Ingredient"
        open={isManualModalVisible}
        onCancel={() => setIsManualModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleManualAdd}
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
                  {unitOptions.map(unit => (
                    <Option key={unit} value={unit}>
                      {unit === 'g' && 'Grams (g)'}
                      {unit === 'kg' && 'Kilograms (kg)'}
                      {unit === 'ml' && 'Milliliters (ml)'}
                      {unit === 'l' && 'Liters (l)'}
                      {unit === 'oz' && 'Ounces (oz)'}
                      {unit === 'lb' && 'Pounds (lb)'}
                      {unit === 'pcs' && 'Pieces (pcs)'}
                    </Option>
                  ))}
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
              <Button onClick={() => setIsManualModalVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                Add Ingredient
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default IngredientsImport;