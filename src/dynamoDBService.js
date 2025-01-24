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
  // Fetch user's assets
  fetchAssets: async (tableName, userEmail) => {
    const params = {
      TableName: tableName,
      FilterExpression: 'userEmail = :email',
      ExpressionAttributeValues: {
        ':email': userEmail
      }
    };

    try {
      const result = await dynamodb.scan(params).promise();
      return result.Items;
    } catch (error) {
      console.error(`Error fetching ${tableName}:`, error);
      return [];
    }
  },

  // Add new asset
  addAsset: async (tableName, asset) => {
    const params = {
      TableName: tableName,
      Item: {
        ...asset,
        id: uuidv4(),
        createdAt: new Date().toISOString()
      }
    };

    try {
      await dynamodb.put(params).promise();
      return params.Item;
    } catch (error) {
      console.error(`Error adding asset to ${tableName}:`, error);
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
      Key: { id: assetId },
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
  deleteAsset: async (tableName, assetId) => {
    const params = {
      TableName: tableName,
      Key: { id: assetId }
    };

    try {
      await dynamodb.delete(params).promise();
      return true;
    } catch (error) {
      console.error(`Error deleting asset from ${tableName}:`, error);
      return false;
    }
  },

  // Calculate total asset value
  calculateTotalValue: (assets, valueField = 'value') => {
    return assets.reduce((sum, asset) => sum + parseFloat(asset[valueField] || 0), 0);
  }
};

export default DynamoDBService;