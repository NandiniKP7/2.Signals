# Angular Signals — `computed()` and `linkedSignal()`

## Topics Covered

1. **`computed()` Signal**
2. **Creating a `computed()` Signal**
3. **`linkedSignal()`**
4. **Creating a `linkedSignal()`**
5. **Reactive Function vs Object in `linkedSignal()`**
6. **`computed()` vs `linkedSignal()`**

---

## `computed()` Signal

A `computed()` Signal is used when one value depends on other Signals.

In this app:

```text
Selected Product Price
        +
Quantity
        ↓
Total
```

If either dependency changes:

```text
selectedProduct changes
        OR
quantity changes
        ↓
total recalculates
```

The main idea:

```text
computed()
→ derives a value from other Signals
→ reacts when dependencies change
→ returns a read-only Signal
```

---

### Creating the Total Signal

**File:**

```text
product-selection.ts
```

```ts
total = computed(
  () =>
    (this.selectedProduct()?.price ?? 0)
    * this.quantity()
);
```

Read it like this:

```text
this.selectedProduct()
→ current selected product

?.price
→ get price only if product exists

?? 0
→ if price is undefined, use 0

this.quantity()
→ current quantity

price × quantity
→ total
```

Example:

```text
Price = 8.90
Quantity = 2
      ↓
Total = 17.80
```

---

### Why `?? 0`?

Before a product is selected:

```text
selectedProduct()
→ undefined
```

So:

```ts
this.selectedProduct()?.price
```

may also be:

```text
undefined
```

This:

```ts
?? 0
```

means:

```text
if value is null or undefined
→ use 0
```

So `total` always calculates with a number.

---

### How `computed()` Finds Dependencies

Inside the computation Angular sees:

```text
selectedProduct()
quantity()
```

Those become dependencies.

```text
selectedProduct
      \
       → total
      /
quantity
```

When one changes:

```text
dependency changes
      ↓
computed value becomes stale
      ↓
when total is read
      ↓
it recalculates using current values
```

If nothing reads the computed Signal, Angular does not need to recalculate it yet.

---

### `computed()` Is Read-Only

`total` has a type like:

```text
Signal<number>
```

not:

```text
WritableSignal<number>
```

You can read it:

```ts
total()
```

But you do not directly use:

```text
set()
update()
```

Why?

```text
total
→ comes from other Signals
→ Angular calculates it
```

Mental model:

```text
signal()
→ writable state

computed()
→ read-only derived state
```

---

### Displaying the Total

**Template:**

```html
<div class="cellRight">
  {{ total() | currency }}
</div>
```

```text
total()
→ read computed value

currency
→ format value as currency
```

Because the template uses `currency`, the component imports:

```ts
imports: [FormsModule, CurrencyPipe]
```

---

### Using `computed()` for UI State

A computed Signal is not only for arithmetic.

The course also derives the total color:

```ts
color = computed(
  () => this.total() > 200
    ? 'green'
    : 'blue'
);
```

```text
total() > 200
→ green

otherwise
→ blue
```

Template:

```html
<div
  class="cellRight"
  [style.color]="color()">
  {{ total() | currency }}
</div>
```

Flow:

```text
selectedProduct / quantity changes
        ↓
total recalculates
        ↓
color recalculates
        ↓
UI color changes
```

So `computed()` can derive:

```text
calculations
UI state
other values based on Signals
```

---

## `linkedSignal()`

Now there is a different problem.

Suppose:

```text
Product A selected
Quantity = 7
```

Then the user selects another product.

Without extra logic:

```text
Product B selected
Quantity = 7
```

For this app we want:

```text
selectedProduct changes
      ↓
quantity resets to 1
```

But quantity must still be writable because the user can change it.

A `computed()` Signal cannot do this because it is read-only.

This is where `linkedSignal()` fits.

---

### What Is a `linkedSignal()`?

A `linkedSignal()` is:

```text
reactive
+
writable
```

It can react when another Signal changes:

```text
selectedProduct changes
→ quantity resets
```

but afterward the user can still change quantity:

```text
quantity.update(...)
[(ngModel)]="quantity"
```

Mental model:

```text
computed()
→ reactive + read-only

linkedSignal()
→ reactive + writable
```

---

### Creating the Quantity `linkedSignal()`

Before:

```ts
quantity = signal(1);
```

Now:

```ts
quantity = linkedSignal({
  source: this.selectedProduct,
  computation: p => 1
});
```

Read it like this:

```text
source
→ Signal to watch

this.selectedProduct
→ when this Signal changes...

computation
→ decide the new quantity

p => 1
→ reset quantity to 1
```

Flow:

```text
selectedProduct changes
      ↓
linkedSignal reacts
      ↓
quantity becomes 1
```

---

### Why No `()` on `source`?

Notice:

```ts
source: this.selectedProduct
```

not:

```ts
source: this.selectedProduct()
```

Because:

```text
this.selectedProduct
→ Signal itself

this.selectedProduct()
→ current Signal value
```

`source` needs the Signal to watch.

So we pass:

```text
the Signal itself
```

---

### Why Is Quantity Still Writable?

This still works:

```ts
this.quantity.update(
  q => q + 1
);
```

and:

```ts
this.quantity.update(
  q => q <= 0 ? 0 : q - 1
);
```

and:

```html
[(ngModel)]="quantity"
```

So:

```text
Product changes
→ quantity resets to 1

User changes quantity
→ quantity remains writable
```

That is the key reason for using `linkedSignal()` here.

---

## Reactive Function vs Object in `linkedSignal()`

![Reactive Function vs Object in linkedSignal](./linkedSignal-function-vs-object.png)

There are two common ways to create a `linkedSignal()`.

### Pass a Reactive Function

```ts
score = linkedSignal<number>(
  () => this.reset() ? 0 : 10
);
```

Use this when:

```text
the reactive function directly reads
all dependent Signals
```

Here:

```ts
this.reset()
```

is read inside the function.

Angular can track that dependency automatically.

---

### Pass an Object

```ts
quantity = linkedSignal({
  source: this.selectedProduct,
  computation: p => 1
});
```

Use the object form when:

```text
the computation does NOT directly read
all Signals that should trigger it
```

Here:

```ts
computation: p => 1
```

does not read:

```ts
this.selectedProduct()
```

So we explicitly tell Angular:

```ts
source: this.selectedProduct
```

Meaning:

```text
when selectedProduct changes
→ run the computation
```

---

### Object Form with Previous Value

The object form is also useful when the computation needs previous state.

Conceptually:

```ts
linkedSignal<SourceType, ValueType>({
  source: ...,
  computation: (source, previous) => ...
});
```

`previous` can provide:

```text
previous source value
previous linkedSignal value
```

Use this when the new value depends on what the earlier value was.

---

## `computed()` vs `linkedSignal()`

![computed vs linkedSignal](./computed-vs-linkedSignal.png)

The easiest comparison:

```text
computed()
→ derive a value
→ read-only

linkedSignal()
→ reset/recompute a value
→ writable
```

### Use `computed()` When

```text
one value depends on other Signals
      ↓
it should automatically recompute
      ↓
you do not need to manually change it
```

Examples:

```text
total
→ price × quantity

color
→ based on total
```

### Use `linkedSignal()` When

```text
a Signal should reset/react
when another Signal changes
      ↓
but the result must remain writable
```

Example:

```text
selectedProduct changes
      ↓
quantity resets to 1
      ↓
user can still change quantity
```

It is also useful when you need:

```text
previous source/value
```

to decide the next value.

---

## Current Component Logic

**File:**

```text
product-selection.ts
```

```ts
import {
  Component,
  computed,
  effect,
  linkedSignal,
  signal
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';

import { ProductData } from '../product-data';
import { Product } from '../product';

@Component({
  selector: 'app-product-selection',
  imports: [FormsModule, CurrencyPipe],
  templateUrl: './product-selection.html',
  styleUrl: './product-selection.css'
})
export class ProductSelection {

  pageTitle = 'Product Selection';

  selectedProduct =
    signal<Product | undefined>(undefined);

  quantity = linkedSignal({
    source: this.selectedProduct,
    computation: p => 1
  });

  products = signal(ProductData.products);

  onIncrease() {
    this.quantity.update(
      q => q + 1
    );
  }

  onDecrease() {
    this.quantity.update(
      q => q <= 0 ? 0 : q - 1
    );
  }

  qtyEffect = effect(
    () => console.log(
      'quantity:',
      this.quantity()
    )
  );

  total = computed(
    () =>
      (this.selectedProduct()?.price ?? 0)
      * this.quantity()
  );

  color = computed(
    () => this.total() > 200
      ? 'green'
      : 'blue'
  );
}
```

---

## How Everything Connects

```text
User selects product
      ↓
selectedProduct Signal changes
      ↓
linkedSignal quantity resets to 1
      ↓
quantity remains writable
```

At the same time:

```text
selectedProduct
      +
quantity
      ↓
computed total
      ↓
computed color
      ↓
UI updates
```

Overall:

```text
selectedProduct
      ↓
linkedSignal(quantity)
      ↓
quantity remains writable
      ↓
computed(total)
      ↓
computed(color)
      ↓
UI reacts
```

---

## `computed()` + `linkedSignal()` Cheat Sheet

```ts
total = computed(
  () =>
    (selectedProduct()?.price ?? 0)
    * quantity()
);
```

```text
computed()
→ derived value
→ tracks Signals it reads
→ read-only result
```

```ts
color = computed(
  () => total() > 200
    ? 'green'
    : 'blue'
);
```

```text
computed()
→ can also derive UI state
```

```ts
quantity = linkedSignal({
  source: selectedProduct,
  computation: p => 1
});
```

```text
linkedSignal()
→ reactive
→ writable
→ resets/recomputes when source changes
```

```text
computed()
→ derive value
→ read-only

linkedSignal()
→ react/reset value
→ writable
```

```text
Pass function to linkedSignal()
→ function directly reads dependencies

Pass object to linkedSignal()
→ explicit source needed
→ or previous source/value is needed
```
