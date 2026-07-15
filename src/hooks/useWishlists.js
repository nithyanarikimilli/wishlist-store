import { useState, useEffect, useCallback } from 'react';

const LOCAL_STORAGE_KEY = 'ecommerce_wishlists';

// Helper to validate the wishlist name
export const validateWishlistName = (name) => {
  const trimmed = name.trim();
  if (!trimmed) {
    return { isValid: false, reason: 'Wishlist name cannot be empty.' };
  }
  if (trimmed.length > 30) {
    return { isValid: false, reason: 'Wishlist name must be 30 characters or less.' };
  }
  // Allow letters, numbers, spaces, dashes, underscores
  const regex = /^[a-zA-Z0-9\s-_]+$/;
  if (!regex.test(trimmed)) {
    return { isValid: false, reason: 'Name can only contain letters, numbers, spaces, hyphens, and underscores.' };
  }
  return { isValid: true, sanitized: trimmed };
};

// Helper to check if a retrieved object matches our wishlist schema
const isValidWishlistSchema = (item) => {
  return (
    item &&
    typeof item.id === 'string' &&
    typeof item.name === 'string' &&
    Array.isArray(item.productIds) &&
    item.productIds.every(id => typeof id === 'number') &&
    typeof item.createdAt === 'string'
  );
};

export default function useWishlists(onTriggerToast) {
  const [wishlists, setWishlists] = useState(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!stored) return [];
      
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.every(isValidWishlistSchema)) {
        return parsed;
      } else {
        // Corrupt schema
        console.warn('LocalStorage data has corrupt schema, resetting.');
        if (onTriggerToast) {
          onTriggerToast('Corrupted database detected. Wishlists reset.', 'error');
        }
        return [];
      }
    } catch (e) {
      console.error('Error parsing localStorage wishlists:', e);
      if (onTriggerToast) {
        onTriggerToast('Failed to load wishlists from storage.', 'error');
      }
      return [];
    }
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(wishlists));
    } catch (e) {
      console.error('Failed to save wishlists to localStorage:', e);
      if (onTriggerToast) {
        onTriggerToast('Storage full! Cannot save wishlists.', 'error');
      }
    }
  }, [wishlists, onTriggerToast]);

  // Create a new wishlist
  const createWishlist = useCallback((name) => {
    const validation = validateWishlistName(name);
    if (!validation.isValid) {
      return { success: false, message: validation.reason };
    }

    const nameExists = wishlists.some(
      (w) => w.name.toLowerCase() === validation.sanitized.toLowerCase()
    );
    if (nameExists) {
      return { success: false, message: `A wishlist named "${validation.sanitized}" already exists.` };
    }

    const newWishlist = {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).substring(2, 9),
      name: validation.sanitized,
      productIds: [],
      createdAt: new Date().toISOString(),
    };

    setWishlists((prev) => [newWishlist, ...prev]);
    return { success: true, message: `Wishlist "${validation.sanitized}" created successfully!`, id: newWishlist.id };
  }, [wishlists]);

  // Delete a wishlist
  const deleteWishlist = useCallback((id) => {
    const target = wishlists.find((w) => w.id === id);
    if (!target) {
      return { success: false, message: 'Wishlist not found.' };
    }

    setWishlists((prev) => prev.filter((w) => w.id !== id));
    return { success: true, message: `Wishlist "${target.name}" deleted successfully.` };
  }, [wishlists]);

  // Add a product to a wishlist
  const addProductToWishlist = useCallback((wishlistId, productId) => {
    const target = wishlists.find((w) => w.id === wishlistId);
    if (!target) {
      return { success: false, message: 'Wishlist not found.' };
    }

    if (target.productIds.includes(productId)) {
      return { success: false, message: 'This product is already in this wishlist.' };
    }

    setWishlists((prev) =>
      prev.map((w) =>
        w.id === wishlistId ? { ...w, productIds: [...w.productIds, productId] } : w
      )
    );
    return { success: true, message: `Added to "${target.name}".` };
  }, [wishlists]);

  // Remove a product from a wishlist
  const removeProductFromWishlist = useCallback((wishlistId, productId) => {
    const target = wishlists.find((w) => w.id === wishlistId);
    if (!target) {
      return { success: false, message: 'Wishlist not found.' };
    }

    if (!target.productIds.includes(productId)) {
      return { success: false, message: 'Product not found in this wishlist.' };
    }

    setWishlists((prev) =>
      prev.map((w) =>
        w.id === wishlistId
          ? { ...w, productIds: w.productIds.filter((id) => id !== productId) }
          : w
      )
    );
    return { success: true, message: `Removed from "${target.name}".` };
  }, [wishlists]);

  // Merge two wishlists
  const mergeWishlists = useCallback((id1, id2, newName) => {
    if (id1 === id2) {
      return { success: false, message: 'Cannot merge a wishlist with itself.' };
    }

    const list1 = wishlists.find((w) => w.id === id1);
    const list2 = wishlists.find((w) => w.id === id2);

    if (!list1 || !list2) {
      return { success: false, message: 'One or both of the selected wishlists were not found.' };
    }

    const validation = validateWishlistName(newName);
    if (!validation.isValid) {
      return { success: false, message: validation.reason };
    }

    const nameExists = wishlists.some(
      (w) => w.name.toLowerCase() === validation.sanitized.toLowerCase()
    );
    if (nameExists) {
      return { success: false, message: `A wishlist named "${validation.sanitized}" already exists.` };
    }

    // Preserve order from list1, then append unique items from list2
    const mergedIds = [...list1.productIds];
    list2.productIds.forEach((pid) => {
      if (!mergedIds.includes(pid)) {
        mergedIds.push(pid);
      }
    });

    const newWishlist = {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).substring(2, 9),
      name: validation.sanitized,
      productIds: mergedIds,
      createdAt: new Date().toISOString(),
    };

    setWishlists((prev) => [newWishlist, ...prev]);
    
    let successMessage = `Merged successfully into "${validation.sanitized}"!`;
    if (mergedIds.length === 0) {
      successMessage = `Merged successfully into "${validation.sanitized}", but the list is empty.`;
    }

    return { success: true, message: successMessage, id: newWishlist.id };
  }, [wishlists]);

  return {
    wishlists,
    createWishlist,
    deleteWishlist,
    addProductToWishlist,
    removeProductFromWishlist,
    mergeWishlists,
  };
}
