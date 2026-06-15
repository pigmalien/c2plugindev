# Encircle Behavior

Enables an object to orbit/circle around a target object with options for angle tracking, rotation speed, elliptical radii, and automatic depth/Z-ordering.

## Properties

| Property | Description |
| :--- | :--- |
| **Initial state** | Whether to initially enable the behavior or not (`Disabled` or `Enabled`). |
| **Speed** | Speed of rotation in degrees per second. |
| **Radius X** | Horizontal radius of the orbit. |
| **Radius Y** | Vertical radius of the orbit. |
| **Initial angle** | Initial angle in degrees. |
| **Set angle** | Choose how to rotate the object (`No`, `Face motion`, or `Face target`). |
| **Z-ordering** | Move object behind/in-front of target based on position (`No` or `Yes`). |

---

## Actions

### General
*   **Set target**: Set the object to orbit around (`Target`).
*   **Set enabled**: Set whether the behavior is enabled (`State`: Disabled/Enabled).
*   **Set speed**: Set the rotation speed in degrees per second (`Speed`).
*   **Set radius X**: Set the horizontal radius of the orbit (`Radius X`).
*   **Set radius Y**: Set the vertical radius of the orbit (`Radius Y`).
*   **Set angle**: Set the current angle in the orbit in degrees (`Angle`).

---

## Conditions

### General
*   **Is enabled**: Test if the behavior is currently enabled.

---

## Expressions

### General
*   `Speed`: The current rotation speed in degrees per second.
*   `RadiusX`: The current horizontal radius of the orbit.
*   `RadiusY`: The current vertical radius of the orbit.
*   `Angle`: The current angle in the orbit in degrees.

---

## Usage Example

To make a shield orbital sprite orbit around a player:

1.  **Action**: `ShieldSprite -> Set target (Player)`
2.  **Action**: `ShieldSprite -> Set speed (180)` (half a rotation per second)
3.  **Action**: `ShieldSprite -> Set radius X (60)` and `Set radius Y (40)` (elliptical orbit)
