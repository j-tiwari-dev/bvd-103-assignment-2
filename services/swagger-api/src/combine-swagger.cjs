const fs = require('node:fs'); // eslint-disable-line @typescript-eslint/no-require-imports
const path = require('node:path'); // eslint-disable-line @typescript-eslint/no-require-imports

const root = path.resolve(__dirname, '../../..');
const services = ['books-api', 'warehouse-api', 'orders-api'];

const combined = {
  openapi: '3.0.0',
  info: {
    title: 'McMasterful Books API',
    version: '1.0.0',
    description: 'Combined API documentation for Assignment 7',
  },
  servers: [{ url: '/api' }],
  paths: {},
  components: {},
  tags: [],
};

for (const service of services) {
  const file = path.join(root, 'services', service, 'build', 'swagger.json');
  const spec = JSON.parse(fs.readFileSync(file, 'utf8'));

  for (const [route, operations] of Object.entries(spec.paths || {})) {
    if (combined.paths[route]) {
      throw new Error(`Duplicate API path: ${route}`);
    }

    combined.paths[route] = operations;
  }

  for (const [section, definitions] of Object.entries(spec.components || {})) {
    combined.components[section] ??= {};

    for (const [name, definition] of Object.entries(definitions)) {
      if (combined.components[section][name]) {
        if (
          JSON.stringify(combined.components[section][name]) !==
          JSON.stringify(definition)
        ) {
          throw new Error(`Conflicting ${section}: ${name}`);
        }
      } else {
        combined.components[section][name] = definition;
      }
    }
  }

  for (const tag of spec.tags || []) {
    if (!combined.tags.some((existing) => existing.name === tag.name)) {
      combined.tags.push(tag);
    }
  }
}

const output = path.join(root, 'services/swagger-api/build/swagger.json');

fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, JSON.stringify(combined, null, 2));

console.log('Combined Swagger specification generated successfully.');
