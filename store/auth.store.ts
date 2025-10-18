import { create } from 'zustand';
import {User} from "@/type";
import { getCurrentUser } from '../lib/write';
import { isLoaded } from 'expo-font';

type AuthState = {
    isAuthenticated: boolean;
    user: User | null;
    isLoading: boolean;

    setIsAuthenticated: (value: boolean) => void;
    setUser: (user: User | null) => void;
    setIsLoading: (value: boolean) => void;
    fetchAuthenticatedUser: () => Promise<void>;
}
const useAuthStore = create<AuthState>((set) => ({
    isAuthenticated: false,
    user: null,
    isLoading: true,

    setIsAuthenticated: (value: boolean) => set({ isAuthenticated: value }),
    setUser: (user: User | null) => set({ user }),
    setIsLoading: (value: boolean) => set({ isLoading: value }),

    fetchAuthenticatedUser: async () => {
        console.log('fetchAuthenticatedUser called');
        set({ isLoading: true });

        try {
            const user = await getCurrentUser();
            console.log('getCurrentUser result:', user);
            if (
                user &&
                typeof user === 'object' &&
                'name' in user &&
                'email' in user &&
                'avatar' in user
            ) {
                set({ isAuthenticated: true, user: user as unknown as User });
            } else {
                set({ isAuthenticated: false, user: null });
            }
        } catch (error) {
            console.log('fetchAuthenticatedUser error', error);
            set({ isAuthenticated: false, user: null });
        } finally {
            set({ isLoading: false });
        }
    }
}))

export default useAuthStore;
