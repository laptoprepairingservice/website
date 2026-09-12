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

const AppContext = createContext(null);

export function AppProvider({
  children,
  user: initialUser = null,
  initialCart = null,
  userCart: legacyUserCart = null,
}) {
  const [user, setUser] = useState(initialUser);

  const cartProp = initialCart ?? legacyUserCart ?? null;
  const [userCart, setUserCart] = useState({
    id: cartProp?.id ?? null,
    items: cartProp?.items ?? [],
  });

  const isAuthenticated = Boolean(user && !user.isGuest);

  /*
   * Load guest cart / sync cart after authentication.
   */
  useEffect(() => {
    async function initializeCart() {
      const guestItems = getGuestCart();

      if (isAuthenticated) {
        if (guestItems.length) {
          const result = await syncGuestCartAction(guestItems);

          if (result?.success && result.cart) {
            setUserCart(result.cart);
            clearGuestCart();
            return;
          }
        }

        const cart = await getCurrentUserCartAction();
        if (cart) {
          setUserCart(cart);
        }
        return;
      }

      if (guestItems.length) {
        setUserCart({
          id: null,
          items: guestItems,
        });
      }
    }

    initializeCart();
  }, [isAuthenticated]);

  const refreshUser = useCallback(async () => {
    const nextUser = await getCurrentUserAction();
    setUser(nextUser);
    return nextUser;
  }, []);

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

  const cartItems = userCart.items;

  const cartCount = useMemo(
    () => computeCartCount(cartItems),
    [cartItems]
  );

  const cartSubtotal = useMemo(
    () => computeCartSubtotal(cartItems),
    [cartItems]
  );

  const value = useMemo(
    () => ({
      user,
      userCart,
      cartItems,
      cartCount,
      cartSubtotal,

      refreshUser,
      refreshCart,

      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
    }),
    [
      user,
      userCart,
      cartItems,
      cartCount,
      cartSubtotal,
      refreshUser,
      refreshCart,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
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
