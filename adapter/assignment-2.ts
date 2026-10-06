import assignment1 from './assignment-1';

export type BookID = string;

export interface Book {
  id?: BookID;
  name: string;
  author: string;
  description: string;
  price: number;
  image: string;
}

const API_BASE = 'http://localhost:3000';

async function listBooks(
  filters?: Array<{ from?: number; to?: number }>
): Promise<Book[]> {
  return assignment1.listBooks(filters);
}

async function createOrUpdateBook(book: Book): Promise<BookID> {
  const isUpdate = Boolean(book.id);
  const url = isUpdate ? API_BASE + '/books/' + book.id : API_BASE + '/books';
  const method = isUpdate ? 'PUT' : 'POST';

  const response = await fetch(url, {
    method: method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(book),
  });

  if (!response.ok) {
    let errorMessage =
      'Failed to ' +
      (isUpdate ? 'update' : 'create') +
      ' book: HTTP ' +
      response.status;
    try {
      const errData: any = await response.json();
      if (errData && errData.error) {
        errorMessage = errData.error;
      }
    } catch {
      // response was not JSON
    }
    throw new Error(errorMessage);
  }

  const data: any = await response.json();
  return data.id as BookID;
}

async function removeBook(bookId: BookID): Promise<void> {
  const url = API_BASE + '/books/' + bookId;
  const response = await fetch(url, {
    method: 'DELETE',
  });

  if (!response.ok && response.status !== 204) {
    let errorMessage = 'Failed to delete book: HTTP ' + response.status;
    try {
      const errData: any = await response.json();
      if (errData && errData.error) {
        errorMessage = errData.error;
      }
    } catch {
      // response was not JSON
    }
    throw new Error(errorMessage);
  }
}

const assignment = 'assignment-2';

export default {
  assignment,
  createOrUpdateBook,
  removeBook,
  listBooks,
};
