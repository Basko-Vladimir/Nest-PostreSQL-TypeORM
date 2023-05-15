import {
  auth,
  blogs,
  comments,
  errors,
  INVALID_ID,
  posts,
  users,
  likes,
} from './mockData';
import { publicCommentsRequests } from './utils/comments-requests';
import { adminUsersRequests } from './utils/users-requests';
import { publicPostsRequests } from './utils/posts-requests';
import {
  adminBlogsRequests,
  bloggerBlogsRequests,
} from './utils/blogs-requests';
import { authRequests } from './utils/auth-requests';
import { LikeStatus } from '../src/common/enums';
import { ICommentWithLikeInfoOutputModel } from '../src/comments/api/dto/comments-output-models.dto';
import { initTestApp } from './utils/common';
import { disconnect } from 'mongoose';

describe('Comments', () => {
  jest.setTimeout(20 * 1000);
  const { correctCreateBlogDtos } = blogs;
  const { notFoundExceptionMock } = errors;
  const { correctCreatePostDtos, correctUpdatePostDto } = posts;
  const { correctBasicCredentials, incorrectAccessToken, getBearerAuthHeader } =
    auth;
  const { createUserRequest } = adminUsersRequests;
  const { createBlogsRequest, createPostByBlogIdRequest } =
    bloggerBlogsRequests;
  const {
    getCommentRequest,
    deleteCommentRequest,
    updateCommentRequest,
    updateCommentLikeStatus,
  } = publicCommentsRequests;
  const { bindBlogWithUser } = adminBlogsRequests;
  const { loginRequest } = authRequests;
  const { createCommentByPostIdRequest } = publicPostsRequests;
  const {
    correctCreateCommentDtos,
    commentsBadQueryResponse,
    incorrectCommentsDtos,
    correctUpdateCommentDto,
    getCommentItem,
  } = comments;
  const {
    correctUpdateLikeStatusDto,
    incorrectLikeStatusDto,
    likeBadQueryResponse,
  } = likes;
  const { correctCreateUserDtos } = users;
  let app, mongoMS;
  let post1, post2;
  let user1, user2, user3;
  let comment1;
  let blog1;
  let user1Token;

  beforeAll(async () => {
    const { nestApp, mongoMemoryServer } = await initTestApp();
    app = nestApp;
    mongoMS = mongoMemoryServer;
  });

  describe('Preparing data', () => {
    it('User creating', async () => {
      const response1 = await createUserRequest(app)
        .set(correctBasicCredentials)
        .send(correctCreateUserDtos[0]);
      expect(response1.status).toBe(201);
      user1 = response1.body;
    });

    it('User login', async () => {
      const response1 = await loginRequest(app).send({
        loginOrEmail: correctCreateUserDtos[0].login,
        password: correctCreateUserDtos[0].password,
      });
      expect(response1.status).toBe(200);
      user1Token = `Bearer ${response1.body.accessToken}`;
    });

    it('Blog creating', async () => {
      const response = await createBlogsRequest(app)
        .set(getBearerAuthHeader(user1Token))
        .send(correctCreateBlogDtos[0]);
      expect(response.status).toBe(201);
      blog1 = response.body;
    });

    //TODO need to investigate
    // it('binding of blog with user', async () => {
    //   const response = await bindBlogWithUser(app, blog1.id, user1.id).set(
    //     correctBasicCredentials,
    //   );
    //   expect(response.status).toBe(204);
    // });

    it('Posts creating', async () => {
      const response1 = await createPostByBlogIdRequest(app, blog1.id)
        .set(getBearerAuthHeader(user1Token))
        .send(correctCreatePostDtos[0]);
      expect(response1.status).toBe(201);
      post1 = response1.body;
    });

    it('Comment creating', async () => {
      const response = await createCommentByPostIdRequest(app, post1.id)
        .set(getBearerAuthHeader(user1Token))
        .send(correctCreateCommentDtos[0]);
      expect(response.status).toBe(201);
      comment1 = response.body;
    });
  });

  describe('/(GET ONE COMMENT) get one comment', () => {
    it('by invalid id', async () => {
      const response = await getCommentRequest(app, INVALID_ID);
      expect(response.status).toBe(404);
    });

    it('by valid id', async () => {
      const response = await getCommentRequest(app, comment1.id);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        getCommentItem(comment1.content, user1.login),
      );
    });
  });

  describe('/(UPDATE ONE COMMENT)', () => {
    it('incorrect token or without it', async () => {
      const response1 = await updateCommentRequest(app, post1.id).send(
        correctUpdateCommentDto,
      );
      expect(response1.status).toBe(401);

      const response2 = await updateCommentRequest(app, post1.id)
        .set(getBearerAuthHeader(incorrectAccessToken))
        .send(correctUpdateCommentDto);
      expect(response2.status).toBe(401);
    });

    it('correct token but invalid id', async () => {
      const response = await updateCommentRequest(app, INVALID_ID)
        .set(getBearerAuthHeader(user1Token))
        .send(correctUpdateCommentDto);
      expect(response.status).toBe(404);
      expect(response.body).toEqual(notFoundExceptionMock);
    });

    it('correct token, valid id but incorrect input data', async () => {
      for (let i = 0; i < incorrectCommentsDtos.length; i++) {
        const response = await updateCommentRequest(app, comment1.id)
          .set(getBearerAuthHeader(user1Token))
          .send(incorrectCommentsDtos[i]);
        expect(response.status).toBe(400);
        expect(response.body).toEqual(commentsBadQueryResponse);
      }
    });

    // it('correct all (auth credentials, id, input data) but blog is someone else', async () => {
    //   const response = await updateBlogRequest(app, blog4.id)
    //     .set(getBearerAuthHeader(user1Token))
    //     .send(correctUpdateBlogDto);
    //   expect(response.status).toBe(403);
    // });

    it('correct all (token, id, input data)', async () => {
      const response1 = await updateCommentRequest(app, comment1.id)
        .set(getBearerAuthHeader(user1Token))
        .send(correctCreateCommentDtos[0]);
      expect(response1.status).toBe(204);

      const response2 = await getCommentRequest(app, comment1.id);
      expect(response2.body).toEqual(
        getCommentItem(comment1.content, correctCreateUserDtos[0].login),
      );
    });
  });

  describe('/(UPDATE COMMENT LIKE STATUS)', () => {
    it('incorrect token or without it', async () => {
      const response1 = await updateCommentLikeStatus(app, comment1.id).send(
        correctUpdateLikeStatusDto[0],
      );
      expect(response1.status).toBe(401);

      const response2 = await updateCommentLikeStatus(app, comment1.id)
        .set(getBearerAuthHeader(incorrectAccessToken))
        .send(correctUpdateLikeStatusDto[0]);
      expect(response2.status).toBe(401);
    });

    it('correct token but invalid id', async () => {
      const response = await updateCommentLikeStatus(app, INVALID_ID)
        .set(getBearerAuthHeader(user1Token))
        .send(correctUpdateLikeStatusDto[0]);
      expect(response.status).toBe(404);
      expect(response.body).toEqual(notFoundExceptionMock);
    });

    it('correct token, valid id but incorrect input data', async () => {
      for (let i = 0; i < incorrectLikeStatusDto.length; i++) {
        const response = await updateCommentLikeStatus(app, comment1.id)
          .set(getBearerAuthHeader(user1Token))
          .send(incorrectLikeStatusDto[i]);
        expect(response.status).toBe(400);
        expect(response.body).toEqual(likeBadQueryResponse);
      }
    });

    it('correct all (token, id, input data)', async () => {
      for (let i = 0; i < correctUpdateLikeStatusDto.length; i++) {
        const isLike =
          correctUpdateLikeStatusDto[i].likeStatus === LikeStatus.LIKE;
        const isDislike =
          correctUpdateLikeStatusDto[i].likeStatus === LikeStatus.DISLIKE;

        const response1 = await updateCommentLikeStatus(app, comment1.id)
          .set(getBearerAuthHeader(user1Token))
          .send(correctUpdateLikeStatusDto[i]);
        expect(response1.status).toBe(204);

        const response2 = await getCommentRequest(app, comment1.id).set({
          Authorization: user1Token,
        });
        expect(response2.status).toBe(200);
        expect(response2.body).toEqual({
          ...comment1,
          likesInfo: {
            likesCount: isLike ? 1 : 0,
            dislikesCount: isDislike ? 1 : 0,
            myStatus: correctUpdateLikeStatusDto[i].likeStatus,
          },
        } as ICommentWithLikeInfoOutputModel);
      }
    });
  });

  describe('/(DELETE ONE COMMENT) delete one comment', () => {
    it('incorrect token or without it', async () => {
      const response1 = await deleteCommentRequest(app, comment1.id);
      expect(response1.status).toBe(401);

      const response2 = await deleteCommentRequest(app, comment1.id).set(
        getBearerAuthHeader(incorrectAccessToken),
      );
      expect(response2.status).toBe(401);
    });

    it('correct token but invalid id', async () => {
      const response = await deleteCommentRequest(app, INVALID_ID).set(
        getBearerAuthHeader(user1Token),
      );
      expect(response.status).toBe(404);
      expect(response.body).toEqual(notFoundExceptionMock);
    });

    //TODO need to investigate
    // it('correct all (auth credentials, id, input data) but blog is someone else', async () => {
    //   const response = await updateBlogRequest(app, blog4.id)
    //     .set(getBearerAuthHeader(user1Token))
    //     .send(correctUpdateBlogDto);
    //   expect(response.status).toBe(403);
    // });

    it('correct token and valid id', async () => {
      const response = await deleteCommentRequest(app, comment1.id).set(
        getBearerAuthHeader(user1Token),
      );
      expect(response.status).toBe(204);

      const response2 = await getCommentRequest(app, comment1.id);
      expect(response2.status).toBe(404);
      expect(response2.body).toEqual(notFoundExceptionMock);
    });
  });

  afterAll(async () => {
    await app.close();
    await mongoMS.stop();
    await disconnect();
  });
});
