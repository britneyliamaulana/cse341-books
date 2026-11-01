# Books API Endpoints

The Books API provides read-only access to book records stored in MongoDB.

## Base URL

https://cse341-books-d7kn.onrender.com

## Endpoints

### Get all books

- Method: GET
- Path: `/books`
- Success response: `200 OK`
- Returns: An array of all books.

### Get a single book

- Method: GET
- Path: `/books/:id`
- Example: `/books/b1`
- Success response: `200 OK`
- Not found response: `404 Not Found`
- Returns: The requested book or an error message if it does not exist.

### Error handling

If an unexpected server or database error occurs, the API returns `500 Internal Server Error` with a generic error message.
