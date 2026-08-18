import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getVariantPrice } from '../lib/format'

const DEFAULT_SHIPPING_FEE = 250
const DEFAULT_FREE_SHIPPING = 8000

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      promoCode: null,

      addItem: ({ product, variant, quantity = 1 }) => {
        const items = [...get().items]
        const existingIndex = items.findIndex(
          (item) => item.productId === product.id && item.size === variant.size,
        )

        if (existingIndex >= 0) {
          const nextQty = Math.min(
            items[existingIndex].quantity + quantity,
            variant.stock || 99,
          )
          items[existingIndex] = { ...items[existingIndex], quantity: nextQty }
        } else {
          items.push({
            key: `${product.id}-${variant.size}`,
            productId: product.id,
            slug: product.slug,
            name: product.name,
            image: product.images[0],
            size: variant.size,
            sku: variant.sku,
            price: getVariantPrice(variant),
            compareAtPrice: variant.compareAtPrice,
            quantity,
            stock: variant.stock,
          })
        }

        set({ items })
      },

      removeItem: (key) => {
        set({ items: get().items.filter((item) => item.key !== key) })
      },

      updateQuantity: (key, quantity) => {
        set({
          items: get().items.map((item) =>
            item.key === key
              ? { ...item, quantity: Math.max(1, Math.min(quantity, item.stock || 99)) }
              : item,
          ),
        })
      },

      clearCart: () => set({ items: [], promoCode: null }),

      setPromo: (promo) => set({ promoCode: promo }),

      clearPromo: () => set({ promoCode: null }),

      getSubtotal: () =>
        get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),

      getDiscount: () => {
        const subtotal = get().getSubtotal()
        const promo = get().promoCode
        if (!promo) return 0
        if (promo.type === 'percent') return Math.round((subtotal * promo.value) / 100)
        if (promo.type === 'fixed') return Math.min(subtotal, promo.value)
        return 0
      },

      getShipping: (cityFee = DEFAULT_SHIPPING_FEE, freeShippingThreshold = DEFAULT_FREE_SHIPPING) => {
        const subtotal = get().getSubtotal()
        const promo = get().promoCode
        if (promo?.type === 'shipping' || promo?.freeShipping) return 0
        if (subtotal >= freeShippingThreshold) return 0
        return cityFee
      },

      getTotal: (cityFee, freeShippingThreshold) => {
        const subtotal = get().getSubtotal()
        const discount = get().getDiscount()
        const shipping = get().getShipping(cityFee, freeShippingThreshold)
        return Math.max(0, subtotal - discount + shipping)
      },

      getItemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    { name: 'sq-cart' },
  ),
)

export const useWishlistStore = create(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (productId) => {
        const ids = get().ids
        if (ids.includes(productId)) {
          set({ ids: ids.filter((id) => id !== productId) })
          return false
        }
        set({ ids: [...ids, productId] })
        return true
      },
      has: (productId) => get().ids.includes(productId),
      remove: (productId) => set({ ids: get().ids.filter((id) => id !== productId) }),
      clear: () => set({ ids: [] }),
    }),
    { name: 'sq-wishlist' },
  ),
)

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      login: ({ email, name, id }) => {
        set({
          user: {
            id: id || email,
            name: name || email.split('@')[0],
            email,
          },
        })
      },
      register: ({ name, email, id }) => {
        set({
          user: {
            id: id || email,
            name,
            email,
          },
        })
      },
      logout: () => set({ user: null }),
      isAuthenticated: () => Boolean(get().user),
    }),
    { name: 'sq-auth' },
  ),
)

export const useRecentlyViewedStore = create(
  persist(
    (set, get) => ({
      ids: [],
      add: (productId) => {
        const next = [productId, ...get().ids.filter((id) => id !== productId)].slice(0, 8)
        set({ ids: next })
      },
    }),
    { name: 'sq-recent' },
  ),
)
