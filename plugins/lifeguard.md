## Overview

The **Lifeguard** plugin is a universal singleton that provides object pooling, global event handling, and game‑flow control. It is a non‑drawing, global object.

## Settings (from `edittime.js`)

```js
{
  "name": "Lifeguard",
  "id": "Lifeguard",
  "version": "1.0",
  "description": "A universal singleton plugin for Object Pooling, Global Events, and game flow control.",
  "author": "Gemini Code Assist",
  "help url": "",
  "category": "General",
  "type": "object",
  "flags": pf_singleglobal
}
```

## Conditions

| ID | Name | Category | Description |
|----|------|----------|-------------|
| 1 | On object spawned from pool | Pooling | Triggers when an instance of an object is spawned from the pool. |
| 2 | On global event | Global Events | Triggers when a specific global event is fired. |

## Actions

| ID | Name | Category | Description |
|----|------|----------|-------------|
| 1 | Setup pool | Pooling | Pre‑creates and initializes the pool for an object type. |
| 2 | Spawn instance | Pooling | Retrieves a hidden instance from the pool, makes it visible, and positions it. |
| 3 | Trigger global event | Global Events | Triggers a global event that any Lifeguard instance can listen for. |
| 4 | Return instance to pool | Pooling | Returns a picked object instance to its pool, making it available for reuse. |
| 5 | Return all active instances | Pooling | Returns all visible instances of an object type to their pool. |

## Expressions

| ID | Expression | Category | Return Type | Description |
|----|------------|----------|-------------|-------------|
| 0 | PoolActiveCount | Pooling | number | Get the number of active (visible) instances in an object's pool. |
| 1 | PoolTotalCount | Pooling | number | Get the total number of instances (active and inactive) in an object's pool. |

## Properties

No custom properties are defined.

## Usage

Add the plugin to your project, then use the actions and conditions to manage object pools and global events.
Add the plugin to your project to enable runtime safety checks.