# Kafka Workshop Troubleshooting

## Docker says port 9092 is already allocated

Another Kafka process or container is already using the port.

Check:

```bash
docker ps
lsof -i :9092
```

Stop the conflicting container, or change the host port in `docker-compose.yml`.

## Topic `orders` already exists

That is fine if you are continuing the lab. To reset only that topic:

```bash
docker exec kafka kafka-topics \
  --delete --topic orders \
  --bootstrap-server localhost:9092
```

Then recreate it from `COMMANDS.md`.

For a full clean reset:

```bash
docker compose down -v
docker compose up -d
```

## Consumers do not print old messages

Kafka consumers in a new group usually start at the latest offset unless told
otherwise. Use `--from-beginning` for replay, or start the consumer first and
then produce new messages.

## Only one consumer prints in Experiment 1

That is the expected result. The topic has one partition, and all three
consumers are in the same group. Kafka assigns that one partition to exactly
one member. The other members stay idle.

## All consumers print in Experiment 2

That is the expected result. They use different group ids, so each group has
its own offset cursor for the same topic partition.

## Slow consumer does not fail quickly

Make sure you are running `slow_consumer.py`, not the console consumer. The
script sets:

```python
max_poll_interval_ms=10000
```

Then it sleeps for 15 seconds, which is intentionally longer than the allowed
poll interval.

## Offset formatter class fails

Kafka has changed internal formatter class names across major versions. This
workshop pins the Docker image to Confluent Kafka 7.6.1, where this formatter is
expected:

```text
kafka.coordinator.group.GroupMetadataManager$OffsetsMessageFormatter
```

If you change the image version and this fails, inspect the image's available
classes or use the consumer group commands instead:

```bash
docker exec kafka kafka-consumer-groups \
  --describe --all-groups \
  --bootstrap-server localhost:9092
```

## Python install complains about system packages

Use the local virtualenv flow from `COMMANDS.md`:

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
```
