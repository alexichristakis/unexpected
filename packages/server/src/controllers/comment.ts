import {
  BodyParams,
  Controller,
  Delete,
  Get,
  Inject,
  Patch,
  PathParams,
  Put,
  UseAuth,
  Context,
} from "@tsed/common";
import filter from "lodash/filter";
import remove from "lodash/remove";

import { NewComment, User } from "@global";
import uniq from "lodash/uniq";

import { AuthMiddleware } from "../middlewares/auth";
import { CommentService } from "../services/comment";
import { NotificationService } from "../services/notification";
import { PostService } from "../services/post";
import { UserService } from "../services/user";

@Controller("/comment")
@UseAuth(AuthMiddleware)
export class CommentController {
  @Inject(CommentService)
  private commentService: CommentService;

  @Inject(PostService)
  private postService: PostService;

  @Inject(UserService)
  private userService: UserService;

  @Inject(NotificationService)
  private notificationService: NotificationService;

  @Put()
  async comment(
    @BodyParams("comment") comment: NewComment,
    @Context("auth") id: string
  ) {
    const { body, post } = comment;

    return this.commentService.create({ user: id, body, post });

    // const [fromUser, comments, post] = await Promise.all([
    //   this.userService.get(uid.toString()),
    //   this.commentService.getByPostId(postId.toString()),
    //   this.postService.getId(postId.toString()),
    // ]);

    // if (!fromUser || !post) throw new Exception();

    // const otherCommentersNumbers = comments?.length
    //   ? uniq(
    //       filter(
    //         comments,
    //         ({ user }) => user !== fromUser.id && user !== post.user
    //       )
    //     ).map(({ user }) => user.toString())
    //   : [];

    // const users = await this.userService.find(
    //   { _id: { $in: [post.user.toString(), ...otherCommentersNumbers] } },
    //   ["deviceOS", "deviceToken"]
    // );

    // const [postAuthor] = remove(users, (user) => user.id === post.user);

    // const [newComment] = await Promise.all([
    //   this.commentService.createNewComment(comment as any),
    //   this.notificationService.notify(
    //     postAuthor,
    //     `${fromUser.firstName} commented on your post!`
    //     // { phoneNumber: post.phoneNumber, id: postId }
    //   ),
    //   this.notificationService.notify(
    //     users,
    //     `${fromUser.firstName} also commented ${postAuthor.firstName}'s post`
    //     // { phoneNumber: post.phoneNumber, id: postId }
    //   ),
    // ]);

    // return newComment;
  }

  @Patch("/:uid/like/:id")
  async likeComment(
    @PathParams("uid") uid: string,
    @PathParams("id") id: string
  ) {
    const comment = await this.commentService.likeComment(uid, id, "post user");

    if (comment && uid !== comment.user.toString()) {
      await this.notificationService.notify(
        comment.user as User,
        `${uid} liked your comment!`
        // { phoneNumber: post.phoneNumber, id: post.id }
      );
    }

    return comment;
  }

  @Delete("/:id")
  deleteComment(@PathParams("id") id: string) {
    // return this.commentService.delete(id);
  }

  @Get("/:postId")
  getCommentsForPost(@PathParams("postId") postId: string) {
    return this.commentService.getByPostId(postId);
  }
}
