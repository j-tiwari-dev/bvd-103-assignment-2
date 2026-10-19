import { ObjectId, type Collection } from 'mongodb';

interface DatabaseBook {
  _id: ObjectId;
  name: string;
  author: string;
  description: string;
  price: number;
  image: string;
}

interface BookDatabase {
  books: Pick<Collection<DatabaseBook>, 'findOne'>;
}

export interface Book {
  id: string;
  name: string;
  author: string;
  description: string;
  price: number;
  image: string;
  stock: number;
}

export async function lookupBookById(
  bookId: string,
  database: BookDatabase
): Promise<Book | false> {
  if (!ObjectId.isValid(bookId)) {
    return false;
  }

  const book = await database.books.findOne({
    _id: new ObjectId(bookId),
  });

  if (!book) {
    return false;
  }

  return {
    id: book._id.toString(),
    name: book.name,
    author: book.author,
    description: book.description,
    price: book.price,
    image: book.image,
    stock: 0,
  };
}
