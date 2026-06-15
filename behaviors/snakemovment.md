# Snake Chain Behavior

Automatically generates, spawns, and manages a trailing chain of connected body segments. Supports distance-based or history-based follow logic.

## Properties

| Property | Description |
| :--- | :--- |
| **Segments** | Number of body segments to create. |
| **Spacing** | Distance in pixels between segments. |
| **Smoothness** | Follow smoothness factor (0.1 = loose, 1.0 = rigid). |
| **Mode** | Movement trailing logic (`Distance` or `History`). |
| **Body Type Name** | The name of the object type in the project to use for spawning segments. |

---

## Actions

### Chain
*   **Build chain**: Spawns and links all body segments.
*   **Destroy chain**: Destroys all body segments.
*   **Reorganise chain**: Removes destroyed segments and closes gaps.
*   **Add segment**: Adds a new segment to the end of the chain using the default body object type.
*   **Set body object**: Sets the object type used for subsequent segment additions (`Object`).
*   **Add segment (object)**: Adds a new segment of a specific object type to the end of the chain (`Object`).

---

## Conditions

*(This behavior has no conditions)*

---

## Expressions

### Chain
*   `SegmentCount`: Returns the number of active body segments.
