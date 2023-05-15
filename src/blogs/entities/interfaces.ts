export interface IBlog {
  id: string;
  name: string;
  websiteUrl: string;
  description: string;
  isMembership: boolean;
  isBanned: boolean;
  banDate: Date;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  ownerLogin?: string;
}
