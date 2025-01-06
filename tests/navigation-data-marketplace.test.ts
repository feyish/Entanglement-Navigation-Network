import { describe, it, expect, beforeEach } from 'vitest';

// Simulated contract state
let listingCount = 0;
const dataListings = new Map();
const tokenBalances = new Map();

// Simulated contract functions
function createListing(dataType: string, description: string, price: number, accuracy: number, expiration: number, seller: string) {
  const listingId = ++listingCount;
  if (accuracy < 0 || accuracy > 100) {
    throw new Error('Invalid accuracy');
  }
  dataListings.set(listingId, {
    seller,
    dataType,
    description,
    price,
    accuracy,
    expiration: Date.now() + expiration * 1000 // Convert to milliseconds
  });
  return listingId;
}

function purchaseData(listingId: number, buyer: string) {
  const listing = dataListings.get(listingId);
  if (!listing) throw new Error('Invalid listing');
  if (Date.now() > listing.expiration) throw new Error('Listing expired');
  const buyerBalance = tokenBalances.get(buyer) || 0;
  if (buyerBalance < listing.price) throw new Error('Insufficient balance');
  
  // Transfer tokens
  tokenBalances.set(buyer, buyerBalance - listing.price);
  const sellerBalance = tokenBalances.get(listing.seller) || 0;
  tokenBalances.set(listing.seller, sellerBalance + listing.price);
  
  // Remove listing
  dataListings.delete(listingId);
  return true;
}

function cancelListing(listingId: number, canceler: string) {
  const listing = dataListings.get(listingId);
  if (!listing) throw new Error('Invalid listing');
  if (listing.seller !== canceler) throw new Error('Not authorized');
  dataListings.delete(listingId);
  return true;
}

// Helper function to set token balance
function setTokenBalance(account: string, balance: number) {
  tokenBalances.set(account, balance);
}

describe('Navigation Data Marketplace Contract', () => {
  beforeEach(() => {
    listingCount = 0;
    dataListings.clear();
    tokenBalances.clear();
  });
  
  it('should create a new data listing', () => {
    const id = createListing('Star Map', 'Detailed map of the Orion constellation', 1000, 95, 3600, 'seller1');
    expect(id).toBe(1);
    const listing = dataListings.get(id);
    expect(listing.dataType).toBe('Star Map');
    expect(listing.price).toBe(1000);
    expect(listing.accuracy).toBe(95);
  });
  
  it('should allow purchasing of data', () => {
    const listingId = createListing('Wormhole Coordinates', 'Coordinates for stable wormhole in Sector 7', 5000, 90, 7200, 'seller2');
    setTokenBalance('buyer1', 10000);
    expect(purchaseData(listingId, 'buyer1')).toBe(true);
    expect(tokenBalances.get('buyer1')).toBe(5000);
    expect(tokenBalances.get('seller2')).toBe(5000);
    expect(dataListings.has(listingId)).toBe(false);
  });
  
  it('should not allow purchase with insufficient balance', () => {
    const listingId = createListing('Asteroid Field Map', 'Detailed map of the Kuiper Belt', 3000, 85, 5400, 'seller3');
    setTokenBalance('buyer2', 2000);
    expect(() => purchaseData(listingId, 'buyer2')).toThrow('Insufficient balance');
  });
  
  it('should allow cancellation of listing by seller', () => {
    const listingId = createListing('Black Hole Data', 'Gravitational data from the center of the Milky Way', 8000, 98, 10800, 'seller4');
    expect(cancelListing(listingId, 'seller4')).toBe(true);
    expect(dataListings.has(listingId)).toBe(false);
  });
  
  it('should not allow cancellation by non-seller', () => {
    const listingId = createListing('Exoplanet Atmosphere Analysis', 'Spectral analysis of Proxima Centauri b', 6000, 92, 9000, 'seller5');
    expect(() => cancelListing(listingId, 'unauthorized_user')).toThrow('Not authorized');
  });
  
  it('should not allow purchase of expired listing', async () => {
    const listingId = createListing('Quantum Fluctuation Data', 'High-precision measurements of vacuum energy', 4000, 88, 1, 'seller6');
    setTokenBalance('buyer3', 5000);
    
    // Wait for the listing to expire
    await new Promise(resolve => setTimeout(resolve, 1100));
    
    expect(() => purchaseData(listingId, 'buyer3')).toThrow('Listing expired');
  });
  
  it('should not allow creation of listing with invalid accuracy', () => {
    expect(() => createListing('Invalid Data', 'This should fail', 1000, 101, 3600, 'seller7')).toThrow('Invalid accuracy');
  });
});

