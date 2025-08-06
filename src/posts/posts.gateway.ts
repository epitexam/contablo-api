import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PostDto } from './dto/post-response.dto';

@WebSocketGateway()
export class PostsGateway {

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    return 'Hello world!';
  }

  @SubscribeMessage('joinArticle')
  handleJoinArticle(@MessageBody() articleUuid: string, @ConnectedSocket() client: Socket) {
    const roomName = `article_${articleUuid}`;
    client.join(roomName);
  }

  handleConnection(client: Socket) {
    const articleUuid = client.handshake.query.articleUuid;
    if (articleUuid) {
      const roomName = `article_${articleUuid}`;
      client.join(roomName);
    }
  }

  emitNewComment(articleUuid: string, comment: PostDto) {
    const roomName = `article_${articleUuid}`;
    this.server.to(roomName).emit('newComment', comment);
  }

  emitReplyToComment(articleUuid: string, parentCommentUuid: string, reply: PostDto) {
    const roomName = `article_${articleUuid}`;
    this.server.to(roomName).emit('newReply', {
      parentUuid: parentCommentUuid,
      reply,
    });
  }

  emitUpdatedComment(articleUuid: string, updatedComment: PostDto) {
    const roomName = `article_${articleUuid}`;
    this.server.to(roomName).emit('commentUpdated', updatedComment);
  }
}
