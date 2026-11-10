
# Books API Week 02 Spec - Version 1

## Feature 1: Book CRUD Operations and Author References

### Goal
Update the existing Week 01 book API so book documents include a reference to an author and the API supports all CRUD operations for books. Every book route must be documented and testable in Swagger.

### Data Model
Book documents will be stored in the `books` collection.

Required book fields:
- `id`: string, required, custom id such as `b1`
- `authorId`: string, required, references the `id` field of an author document
- `title`: string, required
- `publicationDate`: string, required

Books will continue to use custom string ids instead of MongoDB `_id` values for route parameters.

### Relationship to Authors
Each book will identify its author with an `authorId` field. The value of `authorId` must match the custom `id` value of an existing author document.

When creating or updating a book, the API should reject the request with a `400` status code if the submitted `authorId` does not match an existing author.

### Routes

#### GET /books
Purpose: Return all books.

Success:
- Status code: `200`
- Response body: an array of book objects

Errors:
- `500` if an unexpected server or database error occurs

#### GET /books/:id
Purpose: Return one book by its custom id.

Success:
- Status code: `200`
- Response body: the matching book object

Errors:
- `404` if no book exists with that id
- `500` if an unexpected server or database error occurs

#### POST /books
Purpose: Create a new book.

Request body:

    {
      "id": "b4",
      "authorId": "a1",
      "title": "Example Book Title",
      "publicationDate": "2026-01-15"
    }

Success:
- Status code: `201`
- Response body: the newly created book object

Errors:
- `400` if a required field is missing
- `400` if the `id` already exists
- `400` if the `authorId` does not match an existing author
- `500` if an unexpected server or database error occurs

#### PUT /books/:id
Purpose: Update an existing book.

Request body:

    {
      "authorId": "a2",
      "title": "Updated Book Title",
      "publicationDate": "2026-02-20"
    }

Success:
- Status code: `200`
- Response body: the updated book object

Errors:
- `400` if a required field is missing
- `400` if the `authorId` does not match an existing author
- `404` if no book exists with that id
- `500` if an unexpected server or database error occurs

#### DELETE /books/:id
Purpose: Delete an existing book.

Success:
- Status code: `204`
- Response body: none

Errors:
- `404` if no book exists with that id
- `500` if an unexpected server or database error occurs

### Swagger Documentation
Swagger must document every book route.

### Deployment Expectations
After implementation, the book routes must work locally and from the deployed Render application. The deployed Swagger page at `/api-docs` must allow someone to test every book route from the browser.


## Feature 2: Author CRUD Operations

### Goal

Create an authors API that allows clients to create, read, update, and delete authors. Each author will have a custom ID, name, and birth year. Every author route must be documented and testable in Swagger.

### Data Model

Author documents will be stored in the `authors` collection.

Required author fields:
- `id`: string, required, custom ID such as `a1`
- `name`: string, required
- `birthYear`: number, required, must be a valid positive year

Authors will use custom string IDs instead of MongoDB `_id` values for route parameters.

### Relationship to Books

Books will reference authors using the `authorId` field.

An author cannot be deleted while books still reference that author. The API will return a `409` status code if a client attempts to delete an author who has existing books.

### Routes

#### GET /authors

Purpose: Return all authors.

Success:
- Status code: `200`
- Response body: an array of author objects

Errors:
- `500` if an unexpected server or database error occurs.

#### GET /authors/:id

Purpose: Return one author by their custom ID.

Success:
- Status code: `200`
- Response body: the matching author object

Errors:
- `404` if no author exists with that ID.
- `500` if an unexpected server or database error occurs.

#### POST /authors

Purpose: Create a new author.

Request body:

    {
      "id": "a1",
      "name": "Maya Rivera",
      "birthYear": 1985
    }

Success:
- Status code: `201`
- Response body: the newly created author object.

Errors:
- `400` if a required field is missing or invalid.
- `400` if the author ID already exists.
- `500` if an unexpected server or database error occurs.

#### PUT /authors/:id

Purpose: Update an existing author.

Request body:

    {
      "name": "Maya Rivera",
      "birthYear": 1986
    }

Success:
- Status code: `200`
- Response body: the updated author object.

Errors:
- `400` if a required field is missing or invalid.
- `404` if no author exists with that ID.
- `500` if an unexpected server or database error occurs.

#### DELETE /authors/:id

Purpose: Delete an existing author.

Success:
- Status code: `204`
- Response body: none.

Errors:
- `404` if no author exists with that ID.
- `409` if books still reference the author.
- `500` if an unexpected server or database error occurs.

### Swagger Documentation

Swagger must document all author routes, including request bodies, response status codes, and possible errors.

Users must be able to test all author routes through the Swagger interface at `/api-docs`.

### Deployment Expectations

After implementation, all author routes must work locally and on the deployed Render application. The deployed Swagger page must allow users to test every author route.



# Books API Week 02 Spec - Version 2

## Feature 1: Book CRUD Operations and Author References

### Goal
Update the Books API to support all CRUD operations and connect each book to an existing author using an author ID. All routes must be documented and testable through Swagger.

### Data Model
Books will be stored in the `books` collection.

Required fields:
- `id`: string, required, unique custom ID such as `b1`.
- `authorId`: string, required, references an existing author's custom ID.
- `title`: string, required, non-empty.
- `publicationDate`: string, required, valid date in YYYY-MM-DD format.

The custom `id` field will be used for API routes instead of MongoDB `_id`.

### Relationship to Authors
Every book must reference an existing author.

- The API must check whether the author exists before creating or updating a book.
- An invalid author reference returns `400 Bad Request`.
- Books must store the author's custom ID in `authorId`.
- A book's custom ID cannot be changed through an update request.

### Routes

#### GET /books
Return all books.

Success:
- `200 OK`: Return an array of book objects.

Errors:
- `500 Internal Server Error`: Unexpected server or database error.

#### GET /books/:id
Return one book using its custom ID.

Success:
- `200 OK`: Return the matching book.

Errors:
- `404 Not Found`: Book does not exist.
- `500 Internal Server Error`: Unexpected server or database error.

#### POST /books
Create a new book.

Request body:
{
  "id": "b4",
  "authorId": "a1",
  "title": "Example Book Title",
  "publicationDate": "2026-01-15"
}

Validation:
- All fields are required.
- ID must be unique.
- Title cannot be empty.
- Publication date must be a valid YYYY-MM-DD date.
- Author ID must reference an existing author.
- Only the expected fields are accepted.

Success:
- `201 Created`: Return the newly created book.

Errors:
- `400 Bad Request`: Missing or invalid fields, invalid date, or unknown author.
- `409 Conflict`: Book ID already exists.
- `500 Internal Server Error`: Unexpected server or database error.

#### PUT /books/:id
Update an existing book.

Request body:
{
  "authorId": "a2",
  "title": "Updated Book Title",
  "publicationDate": "2026-02-20"
}

Validation:
- All update fields are required.
- The book ID in the URL must identify an existing book.
- The custom ID cannot be changed.
- The new author ID must reference an existing author.
- Title and publication date must be valid.
- Only expected fields are accepted.

Success:
- `200 OK`: Return the updated book.

Errors:
- `400 Bad Request`: Missing or invalid fields or unknown author.
- `404 Not Found`: Book does not exist.
- `500 Internal Server Error`: Unexpected server or database error.

#### DELETE /books/:id
Delete an existing book.

Success:
- `204 No Content`: Book deleted successfully. No response body.

Errors:
- `404 Not Found`: Book does not exist.
- `500 Internal Server Error`: Unexpected server or database error.

### Swagger Documentation
Document all book routes with:
- HTTP methods and descriptions.
- Required parameters.
- Request body schemas.
- Successful response codes and examples.
- Error response codes and examples.

All routes must be testable through `/api-docs`.

### Deployment Expectations
All book routes must work locally and on Render. The deployed Swagger documentation must allow testing of all book operations.

---

# Authors API Week 02 Spec - Version 2

## Feature 2: Author CRUD Operations

### Goal
Create an authors API that supports creating, reading, updating, and deleting authors. All routes must be documented and testable through Swagger.

### Data Model
Authors will be stored in the `authors` collection.

Required fields:
- `id`: string, required, unique custom ID such as `a1`.
- `name`: string, required, non-empty.
- `birthYear`: number, required, positive whole number that cannot be in the future.

The custom `id` field will be used for API routes instead of MongoDB `_id`.

### Relationship to Books
Books reference authors through their `authorId` field.

- An author cannot be deleted while books still reference that author.
- Attempting to delete an author with existing books returns `409 Conflict`.
- The API must check the books collection before deleting an author.

### Routes

#### GET /authors
Return all authors.

Success:
- `200 OK`: Return an array of author objects.

Errors:
- `500 Internal Server Error`: Unexpected server or database error.

#### GET /authors/:id
Return one author using their custom ID.

Success:
- `200 OK`: Return the matching author.

Errors:
- `404 Not Found`: Author does not exist.
- `500 Internal Server Error`: Unexpected server or database error.

#### POST /authors
Create a new author.

Request body:
{
  "id": "a1",
  "name": "Maya Rivera",
  "birthYear": 1985
}

Validation:
- All fields are required.
- ID must be unique.
- Name cannot be empty.
- Birth year must be a positive whole number and cannot be in the future.
- Only expected fields are accepted.

Success:
- `201 Created`: Return the newly created author.

Errors:
- `400 Bad Request`: Missing or invalid fields.
- `409 Conflict`: Author ID already exists.
- `500 Internal Server Error`: Unexpected server or database error.

#### PUT /authors/:id
Update an existing author.

Request body:
{
  "name": "Maya Rivera",
  "birthYear": 1986
}

Validation:
- Name and birth year are required.
- Name cannot be empty.
- Birth year must be a positive whole number and cannot be in the future.
- The custom author ID cannot be changed.
- Only expected fields are accepted.

Success:
- `200 OK`: Return the updated author.

Errors:
- `400 Bad Request`: Missing or invalid fields.
- `404 Not Found`: Author does not exist.
- `500 Internal Server Error`: Unexpected server or database error.

#### DELETE /authors/:id
Delete an existing author.

Success:
- `204 No Content`: Author deleted successfully. No response body.

Errors:
- `404 Not Found`: Author does not exist.
- `409 Conflict`: Books still reference this author.
- `500 Internal Server Error`: Unexpected server or database error.

### Swagger Documentation
Document all author routes with:
- HTTP methods and descriptions.
- Required parameters.
- Request body schemas.
- Successful response codes and examples.
- Error response codes and examples.

All author routes must be testable through `/api-docs`.

### Deployment Expectations
All author routes must work locally and on Render. The deployed Swagger documentation must allow testing of all author operations.

### General API Requirements
- Validate all incoming request data.
- Accept only expected fields.
- Use consistent JSON error messages, for example:
  { "error": "Author not found" }
- Never expose database credentials or raw database error details.
- Use unique database indexes for custom IDs to prevent duplicate records.
- Handle unexpected errors safely with a `500` response.
