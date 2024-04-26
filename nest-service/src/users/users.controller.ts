import { Controller, Inject, Logger } from '@nestjs/common';
import {
  ClientProxy,
  Ctx,
  EventPattern,
  NatsContext,
  Payload,
} from '@nestjs/microservices';
import { randomUUID } from 'crypto';
import { CreateUser } from './commands';
import { UserCreated } from './events';

@Controller()
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(@Inject('NATS_CLIENT') private natsClient: ClientProxy) {}

  @EventPattern('users.commands.create')
  async createUser(@Payload() request: CreateUser, @Ctx() ctx: NatsContext) {
    this.logger.log(
      `Command: create -> Subject: ${ctx.getSubject()}, Payload: ${JSON.stringify(request)}`,
    );
    const id = randomUUID();
    const newUser: UserCreated = {
      id: id,
      name: request.name,
      email: request.email,
      age: request.age,
    };
    await this.natsClient.emit<UserCreated>(
      `users.events.${id}.created`,
      newUser,
    );
  }
}
