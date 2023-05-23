// import { CreateBlogDto } from '../src/blogs/api/dto/create-blog.dto';
// import {
//   IFullPostOutputModel,
//   IPostOutputModel,
// } from '../src/posts/api/dto/posts-output-models.dto';
import { LikeStatus } from '../src/common/enums';
// import { CreatePostDto } from '../src/posts/api/dto/create-post.dto';
// import {
//   IBlogBanInfo,
//   IBlogForAdminOutputModel,
//   IBlogOutputModel,
// } from '../src/blogs/api/dto/blogs-output-models.dto';
// import {
//   IBloggerCommentOutputModel,
//   ICommentOutputModel,
//   ICommentWithLikeInfoOutputModel,
// } from '../src/comments/api/dto/comments-output-models.dto';
import { IUserOutputModel } from '../src/users/api/dto/users-output-models.dto';
import { CreateUserDto } from '../src/users/api/dto/create-user.dto';
import { EmailAdapter } from '../src/common/adapters/email.adapter';
import { CreateBlogDto } from '../src/blogs/api/dto/create-blog.dto';
import { UpdateBlogDto } from '../src/blogs/api/dto/update-blog.dto';
import {
  IBlogBanInfo,
  IBlogForAdminOutputModel,
  IBlogOutputModel,
} from '../src/blogs/api/dto/blogs-output-models.dto';
import { CreatePostDto } from '../src/posts/api/dto/create-post.dto';
import { IFullPostOutputModel } from '../src/posts/api/dto/posts-output-models.dto';
import {
  DEFAULT_PAGE_SIZE,
  DEFAULT_PAGE_NUMBER,
} from '../src/common/constants';
// import { UpdateBlogDto } from '../src/blogs/api/dto/update-blog.dto';

interface Exception {
  statusCode: number;
  message: string;
}

export const INVALID_ID = '9999a015-df86-4c04-9a3c-2f65262e2cc2';

export const auth = {
  incorrectBasicCredentials: { Authorization: 'Basic YWRtaW46cXdlcnR1' },
  correctBasicCredentials: { Authorization: 'Basic YWRtaW46cXdlcnR5' },
  incorrectAccessToken:
    'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI0MTFlZWZlZS0zZTY4LTRiMTItODhlNC0xODEzYWEyYTMzM2IiLCJpYXQiOjE2ODMxMjU0NTksImV4cCI6MTY4MzIxMTg1OX0.Pxul7ki9BMKivI-ZP7u2VbKWsvz_8Igy4DJQWIXyNSc',
  getBearerAuthHeader: (token: string) => ({ Authorization: token }),
};

export const users = {
  correctCreateUserDtos: [
    {
      login: 'User1',
      password: '111111',
      email: 'user1@gmail.com',
    },
    {
      login: 'User2',
      password: '222222',
      email: 'user2@gmail.com',
    },
    {
      login: 'User3',
      password: '333333',
      email: 'user3@gmail.com',
    },
  ],
  incorrectCreateUsersDtos: [
    {},
    {
      login: '',
      password: '',
      email: '',
    },
    {
      login: '   ',
      password: '   ',
      email: '   ',
    },
    {
      login: 'aaa;kdl/',
      password: '123',
      email: 'aaaa@sdsds',
    },
  ],
  usersBadCreateQueryResponse: {
    errorsMessages: [
      { message: expect.any(String), field: 'login' },
      { message: expect.any(String), field: 'password' },
      { message: expect.any(String), field: 'email' },
    ],
  },
  correctUpdateUserBanStatusDto: {
    isBanned: true,
    banReason: 'test ban reason length 20+',
  },
  correctUpdateUserBanStatusForSpecificBlogDto: (blogId: string) => ({
    isBanned: true,
    banReason: 'test ban reason user for specific blog',
    blogId,
  }),
  incorrectUpdateUserBanStatusDtos: [
    {},
    {
      isBanned: '',
      banReason: '',
    },
    {
      isBanned: 5,
      banReason: '   ',
    },
    {
      isBanned: {},
      banReason: 'short test reason',
    },
  ],
  incorrectUpdateUserBanStatusForSpecificBlogDtos: [
    {},
    {
      isBanned: '',
      banReason: '',
      blogId: '',
    },
    {
      isBanned: 5,
      banReason: '   ',
      blogId: '   ',
    },
    {
      isBanned: {},
      banReason: 'short test reason',
      blogId: true,
    },
  ],
  usersBadUpdateQueryResponse: {
    errorsMessages: [
      { message: expect.any(String), field: 'isBanned' },
      { message: expect.any(String), field: 'banReason' },
    ],
  },
  usersUpdateUserBanStatusForBlogBadQueryResponse: {
    errorsMessages: [
      { message: expect.any(String), field: 'blogId' },
      { message: expect.any(String), field: 'isBanned' },
      { message: expect.any(String), field: 'banReason' },
    ],
  },
  getCreatedUserItem: (createUserDto: CreateUserDto): IUserOutputModel => ({
    id: expect.any(String),
    email: createUserDto.email,
    login: createUserDto.login,
    createdAt: expect.any(String),
    banInfo: {
      isBanned: false,
      banDate: null,
      banReason: null,
    },
  }),
};

export const blogs = {
  correctCreateBlogDtos: [
    {
      name: 'Blog1',
      description: 'Lorem ipsum dolor sit amet #1.',
      websiteUrl: 'https://blog-test1.com',
    },
    {
      name: 'Blog2',
      description: 'Lorem ipsum dolor sit amet #2.',
      websiteUrl: 'https://blog-test2.com',
    },
    {
      name: 'Blog3',
      description: 'Lorem ipsum dolor sit amet #3.',
      websiteUrl: 'https://blog-test3.com',
    },
  ],
  correctUpdateBlogDto: {
    name: 'Updated Blog',
    description: 'New description for blog Blog',
    websiteUrl: 'https://new-site.io',
  },
  incorrectBlogsDtos: [
    {},
    {
      name: '',
      websiteUrl: '',
      description: '',
    },
    {
      name: '   ',
      websiteUrl: '   ',
      description: '   ',
    },
    {
      name: 'name length 16 test test',
      websiteUrl: 'blog.com',
      description:
        '500+_Length_1GjrgergpmmpmKMKLjioememfOyJdTHB0cI9iW8GmbmPsd7O70PS4BdopkHksGCWm3KxPzkbQP3e5kE9yqLVEjqwroaoOqGwSftpKiVQfYwdZEW0101_Length_1GjrgergpmmpmKMKLjioememfOyJdTHB0cI9iW8GmbmPsd7O70PS4BdopkHksGCWm3KxPzkbQP3e5kE9yqLVEjqwroaoOqGwSftpKiVQfYwdZEW0101_Length_1GjrgergpmmpmKMKLjioememfOyJdTHB0cI9iW8GmbmPsd7O70PS4BdopkHksGCWm3KxPzkbQP3e5kE9yqLVEjqwroaoOqGwSftpKiVQfYwdZEW0101_Length_1GjrgergpmmpmKMKLjioememfOyJdTHB0cI9iW8GmbmPsd7O70PS4BdopkHksGCWm3KxPzkbQP3e5kE9yqLVEjqwroaoOqGwSftpKiVQfYwdZEW0101_Length_1GjrgergpmmpmKMKLjioememfOyJdTHB0cI9iW8GmbmPsd7O70PS4BdopkHksGCWm3KxPzkbQP3e5kE9yqLVEjqwroaoOqGwSftpKiVQfYwdZEW0',
    },
  ],
  incorrectBlogsIds: ['', '   ', '2156165465', INVALID_ID],
  getBlogItem: (blogDto: CreateBlogDto | UpdateBlogDto): IBlogOutputModel => ({
    id: expect.any(String),
    name: blogDto.name,
    description: blogDto.description,
    websiteUrl: blogDto.websiteUrl,
    isMembership: false,
    createdAt: expect.any(String),
  }),
  getBlogItemForAdmin: (
    blogDto: CreateBlogDto,
    userLogin: string,
    banInfo: IBlogBanInfo = { isBanned: false, banDate: null },
  ): IBlogForAdminOutputModel => ({
    id: expect.any(String),
    name: blogDto.name,
    description: blogDto.description,
    websiteUrl: blogDto.websiteUrl,
    isMembership: false,
    createdAt: expect.any(String),
    blogOwnerInfo: {
      userId: expect.any(String),
      userLogin: userLogin,
    },
    banInfo,
  }),
  blogsBadQueryResponse: {
    errorsMessages: [
      { message: expect.any(String), field: 'name' },
      { message: expect.any(String), field: 'websiteUrl' },
      { message: expect.any(String), field: 'description' },
    ],
  },
};

export const posts = {
  correctCreatePostDtos: [
    {
      title: 'Post1',
      shortDescription: 'short description of Post1',
      content: 'Post1 Post1 Post1 Post1 Post1 Post1 Post1 Post1 Post1 Post1',
    },
    {
      title: 'Post2',
      shortDescription: 'short description of Post2',
      content: 'Post2 Post2 Post2 Post2 Post2 Post2 Post2 Post2 Post2 Post2',
    },
    {
      title: 'Post3',
      shortDescription: 'short description of Post3',
      content: 'Post3 Post3 Post3 Post3 Post3 Post3 Post3 Post3 Post3 Post3',
    },
  ],
  correctUpdatePostDto: {
    title: 'Post is UPDATED',
    content: 'New UPDATED content for blog Post',
    shortDescription: 'UPDATED short description',
  },
  incorrectPostsDtos: [
    {},
    {
      title: '',
      shortDescription: '',
      content: '',
    },
    {
      title: '    ',
      shortDescription: '    ',
      content: '    ',
    },
    {
      title: '30+_length_oqWPBjPIDCZsSmJTRi360TZWxXgTY0Y',
      shortDescription:
        '100+_length_TPiCDkcFTUlci5EixvHxj4fOT8KfKrGqZM3jjuvhPMEC2h1hanimil9ScG7XIvxVbYQIGUkAIKGz5lflHDZdo6rfqax6ZWZ1ZAJ5O',
      content:
        '1000+_length_SgqITcVIF19oeUkBqeHjwyCAayeJMIYFqPRyUaWXi2cRZqFQww3L6k3WnHpsqDYmMTEYEcyEKnEHwdwRmih2ijgycdocxRckEgq0hmoSxZOWSEjaivxLNpZUTmToVRpzc52xzPs33744NDdPiZBPuLN36NzGvMZowAmfhDeAjkNCAw6OLSRBab4T4mX1T6t4ctsSEQSNChOF3zyaCUUZkrG9R89nWOGpWYT4cDVxZFwBplv9w3PZpuML0u1Rt1M3fCVxBwBOyK4D78DNY8iOizf9ifyLm77VCKUQMqrxpuuGE8hpEDp1z6bYOkphJ2S8yxwurb4vhu4JqNtnQDJBJGTYqwC6MHwkJby9dYAKiTXFaMXWZoKyvkTudEGcOc5XZrhgKZUnIeNQbMwHTsggOf0cYejIIsdeIMd7uIoOEHxmMUSvNeHnQfnJUELNb5Y5gSMTqdt3x2l0OnIDvlbjivh8H5ngaLEsuzbHlN4jaIqd50Mz1JWjsgqZYn3A2s5LtG6N7hmrXhZiwM7Ay1fvIZv9u5fvjAFSTBtdwMTw6wyAc4OlSNppC56OtqmuOgW60vQF0ByTRUOkIIpDtsOzB4OYiJI2zoAP2oML3WUzodxvyb0KmRByBcu2Uo3ImxckdKdssa4DXoEvNnBpVBm9N0ts475rUx2GhkPq7DjdMVaUw87ilCCwhHbcd09i51nkGTeYQH2z30W0C1BcB1EP4KugrGKu5o5LfCDuorKRo6FTFKJSOCXgIWo9i6LntCYeS2UNSXdD3HRprUhuNeC6sZ2yRF1aKpGr4gczF14yTlMiy7rDMovbPvlNaZWZ8Rj8Dk6bEL3H3Y9DTXiOBgdo8GjTDYgmBoHHfGhQnA2rBaX8VeboZm8Ut5Ipgt966czLAMFemNlSf3FAmNLaqW4QIlodUALO8L1jzvIBaa2KbY88RH8Er9ruzGEjkwvZHFl7oAjoTK9DOmvYQlxW1qX040Ng4tFA2Stam2udqPb1\n',
    },
  ],
  postsBadQueryResponse: {
    errorsMessages: [
      { message: expect.any(String), field: 'title' },
      { message: expect.any(String), field: 'shortDescription' },
      { message: expect.any(String), field: 'content' },
    ],
  },
  getPostItem: (
    createPostDto: Omit<CreatePostDto, 'blogId'>,
    currentBlog: IBlogOutputModel,
    likeStatus: LikeStatus = LikeStatus.NONE,
  ): IFullPostOutputModel => ({
    id: expect.any(String),
    blogId: currentBlog.id,
    blogName: currentBlog.name,
    content: createPostDto.content,
    title: createPostDto.title,
    shortDescription: createPostDto.shortDescription,
    createdAt: expect.any(String),
    extendedLikesInfo: {
      likesCount: 0,
      dislikesCount: 0,
      myStatus: likeStatus,
      newestLikes: [],
    },
  }),
};

export const comments = {
  correctCreateCommentDtos: [
    { content: 'Comment 1 content 111111111111111111111' },
    { content: 'Comment 2 content 222222222222222222222' },
    { content: 'Comment 3 content 333333333333333333333' },
  ],
  correctUpdateCommentDto: { content: 'Updated updated updated Comment 1' },
  incorrectCommentsDtos: [
    {},
    { content: '' },
    { content: '       ' },
    { content: 'short content' },
    {
      content:
        '300+_length_eFoDB9ejBSUWfoUrrx6CPhAHOBFTuCh0TSZTBbG8r4dFacjCnqafE8iwp76MUtzbDhL2OKbCbh4jWziALBrN0jzHarFMYF9EEDfqYkFHMVOzUyuK7rUrzYy2gC0I3EBlh5VMvsJGNojmUWGO6RRGcZ3YR8AstidHPZvwGBsd0kztom7qPmAndoxLCoA1ESK2oMt6CgydQVvDakFCaxW9DAXUi7XbDHankglDrNvSjqHBs7m1FGedGg1ND8hMvmn3K0BbWQSeoA4AeOmk7f3BsISpsWxlRkGCUcZiLTReWP4z\n',
    },
  ],
  commentsBadQueryResponse: {
    errorsMessages: [{ message: expect.any(String), field: 'content' }],
  },
  // getCommentItem: (
  //   content: string,
  //   userLogin: string,
  //   likeStatus: LikeStatus = LikeStatus.NONE,
  // ): ICommentWithLikeInfoOutputModel => ({
  //   id: expect.any(String),
  //   content,
  //   commentatorInfo: {
  //     userId: expect.any(String),
  //     userLogin,
  //   },
  //   createdAt: expect.any(String),
  //   likesInfo: {
  //     likesCount: 0,
  //     dislikesCount: 0,
  //     myStatus: likeStatus,
  //   },
  // }),
  // getCommentItemAsBlogger: (
  //   comment: ICommentOutputModel,
  //   user: IUserOutputModel,
  //   post: IPostOutputModel,
  // ): IBloggerCommentOutputModel => ({
  //   id: expect.any(String),
  //   content: comment.content,
  //   commentatorInfo: {
  //     userId: user.id,
  //     userLogin: user.login,
  //   },
  //   createdAt: expect.any(String),
  //   likesInfo: {
  //     likesCount: expect.any(Number),
  //     dislikesCount: expect.any(Number),
  //     myStatus: expect.any(String),
  //   },
  //   postInfo: {
  //     id: post.id,
  //     blogName: post.blogName,
  //     blogId: post.blogId,
  //     title: post.title,
  //   },
  // }),
};

export const likes = {
  correctUpdateLikeStatusDto: [
    { likeStatus: LikeStatus.LIKE },
    { likeStatus: LikeStatus.DISLIKE },
    { likeStatus: LikeStatus.NONE },
  ],
  incorrectLikeStatusDto: [
    {},
    { likeStatus: '' },
    { likeStatus: '     ' },
    { likeStatus: 'nothing' },
  ],
  likeBadQueryResponse: {
    errorsMessages: [{ message: expect.any(String), field: 'likeStatus' }],
  },
};

export const errors: { [key: string]: Exception } = {
  notFoundExceptionMock: {
    statusCode: 404,
    message: 'Not Found',
  },
  unauthorisedExceptionMock: {
    statusCode: 401,
    message: 'Unauthorized',
  },
};

export const defaultResponses = {
  defaultGetAllResponse: {
    page: DEFAULT_PAGE_NUMBER,
    pageSize: DEFAULT_PAGE_SIZE,
    pagesCount: 0,
    totalCount: 0,
    items: [],
  },
  getAllItemsWithPage2Size1: <I, O>(matchedItem: I): O => {
    return {
      page: 2,
      pageSize: 1,
      pagesCount: 3,
      totalCount: 3,
      items: [matchedItem as I],
    } as O;
  },
};

export const emailAdapterMock: jest.Mocked<EmailAdapter> = {
  sendEmail: jest.fn(),
};

export class EmailManagerMock {
  formRegistrationEmail = jest.fn();
  formRecoverPasswordEmail = jest.fn();
  emailAdapter = emailAdapterMock;
}
