# FindPath Behavior

Provides grid-based A* pathfinding. Supports custom grid cell sizing, registration of wall obstacles, search iteration limits, and node iteration loops to guide characters through custom maps.

## Properties

| Property | Description |
| :--- | :--- |
| **Cell Width** | The width of a single grid cell in pixels. |
| **Cell Height** | The height of a single grid cell in pixels. |
| **Max Iterations** | The maximum search iterations before pathfinding fails (default: 15,000). |

---

## Actions

### Setup
*   **Set grid size**: Defines the grid cell dimensions (`Cell Width`, `Cell Height`).
*   **Set wall obstacle**: Adds an object type to be treated as an impassable wall obstacle (`Object`).
*   **Clear all wall obstacles**: Removes all object types from the wall obstacle list.

### Pathfinding
*   **Find path to**: Calculates a path from the object's current position to the target coordinates using A* (`Target X`, `Target Y` in pixels).

---

## Conditions

### Pathfinding
*   **On path found**: Triggered after a path has been successfully calculated.
*   **On path failed**: Triggered if no path could be found to the target coordinates.

### Path
*   **For each node**: Loop through each node in the calculated path.

---

## Expressions

### Path
*   `PathNodeCount`: Returns the number of nodes in the current path.
*   `PathNodeXAt(Index)`: Returns the pixel X coordinate of a node at the specified index.
*   `PathNodeYAt(Index)`: Returns the pixel Y coordinate of a node at the specified index.
*   `CurrentNodeIndex`: Returns the index of the current node inside a `For each node` loop.

---

## Usage Example

To find a path and guide an NPC along it:

1.  **Action**: `NPC -> Add wall obstacle (Solid)`
2.  **Action**: `NPC -> Find path to (Player.X, Player.Y)`
3.  **Condition**: `NPC -> On path found`
    *   **Action**: `NPC -> Clear path points (using follow path helper)`
    *   **Condition**: `NPC -> For each node`
        *   **Action**: `NPC -> Add node (FindPath.PathNodeXAt(FindPath.CurrentNodeIndex), FindPath.PathNodeYAt(FindPath.CurrentNodeIndex))`
