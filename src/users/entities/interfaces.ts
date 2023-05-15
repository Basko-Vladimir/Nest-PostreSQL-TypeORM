export interface IUser {
  id: string;
  login: string;
  email: string;
  passwordHash: string;
  passwordRecoveryCode: string;
  createdAt: Date;
  updatedAt: Date;
  //emailConfirmation
  confirmationCode: string;
  isConfirmed: boolean;
  expirationDate: Date;
  //banInfo
  isBanned: boolean;
  banDate: Date;
  banReason: string;
  userId?: string;
  isBannedForSpecificBlog?: boolean;
  banDateForSpecificBlog?: Date;
  banReasonForSpecificBlog?: string;
}

export interface IBlockedUserForBlog {
  userId: string;
  blogId: string;
  isBanned: boolean;
  banReason: string;
}
