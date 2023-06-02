import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EmailConfirmationEntity } from './users/entities/db-entities/email-confirmation.entity';
import { UserEntity } from './users/entities/db-entities/user.entity';
import { AdminUsersController } from './users/api/admin-users.controller';
import { UsersService } from './users/application/users.service';
import { UsersRepository } from './users/infrastructure/users.repository';
import { QueryAdminUsersRepository } from './users/infrastructure/query-admin-users-repository.service';
import { CreateUserUseCase } from './users/application/use-cases/create-user.useCase';
import { DeleteUserUseCase } from './users/application/use-cases/delete-user.useCase';
import { UpdateUserBanStatusUseCase } from './users/application/use-cases/update-user-ban-status.useCase';
import { RegisterUserUseCase } from './auth/application/use-cases/register-user.useCase';
import { AuthService } from './auth/application/auth.service';
import { JwtService } from './auth/infrastructure/jwt.service';
import { EmailManager } from './common/managers/email.manager';
import { EmailAdapter } from './common/adapters/email.adapter';
import { AuthController } from './auth/api/auth.controller';
import { ConfirmRegistrationUseCase } from './auth/application/use-cases/confirm-registration.useCase';
import { ResendRegistrationEmailUseCase } from './auth/application/use-cases/resend-registration-email.useCase';
import { LoginUserUseCase } from './auth/application/use-cases/login-user.useCase';
import { DeviceSessionEntity } from './devices-sessions/entities/db-entities/device-session.entity';
import { DevicesSessionsController } from './devices-sessions/api/devices-sessions.controller';
import { DevicesSessionsRepository } from './devices-sessions/infrastructure/devices-sessions.repository';
import { CreateDeviceSessionUseCase } from './devices-sessions/application/use-cases/create-device-session.useCase';
import { UpdateDeviceSessionUseCase } from './devices-sessions/application/use-cases/update-device-session.useCase';
import { DeleteAllDevicesSessionsExceptCurrentUseCase } from './devices-sessions/application/use-cases/delete-all-devices-sessions-except-current.useCase';
import { DeleteDeviceSessionUseCase } from './devices-sessions/application/use-cases/delete-device-session.useCase';
import { QueryDevicesSessionsRepository } from './devices-sessions/infrastructure/query-devices-sessions.repository';
import { RecoverPasswordUseCase } from './auth/application/use-cases/recover-password.useCase';
import { ChangePasswordUseCase } from './auth/application/use-cases/change-password.useCase';
import { LogoutUseCase } from './auth/application/use-cases/logout.useCase';
import { RefreshTokensUseCase } from './auth/application/use-cases/refresh-tokens.useCase';
import { ClientRequestEntity } from './clients-requests/entities/db-entities/client-request.entity';
import { UpdateClientRequestUseCase } from './clients-requests/application/use-cases/update-client-request.useCase';
import { CreateClientRequestUseCase } from './clients-requests/application/use-cases/create-client-request.useCase';
import { UpdateManyClientsRequestsUseCase } from './clients-requests/application/use-cases/update-many-clients-requests.useCase';
import { ClientsRequestsRepository } from './clients-requests/infrastructure/clients-requests.repository';
import { BlogEntity } from './blogs/entities/db-entities/blog.entity';
import { BloggerBlogsController } from './blogs/api/blogger-blogs.controller';
import { BlogsRepository } from './blogs/infrastructure/blogs.repository';
import { CreateBlogUseCase } from './blogs/application/use-cases/create-blog.useCase';
import { PostsRepository } from './posts/infrastructure/posts.repository';
import { QueryBloggerBlogsRepository } from './blogs/infrastructure/query-blogger-blogs.repository';
import { QueryBlogsRepository } from './blogs/infrastructure/query-blogs.repository';
import { QueryPostsRepository } from './posts/infrastructure/query-posts.repository';
import { DeleteBlogUseCase } from './blogs/application/use-cases/delete-blog.useCase';
import { UpdateBlogUseCase } from './blogs/application/use-cases/update-blog.useCase';
import { PostEntity } from './posts/entities/db-entities/post.entity';
import { CreatePostUseCase } from './posts/application/use-cases/create-post.useCase';
import { GetFullPostUseCase } from './posts/application/use-cases/get-full-post.useCase';
import { DeletePostUseCase } from './posts/application/use-cases/delete-post.useCase';
import { UpdatePostUseCase } from './posts/application/use-cases/update-post.useCase';
import { AdminBlogsController } from './blogs/api/admin-blogs.controller';
import { QueryAdminBlogsRepository } from './blogs/infrastructure/query-admin-blogs.repository';
import { UpdateBlogBanStatusUseCase } from './blogs/application/use-cases/update-blog-ban-status.useCase';
import { BindBlogWithUserUseCase } from './blogs/application/use-cases/bind-blog-with-user.useCase';
import { BlogsController } from './blogs/api/blogs.controller';
import { GetAllFullPostsUseCase } from './posts/application/use-cases/get-all-full-posts.useCase';
import { PostsController } from './posts/api/posts.controller';
import { QueryBloggerUsersRepository } from './users/infrastructure/query-blogger-users-repository.service';
import { BloggerUsersController } from './users/api/blogger-users.controller';
import { UpdateUserBanStatusForBlogUseCase } from './users/application/use-cases/update-user-ban-status-for-blog.useCase';
import { BannedUsersForBlogsRepository } from './users/infrastructure/banned-users-for-blogs-repository.service';
import { BannedUserForBlogEntity } from './users/entities/db-entities/banned-user-for-blog.entity';
import { CommentEntity } from './comments/entities/db-entities/comment.entity';
import { GetFullCommentUseCase } from './comments/application/use-cases/get-full-comment.useCase';
import { CreateCommentUseCase } from './comments/application/use-cases/create-comment.useCase';
import { QueryCommentsRepository } from './comments/infrastructure/query-comments.repository';
import { CommentsRepository } from './comments/infrastructure/comments.repository';
import { LikeEntity } from './likes/entities/db-entities/like.entity';
import { QueryLikesRepository } from './likes/infrastructure/query-likes.repository';
import { UpdatePostLikeStatusUseCase } from './posts/application/use-cases/update-post-like-status.useCase';
import { CreateLikeUseCase } from './likes/application/use-cases/create-like.useCase';
import { UpdateLikeUseCase } from './likes/application/use-cases/update-like.useCase';
import { LikesRepository } from './likes/infrastructure/likes.repository';
import { GetAllFullCommentsUseCase } from './comments/application/use-cases/get-all-full-comments.useCase';
import { CommentsController } from './comments/api/comments.controller';
import { DeleteCommentUseCase } from './comments/application/use-cases/delete-comment.useCase';
import { UpdateCommentUseCase } from './comments/application/use-cases/update-comment.useCase';
import { UpdateCommentLikeStatusUseCase } from './comments/application/use-cases/update-comment-like-status.useCase';
import { GetAllBloggerCommentsUseCase } from './comments/application/use-cases/get-all-blogger-comments.useCase';

const useCases = [
  RegisterUserUseCase,
  ConfirmRegistrationUseCase,
  ResendRegistrationEmailUseCase,
  LoginUserUseCase,
  RecoverPasswordUseCase,
  ChangePasswordUseCase,
  RefreshTokensUseCase,
  LogoutUseCase,
  CreateUserUseCase,
  DeleteUserUseCase,
  UpdateUserBanStatusUseCase,
  CreateDeviceSessionUseCase,
  UpdateDeviceSessionUseCase,
  DeleteAllDevicesSessionsExceptCurrentUseCase,
  DeleteDeviceSessionUseCase,
  CreateClientRequestUseCase,
  UpdateClientRequestUseCase,
  UpdateManyClientsRequestsUseCase,
  CreateBlogUseCase,
  DeleteBlogUseCase,
  UpdateBlogUseCase,
  CreatePostUseCase,
  GetFullPostUseCase,
  DeletePostUseCase,
  UpdatePostUseCase,
  UpdateBlogBanStatusUseCase,
  BindBlogWithUserUseCase,
  GetAllFullPostsUseCase,
  UpdateUserBanStatusForBlogUseCase,
  GetFullCommentUseCase,
  CreateCommentUseCase,
  UpdatePostLikeStatusUseCase,
  CreateLikeUseCase,
  UpdateLikeUseCase,
  GetAllFullCommentsUseCase,
  DeleteCommentUseCase,
  UpdateCommentUseCase,
  UpdateCommentLikeStatusUseCase,
  GetAllBloggerCommentsUseCase,
];

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'ep-round-voice-613003.eu-central-1.aws.neon.tech',
      port: 5432,
      username: '1989bvg',
      password: '2olxG6ROnPie',
      database: 'NestAppSQL',
      autoLoadEntities: true,
      synchronize: true,
      ssl: {
        rejectUnauthorized: false,
      },
    }),
    TypeOrmModule.forFeature([
      UserEntity,
      EmailConfirmationEntity,
      DeviceSessionEntity,
      ClientRequestEntity,
      BlogEntity,
      PostEntity,
      BannedUserForBlogEntity,
      CommentEntity,
      LikeEntity,
    ]),
    CqrsModule,
  ],
  controllers: [
    AppController,
    AdminUsersController,
    BloggerUsersController,
    AuthController,
    DevicesSessionsController,
    BlogsController,
    BloggerBlogsController,
    AdminBlogsController,
    PostsController,
    CommentsController,
  ],
  providers: [
    AppService,
    UsersService,
    UsersRepository,
    QueryAdminUsersRepository,
    QueryBloggerUsersRepository,
    BannedUsersForBlogsRepository,
    AuthService,
    JwtService,
    EmailManager,
    EmailAdapter,
    DevicesSessionsRepository,
    QueryDevicesSessionsRepository,
    ClientsRequestsRepository,
    QueryBloggerBlogsRepository,
    QueryBlogsRepository,
    QueryAdminBlogsRepository,
    BlogsRepository,
    PostsRepository,
    QueryPostsRepository,
    CommentsRepository,
    QueryCommentsRepository,
    LikesRepository,
    QueryLikesRepository,
    ...useCases,
  ],
})
export class AppModule {}
