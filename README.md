# McMasterful Books - Assignment 7

BVD 103 | McMaster Continuing Education

## Overview

Assignment 7 transforms the McMasterful Books application from a
single backend into an event-driven microservices architecture.

The application uses separate Books, Warehouse, and Orders APIs,
RabbitMQ messaging, independent MongoDB databases, Nginx reverse
proxy routing, and combined Swagger documentation.

The frontend continues to support book browsing, inventory
visibility, shopping cart functionality, and order placement.

## Features

- Three independent REST API services
- Koa and TypeScript
- MongoDB persistence
- Separate databases for each API
- RabbitMQ event-driven communication
- Book catalogue management
- Warehouse inventory and shelf management
- Order creation and asynchronous fulfilment
- MongoDB transactions for inventory deductions
- Event-based stock synchronization
- Transactional fulfilment outbox
- tsoa OpenAPI generation
- Combined Swagger documentation
- Generated TypeScript SDK
- Docker Compose deployment
- Nginx reverse proxy
- McMasterful Books frontend
- Vitest automated testing
- GitHub Actions CI

## Architecture

Assignment 7 separates the backend into four services.

### Books API

Responsible for:

- Creating books
- Updating books
- Deleting books
- Listing and searching books
- Maintaining locally synchronized stock information

### Warehouse API

Responsible for:

- Warehouse inventory
- Shelf management
- Stock placement
- Stock deductions
- Transactional fulfilment processing
- Maintaining a local book catalogue

### Orders API

Responsible for:

- Creating orders
- Listing orders
- Tracking order status
- Requesting fulfilment through RabbitMQ
- Processing fulfilment results

### Swagger API

Provides combined OpenAPI documentation for the three APIs.

## Database Architecture

Each API has its own MongoDB server and database.

| Service       | Database                    |
| ------------- | --------------------------- |
| Books API     | mcmasterful-books-listings  |
| Warehouse API | mcmasterful-books-warehouse |
| Orders API    | mcmasterful-books-orders    |

The Warehouse MongoDB server uses a single-node replica set
named `rs0` to support transactions.

Each API manages its own data.

Information needed by other services is synchronized through
RabbitMQ events.

## RabbitMQ Messaging

RabbitMQ provides asynchronous communication between services.

The application uses a topic exchange:

`mcmasterful.events`

### Book Events

| Event       | Publisher     | Purpose                   |
| ----------- | ------------- | ------------------------- |
| BookAdded   | Books API     | Synchronize new books     |
| BookUpdated | Books API     | Synchronize book changes  |
| BookDeleted | Books API     | Synchronize book deletion |
| BookStocked | Warehouse API | Synchronize stock totals  |

### Order Events

| Event                    | Publisher     | Purpose                       |
| ------------------------ | ------------- | ----------------------------- |
| OrderFulfilmentRequested | Orders API    | Request inventory fulfilment  |
| OrderFulfilled           | Warehouse API | Confirm successful fulfilment |
| OrderFulfilmentFailed    | Warehouse API | Report fulfilment failure     |

### Order Fulfilment Process

1. A customer creates an order.
2. Orders API stores the order in its database.
3. The customer requests fulfilment.
4. Orders API publishes an OrderFulfilmentRequested event.
5. Warehouse API receives the request.
6. Warehouse validates available inventory.
7. MongoDB transactions protect multi-shelf deductions.
8. Warehouse records the fulfilment result.
9. RabbitMQ delivers the result to Orders API.
10. Orders API updates the order status.
11. Stock events synchronize inventory information with Books API.

Order fulfilment is asynchronous.

A fulfilment request returns HTTP 202 Accepted while processing
continues through RabbitMQ.

## Requirements

- Docker Desktop or Docker Engine
- Docker Compose
- Node.js 24 for local development
- npm
- Java 17 for OpenAPI SDK generation
- Git

## Installation

Clone the repository:

```bash
git clone https://github.com/j-tiwari-dev/bvd-103-assignment-2.git
```

Enter the project directory:

```bash
cd bvd-103-assignment-2
```

Install dependencies:

```bash
npm ci
```

## Running Assignment 7

Start the application:

```bash
docker compose -f docker-compose.assignment7.yaml up -d
```

Check container status:

```bash
docker compose -f docker-compose.assignment7.yaml ps
```

The deployment includes:

- mongo-books
- mongo-warehouse
- mongo-orders
- rabbitmq
- books-api
- warehouse-api
- orders-api
- swagger-api
- frontend
- nginx

The prepare service generates API documentation, routes,
and the TypeScript SDK before the application services start.

### Initialize Warehouse MongoDB

For a new Warehouse MongoDB volume, initialize the replica set:

```bash
docker compose -f docker-compose.assignment7.yaml exec \
  mongo-warehouse mongosh --eval \
  'rs.initiate({_id:"rs0",members:[{_id:0,host:"mongo-warehouse:27017"}]})'
```

Verify the replica set:

```bash
docker compose -f docker-compose.assignment7.yaml exec \
  mongo-warehouse mongosh --quiet --eval \
  'rs.status().members.map(m => ({name:m.name,state:m.stateStr}))'
```

The Warehouse MongoDB instance should report PRIMARY.

If the replica set is already initialized, do not initialize it again.

### Stop the Application

```bash
docker compose -f docker-compose.assignment7.yaml down
```

Do not use `down -v` unless you intentionally want to delete
persistent database and RabbitMQ volumes.

## Application URLs

| Component           | URL                                 |
| ------------------- | ----------------------------------- |
| Website             | http://localhost:8081               |
| Books API           | http://localhost:8081/api/books     |
| Warehouse API       | http://localhost:8081/api/warehouse |
| Orders API          | http://localhost:8081/api/orders    |
| Swagger UI          | http://localhost:8081/api/docs/     |
| RabbitMQ Management | http://localhost:15672              |

### Direct API Ports

| Service             | Port  |
| ------------------- | ----- |
| Books API           | 3001  |
| Warehouse API       | 3002  |
| Orders API          | 3003  |
| Swagger API         | 3004  |
| Nginx               | 8081  |
| RabbitMQ Management | 15672 |

The APIs listen internally on port 3000.

Nginx routes requests to the appropriate service.

## OpenAPI Documentation

Each API generates its own OpenAPI specification.

Generate the specifications and routes:

```bash
for service in books-api warehouse-api orders-api; do
  (
    cd "services/$service" &&
    npx tsoa spec &&
    npx tsoa routes
  ) || exit 1
done
```

Generate the combined Swagger specification:

```bash
node services/swagger-api/src/combine-swagger.cjs
```

Generate the TypeScript SDK:

```bash
npx openapi-generator-cli generate \
  -i services/swagger-api/build/swagger.json \
  -g typescript-fetch \
  -o generated-client
```

Java 17 is required for SDK generation.

## Testing

### TypeScript

```bash
npm run check-types
```

Check each service:

```bash
for service in books-api warehouse-api orders-api swagger-api; do
  (
    cd "services/$service" &&
    npx tsc --noEmit
  ) || exit 1
done
```

### ESLint

```bash
npm run lint
```

### Prettier

```bash
npx prettier --check .
```

### Unit Tests

```bash
npm run test:ci
```

The unit tests use mongodb-memory-server.

MongoDB binary availability may vary depending on the operating
system and CPU architecture.

### API Integration Tests

Start the Assignment 7 application before running:

```bash
npm run test:api
```

The API tests use the generated TypeScript SDK.

The Assignment 7 API base URL is:

`http://localhost:8081/api`

It can be configured through the API_BASE_URL environment variable.

### Docker Configuration Validation

```bash
docker compose -f docker-compose.assignment7.yaml config --quiet
```

### Check Service Health

```bash
curl http://localhost:8081/api/books
curl http://localhost:8081/api/orders
curl http://localhost:3004/health
```

## Integration Testing

The following application workflow was manually verified:

1. Create a book.
2. Synchronize the book with Warehouse and Orders.
3. Add inventory to a warehouse shelf.
4. Synchronize stock with Books API.
5. Create an order.
6. Request order fulfilment.
7. Process inventory deductions.
8. Update the order status.
9. Synchronize the remaining stock.

### Verified Example

Initial warehouse inventory: 5 books

Fulfilment quantity: 2 books

Remaining warehouse inventory: 3 books

Final order status: fulfilled

Books API synchronized stock: 3 books

The frontend was also tested for book browsing,
adding a book to the cart, and placing orders.

## GitHub Actions

The repository includes automated CI checks for:

1. Format and Lint
2. TypeScript validation
3. Unit and Warehouse Tests
4. Generated SDK API Integration Tests

The Assignment 7 workflow generates service-specific OpenAPI
specifications, combines Swagger documentation, generates the SDK,
and starts the required services for integration testing.

The workflow uses Node.js and Java for code generation and testing.

## Reliability Considerations

The application uses durable RabbitMQ queues and persistent
messages for event delivery.

Warehouse fulfilment uses MongoDB transactions to protect
multi-shelf inventory deductions.

A fulfilment outbox records events for subsequent publishing.

Additional production-hardening considerations include:

- Initial synchronization of existing records
- Recovery from failed event publishing
- Duplicate event handling
- Out-of-order event delivery
- RabbitMQ reconnection
- Monitoring and dead-letter handling

## Assignment 7 Submission

Repository:

https://github.com/j-tiwari-dev/bvd-103-assignment-2

Development branch:

`main`

Release tag:

`assignment-7`

The final submission should include the repository link and
the Assignment 7 release tag, subject to the instructor's
submission instructions.

## Previous Assignments

Assignment 6 introduced Docker deployment, Nginx reverse proxy,
round-robin load balancing, and HTTP caching.

Assignment 7 extends the application with independently deployed
services, RabbitMQ messaging, separate databases, and
event-driven synchronization.
