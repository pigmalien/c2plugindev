# Follow Path Behavior

Moves an object along a path of coordinates, with optional movement settings (speed, acceleration, deceleration), corner rounding for smooth curves, and collision detection for solid obstacles.

## Properties

| Property | Description |
| :--- | :--- |
| **Stop on solids** | Whether to stop when hitting an object with the Solid behavior (`No` or `Yes`). |
| **Speed** | The speed of movement in pixels per second. |
| **Acceleration** | The acceleration in pixels per second squared. |
| **Deceleration** | The deceleration in pixels per second squared. |
| **Corner rounding** | Distance from a node to begin rounding the corner. `0` for sharp corners. |

---

## Actions

### Path
*   **Add node**: Add a new node coordinate to the end of the path (`X`, `Y` in pixels).
*   **Clear path**: Remove all nodes from the path.
*   **Start path**: Start moving along the defined path using the current speed property.
*   **Stop**: Stop the object's movement immediately.
*   **Set speed**: Set the object's movement speed (`Speed` in pixels/sec).
*   **Set acceleration**: Set the object's acceleration (`Acceleration` in pixels/sec²).
*   **Set deceleration**: Set the object's deceleration (`Deceleration` in pixels/sec²).
*   **Set corner rounding**: Set the distance from a node to begin rounding the corner (`Rounding` in pixels).

### Collisions
*   **Set stop on solids**: Enable or disable stopping on solid objects dynamically (`State`).

---

## Conditions

### Path
*   **On path finished**: Triggered when the object reaches the end of the path.
*   **Is moving**: True if the object is currently moving along a path.

### Collisions
*   **On solid collision**: Triggered when the object collides with an object possessing the Solid behavior.

---

## Expressions

### Path
*   `CurrentSpeed`: The current speed of the object in pixels per second.
*   `PathNodeCount`: The total number of nodes in the current path.
*   `CurrentNode`: The index of the current target node in the path.
*   `AngleOfMotion`: The current angle of motion in degrees.
