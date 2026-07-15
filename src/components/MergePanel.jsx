import React, { useState } from 'react';
import '../styles/MergePanel.css';

/**
 * MergePanel Component
 * Dedicated UI to merge two different wishlists. Contains options selectors, Name inputs,
 * logical explanations, and merges.
 */
export default function MergePanel({ 
  wishlists, 
  mergeWishlists, 
  onTriggerToast, 
  onMergeSuccess,
  goToStore,
  goToWishlists
}) {
  const [sourceId1, setSourceId1] = useState('');
  const [sourceId2, setSourceId2] = useState('');
  const [newListName, setNewListName] = useState('');

  const handleMerge = (e) => {
    e.preventDefault();

    if (!sourceId1 || !sourceId2) {
      onTriggerToast('Please select two wishlists to merge.', 'error');
      return;
    }

    if (sourceId1 === sourceId2) {
      onTriggerToast('Cannot merge a wishlist with itself.', 'error');
      return;
    }

    const res = mergeWishlists(sourceId1, sourceId2, newListName);
    if (res.success) {
      onTriggerToast(res.message, 'success');
      setSourceId1('');
      setSourceId2('');
      setNewListName('');
      if (onMergeSuccess) {
        onMergeSuccess(); // Redirect to wishlists tab
      }
    } else {
      onTriggerToast(res.message, 'error');
    }
  };

  const getWishlistName = (id) => {
    const list = wishlists.find(w => w.id === id);
    return list ? list.name : '';
  };

  // If there are fewer than 2 wishlists, render a helpful empty state
  if (wishlists.length < 2) {
    return (
      <div className="merge-view-container">
        <div className="merge-empty-container">
          <div className="merge-empty-icon" aria-hidden="true">⇄</div>
          <h3>Merge Center Locked</h3>
          <p>
            Merging combines items from two lists. You currently have {wishlists.length} active wishlist{wishlists.length === 1 ? '' : 's'}. 
            Create and populate at least two wishlists to unlock the Merge Center.
          </p>
          <div className="merge-empty-actions">
            <button className="merge-empty-btn" onClick={goToStore}>
              Browse Store Catalog
            </button>
            <button className="merge-empty-btn secondary" onClick={goToWishlists}>
              Manage Wishlists
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Preview elements of merge
  const source1 = wishlists.find(w => w.id === sourceId1);
  const source2 = wishlists.find(w => w.id === sourceId2);
  const source1Count = source1 ? source1.productIds.length : 0;
  const source2Count = source2 ? source2.productIds.length : 0;

  return (
    <div className="merge-view-container">
      {/* Configuration Card */}
      <section className="merge-card">
        <h2 className="merge-card-title">Configure Merge</h2>
        <form onSubmit={handleMerge} className="merge-form">
          <div className="form-group">
            <label htmlFor="source-1-select">Primary Wishlist (Preserves Order)</label>
            <select
              id="source-1-select"
              className="merge-select"
              value={sourceId1}
              onChange={(e) => setSourceId1(e.target.value)}
              required
            >
              <option value="" disabled>-- Select primary wishlist --</option>
              {wishlists.map(w => (
                <option key={w.id} value={w.id}>{w.name} ({w.productIds.length} items)</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="source-2-select">Secondary Wishlist (Appends Unique Items)</label>
            <select
              id="source-2-select"
              className="merge-select"
              value={sourceId2}
              onChange={(e) => setSourceId2(e.target.value)}
              required
            >
              <option value="" disabled>-- Select secondary wishlist --</option>
              {wishlists.map(w => (
                <option 
                  key={w.id} 
                  value={w.id}
                  disabled={w.id === sourceId1}
                >
                  {w.name} ({w.productIds.length} items)
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="new-list-name-input">New Merged Wishlist Name</label>
            <input
              type="text"
              id="new-list-name-input"
              className="merge-input"
              placeholder="e.g. Combined Tech Gears"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              maxLength={30}
              required
            />
          </div>

          <button type="submit" className="submit-merge-btn">
            Merge Wishlists
          </button>
        </form>
      </section>

      {/* Info & Rule Panel */}
      <aside className="merge-info-panel">
        <div className="merge-info-card">
          <h3 className="merge-info-title">
            <span aria-hidden="true">⇄</span> Merging Logic Rules
          </h3>
          <ul className="merge-rules-list">
            <li className="merge-rule-item">
              <span className="merge-rule-icon">✔</span>
              <span>
                <strong>Originals Preserved:</strong> Both source wishlists remain unchanged in your archives.
              </span>
            </li>
            <li className="merge-rule-item">
              <span className="merge-rule-icon">✔</span>
              <span>
                <strong>Order Preservation:</strong> Products from the primary wishlist will occupy the first positions, in their exact original order.
              </span>
            </li>
            <li className="merge-rule-item">
              <span className="merge-rule-icon">✔</span>
              <span>
                <strong>Deduplication:</strong> Unique items from the secondary wishlist will be appended to the end. Duplicate products (matching IDs) will be filtered out.
              </span>
            </li>
          </ul>
        </div>

        {/* Dynamic preview block */}
        {(sourceId1 || sourceId2) && (
          <div className="merge-preview-container">
            <h4 className="preview-title">Merge Summary</h4>
            <div className="preview-tags-row">
              {sourceId1 && (
                <span className="preview-tag">
                  Primary: <strong>{getWishlistName(sourceId1)}</strong> ({source1Count} items)
                </span>
              )}
              {sourceId2 && (
                <span className="preview-tag">
                  Secondary: <strong>{getWishlistName(sourceId2)}</strong> ({source2Count} items)
                </span>
              )}
            </div>
            {sourceId1 && sourceId2 && (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Merging will result in a brand new wishlist containing up to {source1Count + source2Count} unique items.
              </p>
            )}
          </div>
        )}
      </aside>
    </div>
  );
}
