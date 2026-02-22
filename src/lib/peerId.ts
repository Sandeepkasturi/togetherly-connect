/**
 * Deterministic peer ID from a Google user's `sub` claim.
 * Uses a simple djb2-style hash so the same user always gets the same 8-char ID.
 * Prefix "tg-" makes IDs readable and avoids clashes with raw PeerJS IDs.
 */
export function generatePermanentPeerId(googleSub: string): string {
    let hash = 5381;
    for (let i = 0; i < googleSub.length; i++) {
        // djb2: hash * 33 XOR charCode
        hash = ((hash << 5) + hash) ^ googleSub.charCodeAt(i);
        hash = hash >>> 0; // keep unsigned 32-bit
    }
    return 'tg-' + hash.toString(36).padStart(7, '0').slice(0, 7);
}
