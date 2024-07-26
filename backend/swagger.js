import swaggerAutogen from 'swagger-autogen'

const doc = {
  info: {
    version: '1.0.0',
    title: 'Recipe API',
    description: 'This is a REST API application made with Express and documented with Swagger',
  },
  host: process.env.REDIRECT_URL,
  schemes: ['http', 'https'],
  consumes: ['application/json', 'application/xml'],
  produces: ['application/json', 'application/xml'],
}

const outputFile = './swagger-output.json'
const endpointsFiles = ['./server.js']

swaggerAutogen(outputFile, endpointsFiles, doc)
