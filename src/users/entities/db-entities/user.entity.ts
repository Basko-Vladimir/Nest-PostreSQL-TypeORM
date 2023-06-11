import { Column, Entity, ManyToMany, OneToMany, OneToOne } from 'typeorm';
import { EmailConfirmationEntity } from './email-confirmation.entity';
import { DeviceSessionEntity } from '../../../devices-sessions/entities/db-entities/device-session.entity';
import { BlogEntity } from '../../../blogs/entities/db-entities/blog.entity';
import { BlockableEntity } from '../../../common/common-db-entities';
import { BannedUserForBlogEntity } from './banned-user-for-blog.entity';
import { CommentEntity } from '../../../comments/entities/db-entities/comment.entity';
import { LikeEntity } from '../../../likes/entities/db-entities/like.entity';
import { PostEntity } from '../../../posts/entities/db-entities/post.entity';
import { usersConstants } from '../../../common/constants';
import { QuizAnswerEntity } from '../../../quiz/answers/entities/quiz-answer.entity';
import { QuizGameEntity } from '../../../quiz/games/entities/quiz-game.entity';

const { MAX_LOGIN_LENGTH } = usersConstants;

@Entity({ name: 'user' })
export class UserEntity extends BlockableEntity {
  @Column({
    type: 'varchar',
    length: MAX_LOGIN_LENGTH,
  })
  login: string;

  @Column({
    type: 'varchar',
    length: 100,
  })
  email: string;

  @Column({
    type: 'varchar',
    length: 100,
  })
  passwordHash: string;

  @Column({ default: null, nullable: true })
  passwordRecoveryCode: string;

  @Column({ default: null, nullable: true })
  banReason: string;

  @OneToOne(
    () => EmailConfirmationEntity,
    (emailConfirmationEntity) => emailConfirmationEntity.user,
  )
  emailConfirmation: EmailConfirmationEntity;

  @OneToMany(
    () => DeviceSessionEntity,
    (deviceSessionEntity) => deviceSessionEntity.user,
  )
  deviceSession: DeviceSessionEntity[];

  @OneToMany(() => BlogEntity, (blogEntity) => blogEntity.user)
  blogs: BlogEntity[];

  @OneToMany(() => PostEntity, (postEntity) => postEntity.user)
  posts: PostEntity[];

  @OneToMany(
    () => BannedUserForBlogEntity,
    (bannedUserForBlogEntity) => bannedUserForBlogEntity.user,
  )
  bannedUsersForBlog: BannedUserForBlogEntity[];

  @OneToMany(() => CommentEntity, (commentEntity) => commentEntity.user)
  comments: CommentEntity[];

  @OneToMany(() => LikeEntity, (likeEntity) => likeEntity.user)
  likes: LikeEntity[];

  @OneToMany(
    () => QuizAnswerEntity,
    (quizAnswerEntity) => quizAnswerEntity.user,
  )
  answers: QuizAnswerEntity[];

  @ManyToMany(() => QuizGameEntity, (quizGameEntity) => quizGameEntity.users)
  games: QuizGameEntity[];
}
