# Raycasting Behavior

Performs high-performance raycasts from an object's origin. Useful for rapid obstacle detection, collision queries, and multi-hit piercing raycasts.

## Properties

*(This behavior has no initial properties defined in the property grid; configure raycasts dynamically via Actions)*

---

## Actions

### Raycasting
*   **Cast ray**: Fires a single ray and checks for the first collision with a target object (`Angle` in degrees, `Distance` in pixels, `Objects` type).
*   **Cast ray (multi-hit)**: Fires a ray and triggers an event for every single instance hit along the path (`Angle`, `Distance`, `Objects`).
*   **Add solid**: Adds a specific object type to block the raycast (`Solid`).
*   **Clear solids**: Removes all added blocking solid objects.

---

## Conditions

### Raycasting
*   **On ray hit**: Triggered when a standard raycast successfully hits an object.
*   **Ray did hit**: True if the last raycast resulted in a hit.
*   **On ray failed**: Triggered when a raycast fails to hit any target object.
*   **On solid hit**: Triggered when the raycast hits a registered blocking solid object.
*   **On multi-hit**: Triggered for every object instance hit during a multi-hit raycast.

### Line of Sight
*   **Has line of sight**: True if the object has a clear, unblocked line of sight to a target instance (`Target`).

---

## Expressions

### Raycasting
*   `RayHitX`: The X coordinate of the ray's collision point.
*   `RayHitY`: The Y coordinate of the ray's collision point.
*   `RayHitDistance`: The distance in pixels from the origin to the collision point.
*   `RayHitUID`: The Unique ID (UID) of the specific object instance collided with.
