# McMasterful Books - Assignment 6

BVD 103 | McMaster Continuing Education

## Overview

Assignment 6 extends the McMasterful Books application with

Docker-based deployment, Nginx reverse proxy, horizontal scaling,

round-robin load balancing, and HTTP caching.

The application retains the Books, Warehouse, and Orders APIs

developed in previous assignments.

## Features

- Koa REST API

- MongoDB persistence

- Book catalogue management

- Warehouse inventory and shelf management

- Book ordering and fulfilment

- tsoa OpenAPI generation

- Swagger UI documentation

- Generated TypeScript SDK

- Docker Compose deployment

- Nginx reverse proxy

- Three backend instances

- Round-robin load balancing

- HTTP caching

- Vitest unit and API integration tests

- GitHub Actions CI

## Architecture

The application uses six Docker containers:

1. Nginx reverse proxy

2. McMasterful Books frontend

3. Backend instance 1

4. Backend instance 2

5. Backend instance 3

6. MongoDB database

Nginx receives incoming requests on port 8080.

Frontend requests are forwarded to the frontend container

on port 9080.

API requests are distributed across three backend instances,

each listening internally on port 3000.

All backend instances connect to the same MongoDB database.

## Requirements

- Docker

- Docker Compose

- Node.js 24 for local development

- Java 17 for OpenAPI SDK generation

- npm

## Installation

Clone the repository:

bash

git clone https://github.com/j-tiwari-dev/bvd-103-assignment-2.git

Enter the project directory:

bash

cd bvd-103-assignment-2

Switch to the Assignment 6 branch:

bash

git switch assignment-6

Install dependencies for local development:

bash

npm ci

## Running Assignment 6

Start the application:

bash

docker compose up -d

Check container status:

bash

docker compose ps

The following services should be running:

- mongo

- backend1

- backend2

- backend3

- frontend

- nginx

Stop the application:

bash

docker compose down

Do not use docker compose down -v unless you intend

to remove the persistent database and dependency volumes.

## Application URLs

Website:

http://localhost:8080

API health endpoint:

http://localhost:8080/api/health

Books API:

http://localhost:8080/api/books

Swagger UI:

http://localhost:8080/api/docs

## Horizontal Scaling

Assignment 6 runs three backend instances:

- backend1

- backend2

- backend3

Nginx distributes incoming API requests using round-robin

load balancing.

Each backend uses the same MongoDB database.

### Verify Load Balancing

Run:

bash

for i in $(seq 1 9); do

curl -s -D - -o /dev/null \

    http://localhost:8080/api/health \

    | grep -i "X-Backend-Server"

done

Three different backend addresses should appear repeatedly.

## HTTP Caching

Nginx caches selected successful API responses.

| Resource | Cache Behaviour |

|---|---|

| Unfiltered book listings | 30 seconds |

| Individual book details | 30 seconds |

| Filtered book searches | Bypass cache |

| Orders | Not cached |

| Warehouse operations | Not cached |

| Book creation, update and deletion | Not cached |

Frontend development assets retain Vite's cache headers.

### Verify Book Caching

Run:

bash

curl -s -D - -o /dev/null \

http://localhost:8080/api/books \

| grep -i "X-Cache-Status"

Repeat the command.

Expected cache behaviour:

- MISS: Response retrieved from the backend

- HIT: Response served from the Nginx cache

- BYPASS: Request intentionally bypasses caching

Book details may remain stale for up to 30 seconds

after inventory changes or deletion.

## OpenAPI and TypeScript SDK

Generate the OpenAPI specification:

bash

npm run swagger

Generate tsoa routes:

bash

npm run routes

Generate the TypeScript SDK:

bash

npm run generate-sdk

Java must be installed for SDK generation.

## Testing

### TypeScript

bash

npm run check-types

### Lint

bash

npm run lint

### Unit Tests

bash

npm run test:ci

### SDK API Tests

Start the Docker application before running:

bash

npm run test:api

The local API tests use:

http://localhost:8080/api

The API endpoint can be overridden using

the API_BASE_URL environment variable.

## Test Coverage

The project includes tests for:

- Book listing and lookup

- Book creation, updating and deletion

- Invalid book IDs

- Missing books

- Invalid book data

- MongoDB regex escaping

- Warehouse quantity validation

- Order placement

- Order fulfilment

- Inventory deductions

- Generated SDK functionality

Latest verified results:

- 47 unit tests passed

- 15 SDK API tests passed

## Assignment 5 Feedback Corrections

The Assignment 6 branch also includes improvements based

on Assignment 5 feedback:

- Removed duplicate active API routing

- Improved warehouse quantity validation

- Rejected fractional and invalid quantities

- Added duplicate fulfilment validation

- Improved multiple-filter handling

- Escaped special characters in MongoDB searches

- Improved HTTP 400 and 404 error responses

- Added SDK CRUD and failure-case tests

- Improved API documentation

## GitHub Actions

GitHub Actions runs four jobs:

1. Format and Lint

2. Check Types

3. Unit and Warehouse Tests

4. Generated SDK API Tests

The workflow uses Node.js 24 and Java 17.

All four CI jobs were verified as passing.

## Assignment 6 Submission

Repository:

https://github.com/j-tiwari-dev/bvd-103-assignment-2

Branch:

assignment-6

Required release tag:

assignment-6

The final submission consists of a text file containing

the GitHub repository link and the Assignment 6 release tag.
