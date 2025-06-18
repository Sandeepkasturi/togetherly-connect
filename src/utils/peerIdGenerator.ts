
import { nanoid } from 'nanoid';

export const generatePeerId = (): string => {
  // Generate a consistent, unique peer ID using nanoid
  // This ensures compatibility with PeerJS and uniqueness across sessions
  return `togetherly-${nanoid(10)}`;
};

export const generateFallbackPeerId = (): string => {
  // Fallback method using timestamp and random string
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `fallback-${timestamp}-${random}`;
};

export const validatePeerId = (peerId: string): boolean => {
  // Validate peer ID format
  return peerId && peerId.length > 5 && /^[a-zA-Z0-9-_]+$/.test(peerId);
};
