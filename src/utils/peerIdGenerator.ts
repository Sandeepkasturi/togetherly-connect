
import { nanoid } from 'nanoid';

export const generatePeerId = (): string => {
  // Generate a PeerJS-compatible ID (alphanumeric + hyphens, no consecutive hyphens)
  const id = nanoid(10).replace(/[^a-zA-Z0-9]/g, ''); // Remove any non-alphanumeric chars
  return `togetherly${id}`; // No hyphen to avoid double hyphens
};

export const generateFallbackPeerId = (): string => {
  // Fallback method using timestamp and random string (no hyphens)
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `fallback${timestamp}${random}`;
};

export const validatePeerId = (peerId: string): boolean => {
  // Validate peer ID format - PeerJS doesn't allow consecutive hyphens or ending/starting with hyphens
  return peerId && 
         peerId.length > 5 && 
         /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]$/.test(peerId) && 
         !peerId.includes('--'); // No consecutive hyphens
};

export const getStoredPeerId = (): string | null => {
  try {
    const stored = localStorage.getItem('togetherly_peer_id');
    if (stored && validatePeerId(stored)) {
      return stored;
    }
    return null;
  } catch {
    return null;
  }
};

export const storePeerId = (peerId: string): void => {
  try {
    if (validatePeerId(peerId)) {
      localStorage.setItem('togetherly_peer_id', peerId);
    }
  } catch {
    console.warn('Failed to store peer ID in localStorage');
  }
};
