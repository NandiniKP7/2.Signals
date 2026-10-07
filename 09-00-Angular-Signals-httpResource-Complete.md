# Angular Signals — `httpResource()`, Resource Lifetime, Loading, and Errors

## Topics Covered

1. **Observable vs `httpResource()`**
2. **Angular Resource API**
3. **Creating an `httpResource()`**
4. **Using `defaultValue`**
5. **Injecting `ProductService`**
6. **Reading the Resource `value` Signal**
7. **Resource in Service vs Returned from a Method**
8. **Using `isLoading`**
9. **Using `error`**
10. **Common Resource API Questions**

---

## Observable vs `httpResource()`

Our goal is:

```text
Backend Server
      ↓
ProductService
      ↓
products Signal
      ↓
Product Selection Component
      ↓
UI
```

Before the Resource API, the course describes the flow as:

```text
HTTP request
      ↓
Observable
      ↓
subscribe()
      ↓
data returns later
      ↓
manually put data into Signal
      ↓
UI updates
      ↓
unsubscribe
```

With `httpResource()`:

```text
define HTTP request
      ↓
httpResource()
      ↓
response goes into reactive resource state
      ↓
UI reacts
```

So for this retrieval flow there is:

```text
No manual subscribe
No manual unsubscribe
No manual Signal.set(...)
```

---

## Angular Resource API

`httpResource()` returns an `HttpResourceRef`.

Conceptually:

```text
httpResource()
      ↓
HttpResourceRef
      ├── value
      ├── isLoading
      ├── status
      └── error
```

```text
value
→ Signal containing returned data

isLoading
→ Signal<boolean>

status
→ request status Signal

error
→ error Signal
```

Request flow:

```text
request starts
      ↓
loading
      ↓
data returns
      ↓
value Signal receives data
      ↓
Angular reacts
      ↓
UI updates
```

---

## Creating the Product Resource

HTTP logic belongs in the service.

**File:**

```text
product.service.ts
```

```ts
private productsUrl = 'api/products';

productsResource =
  httpResource<Product[]>(
    () => this.productsUrl,
    {
      defaultValue: []
    }
  );
```

```text
httpResource<Product[]>()
→ expect Product[] from backend

() => this.productsUrl
→ provide request URL

defaultValue: []
→ start with an empty array
```

---

## Why `defaultValue: []`?

Without it:

```text
value
→ Product[] | undefined
```

With:

```ts
{
  defaultValue: []
}
```

we get:

```text
before data arrives
→ []

after data arrives
→ [Product, Product, ...]
```

That avoids handling `undefined` everywhere.

---

## Injecting `ProductService`

**File:**

```text
product-selection.ts
```

```ts
private productService =
  inject(ProductService);
```

```text
inject(ProductService)
→ ask Angular for the service instance
```

The course keeps the service private:

```text
Template
→ uses component Signals

Component
→ talks to private service
```

---

## Reading the Resource `value` Signal

Previously:

```ts
products =
  signal(ProductData.products);
```

Now:

```ts
products =
  this.productService
    .productsResource
    .value;
```

Important:

```text
productsResource.value
→ Signal itself
→ no ()
```

But in the template:

```html
@for (
  product of products();
  track product.id
) {
```

```text
products()
→ read current Product[] value
```

So:

```text
products
→ Signal

products()
→ value inside Signal
```

The hard-coded `ProductData` import is no longer needed.

---

## Resource Lifetime — Two Different Approaches

This is the most important new idea in this section.

### 1. Resource Declared in the Service

```ts
productsResource =
  httpResource<Product[]>(
    () => this.productsUrl,
    {
      defaultValue: []
    }
  );
```

Flow:

```text
ProductService initialized
      ↓
resource created
      ↓
HTTP request issued
      ↓
data stored in service resource
      ↓
component can be destroyed
      ↓
resource/data remain with service
```

Use this when:

```text
data should be shared
or
data should survive component destruction
```

This is the approach the sample application keeps.

---

### 2. Resource Returned from a Service Method

Alternative:

```ts
createProducts() {
  return httpResource<Product[]>(
    () => this.productsUrl,
    {
      defaultValue: []
    }
  );
}
```

Component:

```ts
productsResource =
  this.productService.createProducts();

products =
  this.productsResource.value;
```

Now:

```text
component initialized
      ↓
createProducts() called
      ↓
resource created
      ↓
HTTP request issued
      ↓
component destroyed
      ↓
resource destroyed
      ↓
retrieved data gone
```

Navigate back:

```text
component created again
      ↓
createProducts() runs again
      ↓
HTTP request runs again
```

### Decision Rule

```text
Need shared / retained data?
        ↓
Resource in service

Need fresh data every time component opens?
        ↓
Return resource from service method
        ↓
Component owns the resource lifetime
```

---

## Using `isLoading`

The resource already gives us:

```ts
productsResource.isLoading
```

Component:

```ts
isLoading =
  this.productService
    .productsResource
    .isLoading;
```

```text
isLoading
→ Signal<boolean>
```

Flow:

```text
request starts
→ isLoading() = true

response returns
→ isLoading() = false
```

Template:

```html
@if (isLoading()) {
  <div>Loading products...</div>
} @else {
  <!-- product UI -->
}
```

So the UI can react directly to request state.

---

## Using the `error` Signal

The resource also provides:

```ts
productsResource.error
```

Component:

```ts
error =
  this.productService
    .productsResource
    .error;
```

Conceptually:

```text
error
→ Signal<Error | undefined>
```

```text
request succeeds
→ error() is undefined

request fails
→ error() contains Error
```

---

### Creating an Error Message

```ts
errorMessage = computed(
  () =>
    this.error()
      ? this.error()?.message
      : ''
);
```

Break it down:

```text
this.error()
→ read error Signal

?
→ if an error exists

this.error()?.message
→ safely get error message

:
→ otherwise

''
→ return empty string
```

Template:

```html
@if (errorMessage()) {
  <div style="color: red">
    {{ errorMessage() }}
  </div>
}
```

Flow:

```text
HTTP fails
      ↓
error Signal changes
      ↓
errorMessage computed recalculates
      ↓
UI shows message
```

The course notes that a production app would usually add better logging and more helpful user-facing messages.

---

## Current Product Service

```ts
import { httpResource } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Product } from './product';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private productsUrl = 'api/products';

  productsResource =
    httpResource<Product[]>(
      () => this.productsUrl,
      {
        defaultValue: []
      }
    );
}
```

---

## Current Resource Code in Product Selection

```ts
private productService =
  inject(ProductService);

products =
  this.productService
    .productsResource
    .value;

isLoading =
  this.productService
    .productsResource
    .isLoading;

error =
  this.productService
    .productsResource
    .error;

errorMessage = computed(
  () =>
    this.error()
      ? this.error()?.message
      : ''
);
```

The rest of the existing Signals such as `selectedProduct`, `quantity`, `total`, and `color` continue working around this retrieved product data.

---

## Common Resource API Questions

### Where Should a Resource Be Declared?

```text
Service
→ share resource/data
→ retain data after component destruction

Component-owned resource
→ only one component needs it
→ create/destroy it with that component
→ re-fetch when component is recreated
```

---

### Can `httpResource()` Use Interceptors?

According to the course:

```text
Yes
```

Because `httpResource()` uses `HttpClient`, HTTP interceptors can still participate.

---

### Should Resource API Be Used for Updates?

According to this course:

```text
Resource API
→ retrieval

HttpClient
→ update/mutation operations
```

The reason discussed is cancellation behavior.

For retrieval:

```text
request product A
      ↓
user quickly asks for product B
      ↓
A can be canceled
      ↓
retrieve B
```

That behavior is useful for reads, but not desirable for mutations that need to complete.

---

### Other Resource Types

The course mentions:

```text
httpResource
→ HTTP-based resource

resource
→ lower-level Promise-based resource

rxResource
→ Observable/RxJS-based resource
```

If RxJS operators are needed, the course points to `rxResource`.

---

### Why Is the URL `api/products`?

The sample app uses:

```text
Angular in-memory-web-api
```

It acts like a fake backend for the course.

The Angular request code is still written as if it were calling a real HTTP endpoint.

---

## How Everything Connects

```text
ProductService initialized
      ↓
httpResource<Product[]>()
      ↓
GET api/products
      ↓
response
      ↓
productsResource
      ├── value
      ├── isLoading
      └── error
```

Then:

```text
value
→ products
→ products()
→ product dropdown
```

```text
isLoading
→ isLoading()
→ loading message
```

```text
error
→ error()
→ computed errorMessage
→ error message
```

Architecture:

```text
Backend
   ↓
Service
   ↓
Resource
   ↓
Signals
   ↓
Component
   ↓
Template
```

Resource lifetime:

```text
Resource in service
→ shared / retained

Resource returned from method
→ component-owned
→ destroyed with component
→ re-request when recreated
```

---

## `httpResource()` Cheat Sheet

```text
Observable approach
→ subscribe
→ receive data
→ manually set Signal
→ unsubscribe
```

```text
httpResource()
→ retrieve directly into reactive resource state
```

```ts
productsResource =
  httpResource<Product[]>(
    () => this.productsUrl,
    {
      defaultValue: []
    }
  );
```

```text
defaultValue: []
→ avoid initial undefined
```

```ts
products = productsResource.value;
```

```text
.value
→ Signal itself
```

```ts
isLoading = productsResource.isLoading;
```

```text
isLoading()
→ request running?
```

```ts
error = productsResource.error;
```

```text
error()
→ Error or undefined
```

```text
Resource in service
→ retain/share data

Resource returned from method
→ component owns lifetime
→ fresh request when component is recreated
```

```text
httpResource
→ retrieval

HttpClient
→ mutations

resource
→ Promise-based

rxResource
→ Observable/RxJS-based
```
