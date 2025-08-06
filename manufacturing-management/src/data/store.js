// Simple localStorage-based data store for the manufacturing management system
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEYS = {
  INGREDIENTS: 'mms_ingredients',
  PRODUCTS: 'mms_products',
  RECIPES: 'mms_recipes',
  PRODUCT_MAPPINGS: 'mms_product_mappings',
};

// Helper functions
const getFromStorage = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Error reading from localStorage: ${key}`, error);
    return [];
  }
};

const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Error saving to localStorage: ${key}`, error);
    return false;
  }
};

// Ingredients Management
export const ingredientsStore = {
  getAll: () => getFromStorage(STORAGE_KEYS.INGREDIENTS),
  
  getById: (id) => {
    const ingredients = getFromStorage(STORAGE_KEYS.INGREDIENTS);
    return ingredients.find(ingredient => ingredient.id === id);
  },
  
  create: (ingredientData) => {
    const ingredients = getFromStorage(STORAGE_KEYS.INGREDIENTS);
    const newIngredient = {
      id: uuidv4(),
      ...ingredientData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    ingredients.push(newIngredient);
    saveToStorage(STORAGE_KEYS.INGREDIENTS, ingredients);
    return newIngredient;
  },
  
  update: (id, updates) => {
    const ingredients = getFromStorage(STORAGE_KEYS.INGREDIENTS);
    const index = ingredients.findIndex(ingredient => ingredient.id === id);
    if (index !== -1) {
      ingredients[index] = {
        ...ingredients[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      saveToStorage(STORAGE_KEYS.INGREDIENTS, ingredients);
      return ingredients[index];
    }
    return null;
  },
  
  delete: (id) => {
    const ingredients = getFromStorage(STORAGE_KEYS.INGREDIENTS);
    const filtered = ingredients.filter(ingredient => ingredient.id !== id);
    saveToStorage(STORAGE_KEYS.INGREDIENTS, filtered);
    return true;
  },
  
  bulkCreate: (ingredientsData) => {
    const ingredients = getFromStorage(STORAGE_KEYS.INGREDIENTS);
    const newIngredients = ingredientsData.map(data => ({
      id: uuidv4(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    ingredients.push(...newIngredients);
    saveToStorage(STORAGE_KEYS.INGREDIENTS, ingredients);
    return newIngredients;
  },
};

// Products Management
export const productsStore = {
  getAll: () => getFromStorage(STORAGE_KEYS.PRODUCTS),
  
  getById: (id) => {
    const products = getFromStorage(STORAGE_KEYS.PRODUCTS);
    return products.find(product => product.id === id);
  },
  
  create: (productData) => {
    const products = getFromStorage(STORAGE_KEYS.PRODUCTS);
    const newProduct = {
      id: uuidv4(),
      ...productData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    products.push(newProduct);
    saveToStorage(STORAGE_KEYS.PRODUCTS, products);
    return newProduct;
  },
  
  update: (id, updates) => {
    const products = getFromStorage(STORAGE_KEYS.PRODUCTS);
    const index = products.findIndex(product => product.id === id);
    if (index !== -1) {
      products[index] = {
        ...products[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      saveToStorage(STORAGE_KEYS.PRODUCTS, products);
      return products[index];
    }
    return null;
  },
  
  delete: (id) => {
    const products = getFromStorage(STORAGE_KEYS.PRODUCTS);
    const filtered = products.filter(product => product.id !== id);
    saveToStorage(STORAGE_KEYS.PRODUCTS, filtered);
    return true;
  },
};

// Recipes Management
export const recipesStore = {
  getAll: () => getFromStorage(STORAGE_KEYS.RECIPES),
  
  getById: (id) => {
    const recipes = getFromStorage(STORAGE_KEYS.RECIPES);
    return recipes.find(recipe => recipe.id === id);
  },
  
  create: (recipeData) => {
    const recipes = getFromStorage(STORAGE_KEYS.RECIPES);
    const newRecipe = {
      id: uuidv4(),
      ...recipeData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    recipes.push(newRecipe);
    saveToStorage(STORAGE_KEYS.RECIPES, recipes);
    return newRecipe;
  },
  
  update: (id, updates) => {
    const recipes = getFromStorage(STORAGE_KEYS.RECIPES);
    const index = recipes.findIndex(recipe => recipe.id === id);
    if (index !== -1) {
      recipes[index] = {
        ...recipes[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      saveToStorage(STORAGE_KEYS.RECIPES, recipes);
      return recipes[index];
    }
    return null;
  },
  
  delete: (id) => {
    const recipes = getFromStorage(STORAGE_KEYS.RECIPES);
    const filtered = recipes.filter(recipe => recipe.id !== id);
    saveToStorage(STORAGE_KEYS.RECIPES, filtered);
    return true;
  },
};

// Product Mappings Management
export const productMappingsStore = {
  getAll: () => getFromStorage(STORAGE_KEYS.PRODUCT_MAPPINGS),
  
  getById: (id) => {
    const mappings = getFromStorage(STORAGE_KEYS.PRODUCT_MAPPINGS);
    return mappings.find(mapping => mapping.id === id);
  },
  
  getByProductId: (productId) => {
    const mappings = getFromStorage(STORAGE_KEYS.PRODUCT_MAPPINGS);
    return mappings.filter(mapping => mapping.productId === productId);
  },
  
  create: (mappingData) => {
    const mappings = getFromStorage(STORAGE_KEYS.PRODUCT_MAPPINGS);
    const newMapping = {
      id: uuidv4(),
      ...mappingData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mappings.push(newMapping);
    saveToStorage(STORAGE_KEYS.PRODUCT_MAPPINGS, mappings);
    return newMapping;
  },
  
  update: (id, updates) => {
    const mappings = getFromStorage(STORAGE_KEYS.PRODUCT_MAPPINGS);
    const index = mappings.findIndex(mapping => mapping.id === id);
    if (index !== -1) {
      mappings[index] = {
        ...mappings[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      saveToStorage(STORAGE_KEYS.PRODUCT_MAPPINGS, mappings);
      return mappings[index];
    }
    return null;
  },
  
  delete: (id) => {
    const mappings = getFromStorage(STORAGE_KEYS.PRODUCT_MAPPINGS);
    const filtered = mappings.filter(mapping => mapping.id !== id);
    saveToStorage(STORAGE_KEYS.PRODUCT_MAPPINGS, filtered);
    return true;
  },
  
  deleteByProductId: (productId) => {
    const mappings = getFromStorage(STORAGE_KEYS.PRODUCT_MAPPINGS);
    const filtered = mappings.filter(mapping => mapping.productId !== productId);
    saveToStorage(STORAGE_KEYS.PRODUCT_MAPPINGS, filtered);
    return true;
  },
};

// Initialize with sample data if stores are empty
export const initializeSampleData = () => {
  if (getFromStorage(STORAGE_KEYS.INGREDIENTS).length === 0) {
    const sampleIngredients = [
      {
        name: 'Flour',
        code: 'FL001',
        unit: 'g',
        supplier: 'Grain Corp',
        status: 'active',
      },
      {
        name: 'Sugar',
        code: 'SG001',
        unit: 'g',
        supplier: 'Sweet Supply',
        status: 'active',
      },
      {
        name: 'Cocoa Powder',
        code: 'CP001',
        unit: 'g',
        supplier: 'Choco Inc',
        status: 'active',
      },
      {
        name: 'Vanilla Extract',
        code: 'VE001',
        unit: 'ml',
        supplier: 'Flavor Co',
        status: 'inactive',
      },
    ];
    
    sampleIngredients.forEach(ingredient => ingredientsStore.create(ingredient));
  }
};