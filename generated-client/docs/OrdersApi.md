# OrdersApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**createOrder**](OrdersApi.md#createorder) | **POST** /orders |  |
| [**fulfilOrder**](OrdersApi.md#fulfilorderoperation) | **POST** /orders/{orderId}/fulfil |  |
| [**listOrders**](OrdersApi.md#listorders) | **GET** /orders |  |



## createOrder

> PlaceOrderResponse createOrder(placeOrderRequest)



### Example

```ts
import {
  Configuration,
  OrdersApi,
} from '';
import type { CreateOrderRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new OrdersApi();

  const body = {
    // PlaceOrderRequest
    placeOrderRequest: ...,
  } satisfies CreateOrderRequest;

  try {
    const data = await api.createOrder(body);
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
| **placeOrderRequest** | [PlaceOrderRequest](PlaceOrderRequest.md) |  | |

### Return type

[**PlaceOrderResponse**](PlaceOrderResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Order created |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## fulfilOrder

> fulfilOrder(orderId, fulfilOrderRequest)



### Example

```ts
import {
  Configuration,
  OrdersApi,
} from '';
import type { FulfilOrderOperationRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new OrdersApi();

  const body = {
    // string
    orderId: orderId_example,
    // FulfilOrderRequest
    fulfilOrderRequest: ...,
  } satisfies FulfilOrderOperationRequest;

  try {
    const data = await api.fulfilOrder(body);
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
| **orderId** | `string` |  | [Defaults to `undefined`] |
| **fulfilOrderRequest** | [FulfilOrderRequest](FulfilOrderRequest.md) |  | |

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
| **204** | Order fulfilled |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## listOrders

> Array&lt;OrderResponse&gt; listOrders()



### Example

```ts
import {
  Configuration,
  OrdersApi,
} from '';
import type { ListOrdersRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new OrdersApi();

  try {
    const data = await api.listOrders();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**Array&lt;OrderResponse&gt;**](OrderResponse.md)

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

