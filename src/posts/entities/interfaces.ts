export interface IPost {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  blogName?: string;
}
