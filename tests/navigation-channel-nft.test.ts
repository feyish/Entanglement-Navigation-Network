import { describe, it, expect, beforeEach } from 'vitest';

// Simulated contract state
let lastTokenId = 0;
const tokenMetadata = new Map();
const tokenOwners = new Map();

// Simulated contract functions
function mintNavigationChannel(channelType: string, description: string, precision: number, associatedBeacons: number[], creator: string) {
  const tokenId = ++lastTokenId;
  if (precision < 0 || precision > 100) {
    throw new Error('Invalid precision');
  }
  tokenMetadata.set(tokenId, {
    creator,
    channelType,
    description,
    precision,
    associatedBeacons,
    creationTime: Date.now()
  });
  tokenOwners.set(tokenId, creator);
  return tokenId;
}

function transferNavigationChannel(tokenId: number, sender: string, recipient: string) {
  if (tokenOwners.get(tokenId) !== sender) {
    throw new Error('Not authorized');
  }
  tokenOwners.set(tokenId, recipient);
  return true;
}

describe('Quantum Navigation Channel NFT Contract', () => {
  beforeEach(() => {
    lastTokenId = 0;
    tokenMetadata.clear();
    tokenOwners.clear();
  });
  
  it('should mint a new navigation channel NFT', () => {
    const id = mintNavigationChannel('Interstellar Highway', 'High-precision navigation channel for interstellar travel', 95, [1, 2, 3], 'scientist1');
    expect(id).toBe(1);
    const metadata = tokenMetadata.get(id);
    expect(metadata.channelType).toBe('Interstellar Highway');
    expect(metadata.precision).toBe(95);
    expect(tokenOwners.get(id)).toBe('scientist1');
  });
  
  it('should transfer navigation channel NFT ownership', () => {
    const id = mintNavigationChannel('Quantum Shortcut', 'Experimental channel using quantum tunneling', 80, [4, 5], 'scientist2');
    expect(transferNavigationChannel(id, 'scientist2', 'researcher1')).toBe(true);
    expect(tokenOwners.get(id)).toBe('researcher1');
  });
  
  it('should not allow minting with invalid precision', () => {
    expect(() => mintNavigationChannel('Invalid Channel', 'This should fail', 101, [6], 'scientist3')).toThrow('Invalid precision');
  });
  
  it('should not allow unauthorized transfers', () => {
    const id = mintNavigationChannel('Galactic Expressway', 'High-speed channel for rapid galactic transit', 90, [7, 8, 9], 'scientist4');
    expect(() => transferNavigationChannel(id, 'unauthorized_user', 'researcher2')).toThrow('Not authorized');
  });
});

