# Rich Text Renderer Plugin

## Overview

The **Rich Text Renderer** plugin displays text with advanced formatting, markup, custom fonts, and a typewriter effect. It is a world object that can be placed in a layout.

## Settings (from `edittime.js`)

```js
{\n  "name": "Rich Text Renderer",
  "id": "RichTextRenderer",
  "version": "1.0",
  "description": "Displays text with advanced formatting using markup, custom fonts, and effects.",
  "author": "You",
  "help url": "",
  "category": "General",
  "type": "world",
  "rotatable": true,
  "flags": pf_position_aces | pf_size_aces | pf_angle_aces | pf_appearance_aces | pf_zorder_aces
}
```

## Actions

| ID | Name | Category | Description |
|----|------|----------|-------------|
| 0 | Set text | Appearance | Set the object's text. |
| 1 | Begin typewriter | Typewriter | Begin a typewriter effect. |
| 2 | Set default font | Appearance | Set the default font name and size. |
| 3 | Set typewriter speed | Typewriter | Change the speed of the typewriter effect while it is running. |

## Conditions

| ID | Name | Category | Description |
|----|------|----------|-------------|
| 0 | On typewriter finished | Typewriter | Triggered when the typewriter effect completes. |
| 1 | Is typewriter active | Typewriter | True if the typewriter effect is currently running. |

## Expressions

| ID | Expression | Category | Return Type | Description |
|----|------------|----------|-------------|-------------|
| 0 | Get text | Text | string | Get the current text of the object. |
| 1 | Get typewriter speed | Typewriter | number | Get the current speed of the typewriter effect. |

## Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| Text | text | "Hello, {b}world!{/b}" | The text to display. Supports markup. |
| Font | text | "Arial" | The name of the font to use. |
| Size | integer | 16 | The font size in points. |
| Color | color | "0,0,0" | The default text color. |
| Custom Fonts | text | "" | A comma‑separated list of font files to load. |
| Horizontal alignment | combo | Left | Horizontal alignment of the text. |
| Vertical alignment | combo | Top | Vertical alignment of the text. |
| Markup Help | text | (read‑only) | Read‑only help for markup tags. |

## Usage

Add the plugin to a layout, then use the actions, conditions, and expressions to control text rendering and the typewriter effect.