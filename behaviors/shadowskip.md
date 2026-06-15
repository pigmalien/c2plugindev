# Shadow Skip Behavior

Animates bouncing, squashing, stretching, and leaning of a child puppet object relative to a parent shadow object's movement coordinates.

## Properties

| Property | Description |
| :--- | :--- |
| **Amplitude** | The maximum vertical bounce in pixels. |
| **Frequency** | How fast the bounce animation plays (higher is faster). |
| **Squash Ratio** | How much the child object squashes/stretches (e.g., `0.1` is 10% of its size). |
| **Lean Amount** | The maximum angle in degrees the child object leans. |
| **Initially enabled** | Controls whether the behavior is enabled on start (`Enabled` or `Disabled`). |
| **Child object** | The name of the child object in the container that this behavior animates. |
| **Flip Mode** | Whether the child object flips when moving horizontally (`None` or `Horizontal`). |
| **Puppet Image Point** | Optional image point index or name on the puppet to align with the shadow's origin. |

---

## Actions

### General
*   **Set enabled**: Enables or disables the Shadow Skip behavior (`State`).

---

## Conditions

### General
*   **Is enabled**: True if the Shadow Skip behavior is currently enabled.

---

## Expressions

*(This behavior has no expressions)*
