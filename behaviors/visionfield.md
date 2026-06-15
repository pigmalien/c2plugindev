# Pro Line of Sight Behavior

Advanced line of sight behavior with extreme performance optimizations (spread CPU load via UID staggered intervals) and custom cone-of-vision angles.

## Properties

| Property | Description |
| :--- | :--- |
| **Check Interval** | How often to check line of sight in frames. `1` means every frame, while `5` checks every 5 frames to maximize CPU efficiency. |
| **Cone Angle** | The total angle of the cone of vision in degrees (0 to 360). |
| **Range** | The maximum distance for line of sight in pixels. |
| **Initially Enabled** | Controls if the behavior starts active (`Enabled` or `Disabled`). |

---

## Actions

### Target
*   **Set target**: Sets the active object instance to track for line of sight (`Target`).
*   **Clear target**: Stops tracking the current target.
*   **Add target**: Adds instance(s) of an object type to the target tracking list (`Target`).
*   **Remove target**: Removes instance(s) of an object type from the tracking list (`Target`).

### State
*   **Set enabled**: Enables or disables the Pro Line of Sight behavior (`State`).

### Parameters
*   **Set cone angle**: Sets the total angle of the cone of vision in degrees (`Angle` 0-360).
*   **Set range**: Sets the maximum range in pixels (`Range`).

### Obstacles
*   **Add obstacle**: Adds a general object type that blocks line of sight (`Obstacle`).
*   **Clear obstacles**: Removes all general obstacle types from the blocking list.
*   **Add solid obstacle**: Adds an object type with the Solid behavior to block line of sight (`Solid`).
*   **Clear solid obstacles**: Removes all solid obstacle types from the blocking list.

---

## Conditions

### Line of Sight
*   **On line of sight**: Triggered when line of sight is successfully established to the tracked target.
*   **Has line of sight**: True if there is currently a clear, unobstructed line of sight to the target.
*   **On lost line of sight**: Triggered when line of sight to the tracked target is lost.

---

## Expressions

### Target
*   `TargetX`: The X coordinate of the last tracked target.
*   `TargetY`: The Y coordinate of the last tracked target.
*   `DistanceToTarget`: The distance in pixels to the last tracked target.
*   `AngleToTarget`: The angle in degrees to the last tracked target.
*   `TargetUID`: The Unique ID (UID) of the currently tracked target (or -1 if none).
