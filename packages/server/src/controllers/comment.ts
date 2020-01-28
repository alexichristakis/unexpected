import {
  BodyParams,
  Controller,
  Delete,
  Get,
  Inject,
  PathParams,
  Put,
  UseAuth
} from "@tsed/common";

import { Exception } from "ts-httpexceptions";
import { Comment } from "@unexpected/global";

import { AuthMiddleware } from "../middlewares/auth";
import { CommentService } from "../services/comment";
import { PostService } from "../services/post";
import { UserService } from "../services/user";
import { NotificationService } from "../services/notification";

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
  async comment(@BodyParams("comment") comment: Comment) {
    const { postId } = comment;
    const [fromUser, post] = await Promise.all([
      this.userService.getByPhoneNumber(comment.phoneNumber),
      this.postService.getId(postId)
    ]);

    if (!fromUser || !post) throw new Exception();

    const toUser = await this.userService.getByPhoneNumber(post.phoneNumber);

    const [newComment] = await Promise.all([
      this.commentService.createNewComment(comment),
      this.notificationService.notifyWithNavigationToPost(
        toUser,
        `${fromUser.firstName} commented on your post!`,
        { ...post, id: postId }
      )
    ]);

    return newComment;
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
