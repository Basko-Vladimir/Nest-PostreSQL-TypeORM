import { INestApplication } from '@nestjs/common';
import request from 'supertest';

export const adminUsersRequests = {
  getUsersRequest: (app: INestApplication) => {
    return request(app.getHttpServer()).get('/sa/users');
  },
  createUserRequest: (app: INestApplication) => {
    return request(app.getHttpServer()).post('/sa/users');
  },
  deleteUserRequest: (app: INestApplication, userId: string) => {
    return request(app.getHttpServer()).delete(`/sa/users/${userId}`);
  },
  updateUserBanStatusRequest: (app: INestApplication, userId: string) => {
    return request(app.getHttpServer()).put(`/sa/users/${userId}/ban`);
  },
};

export const bloggerUsersRequests = {
  getAllBannedUsersForBlogRequest: (app: INestApplication, blogId: string) => {
    return request(app.getHttpServer()).get(`/blogger/users/blog/${blogId}`);
  },
  updateUserBanStatusForBlogsRequest: (app: INestApplication, userId: string) =>
    request(app.getHttpServer()).put(`/blogger/users/${userId}/ban`),
};
