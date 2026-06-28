import React from 'react';

import type { UserRole } from '@app-types';
import { ROLE_LABELS } from '@constants';
import { Select } from '@design-system';
import type { SelectOption } from '@design-system';

interface RoleSelectorProps {
  value: UserRole;
  onChange: (role: UserRole) => void;
  errorMessage?: string;
}

const ROLES: UserRole[] = ['SAAS_ADMIN', 'TENANT_ADMIN', 'SUPERVISOR', 'FARMER'];

const ROLE_OPTIONS: SelectOption<UserRole>[] = ROLES.map(role => ({
  label: ROLE_LABELS[role] ?? role,
  value: role,
}));

const RoleSelector: React.FC<RoleSelectorProps> = ({ value, onChange, errorMessage }) => (
  <Select<UserRole>
    label="Role"
    options={ROLE_OPTIONS}
    value={value}
    onValueChange={onChange}
    error={errorMessage}
  />
);

export default RoleSelector;
