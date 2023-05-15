import { disconnect } from 'mongoose';
import {
  blogs,
  INVALID_ID,
  posts,
  auth,
  defaultResponses,
  errors,
  users,
  comments,
  likes,
} from './mockData';
import { publicPostsRequests } from './utils/posts-requests';
import { adminUsersRequests } from './utils/users-requests';
import { authRequests } from './utils/auth-requests';
import {
  bloggerBlogsRequests,
  publicBlogsRequests,
  adminBlogsRequests,
} from './utils/blogs-requests';
import { clearDataBase, initTestApp } from './utils/common';
import {
  AllPostsOutputModel,
  IFullPostOutputModel,
  IPostOutputModel,
} from '../src/posts/api/dto/posts-output-models.dto';
// import {
//   AllCommentsOutputModel,
//   ICommentWithLikeInfoOutputModel,
// } from '../src/comments/api/dto/comments-output-models.dto';
import { LikeStatus } from '../src/common/enums';

describe('Posts', () => {
  jest.setTimeout(20 * 1000);
  const { correctCreateBlogDtos } = blogs;
  const { notFoundExceptionMock, unauthorisedExceptionMock } = errors;
  const { correctCreatePostDtos, postsBadQueryResponse } = posts;
  const { correctBasicCredentials, incorrectAccessToken, getBearerAuthHeader } =
    auth;
  // const {
  //   correctCreateCommentDtos,
  //   commentsBadQueryResponse,
  //   incorrectCommentsDtos,
  //   getCommentItem,
  // } = comments;
  const {
    correctUpdateLikeStatusDto,
    incorrectLikeStatusDto,
    likeBadQueryResponse,
  } = likes;
  const { correctCreateUserDtos } = users;
  const { getAllItemsWithPage2Size1, defaultGetAllResponse } = defaultResponses;
  const {
    createCommentByPostIdRequest,
    getCommentsByPostIdRequest,
    getPostRequest,
    getPostsRequest,
    updatePostLikeStatus,
  } = publicPostsRequests;
  const { createBlogsRequest, createPostByBlogIdRequest } =
    bloggerBlogsRequests;
  const { getPostsByBlogIdAsUserRequest } = publicBlogsRequests;
  const { bindBlogWithUser } = adminBlogsRequests;
  const { loginRequest } = authRequests;
  const { createUserRequest } = adminUsersRequests;
  let app, mongoMS;
  let post1, post2, post3;
  let comment1, comment2;
  let blog1;
  let user1;
  let user1Token;

  beforeAll(async () => {
    const { nestApp, mongoMemoryServer } = await initTestApp();
    app = nestApp;
    mongoMS = mongoMemoryServer;

    postsBadQueryResponse.errorsMessages.push({
      message: expect.any(String),
      field: 'blogId',
    });
  });

  describe('/(GET All POSTS)', () => {
    it('by default without created posts', async () => {
      await clearDataBase(app);

      const response = await getPostsRequest(app);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(defaultGetAllResponse);
    });
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

    it('Posts creating', async () => {
      const response1 = await createPostByBlogIdRequest(app, blog1.id)
        .set(getBearerAuthHeader(user1Token))
        .send(correctCreatePostDtos[0]);
      expect(response1.status).toBe(201);
      post1 = response1.body;

      const response2 = await createPostByBlogIdRequest(app, blog1.id)
        .set(getBearerAuthHeader(user1Token))
        .send(correctCreatePostDtos[1]);
      expect(response2.status).toBe(201);
      post2 = response2.body;

      const response3 = await createPostByBlogIdRequest(app, blog1.id)
        .set(getBearerAuthHeader(user1Token))
        .send(correctCreatePostDtos[2]);
      expect(response3.status).toBe(201);
      post3 = response3.body;
    });
  });

  describe('/(GET All POSTS)', () => {
    it('with query Params', async () => {
      const response1 = await getPostsRequest(app).query({
        pageNumber: 2,
        pageSize: 1,
      });
      const expectedResult = getAllItemsWithPage2Size1<
        IPostOutputModel,
        AllPostsOutputModel
      >(post2);
      expect(response1.body).toEqual(expectedResult);

      const response2 = await getPostsByBlogIdAsUserRequest(
        app,
        blog1.id,
      ).query({
        sortBy: 'content',
        sortDirection: 'asc',
      });
      expect(response2.body.items[0].id).toBe(post1.id);
      expect(response2.body.items[response2.body.items.length - 1].id).toBe(
        post3.id,
      );
    });
  });

  describe('/(GET ONE POST)', () => {
    it('by invalid id', async () => {
      const response = await getPostRequest(app, INVALID_ID);
      expect(response.status).toBe(404);
    });

    it('by valid id', async () => {
      const response = await getPostRequest(app, post1.id);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(post1);
    });
  });

  // describe('/(POST COMMENTS)', () => {
  //   it('without token or with incorrect token', async () => {
  //     const response1 = await createCommentByPostIdRequest(app, post1.id).send(
  //       correctCreateCommentDtos[0],
  //     );
  //     expect(response1.status).toBe(401);
  //     expect(response1.body).toEqual(unauthorisedExceptionMock);
  //
  //     const response2 = await createCommentByPostIdRequest(app, post1.id)
  //       .set(getBearerAuthHeader(incorrectAccessToken))
  //       .send(correctCreateCommentDtos[0]);
  //     expect(response2.status).toBe(401);
  //     expect(response2.body).toEqual(unauthorisedExceptionMock);
  //   });
  //
  //   it('correct token but invalid id', async () => {
  //     const response = await createCommentByPostIdRequest(app, INVALID_ID)
  //       .set(getBearerAuthHeader(user1Token))
  //       .send(correctCreateCommentDtos[0]);
  //     expect(response.status).toBe(404);
  //     expect(response.body).toEqual(notFoundExceptionMock);
  //   });
  //
  //   it('correct token, valid postId but incorrect input data', async () => {
  //     for (let i = 0; i <= incorrectCommentsDtos.length; i++) {
  //       const response = await createCommentByPostIdRequest(app, post1.id)
  //         .set(getBearerAuthHeader(user1Token))
  //         .send(incorrectCommentsDtos[i]);
  //       expect(response.status).toBe(400);
  //       expect(response.body).toEqual(commentsBadQueryResponse);
  //     }
  //   });
  //
  //   it('everything is correct (token, id, input data)', async () => {
  //     const response1 = await createCommentByPostIdRequest(app, post1.id)
  //       .set(getBearerAuthHeader(user1Token))
  //       .send(correctCreateCommentDtos[0]);
  //     expect(response1.status).toBe(201);
  //     expect(response1.body).toEqual(
  //       getCommentItem(
  //         correctCreateCommentDtos[0].content,
  //         correctCreateUserDtos[0].login,
  //       ),
  //     );
  //     comment1 = response1.body;
  //
  //     const response2 = await createCommentByPostIdRequest(app, post1.id)
  //       .set(getBearerAuthHeader(user1Token))
  //       .send(correctCreateCommentDtos[1]);
  //     expect(response2.status).toBe(201);
  //     expect(response2.body).toEqual(
  //       getCommentItem(
  //         correctCreateCommentDtos[1].content,
  //         correctCreateUserDtos[0].login,
  //       ),
  //     );
  //     comment2 = response2.body;
  //   });
  // });

  // describe('/(GET All COMMENTS)', () => {
  //   it('by invalid id', async () => {
  //     const response = await getCommentsByPostIdRequest(app, INVALID_ID);
  //     expect(response.status).toBe(404);
  //     expect(response.body).toEqual(notFoundExceptionMock);
  //   });
  //
  //   it('by valid postId without query params', async () => {
  //     const response = await getCommentsByPostIdRequest(app, post1.id);
  //     expect(response.status).toBe(200);
  //     expect(response.body).toEqual({
  //       page: 1,
  //       pageSize: 10,
  //       pagesCount: 1,
  //       totalCount: 2,
  //       items: [comment2, comment1],
  //     });
  //   });
  //
  //   it('by valid postId with query params', async () => {
  //     const response1 = await getCommentsByPostIdRequest(app, post1.id).query({
  //       pageNumber: 2,
  //       pageSize: 1,
  //     });
  //     const expectedResult = getAllItemsWithPage2Size1<
  //       ICommentWithLikeInfoOutputModel,
  //       AllCommentsOutputModel
  //     >(comment1);
  //     expect(response1.body).toEqual({
  //       ...expectedResult,
  //       pagesCount: 2,
  //       totalCount: 2,
  //     });
  //
  //     const response2 = await getCommentsByPostIdRequest(app, post1.id).query({
  //       sortBy: 'content',
  //       sortDirection: 'asc',
  //     });
  //     expect(response2.body.items[0].id).toBe(comment1.id);
  //     expect(response2.body.items[response2.body.items.length - 1].id).toBe(
  //       comment2.id,
  //     );
  //   });
  // });

  // describe('/(UPDATE POST LIKE STATUS)', () => {
  //   it('incorrect token or without it', async () => {
  //     const response1 = await updatePostLikeStatus(app, post1.id).send(
  //       correctUpdateLikeStatusDto[0],
  //     );
  //     expect(response1.status).toBe(401);
  //
  //     const response2 = await updatePostLikeStatus(app, post1.id)
  //       .set({ Authorization: incorrectAccessToken })
  //       .send(correctUpdateLikeStatusDto[0]);
  //     expect(response2.status).toBe(401);
  //   });
  //
  //   it('correct token but invalid id', async () => {
  //     const response = await updatePostLikeStatus(app, INVALID_ID)
  //       .set(getBearerAuthHeader(user1Token))
  //       .send(correctUpdateLikeStatusDto[0]);
  //     expect(response.status).toBe(404);
  //     expect(response.body).toEqual(notFoundExceptionMock);
  //   });
  //
  //   it('correct token, valid id but incorrect input data', async () => {
  //     for (let i = 0; i < incorrectLikeStatusDto.length; i++) {
  //       const response = await updatePostLikeStatus(app, post1.id)
  //         .set(getBearerAuthHeader(user1Token))
  //         .send(incorrectLikeStatusDto[i]);
  //       expect(response.status).toBe(400);
  //       expect(response.body).toEqual(likeBadQueryResponse);
  //     }
  //   });
  //
  //   it('correct all (token, id, input data)', async () => {
  //     for (let i = 0; i < correctUpdateLikeStatusDto.length; i++) {
  //       const isLike =
  //         correctUpdateLikeStatusDto[i].likeStatus === LikeStatus.LIKE;
  //       const isDislike =
  //         correctUpdateLikeStatusDto[i].likeStatus === LikeStatus.DISLIKE;
  //
  //       const response1 = await updatePostLikeStatus(app, post1.id)
  //         .set(getBearerAuthHeader(user1Token))
  //         .send(correctUpdateLikeStatusDto[i]);
  //       expect(response1.status).toBe(204);
  //
  //       const response2 = await getPostRequest(app, post1.id).set(
  //         getBearerAuthHeader(user1Token),
  //       );
  //       expect(response2.status).toBe(200);
  //       expect(response2.body).toEqual({
  //         ...post1,
  //         ...correctCreatePostDtos[0],
  //         extendedLikesInfo: {
  //           likesCount: isLike ? 1 : 0,
  //           dislikesCount: isDislike ? 1 : 0,
  //           myStatus: correctUpdateLikeStatusDto[i].likeStatus,
  //           newestLikes: isLike
  //             ? [
  //                 {
  //                   login: user1.login,
  //                   userId: user1.id,
  //                   addedAt: expect.any(String),
  //                 },
  //               ]
  //             : [],
  //         },
  //       } as IFullPostOutputModel);
  //     }
  //   });
  // });

  afterAll(async () => {
    await app.close();
    await mongoMS.stop();
    await disconnect();
  });
});
