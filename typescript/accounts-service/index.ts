import { connect } from "nats";

async function runAccountService() {
  const nc = await connect({
    servers: "nats://localhost:4222"
  });
  console.log(`INFO: Connected to NATS ${nc.getServer()}`);
  const done = nc.closed();

  //TODO Logic

  console.log(`INFO: Closing connection to NATS ${nc.getServer()}`);
  await nc.close();
}

runAccountService();
