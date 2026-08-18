export function normalizeProduct(product) {
  if (!product) return null
  return {
    ...product,
    id: product._id || product.id,
    images: product.images?.length ? product.images : ['/favicon.jpeg'],
    topNotes: product.topNotes || [],
    middleNotes: product.middleNotes || [],
    baseNotes: product.baseNotes || [],
    variants: (product.variants || []).map((v) => ({
      ...v,
      salePrice: v.compareAtPrice && v.compareAtPrice > v.price ? v.price : null,
    })),
    createdAt: product.createdAt || product.updatedAt,
    popularity: product.popularity || 0,
    rating: product.rating || 0,
    reviewCount: product.reviewCount || 0,
  }
}

export function audienceLabel(gender) {
  if (gender === 'men') return 'For Him'
  if (gender === 'women') return 'For Her'
  if (gender === 'unisex') return 'Unisex'
  return gender
}

export function normalizeOrder(order) {
  if (!order) return null
  const created = order.createdAt ? new Date(order.createdAt) : null
  return {
    id: order.orderNumber || order._id || order.id,
    mongoId: order._id || order.id,
    date: created ? created.toLocaleDateString() : '',
    status: order.status,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    total: order.total,
    subtotal: order.subtotal,
    discount: order.discount,
    shipping: order.shipping,
    statusHistory: order.statusHistory || [],
    items: (order.items || []).map((item) => ({
      name: item.name,
      size: item.size,
      qty: item.qty,
      price: item.price,
    })),
    shippingAddress: {
      name: order.customerSnapshot?.name || '',
      phone: order.customerSnapshot?.phone || '',
      address: order.shippingAddress?.address || '',
      city: order.shippingAddress?.city || '',
      area: order.shippingAddress?.area || '',
      notes: order.shippingAddress?.notes || '',
    },
  }
}
