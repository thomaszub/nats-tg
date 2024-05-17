import { ConsumerMessages, JSONCodec, JetStreamClient, JsMsg, KV } from "nats";
import { v4 as uuidv4 } from "uuid";
import { Account } from "./model";
import { CreateAccountCommand, DeleteAccountCommand, validateCreateAccountCommand, validateDeleteAccountCommand } from "./schemas";

type FullDispatchResult = [boolean, string, unknown, unknown]
type CommandDispatchResult = [boolean, unknown]

export default class AccountsService {

  private codec = JSONCodec();
  private accountCodec = JSONCodec<Account>();

  constructor(
    private readonly commandsSubscription: ConsumerMessages,
    private readonly accountsStore: KV,
    private readonly client: JetStreamClient
  ) { }

  async run() {
    for await (const cmdMessage of this.commandsSubscription) {
      const [successful, cmdId, cmd, error] = await this.dispatch(cmdMessage);
      if (!successful) {
        console.log(error);
      }
      await cmdMessage.ack();
    }
  }

  private async dispatch(message: JsMsg): Promise<FullDispatchResult> {
    const subject = message.subject.split(".");
    const cmdId = subject[subject.length - 2];
    const type = subject[subject.length - 1];
    try {
      const cmd = this.codec.decode(message.data);
      const [successful, error] = await this.dispatchCommand(type, cmd);
      return [successful, cmdId, cmd, error];
    } catch (error) {
      return [false, cmdId, message.data, error];
    }
  }

  private async dispatchCommand(type: string, cmd: unknown): Promise<CommandDispatchResult> {
    switch (type) {
      case "create": {
        if (!validateCreateAccountCommand(cmd)) {
          return [false, validateCreateAccountCommand.errors];
        }
        return await this.handleCreateAccountCommand(cmd as CreateAccountCommand);
      }
      case "delete": {
        if (!validateDeleteAccountCommand(cmd)) {
          return [false, validateDeleteAccountCommand.errors];
        }
        return await this.handleDeleteAccountCommand(cmd as DeleteAccountCommand);
      }
      default: {
        return [false, "unknown command type"];
      }
    }
  }

  private async handleCreateAccountCommand(cmd: CreateAccountCommand): Promise<CommandDispatchResult> {
    console.log(`Create account: ${cmd}`);
    const id = uuidv4();
    const account: Account = {
      limit: (cmd.limit) ? cmd.limit : 0,
      balance: 0
    };
    await this.accountsStore.create(id, this.accountCodec.encode(account));
    return [true, null];
  }

  private async handleDeleteAccountCommand(cmd: DeleteAccountCommand): Promise<[boolean, unknown]> {
    console.log(`Delete account: ${cmd}`);
    const entry = await this.accountsStore.get(cmd.accountId);
    if (!entry) {
      return [false, `account ${cmd.accountId} does not exist`];
    }
    return await this.accountsStore
      .delete(cmd.accountId, { previousSeq: entry.revision })
      .then(() => [true, null], (reason) => [false, reason]);
  }

}
