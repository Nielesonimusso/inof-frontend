/* Interface for Login */
export interface UserLogin {
  password: string;
  username: string;
}

/* Basic User Info interface */
interface UserInfo extends UserInfoPublic {
  email: string;
}

export interface UserInfoPublic {
  username: string;
  fullName: string;
}

/* Interface for changing password */
export interface ChangePassword {
  currentPassword: string;
  newPassword: string;
}

/* Interface for resetting password */
export interface ResetPassword {
  email: string;
  newPassword: string;
  resetCode: string;
}

/* Interface for Registering an user */
export interface UserRegistration extends UserInfo, UserLogin {
  companyId: string;
}

/* Interface for an user's profile */
export interface UserProfile extends UserInfo {
  // Company cannot be updated
  readonly companyId: string;
  readonly company: Company;
}

/* Interface for user profile update */
export interface UserProfileUpdate {
  email: string;
  fullName: string;
}

/* Interface for a company */
export interface Company {
  readonly id: string;
  name: string;
  address?: string;
}

/* Interface for information about creator */
export type CreatorInfo = UserInfoPublic;

/**
 *  Interface to be extended by Models/Simulations interfaces if they have a owner property.
 *  This allows for the isOwner function to work.
 */
export interface HasOwner {
  readonly owner?: Company;
}

/**
 * Interface to be extended by Models/Simulations interfaces if they have creation info properties.
 *  This allows for the isCreator function to work.
 */
export interface HasCreator {
  readonly createdBy?: CreatorInfo;
  readonly createdOn?: string;
}

/** Function to check whether the current user is the owner of an object, and can indeed view/run that object */
export const isOwner = (object: HasOwner, user: UserProfile): boolean => {
  return object.owner?.id === user.company.id;
};

/** Function to check whether the current user is the creator of an object, and can indeed delete/edit that object */
export const isCreator = (object: HasCreator, user: UserProfile): boolean => {
  return object.createdBy?.username === user.username;
};
