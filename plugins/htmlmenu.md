# HTML Menu Plugin

## Overview

The **HTML Menu** plugin allows you to embed an interactive HTML/CSS menu over the Construct 2 game canvas. It exposes a set of conditions, actions, and expressions that let you manipulate DOM elements, sync data, and animate elements using GSAP.

## Settings (from `edittime.js`)

```js
{\n  "name": "HTML Menu",
  "id": "HTMLMenu",
  "version": "1.0",
  "description": "Displays an interactive HTML/CSS element over the game canvas.",
  "author": "Gemini Code Assist",
  "help url": "https://www.construct.net",
  "category": "User interface",
  "type": "world",
  "rotatable": false,
  "flags": pf_position_aces | pf_size_aces | pf_appearance_aces
}
```

## Conditions

| ID | Name | Category | Description |
|----|------|----------|-------------|
| 0 | On button clicked | Menu | Triggered when a menu element with `data-c2-id` is clicked. |
| 1 | On sound triggered | Sound | Triggered when an HTML element with a `data-sfx` attribute is interacted with. |
| 2 | On focus gained | Focus | Triggered when a menu element gains focus. |
| 3 | On focus lost | Focus | Triggered when a menu element loses focus. |

## Actions

| ID | Name | Category | Description |
|----|------|----------|-------------|
| 1 | Update element content | Content | Set content of element with ID `<b>{0}</b>` to `<i>{1}</i>` |
| 2 | Force sync now | Sync | Manually trigger the universal sync to update all linked HTML elements. |
| 3 | Sync from Dictionary | Sync | Load data from a Dictionary's JSON to be used by the universal sync. |
| 4 | Focus element by ID | Focus | Set focus to element with ID `<b>{0}</b>`. |
| 5 | Set interaction mode | Interaction | Control how the menu blocks input to the game canvas. |
| 6 | Focus next element | Focus | Move focus to the next focusable element in the menu. |
| 7 | Focus previous element | Focus | Move focus to the previous focusable element in the menu. |
| 8 | Release focus | Focus | Manually blur the currently focused HTML element. |
| 9 | Tween property | GSAP Animation | Animate a property of an HTML element using GSAP. |
|10 | Typewriter text | GSAP Animation | Animate text content with a typewriter effect using GSAP. |

## Expressions

The plugin does not expose any custom expressions.

## Properties

No custom properties are defined for this plugin.

## Usage

Add the plugin to your project, then use the actions and conditions in event sheets to control the menu.