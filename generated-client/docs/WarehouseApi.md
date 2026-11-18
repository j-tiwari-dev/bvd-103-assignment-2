# WarehouseApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**findBookOnShelf**](WarehouseApi.md#findbookonshelf) | **GET** /warehouse/books/{bookId} | Find book inventory by shelf |
| [**placeBooksOnShelf**](WarehouseApi.md#placebooksonshelf) | **POST** /warehouse/shelves | Place books on a warehouse shelf |



## findBookOnShelf

> Array&lt;ShelfResponse&gt; findBookOnShelf(bookId)

Find book inventory by shelf

Retrieves all warehouse shelves containing copies of a book.  Returns each shelf identifier and its available quantity.

### Example

```ts
import {
  Configuration,
  WarehouseApi,
} from '';
import type { FindBookOnShelfRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new WarehouseApi();

  const body = {
    // string
    bookId: bookId_example,
  } satisfies FindBookOnShelfRequest;

  try {
    const data = await api.findBookOnShelf(body);
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
| **bookId** | `string` |  | [Defaults to `undefined`] |

### Return type

[**Array&lt;ShelfResponse&gt;**](ShelfResponse.md)

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

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## placeBooksOnShelf

> placeBooksOnShelf(placeBooksRequest)

Place books on a warehouse shelf

Adds copies of a book to a warehouse shelf.  Only positive whole-number quantities are accepted. Existing shelf inventory is increased by the supplied quantity.

### Example

```ts
import {
  Configuration,
  WarehouseApi,
} from '';
import type { PlaceBooksOnShelfRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new WarehouseApi();

  const body = {
    // PlaceBooksRequest
    placeBooksRequest: ...,
  } satisfies PlaceBooksOnShelfRequest;

  try {
    const data = await api.placeBooksOnShelf(body);
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
| **placeBooksRequest** | [PlaceBooksRequest](PlaceBooksRequest.md) |  | |

### Return type

`void` (Empty response body)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **204** | Books placed on shelf |  -  |
| **400** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

