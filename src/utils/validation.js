/**
 * Client-side validation utilities for asset forms
 * These complement the Firestore security rules
 */

/**
 * Validate stock data
 * @param {Object} data - Stock data to validate
 * @returns {Object} - { isValid: boolean, errors: Object }
 */
export const validateStock = (data) => {
  const errors = {};

  if (!data.symbol || data.symbol.trim().length === 0) {
    errors.symbol = 'Stock symbol is required';
  } else if (data.symbol.length > 10) {
    errors.symbol = 'Symbol must be 10 characters or less';
  } else if (!/^[a-zA-Z.]+$/.test(data.symbol)) {
    errors.symbol = 'Symbol can only contain letters and periods';
  }

  if (data.shares === undefined || data.shares === null) {
    errors.shares = 'Number of shares is required';
  } else if (data.shares <= 0) {
    errors.shares = 'Number of shares must be greater than 0';
  } else if (typeof data.shares !== 'number') {
    errors.shares = 'Number of shares must be a number';
  }

  if (data.price === undefined || data.price === null) {
    errors.price = 'Price is required';
  } else if (data.price < 0) {
    errors.price = 'Price must be a positive number';
  } else if (typeof data.price !== 'number') {
    errors.price = 'Price must be a number';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate cash data
 * @param {Object} data - Cash data to validate
 * @returns {Object} - { isValid: boolean, errors: Object }
 */
export const validateCash = (data) => {
  const errors = {};

  if (!data.name || data.name.trim().length === 0) {
    errors.name = 'Account name is required';
  } else if (data.name.length > 100) {
    errors.name = 'Name must be 100 characters or less';
  }

  if (data.amount === undefined || data.amount === null) {
    errors.amount = 'Amount is required';
  } else if (data.amount < 0) {
    errors.amount = 'Amount must be a positive number';
  } else if (typeof data.amount !== 'number') {
    errors.amount = 'Amount must be a number';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate auto/vehicle data
 * @param {Object} data - Auto data to validate
 * @returns {Object} - { isValid: boolean, errors: Object }
 */
export const validateAuto = (data) => {
  const errors = {};

  if (!data.make || data.make.trim().length === 0) {
    errors.make = 'Make is required';
  }

  if (!data.model || data.model.trim().length === 0) {
    errors.model = 'Model is required';
  }

  if (data.year === undefined || data.year === null) {
    errors.year = 'Year is required';
  } else if (data.year < 1900 || data.year > 2100) {
    errors.year = 'Year must be between 1900 and 2100';
  }

  if (data.value === undefined || data.value === null) {
    errors.value = 'Value is required';
  } else if (data.value < 0) {
    errors.value = 'Value must be a positive number';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate metal data
 * @param {Object} data - Metal data to validate
 * @returns {Object} - { isValid: boolean, errors: Object }
 */
export const validateMetal = (data) => {
  const errors = {};

  if (!data.type || data.type.trim().length === 0) {
    errors.type = 'Metal type is required';
  }

  if (data.weight === undefined || data.weight === null) {
    errors.weight = 'Weight is required';
  } else if (data.weight <= 0) {
    errors.weight = 'Weight must be greater than 0';
  }

  if (data.pricePerUnit === undefined || data.pricePerUnit === null) {
    errors.pricePerUnit = 'Price per unit is required';
  } else if (data.pricePerUnit < 0) {
    errors.pricePerUnit = 'Price per unit must be a positive number';
  }

  if (data.total === undefined || data.total === null) {
    errors.total = 'Total value is required';
  } else if (data.total < 0) {
    errors.total = 'Total value must be a positive number';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate property data
 * @param {Object} data - Property data to validate
 * @returns {Object} - { isValid: boolean, errors: Object }
 */
export const validateProperty = (data) => {
  const errors = {};

  if (!data.address || data.address.trim().length === 0) {
    errors.address = 'Address is required';
  } else if (data.address.length > 500) {
    errors.address = 'Address must be 500 characters or less';
  }

  if (data.price === undefined || data.price === null) {
    errors.price = 'Price is required';
  } else if (data.price <= 0) {
    errors.price = 'Price must be greater than 0';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate loan data
 * @param {Object} data - Loan data to validate
 * @returns {Object} - { isValid: boolean, errors: Object }
 */
export const validateLoan = (data) => {
  const errors = {};

  if (!data.name || data.name.trim().length === 0) {
    errors.name = 'Loan name is required';
  } else if (data.name.length > 100) {
    errors.name = 'Name must be 100 characters or less';
  }

  if (data.loanValue === undefined || data.loanValue === null) {
    errors.loanValue = 'Loan value is required';
  } else if (data.loanValue < 0) {
    errors.loanValue = 'Loan value must be a positive number';
  }

  if (data.interestRate === undefined || data.interestRate === null) {
    errors.interestRate = 'Interest rate is required';
  } else if (data.interestRate < 0 || data.interestRate > 100) {
    errors.interestRate = 'Interest rate must be between 0 and 100';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate cryptocurrency data
 * @param {Object} data - Crypto data to validate
 * @returns {Object} - { isValid: boolean, errors: Object }
 */
export const validateCrypto = (data) => {
  const errors = {};

  if (!data.name || data.name.trim().length === 0) {
    errors.name = 'Cryptocurrency name is required';
  } else if (data.name.length > 50) {
    errors.name = 'Name must be 50 characters or less';
  }

  if (!data.symbol || data.symbol.trim().length === 0) {
    errors.symbol = 'Symbol is required';
  } else if (data.symbol.length > 10) {
    errors.symbol = 'Symbol must be 10 characters or less';
  }

  if (data.amount === undefined || data.amount === null) {
    errors.amount = 'Amount is required';
  } else if (data.amount <= 0) {
    errors.amount = 'Amount must be greater than 0';
  }

  if (data.price === undefined || data.price === null) {
    errors.price = 'Price is required';
  } else if (data.price < 0) {
    errors.price = 'Price must be a positive number';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate custom asset data
 * @param {Object} data - Custom asset data to validate
 * @returns {Object} - { isValid: boolean, errors: Object }
 */
export const validateCustomAsset = (data) => {
  const errors = {};

  if (!data.name || data.name.trim().length === 0) {
    errors.name = 'Asset name is required';
  } else if (data.name.length > 100) {
    errors.name = 'Name must be 100 characters or less';
  }

  if (data.totalValue === undefined || data.totalValue === null) {
    errors.totalValue = 'Total value is required';
  } else if (data.totalValue < 0) {
    errors.totalValue = 'Total value must be a positive number';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate custom asset item data
 * @param {Object} data - Custom asset item data to validate
 * @returns {Object} - { isValid: boolean, errors: Object }
 */
export const validateCustomAssetItem = (data) => {
  const errors = {};

  if (!data.assetId || data.assetId.trim().length === 0) {
    errors.assetId = 'Asset ID is required';
  }

  if (!data.name || data.name.trim().length === 0) {
    errors.name = 'Item name is required';
  } else if (data.name.length > 200) {
    errors.name = 'Name must be 200 characters or less';
  }

  if (data.value === undefined || data.value === null) {
    errors.value = 'Value is required';
  } else if (data.value < 0) {
    errors.value = 'Value must be a positive number';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Format currency for display
 * @param {number} value - Value to format
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

/**
 * Parse currency string to number
 * @param {string} value - Currency string to parse
 * @returns {number} - Parsed number
 */
export const parseCurrency = (value) => {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  
  // Remove currency symbols, commas, and spaces
  const cleaned = value.replace(/[$,€£¥\s]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

export default {
  validateStock,
  validateCash,
  validateAuto,
  validateMetal,
  validateProperty,
  validateLoan,
  validateCrypto,
  validateCustomAsset,
  validateCustomAssetItem,
  formatCurrency,
  parseCurrency
};