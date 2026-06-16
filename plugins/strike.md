# Lightning Strike Plugin

## Overview

The **Lightning Strike** plugin simulates lightning bolts with jagged paths and optional branching. It is a world object that can be placed in a layout and triggered via actions.

## Settings (from `edittime.js`)

```js
{\n  "name": "Lightning Strike",
  "id": "LightningStrike",
  "version": "1.0",
  "description": "Simulates lightning strikes with jagged paths and branching.",
  "author": "Gemini",
  "help url": "",
  "category": "General",
  "type": "world",
  "rotatable": true,
  "flags": pf_position_aces | pf_size_aces | pf_angle_aces | pf_appearance_aces | pf_zorder_aces | pf_effects
}
```

## Actions

| ID | Name | Category | Description |
|----|------|----------|-------------|
| 0 | Strike towards | Lightning | Strike towards {0} degrees for {1} pixels |
| 1 | Enable Branching | Lightning | Set branching chance to {0} |
| 2 | Set color | Appearance | Set color to {0} |
| 3 | Set displacement | Appearance | Set displacement to {0} |
| 4 | Set detail | Appearance | Set detail to {0} |
| 5 | Set duration | Appearance | Set duration to {0} |
| 6 | Set width | Appearance | Set width to {0} |

## Expressions

The plugin does not expose custom expressions.

## Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| Displacement | float | 100 | Maximum displacement for jaggedness. |
| Detail | integer | 5 | Number of iterations for the displacement algorithm. |
| Duration | float | 0.5 | Time in seconds the lightning remains visible. |
| Color | color | white | The color of the lightning. |
| Width | float | 2 | Width of the lightning bolt. |

## Usage

Add the plugin to a layout, then use the actions to generate strikes.