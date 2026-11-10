
import { getDb } from './src/db/connect.js';
import express from 'express';

import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './src/swagger.js';

const app = express();

app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/', (req, res) => {
    return res.status(200).json({
        message: 'Server is running'
    });
});

app.get('/books', async (req, res) => {
  try {
    const books = await getDb()
      .collection('books')
      .find({})
      .toArray();

    return res.status(200).json(books);
  } catch (error) {
    console.error('Failed to retrieve books:', error.message);
    return res.status(500).json({
      message: 'Internal server error'
    });
  }
});


/**
 * @swagger
 * /books:
 *   get:
 *     summary: Get all books
 *     tags: [Books]
 *     responses:
 *       200:
 *         description: List of all books
 *       500:
 *         description: Server error
 */



/**
 * @swagger
 * /books:
 *   post:
 *     summary: Create a new book
 *     tags: [Books]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - authorId
 *               - title
 *               - publicationDate
 *             properties:
 *               id:
 *                 type: string
 *                 example: b4
 *               authorId:
 *                 type: string
 *                 example: a1
 *               title:
 *                 type: string
 *                 example: Example Book Title
 *               publicationDate:
 *                 type: string
 *                 example: 2026-01-15
 *     responses:
 *       201:
 *         description: Book created
 *       400:
 *         description: Invalid book data or author
 *       409:
 *         description: Book ID already exists
 *       500:
 *         description: Server error
 */
app.post('/books', async (req, res) => {
  try {
    const { id, authorId, title, publicationDate } = req.body;

    if (
      typeof id !== 'string' || !id.trim() ||
      typeof authorId !== 'string' || !authorId.trim() ||
      typeof title !== 'string' || !title.trim() ||
      typeof publicationDate !== 'string' || !publicationDate.trim()
    ) {
      return res.status(400).json({
        message: 'All book fields are required.'
      });
    }

    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    const date = new Date(`${publicationDate}T00:00:00Z`);

    if (
      !datePattern.test(publicationDate) ||
      Number.isNaN(date.getTime()) ||
      date.toISOString().slice(0, 10) !== publicationDate
    ) {
      return res.status(400).json({
        message: 'Publication date must be a valid YYYY-MM-DD date.'
      });
    }

    const db = getDb();

    const existingBook = await db.collection('books').findOne({ id });

    if (existingBook) {
      return res.status(409).json({
        message: 'A book with this ID already exists.'
      });
    }

    const author = await db.collection('authors').findOne({ id: authorId });

    if (!author) {
      return res.status(400).json({
        message: 'Author not found.'
      });
    }

    const newBook = {
      id: id.trim(),
      authorId: authorId.trim(),
      title: title.trim(),
      publicationDate
    };

    await db.collection('books').insertOne(newBook);

    return res.status(201).json(newBook);
  } catch (error) {
    console.error('Failed to create book:', error.message);
    return res.status(500).json({
      message: 'Internal server error'
    });
  }
});



/**
 * @swagger
 * /books/{id}:
 *   put:
 *     summary: Update an existing book
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: b1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - authorId
 *               - title
 *               - publicationDate
 *             properties:
 *               authorId:
 *                 type: string
 *                 example: a2
 *               title:
 *                 type: string
 *                 example: Updated Book Title
 *               publicationDate:
 *                 type: string
 *                 example: 2026-02-20
 *     responses:
 *       200:
 *         description: Book updated
 *       400:
 *         description: Invalid book data or author
 *       404:
 *         description: Book not found
 *       500:
 *         description: Server error
 */
app.put('/books/:id', async (req, res) => {
  try {
    const { authorId, title, publicationDate } = req.body;
    const id = req.params.id;

    if (
      typeof authorId !== 'string' || !authorId.trim() ||
      typeof title !== 'string' || !title.trim() ||
      typeof publicationDate !== 'string' || !publicationDate.trim()
    ) {
      return res.status(400).json({
        message: 'Author ID, title, and publication date are required.'
      });
    }

    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    const date = new Date(`${publicationDate}T00:00:00Z`);

    if (
      !datePattern.test(publicationDate) ||
      Number.isNaN(date.getTime()) ||
      date.toISOString().slice(0, 10) !== publicationDate
    ) {
      return res.status(400).json({
        message: 'Publication date must be a valid YYYY-MM-DD date.'
      });
    }

    const db = getDb();
    const books = db.collection('books');

    const existingBook = await books.findOne({ id });

    if (!existingBook) {
      return res.status(404).json({
        message: 'Book not found.'
      });
    }

    const author = await db.collection('authors').findOne({
      id: authorId.trim()
    });

    if (!author) {
      return res.status(400).json({
        message: 'Author not found.'
      });
    }

    await books.updateOne(
      { id },
      {
        $set: {
          authorId: authorId.trim(),
          title: title.trim(),
          publicationDate
        }
      }
    );

    const updatedBook = await books.findOne({ id });

    return res.status(200).json(updatedBook);
  } catch (error) {
    console.error('Failed to update book:', error.message);
    return res.status(500).json({
      message: 'Internal server error'
    });
  }
});


/**
 * @swagger
 * /books/{id}:
 *   get:
 *     summary: Get one book by ID
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: b1
 *     responses:
 *       200:
 *         description: Book found
 *       404:
 *         description: Book not found
 *       500:
 *         description: Server error
 */


app.get('/books/:id', async (req, res) => {
  try {
    const book = await getDb()
      .collection('books')
      .findOne({ id: req.params.id });

    if (!book) {
      return res.status(404).json({
        message: 'Book not found'
      });
    }

    return res.status(200).json(book);
  } catch (error) {
    console.error('Failed to retrieve book:', error.message);
    return res.status(500).json({
      message: 'Internal server error'
    });
  }
});


/**
 * @swagger
 * /books/{id}:
 *   delete:
 *     summary: Delete a book
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: b1
 *     responses:
 *       204:
 *         description: Book deleted successfully
 *       404:
 *         description: Book not found
 *       500:
 *         description: Server error
 */
app.delete('/books/:id', async (req, res) => {
  try {
    const result = await getDb()
      .collection('books')
      .deleteOne({ id: req.params.id });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        message: 'Book not found.'
      });
    }

    return res.status(204).send();
  } catch (error) {
    console.error('Failed to delete book:', error.message);
    return res.status(500).json({
      message: 'Internal server error'
    });
  }
});


/**
 * @swagger
 * /authors:
 *   get:
 *     summary: Get all authors
 *     tags: [Authors]
 *     responses:
 *       200:
 *         description: List of all authors
 *       500:
 *         description: Server error
 */
app.get('/authors', async (req, res) => {
  try {
    const authors = await getDb()
      .collection('authors')
      .find({})
      .toArray();

    return res.status(200).json(authors);
  } catch (error) {
    console.error('Failed to retrieve authors:', error.message);
    return res.status(500).json({
      message: 'Internal server error'
    });
  }
});


/**
 * @swagger
 * /authors/{id}:
 *   get:
 *     summary: Get one author by ID
 *     tags: [Authors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: a1
 *     responses:
 *       200:
 *         description: Author found
 *       404:
 *         description: Author not found
 *       500:
 *         description: Server error
 */
app.get('/authors/:id', async (req, res) => {
  try {
    const author = await getDb()
      .collection('authors')
      .findOne({ id: req.params.id });

    if (!author) {
      return res.status(404).json({
        message: 'Author not found'
      });
    }

    return res.status(200).json(author);
  } catch (error) {
    console.error('Failed to retrieve author:', error.message);
    return res.status(500).json({
      message: 'Internal server error'
    });
  }
});


/**
 * @swagger
 * /authors:
 *   post:
 *     summary: Create a new author
 *     tags: [Authors]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - name
 *               - birthYear
 *             properties:
 *               id:
 *                 type: string
 *                 example: a1
 *               name:
 *                 type: string
 *                 example: Maya Rivera
 *               birthYear:
 *                 type: integer
 *                 example: 1985
 *     responses:
 *       201:
 *         description: Author created
 *       400:
 *         description: Invalid author data
 *       409:
 *         description: Author ID already exists
 *       500:
 *         description: Server error
 */
app.post('/authors', async (req, res) => {
  try {
    const { id, name, birthYear } = req.body;

    if (
      typeof id !== 'string' || !id.trim() ||
      typeof name !== 'string' || !name.trim() ||
      !Number.isInteger(birthYear) ||
      birthYear <= 0 ||
      birthYear > new Date().getFullYear()
    ) {
      return res.status(400).json({
        message: 'Valid ID, name, and birth year are required.'
      });
    }

    const authors = getDb().collection('authors');

    const existingAuthor = await authors.findOne({
      id: id.trim()
    });

    if (existingAuthor) {
      return res.status(409).json({
        message: 'An author with this ID already exists.'
      });
    }

    const newAuthor = {
      id: id.trim(),
      name: name.trim(),
      birthYear
    };

    await authors.insertOne(newAuthor);

    return res.status(201).json(newAuthor);
  } catch (error) {
    console.error('Failed to create author:', error.message);
    return res.status(500).json({
      message: 'Internal server error'
    });
  }
});



/**
 * @swagger
 * /authors/{id}:
 *   put:
 *     summary: Update an author
 *     tags: [Authors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: a1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - birthYear
 *             properties:
 *               name:
 *                 type: string
 *                 example: Maya Rivera
 *               birthYear:
 *                 type: integer
 *                 example: 1986
 *     responses:
 *       200:
 *         description: Author updated
 *       400:
 *         description: Invalid author data
 *       404:
 *         description: Author not found
 *       500:
 *         description: Server error
 */
app.put('/authors/:id', async (req, res) => {
  try {
    const { name, birthYear } = req.body;
    const id = req.params.id;

    if (
      typeof name !== 'string' || !name.trim() ||
      !Number.isInteger(birthYear) ||
      birthYear <= 0 ||
      birthYear > new Date().getFullYear()
    ) {
      return res.status(400).json({
        message: 'Valid name and birth year are required.'
      });
    }

    const authors = getDb().collection('authors');

    const existingAuthor = await authors.findOne({ id });

    if (!existingAuthor) {
      return res.status(404).json({
        message: 'Author not found.'
      });
    }

    await authors.updateOne(
      { id },
      {
        $set: {
          name: name.trim(),
          birthYear
        }
      }
    );

    const updatedAuthor = await authors.findOne({ id });

    return res.status(200).json(updatedAuthor);
  } catch (error) {
    console.error('Failed to update author:', error.message);
    return res.status(500).json({
      message: 'Internal server error'
    });
  }
});


/**
 * @swagger
 * /authors/{id}:
 *   delete:
 *     summary: Delete an author
 *     tags: [Authors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: a1
 *     responses:
 *       204:
 *         description: Author deleted
 *       404:
 *         description: Author not found
 *       409:
 *         description: Author is still referenced by books
 *       500:
 *         description: Server error
 */
app.delete('/authors/:id', async (req, res) => {
  try {
    const db = getDb();
    const id = req.params.id;

    const authors = db.collection('authors');
    const books = db.collection('books');

    const existingAuthor = await authors.findOne({ id });

    if (!existingAuthor) {
      return res.status(404).json({
        message: 'Author not found.'
      });
    }

    const booksUsingAuthor = await books.findOne({
      authorId: id
    });

    if (booksUsingAuthor) {
      return res.status(409).json({
        message: 'Cannot delete an author who is referenced by books.'
      });
    }

    await authors.deleteOne({ id });

    return res.status(204).send();
  } catch (error) {
    console.error('Failed to delete author:', error.message);
    return res.status(500).json({
      message: 'Internal server error'
    });
  }
});



export default app;