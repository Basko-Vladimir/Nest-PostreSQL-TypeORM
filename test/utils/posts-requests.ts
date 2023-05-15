import { INestApplication } from '@nestjs/common';
import request from 'supertest';

export const publicPostsRequests = {
  getPostsRequest: (app: INestApplication) => {
    return request(app.getHttpServer()).get('/posts');
  },
  getPostRequest: (app: INestApplication, id: string) => {
    return request(app.getHttpServer()).get(`/posts/${id}`);
  },
  createCommentByPostIdRequest: (app: INestApplication, id: string) => {
    return request(app.getHttpServer()).post(`/posts/${id}/comments`);
  },
  getCommentsByPostIdRequest: (app: INestApplication, postId: string) => {
    return request(app.getHttpServer()).get(`/posts/${postId}/comments`);
  },
  updatePostLikeStatus: (app: INestApplication, postId: string) => {
    return request(app.getHttpServer()).put(`/posts/${postId}/like-status`);
  },
};
