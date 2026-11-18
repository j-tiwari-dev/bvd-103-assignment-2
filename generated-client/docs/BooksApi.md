# BooksApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**createBook**](BooksApi.md#createbook) | **POST** /books | Create a book |
| [**deleteBook**](BooksApi.md#deletebook) | **DELETE** /books/{id} | Delete a book |
| [**getBookById**](BooksApi.md#getbookbyid) | **GET** /books/{id} | Get a book by ID |
| [**listBooks**](BooksApi.md#listbooks) | **GET** /books | List and filter books |
| [**updateBook**](BooksApi.md#updatebook) | **PUT** /books/{id} | Update a book |



## createBook

> BookIdResponse createBook(bookInput)

Create a book

Creates a new book.

### Example

```ts
import {
  Configuration,
  BooksApi,
} from '';
import type { CreateBookRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new BooksApi();

  const body = {
    // BookInput
    bookInput: ...,
  } satisfies CreateBookRequest;

  try {
    const data = await api.createBook(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **bookInput** | [BookInput](BookInput.md) |  | |

### Return type

[**BookIdResponse**](BookIdResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Book created |  -  |
| **400** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## deleteBook

> deleteBook(id)

Delete a book

Deletes an existing book.

### Example

```ts
import {
  Configuration,
  BooksApi,
} from '';
import type { DeleteBookRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new BooksApi();

  const body = {
    // string
    id: id_example,
  } satisfies DeleteBookRequest;

  try {
    const data = await api.deleteBook(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `string` |  | [Defaults to `undefined`] |

### Return type

`void` (Empty response body)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **204** | Book deleted |  -  |
| **400** |  |  -  |
| **404** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getBookById

> BookResponse getBookById(id)

Get a book by ID

Returns one book and its current total warehouse stock.

### Example

```ts
import {
  Configuration,
  BooksApi,
} from '';
import type { GetBookByIdRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new BooksApi();

  const body = {
    // string
    id: id_example,
  } satisfies GetBookByIdRequest;

  try {
    const data = await api.getBookById(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `string` |  | [Defaults to `undefined`] |

### Return type

[**BookResponse**](BookResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Ok |  -  |
| **400** |  |  -  |
| **404** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## listBooks

> Array&lt;BookResponse&gt; listBooks(name, author, priceFrom, priceTo)

List and filter books

Returns books matching the supplied filters. Name and author searches are case-insensitive and treat regex characters literally.

### Example

```ts
import {
  Configuration,
  BooksApi,
} from '';
import type { ListBooksRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new BooksApi();

  const body = {
    // string (optional)
    name: name_example,
    // string (optional)
    author: author_example,
    // number (optional)
    priceFrom: 1.2,
    // number (optional)
    priceTo: 1.2,
  } satisfies ListBooksRequest;

  try {
    const data = await api.listBooks(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **name** | `string` |  | [Optional] [Defaults to `undefined`] |
| **author** | `string` |  | [Optional] [Defaults to `undefined`] |
| **priceFrom** | `number` |  | [Optional] [Defaults to `undefined`] |
| **priceTo** | `number` |  | [Optional] [Defaults to `undefined`] |

### Return type

[**Array&lt;BookResponse&gt;**](BookResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Ok |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## updateBook

> BookIdResponse updateBook(id, bookInput)

Update a book

Updates an existing book.

### Example

```ts
import {
  Configuration,
  BooksApi,
} from '';
import type { UpdateBookRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new BooksApi();

  const body = {
    // string
    id: id_example,
    // BookInput
    bookInput: ...,
  } satisfies UpdateBookRequest;

  try {
    const data = await api.updateBook(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `string` |  | [Defaults to `undefined`] |
| **bookInput** | [BookInput](BookInput.md) |  | |

### Return type

[**BookIdResponse**](BookIdResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Ok |  -  |
| **400** |  |  -  |
| **404** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

