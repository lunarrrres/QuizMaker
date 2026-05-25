import { atom } from 'jotai';
import { atomWithStorage, createJSONStorage } from 'jotai/utils';
import type { User } from '@/types/auth.types';

const sessionStorageProvider = createJSONStorage<any>(() => sessionStorage);

export const accessTokenAtom = atomWithStorage<string | null>('accessToken', null, sessionStorageProvider);
export const refreshTokenAtom = atomWithStorage<string | null>('refreshToken', null, sessionStorageProvider);
export const userAtom = atomWithStorage<User | null>('user', null, sessionStorageProvider);

export const isAuthenticatedAtom = atom((get) => !!get(accessTokenAtom));
