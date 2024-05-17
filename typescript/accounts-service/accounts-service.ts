import { ConsumerMessages, JetStreamClient, KV } from "nats";

export default class AccountsService {

  constructor(
    private readonly commandsSubscription: ConsumerMessages,
    private readonly accountsStore: KV,
    private readonly client: JetStreamClient
  ) { }

  async run() {
    for await (const cmd of this.commandsSubscription) {
      console.log(cmd);
      await cmd.ack();
    }
  }

}