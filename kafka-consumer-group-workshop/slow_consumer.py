from kafka import KafkaConsumer
from kafka.errors import CommitFailedError
import time


def decode(value):
    return value.decode("utf-8", errors="replace")


consumer = KafkaConsumer(
    "orders",
    bootstrap_servers="localhost:9092",
    group_id="grp-slow",
    auto_offset_reset="earliest",
    enable_auto_commit=True,
    max_poll_interval_ms=10_000,
    session_timeout_ms=6_000,
    heartbeat_interval_ms=2_000,
    value_deserializer=decode,
)

print("Slow consumer started in group grp-slow.")
print("Each message sleeps 15s while max_poll_interval_ms is 10s.")
print("Press Ctrl+C to stop.\n")

try:
    for msg in consumer:
        print(
            f"got topic={msg.topic} partition={msg.partition} "
            f"offset={msg.offset} value={msg.value!r}",
            flush=True,
        )
        print("sleeping 15s, longer than max_poll_interval_ms...", flush=True)
        time.sleep(15)
        print("woke up; the next poll/commit may fail after rebalance\n", flush=True)
except CommitFailedError as exc:
    print("\nCommit failed because the group rebalanced while this consumer slept.")
    print(exc)
finally:
    consumer.close()

