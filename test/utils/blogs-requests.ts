import { INestApplication } from '@nestjs/common';
import request from 'supertest';

export const adminBlogsRequests = {
  getBlogsAsAdminRequest: (app: INestApplication) => {
    return request(app.getHttpServer()).get('/sa/blogs');
  },
  bindBlogWithUser: (app: INestApplication, blogId: string, userId: string) => {
    return request(app.getHttpServer()).put(
      `/sa/blogs/${blogId}/bind-with-user/${userId}`,
    );
  },
  updateBlogBanStatusRequest: (app: INestApplication, blogId: string) => {
    return request(app.getHttpServer()).put(`/sa/blogs/${blogId}/ban`);
  },
};

export const bloggerBlogsRequests = {
  getBlogsAsBloggerRequest: (app: INestApplication) => {
    return request(app.getHttpServer()).get('/blogger/blogs');
  },
  createBlogsRequest: (app: INestApplication) => {
    return request(app.getHttpServer()).post('/blogger/blogs');
  },
  deleteBlogRequest: (app: INestApplication, id: string) => {
    return request(app.getHttpServer()).delete(`/blogger/blogs/${id}`);
  },
  updateBlogRequest: (app: INestApplication, id: string) => {
    return request(app.getHttpServer()).put(`/blogger/blogs/${id}`);
  },
  createPostByBlogIdRequest: (app: INestApplication, blogId: string) =>
    request(app.getHttpServer()).post(`/blogger/blogs/${blogId}/posts`),
  updatePostByBlogIdRequest: (
    app: INestApplication,
    blogId: string,
    postId: string,
  ) => {
    return request(app.getHttpServer()).put(
      `/blogger/blogs/${blogId}/posts/${postId}`,
    );
  },
  deletePostByBlogIdRequest: (
    app: INestApplication,
    blogId: string,
    postId: string,
  ) => {
    return request(app.getHttpServer()).delete(
      `/blogger/blogs/${blogId}/posts/${postId}`,
    );
  },
  getAllPostsCommentsInsideBlogRequest: (app: INestApplication) => {
    return request(app.getHttpServer()).get('/blogger/blogs/comments');
  },
};

export const publicBlogsRequests = {
  getBlogsAsUserRequest: (app: INestApplication) => {
    return request(app.getHttpServer()).get('/blogs');
  },
  getBlogAsUserRequest: (app: INestApplication, id: string) => {
    return request(app.getHttpServer()).get(`/blogs/${id}`);
  },
  getPostsByBlogIdAsUserRequest: (app: INestApplication, blogId: string) => {
    return request(app.getHttpServer()).get(`/blogs/${blogId}/posts`);
  },
};
