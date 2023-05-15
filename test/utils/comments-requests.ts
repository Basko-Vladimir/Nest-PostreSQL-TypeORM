import { INestApplication } from '@nestjs/common';
import request from 'supertest';

export const publicCommentsRequests = {
  getCommentRequest: (app: INestApplication, id: string) => {
    return request(app.getHttpServer()).get(`/comments/${id}`);
  },
  deleteCommentRequest: (app: INestApplication, id: string) => {
    return request(app.getHttpServer()).delete(`/comments/${id}`);
  },
  updateCommentRequest: (app: INestApplication, id: string) => {
    return request(app.getHttpServer()).put(`/comments/${id}`);
  },
  updateCommentLikeStatus: (app: INestApplication, commentId: string) => {
    return request(app.getHttpServer()).put(
      `/comments/${commentId}/like-status`,
    );
  },
};
