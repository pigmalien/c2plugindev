# Ribbon Trail Plugin

## Overview

The **Ribbon Trail** plugin creates a continuous ribbon mesh that follows an object. It is a world object that can be placed in a layout and updated via actions.

## Settings (from `edittime.js`)

```js
{\n  "name": "RibbonTrail",
  "id": "RibbonTrail",
  "version": "1.0",
  "description": "A performant, continuous ribbon mesh trail plugin.",
  "author": "Antigravity",
  "help url": "https://www.construct.net/en/construct-2/manuals/construct-2-javascript-sdk",
  "category": "General",
  "type": "world",
  "rotatable": true,
  "flags": pf_texture | pf_position_aces | pf_size_aces | pf_angle_aces | pf_zorder_aces | pf_appearance_aces
}
```

## Conditions

The plugin does not define custom conditions.

## Actions

| ID | Name | Category | Description |
|----|------|----------|-------------|
| 0 | Update Trail Position | Ribbon | Update trail position by ({0}, {1}) |
| 1 | Load image from URL | Web | Load image from {0} (cross-origin {1}) |

## Expressions

The plugin does not expose custom expressions.

## Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| Ribbon Width | float | 40 | The maximum width of the ribbon mesh at its head (in pixels). |
| Trail Lifespan | float | 0.5 | The total duration (in seconds) that a segment of the ribbon persists. |
| Initial visibility | combo | Visible | Choose whether the object is visible when the layout starts. |

## Usage

Add the plugin to a layout, then use the actions to update the trail position and load textures.