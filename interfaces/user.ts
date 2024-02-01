export interface Role {
  departmentId: number;
  department: string;
  departmentRegion: string;
  position: string;
  status: string;
  roleType: string;

  createdAt: number | null;
  createdBy: string;
}

export interface User {
  id: number | null;
  username: string;
  password?: string | null;

  groups: string[] | null;
  group: string | null;

  roles: Role[] | null;

  createdAt: number | null;

  firstName: string | null;
  lastName: string | null;
  preferredName: string | null;
  phone: string | null;
  email: string | null;
  birthday: number | null;

  addressLine1: string | null;
  addressLine2: string | null;
  state: string | null;
  postcode: string | null;
  country: string | null;

  credit: number | null;
  active: boolean | null;

  region: string | null;
  icon: string | null;

  accesses: string[];

  isActive: boolean;
}

export interface LoginData {
  email: string;
  newPassword: string;
}

export interface updatePasswordData {
  newHashPassword: string | null;
  username: string;
  oldPassword: string | null;
}
export interface updateData {
  username: string;
  oldPassword: string | null;
}

export interface updateInfo {
  firstName: string;
  addressline2: any;
  addressline1: any;
  preferName: any;
  lastName: string | null | undefined;
  dob: number | null | undefined;
  email: string | null | undefined;
  phone: string | null | undefined;
  city: string | null | undefined;
  state: string | null | undefined;
  postcode: string | null | undefined;
  dateBox: string | null | undefined;
}

export type UserTask = {
  serialId?: number;
  title: string;
  note: string;
  warehouseName: string;
  status: string;

  expectedHours: number;
  credits: number;

  relatedUserId?: number | null;
  relatedUsername?: string | null;

  createdAt?: number | null;
  createdBy?: string | null;
  activatedAt?: number | null;
  activatedBy?: string | null;
  finishedAt?: number | null;
  finishedBy?: string | null;
  reviewedAt?: number | null;
  reviewedBy?: string | null;
  deletedAt?: number | null;
  deletedBy?: string | null;
};

export const EMPTY_USER_TASK: UserTask = {
  title: "",
  note: "",
  warehouseName: "",
  status: "pending",

  expectedHours: 0,
  credits: 0,
};

export type UserCreditRow = {
  serialId: number;
  relatedUserId: number;
  relatedUsername: string;
  amount: number;
  balance: number;

  type: string;
  note: string;

  createdAt?: number;
  createdBy?: string;
  deletedAt?: number | null;
  deletedBy?: string;
};

export interface Department {
  id: number;
  name: string;
  region: string;
  positions: string[];
  description: string;
  createdAt: number;
  createdBy: string;
}
