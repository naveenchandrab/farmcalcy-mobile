import {
  toTenantRequest,
  toStaffRequest,
  toFarmOwnerRequest,
  REGISTRATION_TYPE_LABEL,
} from '../types';

// The mappers receive already-parsed (zod-trimmed) form values, so inputs here
// are pre-trimmed — the mapper's job is to shape them into the API payload.
const address = {
  addressLine1: '12 Industrial Estate',
  addressLine2: 'Near NH-47',
  taluk: 'Mettupalayam',
  village: 'Karamadai',
  landmark: 'Near the water tank',
  district: 'Coimbatore',
  state: 'Karnataka',
  pincode: '641001',
};

describe('registration form → API mappers', () => {
  it('maps a tenant registration with structured address + owner + aadhaar', () => {
    const result = toTenantRequest({
      companyName: 'ABC Poultry',
      companyEmail: 'info@abc.com',
      companyPhone: '+919876543210',
      ...address,
      gstNumber: '29ABCDE1234F1Z5',
      firstName: 'Rajesh',
      lastName: 'Kumar',
      adminEmail: 'rajesh@abc.com',
      phoneNumber: '+919876543211',
      aadhaarFrontUrl: 'aadhaar/front.jpg',
      aadhaarBackUrl: undefined,
    });

    expect(result).toEqual({
      companyName: 'ABC Poultry',
      companyEmail: 'info@abc.com',
      companyPhone: '+919876543210',
      ...address,
      gstNumber: '29ABCDE1234F1Z5',
      firstName: 'Rajesh',
      lastName: 'Kumar',
      adminEmail: 'rajesh@abc.com',
      phoneNumber: '+919876543211',
      aadhaarFrontUrl: 'aadhaar/front.jpg',
      aadhaarBackUrl: undefined,
    });
  });

  it('maps a staff registration (address included, empty email omitted)', () => {
    const result = toStaffRequest({
      firstName: 'Suresh',
      lastName: 'Babu',
      phoneNumber: '+919876543220',
      email: undefined,
      companyCode: 'FCC-7A91KD',
      ...address,
    });

    expect(result.companyCode).toBe('FCC-7A91KD');
    expect(result.email).toBeUndefined();
    expect(result.addressLine1).toBe('12 Industrial Estate');
    expect(result.state).toBe('Karnataka');
    expect(result.pincode).toBe('641001');
  });

  it('includes GPS coordinates + address for a farm owner', () => {
    const result = toFarmOwnerRequest({
      firstName: 'Maya',
      lastName: 'Rao',
      phoneNumber: '+919876543230',
      email: 'maya@example.com',
      companyCode: 'FCC-7A91KD',
      ...address,
      gpsLatitude: 11.0168,
      gpsLongitude: 76.9558,
    });

    expect(result.gpsLatitude).toBe(11.0168);
    expect(result.gpsLongitude).toBe(76.9558);
    expect(result.companyCode).toBe('FCC-7A91KD');
    expect(result.district).toBe('Coimbatore');
  });

  it('exposes readable type labels', () => {
    expect(REGISTRATION_TYPE_LABEL.TENANT).toBe('Company');
    expect(REGISTRATION_TYPE_LABEL.SUPERVISOR).toBe('Supervisor');
    expect(REGISTRATION_TYPE_LABEL.FARM_OWNER).toBe('Farm Owner');
  });
});
