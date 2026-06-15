# Tile to Mob Behavior

Manages and coordinates child sprite entities (mobs) on a grid layout from a Tilemap perspective. Supports follow targets, random wander modes, and custom speeds.

## Properties

| Property | Description |
| :--- | :--- |
| **Tile Collision** | Choose whether tiles are treated as obstacles (`Solid` or ignored `None`). |
| **Mode** | The default movement behavior of spawned mobs (`Follow Target` or `Wander`). |
| **Wander Radius** | Maximum distance in tiles a mob will wander from its starting tile position. |
| **Min Wander Idle** | Minimum wait time in seconds before a wandering mob picks a new destination. |
| **Max Wander Idle** | Maximum wait time in seconds before a wandering mob picks a new destination. |
| **Speed** | Movement speed in tiles per second. |

---

## Actions

### Management
*   **Add Mob Instance**: Registers a sprite to be managed by this tilemap at a specific coordinate (`Object`, `Grid X`, `Grid Y`).
*   **Remove Mob Instance**: Unregisters a managed sprite (`Object`).
*   **Add Mob by UID**: Registers a sprite by its Unique ID at a specific coordinate (`UID`, `Grid X`, `Grid Y`).
*   **Add Mob at Position**: Registers a sprite at its current pixel location (`Object`).
*   **Set Mob Active**: Sets whether a mob by UID is processed (`UID`, `State`: Active/Inactive).
*   **Set Object Active**: Sets whether a specific sprite instance is processed (`Object`, `State`).

### AI
*   **Set Target**: Sets the target object that mobs will track and follow (`Target`).
*   **Set Mode**: Set the movement behavior mode (`Mode`: Follow Target or Wander).

---

## Conditions

*(This behavior has no conditions defined in edittime)*

---

## Expressions

*(This behavior has no expressions defined in edittime)*
