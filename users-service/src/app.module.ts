import { Module } from '@nestjs/common';
import { isObject } from '@nestjs/common/utils/shared.utils';
import {
  ClientsModule,
  NatsRecord,
  NatsRecordBuilder,
  ReadPacket,
  Serializer,
  Transport,
} from '@nestjs/microservices';
import { JSONCodec } from 'nats';
import { UsersController } from './users/users.controller';

class CustomNatsMessageSerializer
  implements Serializer<ReadPacket, NatsRecord>
{
  private readonly jsonCodec = JSONCodec();

  serialize(packet: ReadPacket<any>): NatsRecord<any, any> {
    const natsMessage =
      packet?.data && isObject(packet.data) && packet.data instanceof NatsRecord
        ? (packet.data as NatsRecord)
        : new NatsRecordBuilder(packet?.data).build();

    return {
      data: this.jsonCodec.encode(natsMessage.data),
      headers: natsMessage.headers,
    };
  }
}

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'NATS_CLIENT',
        transport: Transport.NATS,
        options: {
          servers: ['nats://localhost:4222'],
          serializer: new CustomNatsMessageSerializer(),
        },
      },
    ]),
  ],
  controllers: [UsersController],
  providers: [],
})
export class AppModule {}
