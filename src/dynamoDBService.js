import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

// Configure AWS
AWS.config.update({
  region: process.env.REACT_APP_AWS_REGION,
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY
});

const dynamodb = new AWS.DynamoDB.DocumentClient();

// Generic asset operations
const DynamoDBService = {
  // Fetch asset by ID from the CustomAssets table
  fetchAssetById: async (tableName, assetId) => {
    const params = {
      TableName: tableName,
      Key: { id: Number(assetId) }
    };

    try {
      const result = await dynamodb.get(params).promise();
      return result.Item;
    } catch (error) {
      console.error(`Error fetching asset from ${tableName}:`, error);
      return null;
    }
  },

  // Fetch all items for a custom asset from the CustomAssetItems table
  fetchAssetItems: async (tableName, assetId) => {
    const params = {
      TableName: tableName,
      FilterExpression: 'assetId = :assetId',
      ExpressionAttributeValues: {
        ':assetId': Number(assetId)
      }
    };

    try {
      const result = await dynamodb.scan(params).promise();
      return result.Items;
    } catch (error) {
      throw new Error(`Error fetching items from ${tableName}: ${error.message}`);
    }
  },

  // Add a new item to the CustomAssetItems table
  addAssetItem: async (tableName, item) => {
    const params = {
      TableName: tableName,
      Item: {
        ...item,
        id: item.id || uuidv4(), // Ensure id is unique
        assetId: Number(item.assetId) // Ensure assetId is a number
      }
    };

    try {
      await dynamodb.put(params).promise();
      return params.Item;
    } catch (error) {
      throw new Error(`Error adding item to ${tableName}: ${error.message}`);
    }
  },

  // Add new asset
  addAsset: async (tableName, asset) => {
    const params = {
      TableName: tableName,
      Item: {
        ...asset,
        id: asset.id || uuidv4(), // Ensure id is unique
        createdAt: new Date().toISOString(),
        userEmail: asset.userEmail // Ensure userEmail is included
      }
    };

    console.log('Saving asset with params:', params); // Debugging log

    try {
      await dynamodb.put(params).promise();
      console.log('Asset saved successfully:', params.Item); // Debugging log
      return params.Item;
    } catch (error) {
      throw new Error(`Error adding asset to ${tableName}: ${error.message}`);
    }
  },

  // Update asset
  updateAsset: async (tableName, assetId, updates) => {
    const updateExpression = Object.keys(updates)
      .map((key, index) => `#key${index} = :value${index}`)
      .join(', ');

    const expressionAttributeNames = Object.keys(updates)
      .reduce((acc, key, index) => ({
        ...acc,
        [`#key${index}`]: key
      }), {});

    const expressionAttributeValues = Object.keys(updates)
      .reduce((acc, key, index) => ({
        ...acc,
        [`:value${index}`]: updates[key]
      }), {});

    const params = {
      TableName: tableName,
      Key: { id: Number(assetId) }, // Ensure id is a number
      UpdateExpression: `SET ${updateExpression}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'UPDATED_NEW'
    };

    try {
      const result = await dynamodb.update(params).promise();
      return result.Attributes;
    } catch (error) {
      console.error(`Error updating asset in ${tableName}:`, error);
    }
  },

  // Delete asset
  deleteAsset: async (tableName, assetId, userEmail) => {
    try {
      console.log('Deleting item with params:', { tableName, assetId, userEmail });

      // Ensure assetId is a number
      const id = Number(assetId);

      // Define the key based on the table schema
      const key = {
        id: id, // Primary Key (number)
        userEmail: userEmail // Sort Key (string)
      };

      console.log('Key being used for deletion:', key);

      // Get full item details (optional, for debugging)
      const getParams = {
        TableName: tableName,
        Key: key
      };

      console.log('Fetching item with params:', getParams);

      const existingItem = await dynamodb.get(getParams).promise();

      console.log('Existing item details:', existingItem.Item);

      if (!existingItem.Item) {
        console.error('Item not found:', key);
        return false;
      }

      // Delete the item
      const deleteParams = {
        TableName: tableName,
        Key: key
      };

      console.log('Deleting item with params:', deleteParams);

      await dynamodb.delete(deleteParams).promise();
      return true;
    } catch (error) {
      console.error('Delete error:', {
        message: error.message,
        code: error.code,
        fullError: error
      });
      return false;
    }
  },

  deleteAssetItem: async (tableName, itemId, userEmail) => {
    try {
      console.log('Deleting asset item with params:', { tableName, itemId, userEmail });

      // Ensure itemId is a number
      const id = Number(itemId);

      // Define the key based on the table schema
      const key = {
        id: id, // Partition Key (number)
        userEmail: userEmail // Sort Key (string)
      };

      console.log('Key being used for deletion:', key);

      // Get full item details (optional, for debugging)
      const getParams = {
        TableName: tableName,
        Key: key
      };

      console.log('Fetching item with params:', getParams);

      const existingItem = await dynamodb.get(getParams).promise();

      console.log('Existing item details:', existingItem.Item);

      if (!existingItem.Item) {
        console.error('Item not found:', key);
        return false;
      }

      // Delete the item
      const deleteParams = {
        TableName: tableName,
        Key: key
      };

      console.log('Deleting item with params:', deleteParams);

      await dynamodb.delete(deleteParams).promise();
      return true;
    } catch (error) {
      console.error('Delete error:', {
        message: error.message,
        code: error.code,
        fullError: error
      });
      return false;
    }
  },

  // Fetch all assets for a specific table and user email
  fetchAssets: async (tableName, userEmail) => {
    const params = {
      TableName: tableName,
      FilterExpression: 'userEmail = :userEmail',
      ExpressionAttributeValues: {
        ':userEmail': userEmail
      }
    };

    try {
      const result = await dynamodb.scan(params).promise();
      return result.Items;
    } catch (error) {
      console.error(`Error fetching assets from ${tableName}:`, error);
      return [];
    }
  },

  // Calculate total asset value
  calculateTotalValue: (assets, valueField = 'value') => {
    return assets.reduce((sum, asset) => sum + parseFloat(asset[valueField] || 0), 0);
  }
};

export default DynamoDBService;