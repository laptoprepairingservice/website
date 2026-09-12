"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { getCurrentUserAction } from "./_components/get-current-user-action";
import {
  addToCartAction,
  clearUserCartAction,
  getCurrentUserCartAction,
  removeCartItemAction,
  syncGuestCartAction,
  updateCartQuantityAction,
} from "./_components/cart-actions";
import {
  clearGuestCart,
  computeCartCount,
  computeCartSubtotal,
  createCartItem,
  getGuestCart,
  saveGuestCart,
  updateLocalCart,
} from "./cart-utils";
import {
  addToWishlistAction,
  clearUserWishlistAction,
  getCurrentUserWishlistAction,
  removeFromWishlistAction,
  toggleWishlistAction,
} from "./_components/wishlist-actions";
import {
  computeWishlistCount,
  isProductInWishlist,
} from "./wishlist-utils";

const AppContext = createContext(null);

export function AppProvider({
  children,
  user: initialUser = null,
  initialCart = null,
  userCart: legacyUserCart = null,
  initialWishlist = null,
}) {
  const [user, setUser] = useState(initialUser);

  const cartProp = initialCart ?? legacyUserCart ?? null;
  const [userCart, setUserCart] = useState({
    id: cartProp?.id ?? null,
    items: cartProp?.items ?? [],
  });

  const [userWishlist, setUserWishlist] = useState({
    id: initialWishlist?.id ?? null,
    items: initialWishlist?.items ?? [],
  });

  const isAuthenticated = Boolean(user && !user.isGuest);

  /*
   * Load guest cart / sync cart and load wishlist after authentication.
   */
  useEffect(() => {
    async function initializeData() {
      const guestItems = getGuestCart();

      if (isAuthenticated) {
        // Sync cart
        if (guestItems.length) {
          const result = await syncGuestCartAction(guestItems);

          if (result?.success && result.cart) {
            setUserCart(result.cart);
            clearGuestCart();
          }
        } else {
          const cart = await getCurrentUserCartAction();
          if (cart) {
            setUserCart(cart);
          }
        }

        // Initialize / sync wishlist
        const wishlist = await getCurrentUserWishlistAction();
        if (wishlist) {
          setUserWishlist(wishlist);
        }
        return;
      }

      // Guest mode
      if (guestItems.length) {
        setUserCart({
          id: null,
          items: guestItems,
        });
      }

      // Wishlist requires login, reset in guest mode
      setUserWishlist({
        id: null,
        items: [],
      });
    }

    initializeData();
  }, [isAuthenticated]);

  const refreshUser = useCallback(async () => {
    const nextUser = await getCurrentUserAction();
    setUser(nextUser);
    return nextUser;
  }, []);

  /* -------------------------------------------------------------------------- */
  /* CART ACTIONS                                                               */
  /* -------------------------------------------------------------------------- */

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      const items = getGuestCart();
      setUserCart({ id: null, items });
      return { id: null, items };
    }

    const cart = await getCurrentUserCartAction();
    if (cart) {
      setUserCart(cart);
    }
    return cart;
  }, [isAuthenticated]);

  const addToCart = useCallback(
    async (product, quantity = 1, variantId = null) => {
      const item = createCartItem(product, quantity, variantId);
      if (!item) return;

      /*
       * Guest cart: localStorage is the source of truth
       */
      if (!isAuthenticated) {
        setUserCart((prev) => {
          const items = updateLocalCart(prev.items, item);
          saveGuestCart(items);
          return {
            ...prev,
            items,
          };
        });
        return;
      }

      /*
       * Authenticated cart: Supabase is the source of truth
       */
      try {
        const result = await addToCartAction(item.variantId, item.quantity);
        if (result?.success && result.cart) {
          setUserCart(result.cart);
        }
      } catch (error) {
        console.error("Failed to add cart item:", error);
      }
    },
    [isAuthenticated]
  );

  const updateQuantity = useCallback(
    async (variantId, delta) => {
      if (!isAuthenticated) {
        setUserCart((prev) => {
          const items = prev.items
            .map((item) => {
              if (String(item.variantId) !== String(variantId)) {
                return item;
              }

              const quantity = item.quantity + delta;
              return quantity > 0 ? { ...item, quantity } : null;
            })
            .filter(Boolean);

          saveGuestCart(items);
          return {
            ...prev,
            items,
          };
        });
        return;
      }

      const item = userCart.items.find(
        (item) =>
          String(item.variantId) === String(variantId) ||
          String(item.id) === String(variantId)
      );

      if (!item) return;

      const quantity = item.quantity + delta;

      try {
        const result = await updateCartQuantityAction(
          item.cartItemId || item.id,
          quantity
        );

        if (result?.success && result.cart) {
          setUserCart(result.cart);
        }
      } catch (error) {
        console.error("Failed to update cart:", error);
      }
    },
    [isAuthenticated, userCart.items]
  );

  const removeFromCart = useCallback(
    async (variantId) => {
      if (!isAuthenticated) {
        setUserCart((prev) => {
          const items = prev.items.filter(
            (item) =>
              String(item.variantId) !== String(variantId) &&
              String(item.id) !== String(variantId)
          );

          saveGuestCart(items);
          return {
            ...prev,
            items,
          };
        });
        return;
      }

      const item = userCart.items.find(
        (item) =>
          String(item.variantId) === String(variantId) ||
          String(item.id) === String(variantId)
      );

      if (!item) return;

      try {
        const result = await removeCartItemAction(item.cartItemId || item.id);

        if (result?.success && result.cart) {
          setUserCart(result.cart);
        }
      } catch (error) {
        console.error("Failed to remove cart item:", error);
      }
    },
    [isAuthenticated, userCart.items]
  );

  const clearCart = useCallback(async () => {
    if (!isAuthenticated) {
      clearGuestCart();
      setUserCart({ id: null, items: [] });
      return;
    }

    try {
      const result = await clearUserCartAction();
      if (result?.success && result.cart) {
        setUserCart(result.cart);
      }
    } catch (error) {
      console.error("Failed to clear cart:", error);
    }
  }, [isAuthenticated]);

  /* -------------------------------------------------------------------------- */
  /* WISHLIST ACTIONS                                                           */
  /* -------------------------------------------------------------------------- */

  const refreshWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setUserWishlist({ id: null, items: [] });
      return { id: null, items: [] };
    }

    const wishlist = await getCurrentUserWishlistAction();
    if (wishlist) {
      setUserWishlist(wishlist);
    }
    return wishlist;
  }, [isAuthenticated]);

  const isInWishlist = useCallback(
    (productId) => {
      if (!isAuthenticated) return false;
      return isProductInWishlist(userWishlist.items, productId);
    },
    [isAuthenticated, userWishlist.items]
  );

  const addToWishlist = useCallback(
    async (product) => {
      if (!isAuthenticated) {
        return { success: false, requiresAuth: true };
      }

      const productId = product?.id || product?.productId || product;
      if (!productId) return { success: false };

      try {
        const result = await addToWishlistAction(productId);
        if (result?.success && result.wishlist) {
          setUserWishlist(result.wishlist);
        }
        return result;
      } catch (error) {
        console.error("Failed to add to wishlist:", error);
        return { success: false, error: error.message };
      }
    },
    [isAuthenticated]
  );

  const removeFromWishlist = useCallback(
    async (productId) => {
      if (!isAuthenticated) {
        return { success: false, requiresAuth: true };
      }

      const targetId = productId?.id || productId?.productId || productId;
      if (!targetId) return { success: false };

      try {
        const result = await removeFromWishlistAction(targetId);
        if (result?.success && result.wishlist) {
          setUserWishlist(result.wishlist);
        }
        return result;
      } catch (error) {
        console.error("Failed to remove from wishlist:", error);
        return { success: false, error: error.message };
      }
    },
    [isAuthenticated]
  );

  const toggleWishlist = useCallback(
    async (product) => {
      if (!isAuthenticated) {
        return { success: false, requiresAuth: true };
      }

      const productId = product?.id || product?.productId || product;
      if (!productId) return { success: false };

      try {
        const result = await toggleWishlistAction(productId);
        if (result?.success && result.wishlist) {
          setUserWishlist(result.wishlist);
        }
        return result;
      } catch (error) {
        console.error("Failed to toggle wishlist:", error);
        return { success: false, error: error.message };
      }
    },
    [isAuthenticated]
  );

  const clearWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setUserWishlist({ id: null, items: [] });
      return;
    }

    try {
      const result = await clearUserWishlistAction();
      if (result?.success && result.wishlist) {
        setUserWishlist(result.wishlist);
      }
    } catch (error) {
      console.error("Failed to clear wishlist:", error);
    }
  }, [isAuthenticated]);

  /* -------------------------------------------------------------------------- */
  /* COMPUTED VALUES                                                            */
  /* -------------------------------------------------------------------------- */

  const cartItems = userCart.items;

  const cartCount = useMemo(
    () => computeCartCount(cartItems),
    [cartItems]
  );

  const cartSubtotal = useMemo(
    () => computeCartSubtotal(cartItems),
    [cartItems]
  );

  const wishlistItems = userWishlist.items;

  const wishlistCount = useMemo(
    () => computeWishlistCount(wishlistItems),
    [wishlistItems]
  );

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,

      // Cart
      userCart,
      cartItems,
      cartCount,
      cartSubtotal,
      refreshCart,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,

      // Wishlist
      userWishlist,
      wishlistItems,
      wishlistCount,
      isInWishlist,
      addToWishlist,
      removeFromWishlist,
      toggleWishlist,
      clearWishlist,
      refreshWishlist,

      // User
      refreshUser,
    }),
    [
      user,
      isAuthenticated,
      userCart,
      cartItems,
      cartCount,
      cartSubtotal,
      refreshCart,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      userWishlist,
      wishlistItems,
      wishlistCount,
      isInWishlist,
      addToWishlist,
      removeFromWishlist,
      toggleWishlist,
      clearWishlist,
      refreshWishlist,
      refreshUser,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }

  return context;
}
