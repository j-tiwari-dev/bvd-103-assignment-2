# WarehouseApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**findBookOnShelf**](WarehouseApi.md#findbookonshelf) | **GET** /warehouse/books/{bookId} |  |
| [**placeBooksOnShelf**](WarehouseApi.md#placebooksonshelf) | **POST** /warehouse/shelves |  |



## findBookOnShelf

> Array&lt;ShelfResponse&gt; findBookOnShelf(bookId)



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

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## placeBooksOnShelf

> placeBooksOnShelf(placeBooksRequest)



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
- **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **204** | Books placed on shelf |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

