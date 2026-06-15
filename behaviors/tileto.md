# Tile-To Path Behavior

Moves a sprite across a grid, tile by tile, with custom movement speed, diagonal restrictions, and path conversions.

## Properties

| Property | Description |
| :--- | :--- |
| **Tile Width** | Width of a grid tile in pixels. |
| **Tile Height** | Height of a grid tile in pixels. |
| **Speed** | Movement speed in pixels per second. |
| **Allow Diagonals** | Allow diagonal movement (`No` or `Yes`). |

---

## Actions

### Movement
*   **Add tile to path**: Adds a grid tile coordinate to the movement stack (`Tile X`, `Tile Y`).
*   **Clear path stack**: Clears all pending move target waypoints.
*   **Stop**: Stops moving immediately and clears the stack.
*   **Move along path**: Begins traveling along the queued tile path.

---

## Conditions

### Movement
*   **On path finished**: Triggered when the object arrives at the final destination waypoint.
*   **On new tile reached**: Triggered when the object arrives at any tile center.
*   **Is moving**: True if the object is currently moving along the path.

---

## Expressions

### Movement
*   `StackCount`: Returns the number of waypoints remaining in the stack.
*   `TargetX`: Returns the current target grid X column index.
*   `TargetY`: Returns the current target grid Y row index.
*   `CurrentIndex`: Returns the 0-based index of the current waypoint in the path.
*   `PathXAtIndex(Index)`: Returns the grid X column coordinate for a given waypoint index.
*   `PathYAtIndex(Index)`: Returns the grid Y row coordinate for a given waypoint index.

### Conversion
*   `WorldToTileX(WorldX)`: Converts a world pixel X coordinate to a grid column index.
*   `WorldToTileY(WorldY)`: Converts a world pixel Y coordinate to a grid row index.
*   `TileToWorldX(TileX)`: Converts a grid column index to a world pixel X center coordinate.
*   `TileToWorldY(TileY)`: Converts a grid row index to a world pixel Y center coordinate.
