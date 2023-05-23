import { disconnect } from 'mongoose';
import {
  auth,
  blogs,
  posts,
  errors,
  INVALID_ID,
  users,
  defaultResponses,
  comments,
} from './mockData';
import { clearDataBase, initTestApp } from './utils/common';
import {
  adminBlogsRequests,
  bloggerBlogsRequests,
  publicBlogsRequests,
} from './utils/blogs-requests';
import { adminUsersRequests } from './utils/users-requests';
import { authRequests } from './utils/auth-requests';
import { publicPostsRequests } from './utils/posts-requests';
import {
  AllBlogsOutputModel,
  IBlogForAdminOutputModel,
  IBlogOutputModel,
} from '../src/blogs/api/dto/blogs-output-models.dto';
import {
  AllPostsOutputModel,
  IFullPostOutputModel,
} from '../src/posts/api/dto/posts-output-models.dto';
import {
  DEFAULT_PAGE_NUMBER,
  DEFAULT_PAGE_SIZE,
} from '../src/common/constants';

describe('BLOGS', () => {
  jest.setTimeout(20 * 1000);
  const { correctCreateUserDtos } = users;
  const {
    incorrectBlogsDtos,
    correctCreateBlogDtos,
    correctUpdateBlogDto,
    getBlogItem,
    getBlogItemForAdmin,
    blogsBadQueryResponse,
  } = blogs;
  const {
    correctCreatePostDtos,
    correctUpdatePostDto,
    incorrectPostsDtos,
    postsBadQueryResponse,
    getPostItem,
  } = posts;
  const { notFoundExceptionMock } = errors;
  const { getAllItemsWithPage2Size1 } = defaultResponses;
  const {
    incorrectBasicCredentials,
    correctBasicCredentials,
    incorrectAccessToken,
    getBearerAuthHeader,
  } = auth;
  // const { correctCreateCommentDtos, getCommentItemAsBlogger } = comments;
  const { createUserRequest } = adminUsersRequests;
  const { createCommentByPostIdRequest } = publicPostsRequests;
  const { loginRequest } = authRequests;
  const {
    bindBlogWithUser,
    getBlogsAsAdminRequest,
    updateBlogBanStatusRequest,
  } = adminBlogsRequests;
  const {
    createBlogsRequest,
    createPostByBlogIdRequest,
    deleteBlogRequest,
    deletePostByBlogIdRequest,
    updateBlogRequest,
    getBlogsAsBloggerRequest,
    updatePostByBlogIdRequest,
    getAllPostsCommentsInsideBlogRequest,
  } = bloggerBlogsRequests;
  const {
    getBlogAsUserRequest,
    getBlogsAsUserRequest,
    getPostsByBlogIdAsUserRequest,
  } = publicBlogsRequests;
  const { getPostRequest } = publicPostsRequests;
  let app, mongoMS;
  let user1, user2, user1Token, user2Token;
  let blog1, blog2, blog3;
  let post1, post2;
  let comment1, comment2;

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

      const response2 = await createUserRequest(app)
        .set(correctBasicCredentials)
        .send(correctCreateUserDtos[1]);
      expect(response2.status).toBe(201);
      user2 = response2.body;
    });

    it('User login', async () => {
      const response1 = await loginRequest(app).send({
        loginOrEmail: correctCreateUserDtos[0].login,
        password: correctCreateUserDtos[0].password,
      });
      expect(response1.status).toBe(200);
      user1Token = `Bearer ${response1.body.accessToken}`;

      const response2 = await loginRequest(app).send({
        loginOrEmail: correctCreateUserDtos[1].login,
        password: correctCreateUserDtos[1].password,
      });
      expect(response2.status).toBe(200);
      user2Token = `Bearer ${response2.body.accessToken}`;
    });
  });

  describe('Blogger API', () => {
    describe('/(CREATE BLOG) create blog as blogger', () => {
      it('incorrect auth credentials or without them', async () => {
        const response1 = await createBlogsRequest(app).send(
          correctCreateBlogDtos[0],
        );
        expect(response1.status).toBe(401);

        const response2 = await createBlogsRequest(app)
          .set(getBearerAuthHeader(incorrectAccessToken))
          .send(correctCreateBlogDtos[0]);
        expect(response2.status).toBe(401);
      });

      it('correct auth credentials and incorrect input data', async () => {
        for (let i = 0; i <= incorrectBlogsDtos.length; i++) {
          const response = await createBlogsRequest(app)
            .set(getBearerAuthHeader(user1Token))
            .send(incorrectBlogsDtos[i]);
          expect(response.status).toBe(400);
          expect(response.body).toEqual(blogsBadQueryResponse);
        }
      });

      it('correct auth credentials and correct input data', async () => {
        const response1 = await createBlogsRequest(app)
          .set(getBearerAuthHeader(user1Token))
          .send(correctCreateBlogDtos[0]);
        expect(response1.status).toBe(201);
        expect(response1.body).toEqual(getBlogItem(correctCreateBlogDtos[0]));
        blog1 = response1.body;

        const response2 = await createBlogsRequest(app)
          .set(getBearerAuthHeader(user1Token))
          .send(correctCreateBlogDtos[1]);
        expect(response2.status).toBe(201);
        expect(response2.body).toEqual(getBlogItem(correctCreateBlogDtos[1]));
        blog2 = response2.body;

        const response3 = await createBlogsRequest(app)
          .set(getBearerAuthHeader(user2Token))
          .send(correctCreateBlogDtos[2]);
        expect(response3.status).toBe(201);
        expect(response3.body).toEqual(getBlogItem(correctCreateBlogDtos[2]));
        blog3 = response3.body;

        const response5 = await getBlogsAsUserRequest(app);
        expect(response5.body.items).toHaveLength(3);

        //!!!___This endpoint we don't need to test, since logic of app regarding this
        // was changed and now blog is bound with user by default___!!!

        // expect(response1.body.blogOwnerInfo.ownerId).toBe(user1.id);
        // expect(response2.body.blogOwnerInfo.ownerId).toBe(user1.id);
        // expect(response3.body.blogOwnerInfo.ownerId).toBe(user1.id);
        // expect(response4.body.blogOwnerInfo.ownerId).toBe(user2.id);

        // const response6 = await bindBlogWithUser(app, blog1.id, user1.id).set(
        //   correctBasicCredentials,
        // );
        // expect(response6.status).toBe(204);
        //
        // const response7 = await bindBlogWithUser(app, blog2.id, user1.id).set(
        //   correctBasicCredentials,
        // );
        // expect(response7.status).toBe(204);
        //
        // const response8 = await bindBlogWithUser(app, blog3.id, user1.id).set(
        //   correctBasicCredentials,
        // );
        // expect(response8.status).toBe(204);
        //
        // const response9 = await bindBlogWithUser(app, blog4.id, user2.id).set(
        //   correctBasicCredentials,
        // );
        // expect(response9.status).toBe(204);
      });
    });

    describe('/(UPDATE ONE BLOG) update blog as blogger', () => {
      it('incorrect auth credentials or without them', async () => {
        const response1 = await updateBlogRequest(app, blog1.id).send(
          correctUpdateBlogDto,
        );
        expect(response1.status).toBe(401);

        const response2 = await updateBlogRequest(app, blog1.id)
          .set(getBearerAuthHeader(incorrectAccessToken))
          .send(correctUpdateBlogDto);
        expect(response2.status).toBe(401);
      });

      it('correct auth credentials but invalid id', async () => {
        const response = await updateBlogRequest(app, INVALID_ID)
          .set(getBearerAuthHeader(user1Token))
          .send(correctUpdateBlogDto);
        expect(response.status).toBe(404);
        expect(response.body).toEqual(notFoundExceptionMock);
      });

      it('correct auth credentials, valid id but incorrect input data', async () => {
        for (let i = 0; i <= incorrectBlogsDtos.length; i++) {
          const response = await updateBlogRequest(app, blog1.id)
            .set(getBearerAuthHeader(user1Token))
            .send(incorrectBlogsDtos[i]);
          expect(response.status).toBe(400);
          expect(response.body).toEqual(blogsBadQueryResponse);
        }
      });

      it('correct all (auth credentials, id, input data) but blog is someone else', async () => {
        const response = await updateBlogRequest(app, blog3.id)
          .set(getBearerAuthHeader(user1Token))
          .send(correctUpdateBlogDto);
        expect(response.status).toBe(403);
      });

      it('correct all (auth credentials, id, input data)', async () => {
        const response = await updateBlogRequest(app, blog1.id)
          .set(getBearerAuthHeader(user1Token))
          .send(correctUpdateBlogDto);
        expect(response.status).toBe(204);

        const response2 = await getBlogAsUserRequest(app, blog1.id);
        expect(response2.body).toEqual(getBlogItem(correctUpdateBlogDto));
      });
    });

    describe('/(GET ALL BLOGS) get all blogs as blogger', () => {
      it('incorrect auth credentials or without them', async () => {
        const response1 = await getBlogsAsBloggerRequest(app);
        expect(response1.status).toBe(401);

        const response2 = await getBlogsAsBloggerRequest(app).set(
          getBearerAuthHeader(incorrectAccessToken),
        );
        expect(response2.status).toBe(401);
      });

      it('correct auth credentials', async () => {
        const response1 = await getBlogsAsBloggerRequest(app).set(
          getBearerAuthHeader(user1Token),
        );
        expect(response1.status).toBe(200);
        expect(response1.body.items.length).toBe(2);

        const response2 = await getBlogsAsBloggerRequest(app).set(
          getBearerAuthHeader(user2Token),
        );
        expect(response2.status).toBe(200);
        expect(response2.body.items.length).toBe(1);
      });

      it('with query Params', async () => {
        const response1 = await getBlogsAsBloggerRequest(app)
          .set(getBearerAuthHeader(user1Token))
          .query({ pageNumber: 2, pageSize: 1 });
        expect(response1.body.page).toBe(2);
        expect(response1.body.pageSize).toBe(1);
        expect(response1.body.pagesCount).toBe(2);
        expect(response1.body.totalCount).toBe(2);
        expect(response1.body.items.length).toBe(1);

        const response2 = await getBlogsAsBloggerRequest(app)
          .set(getBearerAuthHeader(user1Token))
          .query({ searchNameTerm: '2' });
        expect(response2.body.items).toHaveLength(1);
        expect(response2.body.totalCount).toBe(1);
        expect(response2.body.items[0].id).toBe(blog2.id);

        const response3 = await getBlogsAsBloggerRequest(app)
          .set(getBearerAuthHeader(user1Token))
          .query({ sortBy: 'name', sortDirection: 'asc' });
        expect(response3.body.items[0].id).toBe(blog2.id);
        expect(response3.body.items[response3.body.items.length - 1].id).toBe(
          blog1.id,
        );
      });
    });

    describe('/(DELETE ONE BLOG) delete blog as blogger', () => {
      it('incorrect auth credentials or without them', async () => {
        const response1 = await deleteBlogRequest(app, blog1.id);
        expect(response1.status).toBe(401);

        const response2 = await deleteBlogRequest(app, blog1.id).set(
          getBearerAuthHeader(incorrectAccessToken),
        );
        expect(response2.status).toBe(401);
      });

      it('correct auth credentials but invalid id', async () => {
        const response = await deleteBlogRequest(app, INVALID_ID).set(
          getBearerAuthHeader(user1Token),
        );
        expect(response.status).toBe(404);
        expect(response.body).toEqual(notFoundExceptionMock);
      });

      it('correct all (auth credentials, id, input data) but blog is someone else', async () => {
        const response = await deleteBlogRequest(app, blog3.id).set(
          getBearerAuthHeader(user1Token),
        );
        expect(response.status).toBe(403);
      });

      it('correct auth credentials and valid id', async () => {
        const response = await deleteBlogRequest(app, blog1.id).set(
          getBearerAuthHeader(user1Token),
        );
        expect(response.status).toBe(204);

        const response2 = await getBlogAsUserRequest(app, blog1.id);
        expect(response2.status).toBe(404);
        expect(response2.body).toEqual(notFoundExceptionMock);
        blog1 = null;

        const response3 = await getBlogsAsBloggerRequest(app).set(
          getBearerAuthHeader(user1Token),
        );
        expect(response3.body.items.length).toBe(1);
      });
    });

    describe('/(CREATE POST) create post as blogger', () => {
      beforeAll(async () => {
        const response1 = await createBlogsRequest(app)
          .set(getBearerAuthHeader(user1Token))
          .send(correctCreateBlogDtos[0]);
        expect(response1.status).toBe(201);
        blog1 = response1.body;
      });

      it('incorrect auth credentials or without them', async () => {
        const response2 = await createPostByBlogIdRequest(app, blog1.id).send(
          correctCreatePostDtos[0],
        );
        expect(response2.status).toBe(401);

        const response3 = await createPostByBlogIdRequest(app, blog1.id)
          .set(getBearerAuthHeader(incorrectAccessToken))
          .send(correctCreatePostDtos[0]);
        expect(response3.status).toBe(401);
      });

      it('correct auth credentials but incorrect blog id', async () => {
        const response = await createPostByBlogIdRequest(app, INVALID_ID)
          .set(getBearerAuthHeader(user1Token))
          .send(correctCreatePostDtos[0]);
        expect(response.status).toBe(404);
        expect(response.body).toEqual(notFoundExceptionMock);
      });

      it('correct auth credentials, valid blog id but incorrect input data', async () => {
        for (let i = 0; i <= incorrectPostsDtos.length; i++) {
          const response = await createPostByBlogIdRequest(app, blog1.id)
            .set(getBearerAuthHeader(user1Token))
            .send(incorrectPostsDtos[i]);
          expect(response.status).toBe(400);
          expect(response.body).toEqual(postsBadQueryResponse);
        }
      });

      it('correct all (auth credentials, id, input data) but blog is someone else', async () => {
        const response = await createPostByBlogIdRequest(app, blog3.id)
          .set(getBearerAuthHeader(user1Token))
          .send(correctCreatePostDtos[0]);
        expect(response.status).toBe(403);
      });

      it('correct all (auth credentials, id, input data)', async () => {
        const response1 = await createPostByBlogIdRequest(app, blog1.id)
          .set(getBearerAuthHeader(user1Token))
          .send(correctCreatePostDtos[0]);
        const targetPost1 = getPostItem(correctCreatePostDtos[0], blog1);
        expect(response1.status).toBe(201);
        expect(response1.body).toEqual(targetPost1);
        post1 = response1.body;

        const response2 = await createPostByBlogIdRequest(app, blog1.id)
          .set(getBearerAuthHeader(user1Token))
          .send(correctCreatePostDtos[1]);
        const targetPost2 = getPostItem(correctCreatePostDtos[1], blog1);
        expect(response2.status).toBe(201);
        expect(response2.body).toEqual(targetPost2);
        post2 = response2.body;
      });
    });

    describe('/(UPDATE POST) update post of blog as blogger', () => {
      it('incorrect auth credentials or without them', async () => {
        const res1 = await updatePostByBlogIdRequest(
          app,
          blog1.id,
          post1.id,
        ).send(correctUpdatePostDto);
        expect(res1.status).toBe(401);

        const res2 = await updatePostByBlogIdRequest(app, blog1.id, post1.id)
          .set(getBearerAuthHeader(incorrectAccessToken))
          .send(correctUpdatePostDto);
        expect(res2.status).toBe(401);
      });

      it('correct auth credentials but invalid blogId or postId', async () => {
        const res1 = await updatePostByBlogIdRequest(app, INVALID_ID, post1.id)
          .set(getBearerAuthHeader(user1Token))
          .send(correctUpdatePostDto);
        expect(res1.status).toBe(404);
        expect(res1.body).toEqual(notFoundExceptionMock);

        const res2 = await updatePostByBlogIdRequest(app, blog1.id, INVALID_ID)
          .set(getBearerAuthHeader(user1Token))
          .send(correctUpdatePostDto);
        expect(res2.status).toBe(404);
        expect(res2.body).toEqual(notFoundExceptionMock);
      });

      it('correct auth credentials, valid ids but incorrect input data', async () => {
        for (let i = 0; i < incorrectPostsDtos.length; i++) {
          const res = await updatePostByBlogIdRequest(app, blog1.id, post1.id)
            .set(getBearerAuthHeader(user1Token))
            .send(incorrectPostsDtos[i]);
          expect(res.status).toBe(400);
          expect(res.body).toEqual(postsBadQueryResponse);
        }
      });

      it('correct all (auth credentials, id, input data) but blog is someone else', async () => {
        const res = await updatePostByBlogIdRequest(app, blog3.id, post1.id)
          .set(getBearerAuthHeader(user1Token))
          .send(correctUpdatePostDto);
        expect(res.status).toBe(403);
      });

      it('correct all (auth credentials, id, input data)', async () => {
        const res = await updatePostByBlogIdRequest(app, blog1.id, post1.id)
          .set(getBearerAuthHeader(user1Token))
          .send(correctUpdatePostDto);
        expect(res.status).toBe(204);

        const testingPost = await getPostRequest(app, post1.id);
        expect(testingPost.body.title).toBe(correctUpdatePostDto.title);
        expect(testingPost.body.content).toBe(correctUpdatePostDto.content);
        expect(testingPost.body.shortDescription).toBe(
          correctUpdatePostDto.shortDescription,
        );
      });
    });

    // describe('/(GET COMMENTS) get all blogger comments', () => {
    //   beforeAll(async () => {
    //     const response1 = await createCommentByPostIdRequest(app, post1.id)
    //       .set(getBearerAuthHeader(user1Token))
    //       .send(correctCreateCommentDtos[0]);
    //     expect(response1.status).toBe(201);
    //     comment1 = response1.body;
    //
    //     const response2 = await createCommentByPostIdRequest(app, post2.id)
    //       .set(getBearerAuthHeader(user1Token))
    //       .send(correctCreateCommentDtos[1]);
    //     expect(response2.status).toBe(201);
    //     comment2 = response2.body;
    //   });
    //
    //   it('incorrect auth credentials or without them', async () => {
    //     const response1 = await getAllPostsCommentsInsideBlogRequest(app);
    //     expect(response1.status).toBe(401);
    //
    //     const response2 = await getAllPostsCommentsInsideBlogRequest(app).set(
    //       getBearerAuthHeader(incorrectAccessToken),
    //     );
    //     expect(response2.status).toBe(401);
    //   });
    //
    //   it('correct auth credentials', async () => {
    //     const response1 = await getAllPostsCommentsInsideBlogRequest(app).set(
    //       getBearerAuthHeader(user1Token),
    //     );
    //     expect(response1.status).toBe(200);
    //     expect(response1.body.items.length).toBe(2);
    //     expect(response1.body.items[0]).toEqual(
    //       getCommentItemAsBlogger(comment2, user1, post2),
    //     );
    //   });
    //
    //   it('with query Params', async () => {
    //     const response1 = await getAllPostsCommentsInsideBlogRequest(app)
    //       .set(getBearerAuthHeader(user1Token))
    //       .query({ pageNumber: 2, pageSize: 1 });
    //     expect(response1.body.page).toBe(2);
    //     expect(response1.body.pageSize).toBe(1);
    //     expect(response1.body.pagesCount).toBe(2);
    //     expect(response1.body.totalCount).toBe(2);
    //     expect(response1.body.items.length).toBe(1);
    //
    //     const response3 = await getAllPostsCommentsInsideBlogRequest(app)
    //       .set(getBearerAuthHeader(user1Token))
    //       .query({ sortBy: 'content', sortDirection: 'asc' });
    //     expect(response3.body.items[0].id).toBe(comment1.id);
    //     expect(response3.body.items[response3.body.items.length - 1].id).toBe(
    //       comment2.id,
    //     );
    //   });
    // });

    describe('/(DELETE POST) delete post of blog as blogger', () => {
      it('incorrect auth credentials or without them', async () => {
        const res1 = await deletePostByBlogIdRequest(app, blog1.id, post1.id);
        expect(res1.status).toBe(401);

        const res2 = await deletePostByBlogIdRequest(
          app,
          blog1.id,
          post1.id,
        ).set(getBearerAuthHeader(incorrectAccessToken));
        expect(res2.status).toBe(401);
      });

      it('correct auth credentials but invalid blogId or postId', async () => {
        const res1 = await deletePostByBlogIdRequest(
          app,
          INVALID_ID,
          post1.id,
        ).set(getBearerAuthHeader(user1Token));
        expect(res1.status).toBe(404);
        expect(res1.body).toEqual(notFoundExceptionMock);

        const res2 = await deletePostByBlogIdRequest(
          app,
          blog1.id,
          INVALID_ID,
        ).set(getBearerAuthHeader(user1Token));
        expect(res2.status).toBe(404);
        expect(res2.body).toEqual(notFoundExceptionMock);
      });

      it('correct all (auth credentials, id, input data) but blog is someone else', async () => {
        const res = await deletePostByBlogIdRequest(
          app,
          blog3.id,
          post1.id,
        ).set(getBearerAuthHeader(user1Token));
        expect(res.status).toBe(403);
      });

      it('correct all (auth credentials, id, input data)', async () => {
        const res = await deletePostByBlogIdRequest(
          app,
          blog1.id,
          post1.id,
        ).set(getBearerAuthHeader(user1Token));
        expect(res.status).toBe(204);

        const testingPost = await getPostRequest(app, post1.id);
        expect(testingPost.status).toBe(404);
        expect(testingPost.body).toEqual(notFoundExceptionMock);
      });
    });
  });

  describe('Public User API', () => {
    beforeAll(async () => {
      await clearDataBase(app);

      const response1 = await createUserRequest(app)
        .set(correctBasicCredentials)
        .send(correctCreateUserDtos[0]);
      expect(response1.status).toBe(201);
      user1 = response1.body;

      const response2 = await createUserRequest(app)
        .set(correctBasicCredentials)
        .send(correctCreateUserDtos[1]);
      expect(response2.status).toBe(201);
      user2 = response2.body;

      const response3 = await loginRequest(app).send({
        loginOrEmail: correctCreateUserDtos[0].login,
        password: correctCreateUserDtos[0].password,
      });
      expect(response3.status).toBe(200);
      user1Token = `Bearer ${response3.body.accessToken}`;

      const response4 = await loginRequest(app).send({
        loginOrEmail: correctCreateUserDtos[1].login,
        password: correctCreateUserDtos[1].password,
      });
      expect(response4.status).toBe(200);
      user2Token = `Bearer ${response4.body.accessToken}`;

      const blogs = [blog1, blog2, blog3];

      for (let i = 0; i < correctCreateBlogDtos.length; i++) {
        const res = await createBlogsRequest(app)
          .set(getBearerAuthHeader(user1Token))
          .send(correctCreateBlogDtos[i]);
        blogs[i] = res.body;
      }
      [blog1, blog2, blog3] = blogs;
    });

    describe('/(GET ALL BLOGS) get all blogs as public user', () => {
      it('without query params', async () => {
        const response = await getBlogsAsUserRequest(app);

        expect(response.status).toBe(200);
        expect(response.body.items.length).toBe(3);
      });

      it('with query Params', async () => {
        const response1 = await getBlogsAsUserRequest(app).query({
          pageNumber: 2,
          pageSize: 1,
        });
        const expectedResult = getAllItemsWithPage2Size1<
          IBlogOutputModel,
          AllBlogsOutputModel
        >(blog2);
        expect(response1.body).toEqual(expectedResult);

        const response2 = await getBlogsAsUserRequest(app).query({
          searchNameTerm: '2',
        });
        expect(response2.body.items).toHaveLength(1);
        expect(response2.body.totalCount).toBe(1);
        expect(response2.body.items[0].id).toBe(blog2.id);

        const response3 = await getBlogsAsUserRequest(app).query({
          sortBy: 'name',
          sortDirection: 'asc',
        });
        expect(response3.body.items[0].id).toBe(blog1.id);
        expect(response3.body.items[response3.body.items.length - 1].id).toBe(
          blog3.id,
        );
      });
    });

    describe('/(GET ONE BLOG) get one blog as public user', () => {
      it('by invalid id', async () => {
        const response = await getBlogAsUserRequest(app, INVALID_ID);
        expect(response.status).toBe(404);
        expect(response.body).toEqual(notFoundExceptionMock);
      });

      it('by valid id', async () => {
        const response = await getBlogAsUserRequest(app, blog1.id);
        expect(response.status).toBe(200);
        expect(response.body).toEqual(blog1);
      });
    });

    describe('/(GET ALL POSTS) get all posts', () => {
      beforeAll(async () => {
        const res1 = await createPostByBlogIdRequest(app, blog1.id)
          .set(getBearerAuthHeader(user1Token))
          .send(correctCreatePostDtos[0]);
        expect(res1.status).toBe(201);
        post1 = res1.body;

        const res2 = await createPostByBlogIdRequest(app, blog1.id)
          .set(getBearerAuthHeader(user1Token))
          .send(correctCreatePostDtos[1]);
        expect(res2.status).toBe(201);
        post2 = res2.body;
      });

      it('by invalid blogId', async () => {
        const response = await getPostsByBlogIdAsUserRequest(app, INVALID_ID);
        expect(response.status).toBe(404);
        expect(response.body).toEqual(notFoundExceptionMock);
      });

      it('by valid blogId without query params', async () => {
        const response = await getPostsByBlogIdAsUserRequest(app, blog1.id);
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          page: 1,
          pageSize: DEFAULT_PAGE_SIZE,
          pagesCount: DEFAULT_PAGE_NUMBER,
          totalCount: 2,
          items: [post2, post1],
        });
      });

      it('by valid blogId with query params', async () => {
        const response1 = await getPostsByBlogIdAsUserRequest(
          app,
          blog1.id,
        ).query({
          pageNumber: 2,
          pageSize: 1,
        });
        const expectedResult = getAllItemsWithPage2Size1<
          IFullPostOutputModel,
          AllPostsOutputModel
        >(post1);
        expect(response1.body).toEqual({
          ...expectedResult,
          pagesCount: 2,
          totalCount: 2,
        });

        const response2 = await getPostsByBlogIdAsUserRequest(
          app,
          blog1.id,
        ).query({
          sortBy: 'title',
          sortDirection: 'asc',
        });
        expect(response2.body.items[0].id).toBe(post1.id);
        expect(response2.body.items[response2.body.items.length - 1].id).toBe(
          post2.id,
        );
      });
    });
  });

  describe('Admin API', () => {
    describe('/(GET ALL BLOGS) get all blogs as Admin', () => {
      it('incorrect auth credentials or without them', async () => {
        const response1 = await getBlogsAsAdminRequest(app);
        expect(response1.status).toBe(401);

        const response2 = await getBlogsAsAdminRequest(app).set(
          incorrectBasicCredentials,
        );
        expect(response2.status).toBe(401);
      });

      it('without query params', async () => {
        const response = await getBlogsAsAdminRequest(app).set(
          correctBasicCredentials,
        );

        expect(response.status).toBe(200);
        expect(response.body.items.length).toBe(3);
        expect(response.body.items[2]).toEqual(
          getBlogItemForAdmin(correctCreateBlogDtos[0], user1.login),
        );
      });

      it('with query Params', async () => {
        const response1 = await getBlogsAsUserRequest(app).query({
          pageNumber: 2,
          pageSize: 1,
        });
        const expectedResult = getAllItemsWithPage2Size1<
          IBlogForAdminOutputModel,
          AllBlogsOutputModel
        >(blog2);
        expect(response1.body).toEqual(expectedResult);

        const response2 = await getBlogsAsUserRequest(app).query({
          searchNameTerm: '2',
        });
        expect(response2.body.items).toHaveLength(1);
        expect(response2.body.totalCount).toBe(1);
        expect(response2.body.items[0].id).toBe(blog2.id);

        const response3 = await getBlogsAsUserRequest(app).query({
          sortBy: 'name',
          sortDirection: 'asc',
        });
        expect(response3.body.items[0].id).toBe(blog1.id);
        expect(response3.body.items[response3.body.items.length - 1].id).toBe(
          blog3.id,
        );
      });
    });

    describe('/(UPDATE ONE BLOG) bind Blog with User as Admin', () => {
      it('with incorrect auth credentials or without them', async () => {
        const response1 = await bindBlogWithUser(app, blog1.id, user1.id);
        expect(response1.status).toBe(401);

        const response2 = await bindBlogWithUser(app, blog1.id, user1.id).set(
          incorrectBasicCredentials,
        );
        expect(response2.status).toBe(401);
      });

      it('with correct auth credentials but incorrect invalid blogId or userId', async () => {
        const response1 = await bindBlogWithUser(app, INVALID_ID, user1.id).set(
          correctBasicCredentials,
        );
        expect(response1.status).toBe(400);

        const response2 = await bindBlogWithUser(app, blog1.id, INVALID_ID).set(
          correctBasicCredentials,
        );
        expect(response2.status).toBe(400);
      });

      it('with correct auth credentials, correct blogId and userId but try to bind the same user', async () => {
        const response1 = await bindBlogWithUser(app, blog1.id, user1.id).set(
          correctBasicCredentials,
        );

        expect(response1.status).toBe(400);
        expect(response1.body).toEqual({
          errorsMessages: [{ message: expect.any(String), field: 'blogId' }],
        });
      });

      //!!!___This endpoint we don't need to test, since logic of app regarding this was
      // changed and now blog is bound with user by default___!!!

      //it('with all correct input data', async () => {
      // const response1 = await bindBlogWithUser(app, blog2.id, user2.id).set(
      //   correctBasicCredentials,
      // );
      // expect(response1.status).toBe(204);
      // const response2 = await getBlogsAsAdminRequest(app).set(
      //   correctBasicCredentials,
      // );
      // const testingBlog = await response2.body.items.find(
      //   (item) => item.id === blog2.id,
      // );
      // expect(testingBlog.blogOwnerInfo.userId).toBe(user2.id);
      //});
    });

    describe('/(UPDATE BLOG) update blog ban status', () => {
      it('with incorrect auth credentials or without them', async () => {
        const response1 = await updateBlogBanStatusRequest(app, blog1.id);
        expect(response1.status).toBe(401);

        const response2 = await updateBlogBanStatusRequest(app, blog1.id)
          .set(incorrectBasicCredentials)
          .send({ isBanned: true });
        expect(response2.status).toBe(401);
      });

      it('with correct auth credentials but incorrect invalid blogId', async () => {
        const response1 = await updateBlogBanStatusRequest(app, INVALID_ID)
          .set(correctBasicCredentials)
          .send({ isBanned: true });
        expect(response1.status).toBe(404);
      });

      it('with correct auth credentials, correct blogId but incorrect input data', async () => {
        const response1 = await updateBlogBanStatusRequest(app, blog1.id)
          .set(correctBasicCredentials)
          .send({ isBanned: '' });

        expect(response1.status).toBe(400);
        expect(response1.body).toEqual({
          errorsMessages: [{ message: expect.any(String), field: 'isBanned' }],
        });
      });

      it('with all correct data', async () => {
        const response1 = await updateBlogBanStatusRequest(app, blog1.id)
          .set(correctBasicCredentials)
          .send({ isBanned: true });
        expect(response1.status).toBe(204);
        const response2 = await getBlogsAsAdminRequest(app).set(
          correctBasicCredentials,
        );
        const testingBlog = await response2.body.items.find(
          (item) => item.id === blog1.id,
        );
        expect(testingBlog.banInfo.isBanned).toBe(true);
      });
    });
  });

  afterAll(async () => {
    await app.close();
    await mongoMS.stop();
    await disconnect();
  });
});
