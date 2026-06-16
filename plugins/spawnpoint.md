# Spawn Point Plugin

## Overview

The **Spawn Point** plugin is a global object that manages random spawn locations either inside or outside a defined area. It can be used to spawn enemies, items, or any other objects.

## Settings (from `edittime.js`)

```js
{\n  "name": "Spawn Point",
  "id": "SpawnPoint",
  "version": "1.1",
  "description": "A global plugin to manage spawn points either randomly inside or outside an area.",
  "author": "Gemini",
  "help url": "",
  "category": "General",
  "type": "object",
  "flags": pf_singleglobal
}
```

## Conditions

| ID | Name | Category | Description |
|----|------|----------|-------------|
| 0 | Is spawning outside area | Mode | True if the spawn point is set to spawn randomly outside an area. |
| 1 | Is spawning inside area | Mode | True if the spawn point is set to spawn randomly inside an area. |
| 2 | On point set | Spawning | Triggered after the 'Set point' action. |

## Actions

| ID | Name | Category | Description |
|----|------|----------|-------------|
| 0 | Set mode | Mode | Set mode to {0}. |
| 1 | Set area | Area | Set area to ({0}, {1}, {2}, {3}). |
| 2 | Set padding | Area | Set padding to {0}. |
| 3 | Set point | Spawning | Generate a point and trigger 'On point set'. |
| 4 | Set seed | Area | Set seed to {0}. |

## Expressions

| ID | Expression | Category | Return Type | Description |
|----|------------|----------|-------------|-------------|
| 0 | PointX | Point | number | The X coordinate of the last generated point. |
| 1 | PointY | Point | number | The Y coordinate of the last generated point. |

## Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| Seed | text | "" | The seed for the random number generator. Leave empty for a random seed. |

## Usage

Add the plugin to the project, set the mode and area, then call `Set point` to generate a spawn location.