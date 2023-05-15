import {
  users,
  auth,
  defaultResponses,
  INVALID_ID,
  errors,
  blogs,
} from './mockData';
import {
  AllUsersOutputModel,
  IUserOutputModel,
} from '../src/users/api/dto/users-output-models.dto';
import {
  adminUsersRequests,
  bloggerUsersRequests,
} from './utils/users-requests';
import { bloggerBlogsRequests } from './utils/blogs-requests';
import { initTestApp } from './utils/common';
import { authRequests } from './utils/auth-requests';
import { disconnect } from 'mongoose';

describe('USERS', () => {
  jest.setTimeout(30 * 1000);
  const {
    correctCreateUserDtos,
    incorrectCreateUsersDtos,
    usersBadCreateQueryResponse,
    usersBadUpdateQueryResponse,
    correctUpdateUserBanStatusDto,
    incorrectUpdateUserBanStatusDtos,
    incorrectUpdateUserBanStatusForSpecificBlogDtos,
    correctUpdateUserBanStatusForSpecificBlogDto,
    usersUpdateUserBanStatusForBlogBadQueryResponse,
    getCreatedUserItem,
  } = users;
  const {
    incorrectBasicCredentials,
    correctBasicCredentials,
    incorrectAccessToken,
    getBearerAuthHeader,
  } = auth;
  const { getAllItemsWithPage2Size1, defaultGetAllResponse } = defaultResponses;
  const { notFoundExceptionMock } = errors;
  const {
    createUserRequest,
    getUsersRequest,
    deleteUserRequest,
    updateUserBanStatusRequest,
  } = adminUsersRequests;
  const {
    updateUserBanStatusForBlogsRequest,
    getAllBannedUsersForBlogRequest,
  } = bloggerUsersRequests;
  // const { correctCreateBlogDtos, getBlogItem } = blogs;
  const { loginRequest } = authRequests;
  const { createBlogsRequest } = bloggerBlogsRequests;
  let app, mongoMS;
  let user1, user2, user3;
  let blog1;
  let user1Token;

  beforeAll(async () => {
    const { nestApp, mongoMemoryServer } = await initTestApp();
    app = nestApp;
    mongoMS = mongoMemoryServer;
  });

  describe('Admin API', () => {
    describe('/(POST USERS) create user as Admin', () => {
      it('with incorrect auth credentials or without them', async () => {
        const response1 = await createUserRequest(app).send(
          correctCreateUserDtos[0],
        );
        expect(response1.status).toBe(401);

        // const response2 = await createBlogsRequest(app)
        //   .set(incorrectBasicCredentials)
        //   .send(correctCreateUserDtos[0]);
        // expect(response2.status).toBe(401);
      });

      it('correct auth credentials and incorrect input data', async () => {
        for (let i = 0; i < incorrectCreateUsersDtos.length; i++) {
          const response = await createUserRequest(app)
            .set(correctBasicCredentials)
            .send(incorrectCreateUsersDtos[i]);
          expect(response.status).toBe(400);
          expect(response.body).toEqual(usersBadCreateQueryResponse);
        }
      });

      it('correct auth credentials and correct input data', async () => {
        const response1 = await createUserRequest(app)
          .set(correctBasicCredentials)
          .send(correctCreateUserDtos[0]);
        expect(response1.status).toBe(201);
        expect(response1.body).toEqual(
          getCreatedUserItem(correctCreateUserDtos[0]),
        );
        user1 = response1.body;

        const response2 = await createUserRequest(app)
          .set(correctBasicCredentials)
          .send(correctCreateUserDtos[1]);
        expect(response2.status).toBe(201);
        expect(response2.body).toEqual(
          getCreatedUserItem(correctCreateUserDtos[1]),
        );
        user2 = response2.body;

        const response3 = await createUserRequest(app)
          .set(correctBasicCredentials)
          .send(correctCreateUserDtos[2]);
        expect(response3.status).toBe(201);
        expect(response3.body).toEqual(
          getCreatedUserItem(correctCreateUserDtos[2]),
        );
        user3 = response3.body;

        const response4 = await getUsersRequest(app).set(
          correctBasicCredentials,
        );
        expect(response4.body.items).toHaveLength(3);
      });
    });

    describe('/(GET ALL USERS) get all users as Admin)', () => {
      it('with incorrect auth credentials or without them', async () => {
        const response1 = await getUsersRequest(app);
        expect(response1.status).toBe(401);

        // const response2 = await createBlogsRequest(app).set(
        //   incorrectBasicCredentials,
        // );
        // expect(response2.status).toBe(401);
      });

      it('/GET with query params and correct auth credentials', async () => {
        const response1 = await getUsersRequest(app)
          .set(correctBasicCredentials)
          .query({ pageNumber: 2, pageSize: 1 });
        const expectedResult = getAllItemsWithPage2Size1<
          IUserOutputModel,
          AllUsersOutputModel
        >(user2);
        expect(response1.body).toEqual(expectedResult);

        const response2 = await getUsersRequest(app)
          .set(correctBasicCredentials)
          .query({ searchLoginTerm: '3' });
        expect(response2.body.items).toHaveLength(1);
        expect(response2.body.items[0].id).toBe(user3.id);

        const response3 = await getUsersRequest(app)
          .set(correctBasicCredentials)
          .query({ searchEmailTerm: '1' });
        expect(response3.body.items).toHaveLength(1);
        expect(response2.body.totalCount).toBe(1);
        expect(response3.body.items[0].id).toBe(user1.id);

        const response4 = await getUsersRequest(app)
          .set(correctBasicCredentials)
          .query({ sortBy: 'login', sortDirection: 'asc' });
        expect(response4.body.items[0].id).toBe(user1.id);
        expect(response4.body.items[response4.body.items.length - 1].id).toBe(
          user3.id,
        );
      });
    });

    describe('/(UPDATE ONE USER) update user ban status as Admin', () => {
      it('with incorrect auth credentials or without them', async () => {
        const response1 = await updateUserBanStatusRequest(app, user1.id).send(
          correctUpdateUserBanStatusDto,
        );
        expect(response1.status).toBe(401);

        const response2 = await updateUserBanStatusRequest(app, user1.id)
          .set(incorrectBasicCredentials)
          .send(correctUpdateUserBanStatusDto);
        expect(response2.status).toBe(401);
      });

      it('correct auth credentials but invalid id', async () => {
        const response = await updateUserBanStatusRequest(app, INVALID_ID)
          .set(correctBasicCredentials)
          .send(correctUpdateUserBanStatusDto);
        expect(response.status).toBe(404);
        expect(response.body).toEqual(notFoundExceptionMock);
      });

      it('correct auth credentials, userId but incorrect input data', async () => {
        for (let i = 0; i < incorrectUpdateUserBanStatusDtos.length; i++) {
          const response = await updateUserBanStatusRequest(app, user1.id)
            .set(correctBasicCredentials)
            .send(incorrectUpdateUserBanStatusDtos[i]);
          expect(response.status).toBe(400);
          expect(response.body).toEqual(usersBadUpdateQueryResponse);
        }
      });

      it('correct auth credentials, userId and correct input data', async () => {
        const response1 = await updateUserBanStatusRequest(app, user1.id)
          .set(correctBasicCredentials)
          .send(correctUpdateUserBanStatusDto);
        expect(response1.status).toBe(204);

        const response2 = await getUsersRequest(app).set(
          correctBasicCredentials,
        );
        const testingUser: IUserOutputModel = response2.body.items.find(
          (item) => item.id === user1.id,
        );
        expect(testingUser.banInfo.isBanned).toBe(
          correctUpdateUserBanStatusDto.isBanned,
        );
        expect(testingUser.banInfo.banReason).toBe(
          correctUpdateUserBanStatusDto.banReason,
        );
      });
    });

    describe('/(DELETE ONE USER) delete user as Admin', () => {
      it('with incorrect auth credentials or without them', async () => {
        const response1 = await deleteUserRequest(app, user1.id).send(
          correctCreateUserDtos[0],
        );
        expect(response1.status).toBe(401);

        const response2 = await deleteUserRequest(app, user1.id)
          .set(incorrectBasicCredentials)
          .send(correctCreateUserDtos[0]);
        expect(response2.status).toBe(401);
      });

      it('correct auth credentials but invalid id', async () => {
        const response = await deleteUserRequest(app, INVALID_ID).set(
          correctBasicCredentials,
        );
        expect(response.status).toBe(404);
        expect(response.body).toEqual(notFoundExceptionMock);
      });

      it('correct auth credentials and valid id', async () => {
        const response1 = await deleteUserRequest(app, user1.id).set(
          correctBasicCredentials,
        );
        expect(response1.status).toBe(204);

        const response2 = await deleteUserRequest(app, user2.id).set(
          correctBasicCredentials,
        );
        expect(response2.status).toBe(204);

        const response3 = await deleteUserRequest(app, user3.id).set(
          correctBasicCredentials,
        );
        expect(response3.status).toBe(204);
        user1 = null;
        user2 = null;
        user3 = null;

        const response4 = await getUsersRequest(app).set(
          correctBasicCredentials,
        );
        expect(response4.status).toBe(200);
        expect(response4.body).toEqual(defaultGetAllResponse);
      });
    });
  });

  // describe('Blogger API', () => {
  //   beforeAll(async () => {
  //     const response1 = await createUserRequest(app)
  //       .set(correctBasicCredentials)
  //       .send(correctCreateUserDtos[0]);
  //     expect(response1.status).toBe(201);
  //     user1 = response1.body;
  //
  //     const response2 = await createUserRequest(app)
  //       .set(correctBasicCredentials)
  //       .send(correctCreateUserDtos[1]);
  //     expect(response2.status).toBe(201);
  //     user2 = response2.body;
  //
  //     const response3 = await loginRequest(app).send({
  //       loginOrEmail: correctCreateUserDtos[0].login,
  //       password: correctCreateUserDtos[0].password,
  //     });
  //     expect(response3.status).toBe(200);
  //     user1Token = `Bearer ${response3.body.accessToken}`;
  //
  //     const response5 = await createBlogsRequest(app)
  //       .set(getBearerAuthHeader(user1Token))
  //       .send(correctCreateBlogDtos[0]);
  //     expect(response5.status).toBe(201);
  //     expect(response5.body).toEqual(getBlogItem(correctCreateBlogDtos[0]));
  //     blog1 = response5.body;
  //   });
  //
  //   describe('/(UPDATE USER) update user ban status for specific blog', () => {
  //     it('incorrect auth credentials or without them', async () => {
  //       const response1 = await updateUserBanStatusForBlogsRequest(
  //         app,
  //         user2.id,
  //       ).send(correctUpdateUserBanStatusForSpecificBlogDto(blog1.id));
  //       expect(response1.status).toBe(401);
  //
  //       const response2 = await updateUserBanStatusForBlogsRequest(
  //         app,
  //         user2.id,
  //       )
  //         .set(getBearerAuthHeader(incorrectAccessToken))
  //         .send(correctUpdateUserBanStatusForSpecificBlogDto(blog1.id));
  //       expect(response2.status).toBe(401);
  //     });
  //
  //     it('correct auth credentials but incorrect userId', async () => {
  //       const response1 = await updateUserBanStatusForBlogsRequest(
  //         app,
  //         INVALID_ID,
  //       )
  //         .set(getBearerAuthHeader(user1Token))
  //         .send(correctUpdateUserBanStatusForSpecificBlogDto(blog1.id));
  //       expect(response1.status).toBe(404);
  //     });
  //
  //     it('correct auth credentials but incorrect input data', async () => {
  //       const incorrectDtos = incorrectUpdateUserBanStatusForSpecificBlogDtos;
  //       for (let i = 0; i <= incorrectDtos.length; i++) {
  //         const response = await updateUserBanStatusForBlogsRequest(
  //           app,
  //           user1.id,
  //         )
  //           .set(getBearerAuthHeader(user1Token))
  //           .send(incorrectDtos[i]);
  //         expect(response.status).toBe(400);
  //         expect(response.body).toEqual(
  //           usersUpdateUserBanStatusForBlogBadQueryResponse,
  //         );
  //       }
  //     });
  //
  //     it('correct auth credentials and correct input data', async () => {
  //       const response1 = await updateUserBanStatusForBlogsRequest(
  //         app,
  //         user2.id,
  //       )
  //         .set(getBearerAuthHeader(user1Token))
  //         .send(correctUpdateUserBanStatusForSpecificBlogDto(blog1.id));
  //       expect(response1.status).toBe(204);
  //     });
  //   });
  //
  //   describe('/(GET USERS) get all users for specific blog', () => {
  //     it('incorrect auth credentials or without them', async () => {
  //       const response1 = await getAllBannedUsersForBlogRequest(app, blog1.id);
  //       expect(response1.status).toBe(401);
  //
  //       const response2 = await updateUserBanStatusForBlogsRequest(
  //         app,
  //         blog1.id,
  //       ).set(getBearerAuthHeader(incorrectAccessToken));
  //       expect(response2.status).toBe(401);
  //     });
  //
  //     it('correct auth credentials but incorrect blogId', async () => {
  //       const response1 = await getAllBannedUsersForBlogRequest(
  //         app,
  //         INVALID_ID,
  //       ).set(getBearerAuthHeader(user1Token));
  //       expect(response1.status).toBe(404);
  //     });
  //
  //     it('correct auth credentials and correct blogId', async () => {
  //       const response1 = await getAllBannedUsersForBlogRequest(
  //         app,
  //         blog1.id,
  //       ).set(getBearerAuthHeader(user1Token));
  //       expect(response1.status).toBe(200);
  //       expect(response1.body.items[0].id).toBe(user2.id);
  //     });
  //   });
  // });

  afterAll(async () => {
    await app.close();
    await mongoMS.stop();
    await disconnect();
  });
});
