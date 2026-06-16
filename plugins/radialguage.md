# Radial Gauge Plugin

## Overview

The **Radial Gauge** plugin provides a customizable circular gauge that can display a value, animate to a target, and show segments. It is a world object that can be placed in a layout.

## Settings (from `edittime.js`)

```js
{\n  "name": "Radial Gauge",
  "id": "RadialGauge",
  "version": "1.0",
  "description": "A customizable radial gauge.",
  "author": "Author",
  "help url": "<your website or a manual entry on Scirra.com>",
  "category": "General",
  "type": "world",
  "rotatable": true,
  "flags": pf_position_aces | pf_size_aces | pf_angle_aces | pf_appearance_aces
}
```

## Conditions

| ID | Name | Category | Description |
|----|------|----------|-------------|
| 0 | Is animating | General | True if the gauge is currently changing its value. |
| 1 | Compare value | General | Compare the current displayed value. |
| 2 | Compare Percentage | Logic | Compare the current percentage (0‑1). |
| 3 | On Value Reached | Logic | Triggered when the animation finishes. |
| 4 | Is In Range | Logic | Check if value is within range. |

## Actions

| ID | Name | Category | Description |
|----|------|----------|-------------|
| 0 | Set Value | General | Set the gauge target value. |
| 1 | Set Max Value | General | Set the maximum value of the gauge. |
| 2 | Set Lerp Speed | General | Set the interpolation speed. |
| 3 | Set Range | Appearance | Set the start and span angles. |
| 4 | Set Appearance | Appearance | Set the gauge appearance. |
| 5 | Set Segments | Appearance | Configure gauge segments. |
| 6 | Set Color Mode | Appearance | Set the color mode. |
| 7 | Set Color | Appearance | Set the fixed color. |
| 8 | Snap Value | General | Set the value instantly without animation. |

## Expressions

The plugin does not expose custom expressions in `edittime.js`.

## Properties

No custom properties are defined.

## Usage

Add the plugin to a layout, then use the actions to control the gauge.