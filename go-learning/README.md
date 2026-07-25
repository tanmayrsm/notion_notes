# Go Learning Roadmap

Goal: move from beginner Go to advanced and higher-advanced production Go through structured notes, exercises, and projects.

## How To Use This Plan

- Study one topic at a time.
- Write small Go programs for every concept.
- Keep notes in this folder as you learn.
- Build one project per level.
- Revisit concurrency, testing, and performance repeatedly. These are where Go becomes powerful.

## Table Of Contents

### 0. Preparation

1. Why Go
2. Installing Go
3. Setting up editor support
4. Using `go version`, `go env`, `go help`
5. Understanding `GOPATH` vs Go modules
6. Creating your first module with `go mod init`
7. Running, building, formatting, and testing code
8. Basic terminal workflow for Go projects

### 1. Beginner Go

1. Program structure: `package`, `import`, `func main`
2. Variables, constants, zero values, and type inference
3. Basic types: numbers, booleans, strings, runes, bytes
4. Operators and expressions
5. Control flow: `if`, `switch`, `for`
6. Arrays and slices
7. Maps
8. Functions and multiple return values
9. Pointers
10. Structs
11. Methods
12. Interfaces
13. Error handling with `error`
14. `defer`, `panic`, and `recover`
15. Packages and visibility
16. Reading and writing files
17. Basic JSON encoding and decoding
18. Basic command-line programs

Beginner project:

- Build a CLI notes manager that can add, list, search, and delete notes from a local JSON file.

### 2. Intermediate Go

1. Idiomatic Go style
2. Naming, package design, and small interfaces
3. Deeper slices: length, capacity, append behavior
4. Deeper maps: lookup patterns, set-like maps, nested maps
5. Struct composition and embedding
6. Interface design and dependency injection
7. Standard library essentials: `fmt`, `strings`, `strconv`, `time`
8. I/O essentials: `io`, `bufio`, `os`, `path/filepath`
9. HTTP clients with `net/http`
10. HTTP servers, handlers, middleware, and routing
11. JSON APIs
12. Validation and request parsing
13. Testing with `testing`
14. Table-driven tests
15. Mocks, fakes, and test helpers
16. Go modules and dependency management
17. Configuration using environment variables
18. Logging basics
19. Database basics with `database/sql`
20. Transactions and migrations
21. Generics basics

Intermediate project:

- Build a REST API for task tracking with CRUD endpoints, validation, tests, SQLite or Postgres storage, and structured logging.

### 3. Advanced Go

1. Goroutines
2. Channels
3. `select`
4. Buffered vs unbuffered channels
5. Channel closing rules
6. Context cancellation with `context`
7. Timeouts and deadlines
8. Worker pools
9. Fan-out and fan-in
10. Pipelines
11. Rate limiting
12. Synchronization with `sync.Mutex`, `sync.RWMutex`, `sync.Once`, `sync.WaitGroup`
13. Atomic operations
14. Race detection with `go test -race`
15. Memory model basics
16. Benchmarking with `go test -bench`
17. Profiling with `pprof`
18. CPU, memory, goroutine, and block profiles
19. Escape analysis
20. Allocation reduction
21. API design for production services
22. gRPC basics
23. Observability: logs, metrics, traces
24. Resilience: retries, backoff, circuit breakers
25. Security basics: input handling, secrets, TLS, auth
26. Dockerizing Go apps
27. CI basics for Go projects

Advanced project:

- Build a concurrent web crawler or job processor with worker pools, cancellation, retries, metrics, tests, and profiling notes.

### 4. Higher-Advanced Go

1. Go runtime architecture
2. Scheduler internals: G, M, P model
3. Garbage collector internals
4. Stack growth and escape behavior
5. Memory allocator concepts
6. Scheduler tracing with `GODEBUG`
7. Advanced `pprof` investigation
8. `go tool trace`
9. Lock contention analysis
10. Designing high-throughput services
11. Designing low-latency services
12. Backpressure and overload protection
13. Advanced concurrency patterns
14. Distributed systems concepts in Go
15. Idempotency and deduplication
16. Queues, streams, and event-driven systems
17. Consistency, retries, and failure handling
18. Advanced database patterns
19. Reflection
20. Code generation
21. `unsafe` and when to avoid it
22. `cgo` basics and tradeoffs
23. Building reusable Go libraries
24. Public API compatibility
25. Fuzz testing
26. Property-based testing
27. Integration and contract testing
28. Reading Go standard library source
29. Reading Go runtime source
30. Contributing to open-source Go projects

Higher-advanced project:

- Build a production-style distributed job queue or in-memory cache with concurrency control, persistence, metrics, profiling, graceful shutdown, and failure recovery.

## Suggested 24-Week Preparation Plan

### Weeks 1-2: Setup And Core Syntax

- Install Go and configure your editor.
- Learn packages, variables, control flow, functions, arrays, slices, and maps.
- Write 15-20 tiny programs.

### Weeks 3-4: Structs, Interfaces, Errors, Files

- Learn pointers, structs, methods, interfaces, and error handling.
- Practice file I/O and JSON.
- Finish the beginner CLI notes project.

### Weeks 5-7: Idiomatic Go And Standard Library

- Study package design, small interfaces, table-driven tests, and common standard library packages.
- Build HTTP clients and servers.

### Weeks 8-10: APIs, Databases, Testing

- Build REST services.
- Learn `database/sql`, migrations, transactions, configuration, and logging.
- Finish the intermediate task tracker API.

### Weeks 11-14: Concurrency

- Learn goroutines, channels, `select`, context, worker pools, pipelines, and rate limiting.
- Use `go test -race` often.

### Weeks 15-18: Performance And Production Go

- Learn benchmarking, profiling, escape analysis, allocation reduction, graceful shutdown, resilience, and observability.
- Finish the advanced concurrent crawler or job processor.

### Weeks 19-21: Runtime And Internals

- Study scheduler, garbage collector, memory allocator, stack growth, and runtime tracing.
- Read selected parts of the standard library and runtime source.

### Weeks 22-24: Higher-Advanced Project

- Build a distributed job queue or cache.
- Add tests, benchmarks, profiling notes, metrics, graceful shutdown, and failure recovery.
- Write a final architecture document explaining tradeoffs.

## Daily Study Routine

1. Read for 20 minutes.
2. Code for 60-90 minutes.
3. Test what you wrote.
4. Write short notes explaining the concept in your own words.
5. Commit or save the day’s work.

## Practice Checklist

- Can explain the concept without reading notes.
- Can write a small program using it.
- Can test it.
- Can debug it.
- Can say when not to use it.
- Can connect it to a real project.

## Recommended Note Files To Add Later

- `setup.md`
- `syntax-basics.md`
- `slices-and-maps.md`
- `structs-interfaces-errors.md`
- `testing.md`
- `http-services.md`
- `database-sql.md`
- `concurrency.md`
- `context-cancellation.md`
- `performance-profiling.md`
- `runtime-internals.md`
- `advanced-projects.md`
