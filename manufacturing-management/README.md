# Manufacturing Management System

A comprehensive web-based manufacturing management system built with React, Vite, and Ant Design. This system helps manage ingredients, products, recipes, and manufacturing processes with a beautiful, modern interface.

## 🚀 Features

### Core Modules

#### 1. **Ingredients Management**
- ✅ Add, edit, and delete ingredient records
- ✅ Search and filter capabilities
- ✅ Status management (Active/Inactive)
- ✅ Supplier tracking
- ✅ Unit management (g, kg, ml, l, oz, lb, pcs)
- ✅ Bulk operations

#### 2. **Product Ingredient Mapping**
- ✅ Define product formulations with ingredient quantities
- ✅ Weight validation and balance checking
- ✅ Visual feedback for complete/incomplete formulations
- ✅ Clone existing product formulas
- ✅ Dynamic ingredient breakdown
- ✅ Percentage calculations

#### 3. **Recipe Management**
- ✅ Step-by-step manufacturing procedures
- ✅ Drag-and-drop step reordering
- ✅ Optional wait times per step
- ✅ Recipe preview functionality
- ✅ Link recipes to products
- ✅ Step validation

#### 4. **Product Management**
- ✅ Full product lifecycle management
- ✅ Link to ingredient breakdowns and recipes
- ✅ Status filtering and search
- ✅ Detailed product views with tabs
- ✅ Production readiness tracking
- ✅ Comprehensive product details

#### 5. **Ingredients Import**
- ✅ **Manual Entry**: Form-based ingredient addition
- ✅ **CSV Import**: Bulk upload with validation
  - Column mapping interface
  - Data validation and preview
  - Error highlighting and reporting
  - Downloadable sample CSV format
  - Step-by-step import process

### 🎨 UI/UX Features

- **Design Framework**: Ant Design components
- **Color Palette**: Emerald Green (#10B981) primary theme
- **Responsive Design**: Mobile-first approach
- **Modern Interface**: Clean, professional layout
- **Interactive Elements**: Hover effects, animations
- **Collapsible Sidebar**: Space-efficient navigation
- **Dark/Light Themes**: Professional color schemes

## 🛠️ Technology Stack

- **Frontend**: React 18 with functional components and hooks
- **Build Tool**: Vite for fast development and building
- **UI Library**: Ant Design for consistent, beautiful components
- **Routing**: React Router DOM for navigation
- **Drag & Drop**: @dnd-kit for recipe step reordering
- **CSV Processing**: PapaParse for file handling
- **Icons**: Ant Design Icons
- **Storage**: localStorage for data persistence
- **Styling**: CSS with custom themes

## 📦 Installation

1. **Clone or extract the project**
```bash
cd manufacturing-management
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

4. **Build for production**
```bash
npm run build
```

## 🏗️ Project Structure

```
src/
├── components/
│   └── Layout/
│       └── Sidebar.jsx          # Navigation sidebar
├── pages/
│   ├── Dashboard.jsx            # Main dashboard with statistics
│   ├── IngredientsManagement.jsx # Ingredients CRUD operations
│   ├── ProductMapping.jsx       # Product-ingredient mapping
│   ├── RecipeManagement.jsx     # Recipe creation and management
│   ├── ProductManagement.jsx    # Product lifecycle management
│   └── IngredientsImport.jsx    # CSV import and manual entry
├── data/
│   └── store.js                 # Data management and persistence
├── App.jsx                      # Main application component
├── App.css                      # Custom styling and themes
└── main.jsx                     # Application entry point
```

## 📊 Data Management

The system uses localStorage for data persistence with the following structure:

- **Ingredients**: Name, code, unit, supplier, status
- **Products**: Name, weight, unit, status, description
- **Recipes**: Name, description, steps with wait times
- **Product Mappings**: Product-ingredient quantity relationships

## 🎯 Usage Guide

### Getting Started

1. **Dashboard**: View overview statistics and quick actions
2. **Sample Data**: The system initializes with sample ingredients
3. **Navigation**: Use the sidebar to access different modules

### Managing Ingredients

1. Go to **Ingredients Management**
2. Use **Add Ingredient** for single entries
3. Filter by status or search by name/code/supplier
4. Edit or delete existing ingredients
5. Monitor active vs inactive ingredients

### Creating Products

1. Navigate to **Product Management**
2. Click **Add Product** and enter details
3. Specify package weight and unit
4. Set status (Active/Inactive)

### Product Formulation

1. Go to **Product Mapping**
2. Select a product from the list
3. Add ingredients with specific quantities
4. Monitor weight validation alerts
5. Ensure total matches package weight

### Recipe Creation

1. Visit **Recipe Management**
2. Create new recipes with descriptions
3. Add steps with optional wait times
4. Drag and drop to reorder steps
5. Link recipes to products
6. Preview complete recipes

### Bulk Import

1. Go to **Import Data**
2. Download sample CSV format
3. Prepare your data file
4. Upload and map columns
5. Review validation results
6. Import valid rows

## 🔧 Customization

### Color Themes

The primary color can be changed in `src/App.jsx`:

```javascript
const theme = {
  token: {
    colorPrimary: '#10B981', // Change this value
    colorBgContainer: '#ffffff',
    colorBgLayout: '#F3F4F6',
    borderRadius: 8,
  },
};
```

### Adding New Fields

To add new fields to ingredients:

1. Update `requiredFields` in data store
2. Add form fields in management components
3. Update table columns
4. Modify validation rules

## 📱 Responsive Design

The system is fully responsive with breakpoints:

- **Mobile**: < 768px (collapsible sidebar, stacked layouts)
- **Tablet**: 768px - 1024px (adaptive grids)
- **Desktop**: > 1024px (full sidebar, multi-column layouts)

## 🔍 Search and Filtering

- **Global Search**: Available in most modules
- **Status Filtering**: Active/Inactive filtering
- **Real-time Updates**: Instant search results
- **Multi-field Search**: Name, code, supplier matching

## 📈 Future Enhancements

Potential features for expansion:

- **User Authentication**: Multi-user support
- **Inventory Tracking**: Stock levels and alerts
- **Production Scheduling**: Manufacturing calendar
- **Reporting**: Analytics and insights
- **API Integration**: External system connectivity
- **Barcode Scanning**: Mobile ingredient scanning
- **Batch Tracking**: Production batch management
- **Cost Calculation**: Ingredient cost tracking

## 🐛 Troubleshooting

### Common Issues

1. **Data Not Persisting**: Check localStorage availability
2. **CSV Import Failing**: Ensure proper UTF-8 encoding
3. **Drag & Drop Not Working**: Verify @dnd-kit installation
4. **Responsive Issues**: Clear browser cache

### Browser Compatibility

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## 📄 License

This project is available for educational and commercial use. Feel free to modify and distribute according to your needs.

## 🤝 Contributing

1. Fork the repository
2. Create feature branches
3. Submit pull requests
4. Follow existing code style
5. Add appropriate tests

## 📞 Support

For issues or questions:

1. Check the troubleshooting section
2. Review the usage guide
3. Examine the code documentation
4. Create detailed issue reports

---

**Manufacturing Management System** - Streamlining production processes with modern web technology.
