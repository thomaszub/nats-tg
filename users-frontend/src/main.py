import asyncio

import nats

nats_url = "nats://localhost:4222"


async def main():
    try:
        conn = await nats.connect(nats_url)
        print(f"Connection: {conn.connected_url.geturl()}")
        js = conn.jetstream()
        kv = await js.key_value("last_message")
        sub = await js.subscribe("inbox.>", stream="inbox")
        while True:
            try:
                msg = await sub.next_msg(None)
                print(f"{msg.subject}: {msg.data}")
                await kv.put(msg.subject, msg.data)
                await msg.ack()
                last_message = await kv.get(msg.subject)
                print(f"{last_message}")
            except TimeoutError:
                break
    finally:
        await sub.unsubscribe()
        await conn.flush()
        await conn.close()


if __name__ == "__main__":
    asyncio.run(main())
