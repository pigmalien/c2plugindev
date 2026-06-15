# Game Master Plugin

This document provides an overview of the **Game Master** plugin for Construct 2. The plugin is defined in `edittime.js` and implements a set of actions, conditions, and expressions that allow you to manage monsters, generate loot, and expose useful data to your game.

## Plugin Settings

```js
function GetPluginSettings()
{
    return {
        name:          "Game Master",          // Display name in the Insert Object dialog
        id:            "GameMaster",           // Unique identifier – **must not change**
        version:       "1.0",                  // Plugin version (float in x.y format)
        description:   "<appears at the bottom of the insert object dialog>",
        author:        "<your name/organisation>",
        "help url":   "<your website or a manual entry on Scirra.com>",
        category:      "General",               // Re‑use existing categories if possible
        type:          "object",                // "world" for layout objects, "object" for non‑layout
        rotatable:     false,                    // Only used when type is "world"
        flags:         0                         // Optional flags – see comments in the file
    };
}
```

## Parameters

The plugin exposes several parameters that can be configured in the IDE. They are defined using the `Add*Param` functions. The most common ones used in this plugin are:

| Parameter | Type | Description |
|-----------|------|-------------|
| **JSON** | `AddStringParam` | The JSON string containing monster data. |
| **Index** | `AddNumberParam` | The monster ID index. |
| **Level** | `AddNumberParam` | The level of the monster. |
| **Difficulty** | `AddComboParam` | Difficulty setting (Easy, Normal, Hard). |

## Actions

Actions are functions that can be called from event sheets. They are defined with `AddAction` and implemented in the runtime file.

| ID | Name | Description |
|----|------|-------------|
| 0 | **Load database** | Load the monster database from a JSON string. |
| 1 | **Generate monster** | Generate a monster at a given index, level, and difficulty. |
| 2 | **Roll loot** | Roll loot for a monster by index. |

### Example Usage

```construct2
// Load a monster database
GameMaster.Load database("{\"monsters\":[{\"name\":\"Goblin\",\"hp\":30}]}");

// Generate a level 5 Goblin on Normal difficulty
GameMaster.Generate monster(0, 5, "Normal");

// Roll loot for the last generated monster
GameMaster.Roll loot(0);
```

## Conditions

The current `edittime.js` does not define any custom conditions. If you need to add conditions, use `AddCondition` in the same style as actions.

## Expressions

Expressions return values that can be used in other actions or conditions. They are defined with `AddExpression`.

| ID | Expression | Return Type | Description |
|----|------------|-------------|-------------|
| 1 | **MonsterName** | string | The name of the generated monster. |
| 2 | **MonsterElement** | string | The element of the generated monster. |
| 3 | **MonsterHP** | number | The calculated HP of the generated monster. |
| 4 | **MonsterAtk** | number | The calculated Attack of the generated monster. |
| 5 | **LastLoot** | string | The result of the last loot roll (comma separated). |

### Example Usage

```construct2
var name = GameMaster.MonsterName();
var hp   = GameMaster.MonsterHP();
```

## Property Grid

The plugin can expose custom properties in the IDE property grid using `cr.Property`. The current file contains a placeholder `property_list` array that can be populated as needed.

## Runtime

The runtime implementation resides in `runtime.js`. It contains the actual logic for the actions, conditions, and expressions. The `edittime.js` file only defines the IDE interface.

---

For more detailed information, refer to the Construct 2 Plugin Development Guide and the comments within `edittime.js`.
