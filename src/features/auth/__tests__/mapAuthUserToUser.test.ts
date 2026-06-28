import { makeAuthUserDto } from '@test-utils';

import { mapAuthUserToUser } from '../types';

/**
 * The login envelope (AuthUserDto) differs from the app-wide `User` type:
 * `roleName` → `role`, `companyId: null` → `undefined`, timestamps are hydrated.
 * This mapper is the seam between backend and app, so its edge cases matter.
 */
describe('mapAuthUserToUser', () => {
  it('maps a well-formed DTO onto the User shape', () => {
    const dto = makeAuthUserDto({
      id: 'u1',
      name: 'Rajesh',
      email: 'rajesh@abcpoultry.com',
      roleName: 'TENANT_ADMIN',
      status: 'ACTIVE',
      companyId: 'c1',
      mustChangePassword: false,
    });

    const user = mapAuthUserToUser(dto);

    expect(user).toMatchObject({
      id: 'u1',
      name: 'Rajesh',
      email: 'rajesh@abcpoultry.com',
      role: 'TENANT_ADMIN',
      status: 'ACTIVE',
      companyId: 'c1',
      mustChangePassword: false,
    });
  });

  it('falls back to FARMER for an unknown role', () => {
    expect(mapAuthUserToUser(makeAuthUserDto({ roleName: 'WIZARD' })).role).toBe('FARMER');
  });

  it('falls back to ACTIVE for an unknown status', () => {
    expect(mapAuthUserToUser(makeAuthUserDto({ status: 'PENDING' })).status).toBe('ACTIVE');
  });

  it('converts a null companyId to undefined', () => {
    expect(mapAuthUserToUser(makeAuthUserDto({ companyId: null })).companyId).toBeUndefined();
  });

  it('preserves the mustChangePassword flag', () => {
    expect(
      mapAuthUserToUser(makeAuthUserDto({ mustChangePassword: true })).mustChangePassword,
    ).toBe(true);
  });

  it('hydrates ISO createdAt / updatedAt timestamps', () => {
    const user = mapAuthUserToUser(makeAuthUserDto());
    expect(() => new Date(user.createdAt).toISOString()).not.toThrow();
    expect(user.createdAt).toBe(user.updatedAt);
  });

  it.each(['SAAS_ADMIN', 'TENANT_ADMIN', 'SUPERVISOR', 'FARMER'])(
    'preserves the known role %s',
    roleName => {
      expect(mapAuthUserToUser(makeAuthUserDto({ roleName })).role).toBe(roleName);
    },
  );
});
