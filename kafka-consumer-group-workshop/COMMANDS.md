# Kafka Consumer Group Lab Commands

Run host commands from:

```bash
cd kafka-consumer-group-workshop
```

Run Kafka CLI commands inside the container:

```bash
docker exec -it kafka bash
```

Kafka CLI commands like `kafka-topics` and `kafka-console-consumer` are available on PATH inside the container shell.

## 0. Start Kafka

Host terminal:

```bash
docker compose up -d
docker ps --filter name=kafka
```

Wait about 15 seconds, then check the broker:

```bash
docker exec kafka kafka-broker-api-versions --bootstrap-server localhost:9092
```

## 1. One Partition, Three Consumers, Same Group

This proves exclusivity: within one group, a single partition can be owned by
only one consumer at a time.

Inside the container shell:

```bash
kafka-topics --create --topic orders \
  --bootstrap-server localhost:9092 \
  --partitions 1 \
  --replication-factor 1
```

Open three separate host terminals and start three consumers in the same group.

Terminal A:

```bash
docker exec -it kafka bash -lc 'kafka-console-consumer --topic orders --group grp1 --bootstrap-server localhost:9092'
```

Terminal B:

```bash
docker exec -it kafka bash -lc 'kafka-console-consumer --topic orders --group grp1 --bootstrap-server localhost:9092'
```

Terminal C:

```bash
docker exec -it kafka bash -lc 'kafka-console-consumer --topic orders --group grp1 --bootstrap-server localhost:9092'
```

Now produce messages from a fourth terminal:

```bash
docker exec -it kafka bash -lc 'kafka-console-producer --topic orders --bootstrap-server localhost:9092'
```

Type these, one per line, then press `Ctrl+D`:

```text
order-1
order-2
order-3
```

Expected result: only one of the three consumers prints the messages. The
other two are group members, but they are idle because there is only one
partition to assign.

Describe the group:

```bash
docker exec kafka kafka-consumer-groups \
  --describe --group grp1 \
  --bootstrap-server localhost:9092
```

Show group members and assignments:

```bash
docker exec kafka kafka-consumer-groups \
  --describe --group grp1 \
  --members --verbose \
  --bootstrap-server localhost:9092
```

Stop the three consumers with `Ctrl+C` before moving on.

## 2. Same Partition, Three Different Groups

This proves independence: different groups each get their own offset cursor.

Open three separate host terminals again.

Terminal A:

```bash
docker exec -it kafka bash -lc 'kafka-console-consumer --topic orders --group grpA --from-beginning --bootstrap-server localhost:9092'
```

Terminal B:

```bash
docker exec -it kafka bash -lc 'kafka-console-consumer --topic orders --group grpB --from-beginning --bootstrap-server localhost:9092'
```

Terminal C:

```bash
docker exec -it kafka bash -lc 'kafka-console-consumer --topic orders --group grpC --from-beginning --bootstrap-server localhost:9092'
```

Expected result: all three consumers print the existing `order-1`, `order-2`,
and `order-3` messages because each group owns an independent cursor.

Produce a few more messages:

```bash
docker exec -it kafka bash -lc 'kafka-console-producer --topic orders --bootstrap-server localhost:9092'
```

Type:

```text
order-4
order-5
order-6
```

Expected result: all three groups print the new messages too.

Confirm the groups:

```bash
docker exec kafka kafka-consumer-groups \
  --list --bootstrap-server localhost:9092
```

Inspect offsets:

```bash
docker exec kafka kafka-consumer-groups \
  --describe --group grpA --bootstrap-server localhost:9092

docker exec kafka kafka-consumer-groups \
  --describe --group grpB --bootstrap-server localhost:9092

docker exec kafka kafka-consumer-groups \
  --describe --group grpC --bootstrap-server localhost:9092
```

Stop the three consumers with `Ctrl+C`.

## 3. Slow Consumer Eviction And Rebalance

This reproduces the "consumer takes too long to process one message" scenario.
The script sets `max_poll_interval_ms` to 10 seconds and then sleeps for 15
seconds after receiving each record.

Host terminal:

```bash
cd kafka-consumer-group-workshop
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
```

Produce a message for the slow consumer:

```bash
docker exec -i kafka bash -lc 'printf "slow-1\nslow-2\n" | kafka-console-producer --topic orders --bootstrap-server localhost:9092'
```

Run the slow consumer:

```bash
python slow_consumer.py
```

Expected result: after about 10 seconds without polling again, the consumer is
evicted from the group. Depending on timing and client version, you may see a
`CommitFailedError`, a coordinator warning, or group rebalance messages.

In another terminal, repeatedly describe the slow group:

```bash
while true; do
  docker exec kafka kafka-consumer-groups \
    --describe --group grp-slow \
    --bootstrap-server localhost:9092
  sleep 2
done
```

Stop the loop with `Ctrl+C`.

## 4. Inspect `__consumer_offsets`

Inside the container shell:

```bash
kafka-topics --describe --topic __consumer_offsets \
  --bootstrap-server localhost:9092
```

This proves offsets are stored in a real Kafka topic.

Dump committed offset records:

```bash
kafka-console-consumer \
  --topic __consumer_offsets \
  --bootstrap-server localhost:9092 \
  --formatter "kafka.coordinator.group.GroupMetadataManager\$OffsetsMessageFormatter" \
  --from-beginning \
  --timeout-ms 10000 \
  --max-messages 20
```

Example output:

```text
[grpA,orders,0]::OffsetAndMetadata(offset=6, ...)
[grpB,orders,0]::OffsetAndMetadata(offset=6, ...)
[grp-slow,orders,0]::OffsetAndMetadata(offset=1, ...)
```

The key is `(group, topic, partition)`. The value contains that group's
committed offset and metadata.

## Cleanup

Host terminal:

```bash
cd kafka-consumer-group-workshop
docker compose down -v
```
