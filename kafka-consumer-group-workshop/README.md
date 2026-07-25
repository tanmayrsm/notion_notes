# Kafka Consumer Group Workshop

This folder is a local, executable Kafka lab for learning consumer groups,
partition exclusivity, offset independence, slow-consumer eviction, and the
`__consumer_offsets` topic.

It uses one Kafka broker in KRaft mode, no Zookeeper, and Docker Compose.

## Files

- `docker-compose.yml` starts a single Kafka broker named `kafka`.
- `COMMANDS.md` is the main step-by-step runbook.
- `slow_consumer.py` reproduces `max.poll.interval.ms` eviction.
- `requirements.txt` installs the Python client for the slow consumer.
- `TROUBLESHOOTING.md` has fixes for the common local failures.

## Prerequisites

- Docker Desktop or Docker Engine
- Docker Compose v2
- Python 3, only for Experiment 3

Check them:

```bash
docker --version
docker compose version
python3 --version
```

## Start Here

From this folder:

```bash
cd kafka-consumer-group-workshop
docker compose up -d
docker ps --filter name=kafka
```

Give Kafka about 15 seconds to finish startup.

Open a container shell for Kafka CLI commands:

```bash
docker exec -it kafka bash
```

Then follow `COMMANDS.md`.

## Reset The Lab

This deletes all Kafka data for the lab and starts fresh:

```bash
cd kafka-consumer-group-workshop
docker compose down -v
docker compose up -d
```

## Cleanup

```bash
cd kafka-consumer-group-workshop
docker compose down -v
```
