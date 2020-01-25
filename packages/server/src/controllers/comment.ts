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

import { Comment } from "@unexpected/global";

import { AuthMiddleware } from "../middlewares/auth";
import { CommentService } from "../services/comment";

@Controller("/comment")
@UseAuth(AuthMiddleware)
export class CommentController {
  @Inject(CommentService)
  private commentService: CommentService;

  @Put()
  comment(@BodyParams("comment") comment: Comment) {
    return this.commentService.create(comment);
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
