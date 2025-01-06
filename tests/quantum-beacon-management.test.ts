import { describe, it, expect, beforeEach } from 'vitest';

// Simulated contract state
let beaconCount = 0;
const quantumBeacons = new Map();

// Simulated contract functions
function deployBeacon(location: string, entanglementKey: string, deployer: string) {
  const beaconId = ++beaconCount;
  quantumBeacons.set(beaconId, {
    deployer,
    location,
    entanglementKey,
    status: "active",
    deploymentTime: Date.now(),
    lastUpdate: Date.now()
  });
  return beaconId;
}

function updateBeaconStatus(beaconId: number, newStatus: string, updater: string) {
  const beacon = quantumBeacons.get(beaconId);
  if (!beacon) throw new Error('Invalid beacon');
  if (beacon.deployer !== updater && updater !== 'CONTRACT_OWNER') throw new Error('Not authorized');
  if (!['active', 'inactive', 'maintenance'].includes(newStatus)) throw new Error('Invalid status');
  beacon.status = newStatus;
  beacon.lastUpdate = Date.now();
  quantumBeacons.set(beaconId, beacon);
  return true;
}

function updateEntanglementKey(beaconId: number, newKey: string, updater: string) {
  const beacon = quantumBeacons.get(beaconId);
  if (!beacon) throw new Error('Invalid beacon');
  if (beacon.deployer !== updater && updater !== 'CONTRACT_OWNER') throw new Error('Not authorized');
  beacon.entanglementKey = newKey;
  beacon.lastUpdate = Date.now();
  quantumBeacons.set(beaconId, beacon);
  return true;
}

describe('Quantum Beacon Management Contract', () => {
  beforeEach(() => {
    beaconCount = 0;
    quantumBeacons.clear();
  });
  
  it('should deploy a new quantum beacon', () => {
    const id = deployBeacon('Alpha Centauri', '0x1234567890abcdef', 'scientist1');
    expect(id).toBe(1);
    const beacon = quantumBeacons.get(id);
    expect(beacon.location).toBe('Alpha Centauri');
    expect(beacon.status).toBe('active');
  });
  
  it('should update beacon status', () => {
    const id = deployBeacon('Proxima Centauri', '0xabcdef1234567890', 'scientist2');
    expect(updateBeaconStatus(id, 'maintenance', 'scientist2')).toBe(true);
    const beacon = quantumBeacons.get(id);
    expect(beacon.status).toBe('maintenance');
  });
  
  it('should update entanglement key', () => {
    const id = deployBeacon('Sirius', '0x9876543210fedcba', 'scientist3');
    const newKey = '0xfedcba9876543210';
    expect(updateEntanglementKey(id, newKey, 'scientist3')).toBe(true);
    const beacon = quantumBeacons.get(id);
    expect(beacon.entanglementKey).toBe(newKey);
  });
  
  it('should not allow unauthorized status updates', () => {
    const id = deployBeacon('Betelgeuse', '0x1111222233334444', 'scientist4');
    expect(() => updateBeaconStatus(id, 'inactive', 'unauthorized_user')).toThrow('Not authorized');
  });
  
  it('should not allow invalid status updates', () => {
    const id = deployBeacon('Vega', '0x5555666677778888', 'scientist5');
    expect(() => updateBeaconStatus(id, 'invalid_status', 'scientist5')).toThrow('Invalid status');
  });
});

