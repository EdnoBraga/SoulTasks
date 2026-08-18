export type UserProfile = { displayName: string; avatarDataUrl?: string };
const PROFILE_KEY = 'soultasks-profile-v1';
export function loadUserProfile(): UserProfile { try { const raw = localStorage.getItem(PROFILE_KEY); return raw ? JSON.parse(raw) as UserProfile : { displayName: 'Braga' }; } catch { return { displayName: 'Braga' }; } }
export function saveUserProfile(profile: UserProfile): void { localStorage.setItem(PROFILE_KEY, JSON.stringify(profile)); }
