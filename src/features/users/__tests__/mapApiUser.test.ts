import { mapApiUserList, mapApiUserToUser } from '../types';
import type { ApiUserDto } from '../types';

/**
 * Regression coverage for the backend↔app user contract mismatch that crashed
 * the User screens: the NestJS /users resource serialises `isActive` (boolean)
 * with no `status` enum and (in the list DTO) no `role`. `mapApiUserToUser`
 * normalises that into the app-wide `User` so `StatusBadge` never receives an
 * undefined status.
 */
describe('mapApiUserToUser', () => {
  const base: ApiUserDto = {
    id: 'u1',
    name: 'Venkat Rao',
    email: 'venkat@goldenegg.com',
    phone: '+919876543215',
    isActive: true,
  };

  it('maps isActive:true → status ACTIVE', () => {
    expect(mapApiUserToUser(base).status).toBe('ACTIVE');
  });

  it('maps isActive:false → status INACTIVE', () => {
    expect(mapApiUserToUser({ ...base, isActive: false }).status).toBe('INACTIVE');
  });

  it('prefers an explicit, valid status enum when the backend provides one', () => {
    expect(mapApiUserToUser({ ...base, status: 'SUSPENDED' }).status).toBe('SUSPENDED');
  });

  it('defaults status to ACTIVE when neither status nor isActive is present', () => {
    const { isActive, ...withoutFlag } = base;
    void isActive;
    expect(mapApiUserToUser(withoutFlag).status).toBe('ACTIVE');
  });

  it('falls back to FARMER when role is absent (list DTO omits it)', () => {
    expect(mapApiUserToUser(base).role).toBe('FARMER');
  });

  it('resolves a flat roleName into the app role', () => {
    expect(mapApiUserToUser({ ...base, roleName: 'SUPERVISOR' }).role).toBe('SUPERVISOR');
  });

  it('resolves a nested role relation { name }', () => {
    expect(mapApiUserToUser({ ...base, role: { name: 'TENANT_ADMIN' } }).role).toBe(
      'TENANT_ADMIN',
    );
  });

  it('coerces a null phone to undefined', () => {
    expect(mapApiUserToUser({ ...base, phone: null }).phone).toBeUndefined();
  });
});

describe('mapApiUserList', () => {
  const items: ApiUserDto[] = [
    { id: 'a', name: 'A', email: 'a@x.com', isActive: true },
    { id: 'b', name: 'B', email: 'b@x.com', isActive: false },
  ];

  it('maps every item through mapApiUserToUser', () => {
    const result = mapApiUserList({ items }, 1, 20);
    expect(result.items).toHaveLength(2);
    expect(result.items[0].status).toBe('ACTIVE');
    expect(result.items[1].status).toBe('INACTIVE');
  });

  it('synthesises pagination meta when the backend omits it', () => {
    const result = mapApiUserList({ items }, 1, 20);
    expect(result.meta).toEqual({
      total: 2,
      page: 1,
      limit: 20,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    });
  });

  it('preserves backend-provided meta when present', () => {
    const meta = {
      total: 50,
      page: 2,
      limit: 20,
      totalPages: 3,
      hasNextPage: true,
      hasPreviousPage: true,
    };
    expect(mapApiUserList({ items, meta }, 2, 20).meta).toEqual(meta);
  });

  it('handles an undefined payload without throwing', () => {
    const result = mapApiUserList(undefined, 1, 20);
    expect(result.items).toEqual([]);
    expect(result.meta.total).toBe(0);
  });
});
