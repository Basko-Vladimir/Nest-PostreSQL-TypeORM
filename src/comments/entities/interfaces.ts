export class IComment {
  id: string;
  content: string;
  authorId: string;
  postId: string;
  createdAt: Date;
  updatedAt: Date;
  userLogin?: string;
  blogId?: string;
  blogName?: string;
  postTitle?: string;
}
