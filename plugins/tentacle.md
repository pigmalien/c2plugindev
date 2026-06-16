# Tentacle Plugin

## Overview

The **Tentacle** plugin implements a physics‑based tentacle or rope using Verlet integration and a textured quad‑strip. It is a world object that can be pinned to other objects and animated.

## Settings (from `edittime.js`)

```js
{\n  "name": "Tentacle",
  "id": "Tentacle",
  "version": "1.0",
  "description": "A physics-based tentacle or rope using Verlet integration and a textured quad-strip.",
  "author": "Gemini Code Assist",
  "help url": "https://www.construct.net",
  "category": "Drawing",
  "type": "world",
  "rotatable": true,
  "flags": pf_texture | pf_predraw | pf_position_aces | pf_size_aces | pf_angle_aces | pf_appearance_aces | pf_zorder_aces | pf_effects
}
```

## Conditions

| ID | Name | Category | Description |
|----|------|----------|-------------|
| 0 | Is segment overlapping | Collisions | True if a tentacle segment is overlapping an object. |
| 1 | Is moving | Movement | True if the tentacle is currently in motion. |
| 2 | Is within distance of tip | Movement | True if the tip is within a certain distance of a point. |

## Actions

| ID | Name | Category | Description |
|----|------|----------|-------------|
| 0 | Set start width | Appearance | Set the width at the base of the tentacle. |
| 1 | Set end width | Appearance | Set the width at the tip of the tentacle. |
| 2 | Set tip position | Movement | Instantly move the tip to a position. |
| 3 | Set gravity | Physics | Set the gravity force applied to segments. |
| 4 | Set tiling mode | Appearance | Set the texture mapping mode. |
| 5 | Apply impulse to segment | Movement | Apply an impulse to a specific segment. |
| 6 | Pin to object | Movement | Pin the base to another object. |
| 7 | Unpin | Movement | Unpin the tentacle from any object. |
| 8 | Set sine wave amount | Appearance | Set the magnitude of the sine wave animation. |
| 9 | Set sine wave speed | Appearance | Set the speed of the sine wave animation. |
|10 | Set sine wave frequency | Appearance | Set the frequency of the sine wave animation. |

## Expressions

| ID | Expression | Category | Return Type | Description |
|----|------------|----------|-------------|-------------|
| 0 | SegmentX | Segments | number | X coordinate of a segment. |
| 1 | SegmentY | Segments | number | Y coordinate of a segment. |
| 2 | TotalLength | Segments | number | Total length of the tentacle. |
| 3 | SegmentCount | Segments | number | Number of segments. |

## Usage

Add the plugin to a layout, configure widths, pinning, and physics, then use the actions to control its behavior.