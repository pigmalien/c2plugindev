# Global Timer Plugin

## Overview

The **Global Timer** plugin provides a named timer system and chain timers that can be used throughout a Construct 2 project. It is a global object.

## Settings (from `edittime.js`)

```js
{\n  "name": "Global Timer",
  "id": "SysTime",
  "version": "1.0",
  "description": "A global timer system for managing named timers.",
  "author": "Gemini Code Assist",
  "help url": "",
  "category": "General",
  "type": "object",
  "rotatable": false,
  "flags": pf_singleglobal
}
```

## Conditions

| ID | Name | Category | Description |
|----|------|----------|-------------|
| 0 | On timer start | Timer | Triggered when a named timer starts. |
| 1 | On timer | Timer | Triggered when a named timer finishes. |
| 2 | Is timer running | Timer | True if the named timer is currently active. |
| 3 | On chain step | Chain Timer | Triggered when a chain moves to the next step. |
| 4 | On chain finished | Chain Timer | Triggered when a chain finishes. |
| 5 | Is chain running | Chain Timer | True if the chain is currently active. |
| 6 | Compare chain index | Chain Timer | Compare the current index of a chain. |

## Actions

| ID | Name | Category | Description |
|----|------|----------|-------------|
| 0 | Start Timer | Timer | Start timer {0} for {1} ({2} loops). |
| 1 | Sync To Value | Timer | Sync timer {0} to {1}. |
| 2 | Create Chain | Chain Timer | Create chain {0}. |
| 3 | Add Link | Chain Timer | Add link {1}s to chain {0}. |
| 4 | Start Chain | Chain Timer | Start chain {0}. |
| 8 | Stop Timer | Timer | Stop timer {0}. |
| 9 | Stop All Timers | Timer | Stop all timers. |
|10 | Pause Timer | Timer | Pause timer {0}. |
|11 | Resume Timer | Timer | Resume timer {0}. |

## Expressions

The plugin does not expose custom expressions.

## Usage

Add the plugin to the project and use the actions and conditions to manage timers and chains.