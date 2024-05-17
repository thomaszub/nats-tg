import { connect } from "nats";
import AccountsService from "./accounts-service";

async function runAccountService() {
  const nc = await connect({
    servers: "nats://localhost:4222"
  });
  const js = nc.jetstream();
  console.log(`INFO: Connected to NATS ${nc.getServer()}`);
  const done = nc.closed();

  const accountsStore = await js.views.kv("AccountsStore");
  const accountsCommands = await js.consumers.get("AccountsCommands", "AccountsService");
  const commandsSubscription = await accountsCommands.consume();

  const service = new AccountsService(commandsSubscription, accountsStore, js);
  await service.run();

  console.log(`INFO: Closing connection to NATS ${nc.getServer()}`);
  await nc.close();
}

runAccountService();
