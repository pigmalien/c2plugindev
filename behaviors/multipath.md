# Multipath Behavior

Stores and navigates multiple reusable, named lists of X/Y coordinates (paths). Useful for managing complex patrol routes, multiple path buffers, or complex navigation sequences on a single object.

## Properties

*(This behavior has no initial properties defined in the property grid; configure named paths dynamically via Actions)*

---

## Actions

### Path Management
*   **Push point (X, Y)**: Adds a coordinate pair to the end of the specified path list (`Path` string name, `X Coordinate`, `Y Coordinate`).
*   **Clear path**: Removes all points from the specified path (`Path` string name).
*   **Insert point at index**: Inserts a coordinate pair into the specified path list at a specific index (`Path`, `X Coordinate`, `Y Coordinate`, `Index`).
*   **Delete path**: Removes the named path list entirely (`Path`).
*   **Delete point at index**: Removes the point at the specified index from the path (`Path`, `Index`).

### Index Control
*   **Advance index**: Increments the index pointer to target the next point on the specified path (`Path`).
*   **Reset index**: Resets the current target index of the specified path back to the first point (`Path`).
*   **Backtrack index**: Decrements the index pointer to target the previous point on the specified path (`Path`).
*   **Set index**: Sets the current target index of the specified path to a specific point (`Path`, `Index`).

---

## Conditions

### Iteration
*   **For each node**: Repeat the event for each node in the path (`Path`).

### Index Control
*   **Is at end of path**: Test if the index for the specified path is at the last point (`Path`).
*   **Is at start of path**: Test if the index for the specified path is at the first point (`Path`).

### Path Status
*   **Is path empty**: Test if the specified path contains no points (`Path`).

---

## Expressions

### Path Status
*   `PathNodeCount(Path)`: Returns the total number of nodes in the specified path list.
*   `LastIndex(Path)`: Returns the index of the last point on a path (`PathNodeCount - 1`).

### Nodes
*   `PathNodeXAt(Path, Index)`: Returns the X coordinate of a node at a specific index on a path.
*   `PathNodeYAt(Path, Index)`: Returns the Y coordinate of a node at a specific index on a path.

### Current Point
*   `CurrentPointX(Path)`: Returns the X coordinate of the current point on a path.
*   `CurrentPointY(Path)`: Returns the Y coordinate of the current point on a path.

### Index Control
*   `CurrentIndex(Path)`: Returns the 0-based index of the current point on a path.

### Iteration
*   `CurrentNodeIndex`: Returns the current index in a `For each node` loop.
