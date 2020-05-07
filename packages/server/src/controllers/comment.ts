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
} from "@tsed/common";
import filter from "lodash/filter";

import { NewComment } from "@global";
import uniq from "lodash/uniq";
import { Exception } from "ts-httpexceptions";

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
  async comment(@BodyParams("comment") comment: NewComment) {
    const { user: uid, post: postId } = comment;

    const [fromUser, comments, post] = await Promise.all([
      this.userService.get(uid.toString()),
      this.commentService.getByPostId(postId.toString()),
      this.postService.getId(postId.toString()),
    ]);

    if (!fromUser || !post) throw new Exception();

    const otherCommentersNumbers = comments?.length
      ? uniq(
          filter(
            comments,
            ({ user }) => user !== fromUser.id && user !== post.user
          )
        )
      : [];

    const [
      postAuthor,
      ...otherCommenters
    ] = await this.userService.getByPhoneNumber(
      [post.phoneNumber, ...otherCommentersNumbers],
      true
    );

    const [newComment] = await Promise.all([
      this.commentService.createNewComment(comment),
      this.notificationService.notifyWithNavigationToPost(
        postAuthor,
        `${fromUser.firstName} commented on your post!`,
        { phoneNumber: post.phoneNumber, id: postId }
      ),
      this.notificationService.notifyWithNavigationToPost(
        otherCommenters,
        `${fromUser.firstName} also commented ${postAuthor.firstName}'s post`,
        { phoneNumber: post.phoneNumber, id: postId }
      ),
    ]);

    return newComment;
  }

  @Patch("/:phoneNumber/like/:id")
  async likeComment(
    @PathParams("phoneNumber") phoneNumber: string,
    @PathParams("id") id: string
  ) {
    const comment = await this.commentService.likeComment(phoneNumber, id);

    if (comment && phoneNumber !== comment.phoneNumber) {
      const [
        commentAuthor,
        commentLiker,
      ] = await this.userService.getByPhoneNumber(
        [comment.phoneNumber, phoneNumber],
        true
      );

      const post = await this.postService.getId(comment.postId);

      if (!post) return null;

      await this.notificationService.notifyWithNavigationToPost(
        commentAuthor,
        `${commentLiker.firstName} liked your comment!`,
        { phoneNumber: post.phoneNumber, id: post.id }
      );
    }

    return comment;
  }

  @Delete("/:id")
  deleteComment(@PathParams("id") id: string) {
    return this.commentService.delete(id);
  }

  @Get("/:postId")
  getCommentsForPost(@PathParams("postId") postId: string) {
    return this.commentService.getByPostId(postId);
  }
}
