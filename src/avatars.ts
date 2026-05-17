export type AvatarId = 'hakki' | 'neslihan' | 'ceyda' | 'irem';

export type Avatar = {
  id: AvatarId;
  name: string;
  initial: string;
  color: string;
  ring: string;
};

export const AVATARS: Avatar[] = [
  { id: 'hakki', name: 'Hakki', initial: 'H', color: '#1a5f7a', ring: '#2a9d8f' },
  { id: 'neslihan', name: 'Neslihan', initial: 'N', color: '#6b2d5c', ring: '#e056a0' },
  { id: 'ceyda', name: 'Ceyda', initial: 'C', color: '#8b4513', ring: '#fca311' },
  { id: 'irem', name: 'Irem', initial: 'İ', color: '#2d6a4f', ring: '#52b788' },
];

const STORAGE_KEY = 'herry-selected-avatar';

export function loadStoredAvatarId(): AvatarId | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw && AVATARS.some((a) => a.id === raw)) return raw as AvatarId;
  } catch {
    /* ignore */
  }
  return null;
}

export function storeAvatarId(id: AvatarId): void {
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {
    /* ignore */
  }
}

export function getAvatar(id: AvatarId): Avatar {
  return AVATARS.find((a) => a.id === id) ?? AVATARS[0];
}
