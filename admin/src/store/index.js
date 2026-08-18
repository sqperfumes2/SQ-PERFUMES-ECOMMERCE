import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      admin: null,
      login: ({ email, name, role = 'owner', id = 'admin-1' }) =>
        set({
          admin: {
            id,
            name: name || 'Owner Admin',
            email,
            role,
          },
        }),
      logout: () => set({ admin: null }),
      updateProfile: (patch) => set({ admin: { ...get().admin, ...patch } }),
      isAuthenticated: () => Boolean(get().admin),
    }),
    { name: 'sq-admin-auth' },
  ),
)
