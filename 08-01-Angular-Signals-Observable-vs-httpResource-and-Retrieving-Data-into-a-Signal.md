# Angular Signals — Observable vs `httpResource()` and Retrieving Data into a Signal

## Topics Covered

1. **Observable vs `httpResource()`**
2. **Angular Resource API**
3. **Creating an `httpResource()`**
4. **Using `defaultValue`**
5. **Injecting `ProductService`**
6. **Reading the Resource `value` Signal**
7. **Sharing Retrieved Data Through a Service**

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

Before Angular's Resource API, getting HTTP data into a Signal required more steps:

```text
HTTP request
      ↓
Observable
      ↓
subscribe()
      ↓
backend returns data
      ↓
Observable emits data
      ↓
manually put data into Signal
      ↓
UI updates
      ↓
unsubscribe
```

So we had to manage:

```text
Observable
subscription
setting Signal value
unsubscribe
```

With `httpResource()`:

```text
define HTTP request
      ↓
httpResource()
      ↓
response goes directly into reactive resource state
      ↓
UI can react
```

So there is:

```text
No manual subscribe
No manual unsubscribe
No manual set into a Signal
```

---

## Angular Resource API

`httpResource()` returns an HTTP resource reference.

Conceptually:

```text
httpResource()
      ↓
HttpResourceRef
      ├── value
      ├── status
      └── error
```

The course explains:

```text
value
→ Signal containing returned data

status
→ Signal containing request status

error
→ Signal containing error details
```

While the request is running:

```text
status
→ loading
```

Initially:

```text
value
→ undefined
```

When data returns:

```text
HTTP response arrives
      ↓
status becomes resolved
      ↓
response data is placed into value Signal
      ↓
Signal notifies Angular
      ↓
UI updates
```

---

## Creating the Product Resource

Following the course structure:

```text
Component
→ displays data

Service
→ performs HTTP request
→ manages shared data/state
```

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

Read it like this:

```text
httpResource<Product[]>()
→ expect Product[] from the backend

() => this.productsUrl
→ provide the endpoint URL

defaultValue: []
→ start with an empty Product array
```

---

## Why `defaultValue: []`?

Without a default value:

```text
resource value
→ Product[] | undefined
```

Before the HTTP response arrives:

```text
value
→ undefined
```

Using:

```ts
{
  defaultValue: []
}
```

gives:

```text
before data arrives
→ []

after data arrives
→ [Product, Product, ...]
```

So we do not have to handle `undefined` everywhere.

---

## When Does the Request Run?

In this course, the instructor explains:

```text
ProductService initialized
      ↓
productsResource declared
      ↓
HTTP request issued
```

When the response returns:

```text
response data
      ↓
productsResource.value
```

The resource and its value remain available until the service is destroyed.

That allows the data to be shared with components or other services.

---

## Injecting `ProductService`

**File:**

```text
product-selection.ts
```

Use Angular's `inject()` function:

```ts
private productService =
  inject(ProductService);
```

```text
inject(ProductService)
→ ask Angular for ProductService

productService
→ service instance
```

The course recommends keeping the service private:

```text
Template
→ should use component Signals

Component
→ uses the private service
```

The instructor also explains:

```text
first injection
→ service is initialized

later injection
→ Angular provides the existing service instance
```

---

## Reading the Resource `value` Signal

Before:

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

This is an important distinction:

```text
productsResource.value
→ the Signal itself
→ no ()
```

We are referencing the Signal, not reading its current value.

---

### Signal vs Signal Value

In the component:

```ts
products =
  this.productService
    .productsResource
    .value;
```

```text
.value
→ Signal itself
```

In the template:

```html
@for (
  product of products();
  track product.id
) {
```

```text
products()
→ current Product[] value
```

So:

```text
products
→ Signal

products()
→ current array inside the Signal
```

---

## Updated `ProductService`

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

## Updated Product Selection Component

The important changes are:

```ts
private productService =
  inject(ProductService);
```

and:

```ts
products =
  this.productService
    .productsResource
    .value;
```

The hard-coded:

```ts
ProductData.products
```

is no longer needed.

The rest of the template can continue reading:

```html
products()
```

---

## Why the Template Barely Changes

Before:

```text
products Signal
→ hard-coded ProductData
```

Now:

```text
products Signal
→ HTTP resource value
```

The template still only knows:

```text
products()
```

That keeps responsibilities separated:

```text
Template
→ display data

Component
→ expose Signal

Service
→ retrieve and manage data
```

---

## How Everything Connects

```text
ProductService initialized
      ↓
httpResource<Product[]>()
      ↓
GET api/products
      ↓
Backend Server
      ↓
Product[] returned
      ↓
productsResource.value Signal
      ↓
ProductSelection.products
      ↓
products()
      ↓
@for
      ↓
Product dropdown updates
```

Main architecture:

```text
Backend
   ↓
Service
   ↓
Resource
   ↓
Signal
   ↓
Component
   ↓
Template
```

---

## `httpResource()` Cheat Sheet

```text
Older HTTP flow
→ Observable
→ subscribe
→ receive data
→ manually set Signal
→ unsubscribe
```

```ts
httpResource<Product[]>(
  () => this.productsUrl,
  {
    defaultValue: []
  }
);
```

```text
httpResource()
→ retrieve data into reactive resource state
```

```text
defaultValue: []
→ start with empty array
→ avoid undefined
```

```ts
private productService =
  inject(ProductService);
```

```text
inject()
→ get service instance
```

```ts
products =
  this.productService
    .productsResource
    .value;
```

```text
.value
→ Signal itself
→ no ()
```

```html
products()
```

```text
→ read current Product[] from Signal
```
