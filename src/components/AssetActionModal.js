import React, { useState } from 'react';
import { X } from 'lucide-react';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

const CustomAssetCard = ({ asset, onView, onDelete }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteClick = (e) => {
    e.stopPropagation(); // Prevent triggering onView
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteDoc(doc(db, 'customAssets', asset.id));
      await onDelete();
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Error deleting asset:', error);
      alert('Failed to delete asset.');
    }
  };

  return (
    <div className="custom-asset-card" onClick={onView}>
      <div className="custom-asset-delete-icon" onClick={handleDeleteClick}>
        <X size={20} />
      </div>
      <h3>{asset.name}</h3>
      <p>Total Value: ${parseFloat(asset.totalValue || 0).toFixed(2)}</p>
      {showDeleteConfirm && (
        <div className="delete-confirm-overlay">
          <div className="delete-confirm-modal">
            <p>Are you sure you want to delete this asset?</p>
            <div className="delete-confirm-buttons">
              <button onClick={confirmDelete} className="delete">OK</button>
              <button onClick={() => setShowDeleteConfirm(false)} className="cancel">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomAssetCard;