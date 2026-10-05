# Angular Signals — What, Why, and Which Values Should Be Signals?

## Topics Covered

1. **What Is a Signal?**
2. **Why Signals?**
3. **Writable vs Readable Signals**
4. **Reading and Changing Signals**
5. **Computed Signals**
6. **Should This Be a Signal?**
7. **What, Why, and Which of Signals**

---

## What Is a Signal?

A Signal is a **container that holds a value**.

Unlike a normal variable:

```text
Signal
→ holds a value
→ tracks when that value changes
→ lets Angular react to the change
```

Think of it like a box:

```text
Signal
  ↓
[ value ]
```

When the value changes:

```text
[ old value ]
     ↓
[ new value ]
     ↓
Angular knows it changed
```

That notification is what makes Signals useful for reactive applications.

---

### Writable vs Readable Signals

A Signal created with:

```ts
signal()
```

is writable.

Example:

```ts
const quantity = signal(1);
```

You can:

```text
read it
+
change it
```

Read:

```ts
quantity()
```

Change:

```ts
quantity.set(2);
```

or:

```ts
quantity.update(
  q => q + 1
);
```

A computed Signal is different.

```ts
const total = computed(
  () => price() * quantity()
);
```

It is readable:

```ts
total()
```

but you do not directly set it.

```text
Writable Signal
→ read + change

Computed Signal
→ read
→ value comes from other Signals
```

---

## Why Signals?

The course gives three main reasons:

```text
Signals
→ boost reactivity
→ improve change detection
→ simplify code
```

---

### Normal Variables Do Not React Automatically

```ts
let x = 5;
let y = 3;
let z = x + y;
```

Initially:

```text
z = 8
```

Now:

```ts
x = 10;
```

But:

```text
z is still 8
```

Why?

```text
z = x + y
→ calculated once
```

Changing `x` later does not automatically recalculate `z`.

---

### Signals Make the Dependency Reactive

```ts
const x = signal(5);
const y = signal(3);

const z = computed(
  () => x() + y()
);
```

Initially:

```text
x() = 5
y() = 3

z() = 8
```

Now:

```ts
x.set(10);
```

Then:

```text
x changes
   ↓
computed() reacts
   ↓
z recalculates
   ↓
z() = 13
```

Main difference:

```text
Normal variable
→ dependent value does not automatically recalculate

Signal + computed()
→ dependent value can react automatically
```

---

### Signals Improve Change Detection

Angular needs to know when data changes so the UI can update.

The course explains the older model using `zone.js`:

```text
something changes
      ↓
zone.js notices activity
      ↓
Angular runs change detection
      ↓
UI updates
```

Signals give Angular more direct information:

```text
Signal changes
      ↓
Angular knows which reactive value changed
      ↓
dependent UI can update
```

The goal is:

```text
better tracking
+
less unnecessary checking
+
more deliberate rerendering
```

---

### Signals Can Simplify Code

Imagine:

```text
Price
→ $8.90

Quantity
→ 1

Total
→ $8.90
```

If quantity changes:

```text
1 → 2
```

we want:

```text
Total
$8.90 → $17.80
```

Without reactive state:

```text
quantity changes
      ↓
handle event
      ↓
manually recalculate total
```

With Signals:

```text
quantity Signal changes
      ↓
computed total reacts
      ↓
total recalculates
```

---

## Reading and Changing Signals

### Read with `()`

```ts
const quantity = signal(1);
```

Read:

```ts
quantity()
```

```text
quantity
→ Signal itself

quantity()
→ current value
```

Memory rule:

```text
()
→ open the box
→ read the value
```

---

### `set()` — Exact New Value

Use `set()` when you already know the new value.

```ts
quantity.set(5);
```

```text
Before:
quantity() = 1

set(5)
   ↓

After:
quantity() = 5
```

```text
set()
→ replace current value
```

---

### `update()` — New Value from Current Value

Use `update()` when the new value depends on the current value.

```ts
quantity.update(
  q => q + 1
);
```

```text
q
→ current value

q + 1
→ calculate new value

update()
→ store the result
```

So:

```text
set()
→ exact new value

update()
→ new value based on current value
```

---

## Computed Signals

A computed Signal gets its value from other Signals.

```ts
const price = signal(8.90);
const quantity = signal(1);

const total = computed(
  () => price() * quantity()
);
```

Flow:

```text
price
   \
    → total
   /
quantity
```

Initial value:

```text
price() = 8.90
quantity() = 1

total() = 8.90
```

Now:

```ts
quantity.set(2);
```

Then:

```text
quantity changes
      ↓
computed() reacts
      ↓
total recalculates
      ↓
total() = 17.80
```

Important:

```text
signal()
→ writable state

computed()
→ derived/readable state
```

---

## Should This Be a Signal?

The course gives two strong rules.

### Rule 1 — UI Value Can Change

If a value in the UI can change:

```text
→ it should usually be a Signal
```

Examples:

```text
products
→ starts empty
→ later populated
→ Signal

selectedProduct
→ user changes selection
→ Signal

quantity
→ user changes it
→ Signal

reviews
→ changes when data is retrieved
→ Signal
```

---

### Rule 2 — Value Recomputes from Other Signals

If a value depends on other Signals and should automatically recalculate:

```text
→ use a computed Signal
```

Example:

```text
selected product price
        +
quantity
        ↓
total
```

So:

```text
total
→ computed Signal
```

---

### What Does NOT Need to Be a Signal?

Not every value needs reactive tracking.

```text
Constant value
→ normal variable

Temporary local value
→ normal variable

Event/action
→ not a Signal

Async operation itself
→ not a Signal
```

Example:

```ts
pageTitle = 'Product Selection';
```

If it never changes:

```text
pageTitle
→ normal variable
```

---

## Course Application — Signal Decisions

For the sample app:

```text
products
→ Signal

selected product
→ Signal

quantity
→ Signal

reviews
→ Signal

total
→ computed Signal

page title
→ normal variable
```

Why?

```text
products
→ changes when data arrives

selected product
→ changes from user selection

quantity
→ changes from user input

reviews
→ changes when review data arrives

total
→ depends on product price + quantity

page title
→ does not change
```

---

## How Everything Connects

```text
User changes quantity
      ↓
quantity Signal changes
      ↓
computed total depends on quantity
      ↓
total recalculates
      ↓
Angular updates the UI
```

And:

```text
User selects product
      ↓
selectedProduct Signal changes
      ↓
dependent UI reacts
      ↓
product details update
```

The overall mental model:

```text
Signal
→ reactive state

computed()
→ reactive value derived from Signals

Angular
→ tracks those dependencies
→ updates when they change
```

---

## Signals Cheat Sheet

```ts
const quantity = signal(1);
```

```text
signal()
→ writable Signal
```

```ts
quantity()
```

```text
→ read current value
```

```ts
quantity.set(5);
```

```text
set()
→ replace with exact value
```

```ts
quantity.update(
  q => q + 1
);
```

```text
update()
→ calculate new value from current value
```

```ts
const total = computed(
  () => price() * quantity()
);
```

```text
computed()
→ readable derived Signal
→ recalculates when dependencies change
```

```text
Use a Signal when:
→ UI value can change
→ Angular should track it

Use computed() when:
→ value depends on other Signals
→ it should recalculate automatically
```

```text
Usually do NOT use a Signal for:
→ constants
→ temporary local values
→ events/actions
→ the async operation itself
```
