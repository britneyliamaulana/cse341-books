
import swaggerJsdoc from 'swagger-jsdoc';


const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Books and Authors API',
      version: '1.0.0',
      description: 'API for managing books and authors.'
    },
    servers: [
  {
    url: 'https://cse341-books-d7kn.onrender.com',
    description: 'Production server'
  },
  {
    url: 'http://localhost:3000',
    description: 'Local development server'
  }
 ]
  },
  apis: ['./app.js']
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
