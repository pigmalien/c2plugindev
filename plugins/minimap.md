# MiniMap Pro Plugin

## Overview

The **MiniMap Pro** plugin adds a high‑performance WebGL mini‑map to a Construct 2 project. It tracks objects, displays icons, and allows the map to be scrolled programmatically.

## Settings (from `edittime.js`)

```js
{\n  "name": "MiniMap Pro",
  "id": "MiniMapPro",
  "version": "1.0",
  "description": "High-performance WebGL Mini-map with FBO batching.",
  "author": "Gemini Code Assist",
  "help url": "",
  "category": "User interface",
  "type": "world",
  "rotatable": false,
  "flags": pf_position_aces | pf_size_aces | pf_appearance_aces | pf_predraw | pf_zorder_aces
}
```

## Conditions

| ID | Name | Category | Description |
|----|------|----------|-------------|
| 0 | On Object Entered Map | Events | Triggered when a tracked object first appears within the map bounds. |
| 1 | On Object Reached | Events | Triggered when an object reaches a destination or target on the map. |

## Actions

| ID | Name | Category | Description |
|----|------|----------|-------------|
| 0 | Add Tracking | Setup | Track an object type or family (size, color). |
| 1 | Update Icon | Icons | Change attributes of a specific icon by UID (color, blink). |
| 2 | Remove Icon | Icons | Stop tracking a specific UID manually. |
| 3 | Scroll Map | View | Scroll map to a target object or system scroll. |
| 4 | Set Display Shape | Settings | Set the clipping shape of the mini‑map (Rectangle/Circle). |

## Expressions

| ID | Expression | Category | Return Type | Description |
|----|------------|----------|-------------|-------------|
| 0 | MapScale | Settings | number | Current ratio of world to map. |

## Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| Map Scale | float | 0.1 | Ratio of world pixels to map pixels. |
| Display Shape | combo | Rectangle | The shape of the mini‑map clipping boundary. |

## Usage

Add the plugin to your project, then use the actions to track objects and control the map view.