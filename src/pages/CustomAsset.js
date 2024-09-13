import React, { useState, useEffect } from 'react';
import { collection, addDoc, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { Trash2 } from 'lucide-react';

function CustomAsset({ userEmail, asset, fetchCustomAssets, updateAssetTotal }) {
  const [assetItems, setAssetItems] = useState([]);
  const [newItem, setNewItem] = useState({});
  const [totalValue, setTotalValue] = useState(0);
  const [saveButtonText, setSaveButtonText] = useState('Add Item');

  useEffect(() => {
    fetchAssetItems();
  }, [asset.id]);

  const fetchAssetItems = async () => {
    try {
      const q = query(collection(db, `customAssets/${asset.id}/items`), where("userEmail", "==", userEmail));
      const querySnapshot = await getDocs(q);
      const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAssetItems(items);
      const newTotal = calculateTotalValue(items);
      setTotalValue(newTotal);
      updateAssetTotal(asset.id, newTotal);
    } catch (error) {
      console.error('Error fetching custom asset items:', error);
    }
  };

  const calculateTotalValue = (items) => {
    const valueField = asset.fields.find(field => field.type === 'number');
    return items.reduce((sum, item) => sum + (parseFloat(item[valueField.name]) || 0), 0);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem(prevItem => ({ ...prevItem, [name]: value }));
  };

  const handleAddItem = async () => {
    setSaveButtonText('Adding...');
    try {
      await addDoc(collection(db, `customAssets/${asset.id}/items`), {
        ...newItem,
        userEmail,
      });
      await fetchAssetItems();  // This will also update the total
      setNewItem({});
      setSaveButtonText('Added!');
      setTimeout(() => {
        setSaveButtonText('Add Item');
      }, 2000);
    } catch (error) {
      console.error('Error adding custom asset item:', error);
      alert('Failed to add item.');
      setSaveButtonText('Add Item');
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteDoc(doc(db, `customAssets/${asset.id}/items`, itemId));
        await fetchAssetItems();  // This will also update the total
      } catch (error) {
        console.error('Error deleting custom asset item:', error);
        alert('Failed to delete item.');
      }
    }
  };

  return (
    <div className="asset-form">
      <h2>{asset.name}</h2>
      {asset.fields.map(field => (
        <input
          key={field.name}
          type={field.type}
          name={field.name}
          placeholder={field.name}
          value={newItem[field.name] || ''}
          onChange={handleInputChange}
        />
      ))}
      <button onClick={handleAddItem}>{saveButtonText}</button>

      <h2>Total Value: ${totalValue.toFixed(2)}</h2>

      <h2>Saved Items</h2>
      <table>
        <thead>
          <tr>
            {asset.fields.map(field => (
              <th key={field.name}>{field.name}</th>
            ))}
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {assetItems.map(item => (
            <tr key={item.id}>
              {asset.fields.map(field => (
                <td key={field.name}>
                  {field.type === 'number' ? parseFloat(item[field.name]).toFixed(2) : item[field.name]}
                </td>
              ))}
              <td>
                <button onClick={() => handleDeleteItem(item.id)}>
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CustomAsset;