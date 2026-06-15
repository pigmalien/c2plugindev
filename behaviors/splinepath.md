# Spline Path Mover Behavior

Moves an object smoothly along a Catmull-Rom spline path curve. Supports tension adjustments, acceleration, and deceleration.

## Properties

| Property | Description |
| :--- | :--- |
| **Tension** | The tension of the spline curve (0.0 = normal, higher = tighter). |
| **Acceleration** | Rate of acceleration in pixels/second². Set to `0` for instant speed. |
| **Deceleration** | Rate of deceleration in pixels/second². Set to `0` for instant stop. |

---

## Actions

### Path Management
*   **Push point (X, Y)**: Adds a coordinate point to define the spline curve (`X Coordinate`, `Y Coordinate`).
*   **Clear entire path stack**: Removes all stored coordinates from the path.
*   **Set tension**: Sets the tension of the spline curve (`Tension`).

### Control
*   **Start moving along spline**: Begins traveling along the spline (`Speed` in pixels per second).
*   **Stop movement**: Immediately halts movement.
*   **Set speed**: Dynamically sets the speed for subsequent movements (`Speed` in pixels/second).
*   **Set acceleration**: Sets the rate of acceleration (`Acceleration`).
*   **Set deceleration**: Sets the rate of deceleration (`Deceleration`).

---

## Conditions

### Movement
*   **On path finished**: Triggered when the object reaches the final point of the spline path.
*   **Is moving**: True if the object is currently traveling along the spline.

### Path Management
*   **Has enough points**: True if there are at least 4 points in the stack to define a cubic spline curve.

---

## Expressions

### Control
*   `CurrentTimeT`: Returns the normalized time progress (0.0 to 1.0) along the entire spline path.

### Path Management
*   `TotalPoints`: Returns the number of points currently in the path stack.

### Movement
*   `AngleOfMotion`: Returns the current angle of movement in degrees.
