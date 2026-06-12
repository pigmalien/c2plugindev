# MyCam Behavior

Advanced camera control system for Construct 2. MyCam provides smooth following with deadzones, look-ahead prediction, grid-based room snapping, and dynamic auto-zooming.

## Properties

| Property | Description |
| :--- | :--- |
| **Initially Enabled** | Set to `Enabled` or `Disabled` to control the behavior on startup. |
| **Smoothness** | The following factor (0.0 to 1.0). Lower values result in a tighter follow, while higher values add more "floatiness". |
| **Deadzone Width** | The width of the center area where target movement will not cause the camera to move. |
| **Deadzone Height** | The height of the center area where target movement will not cause the camera to move. |
| **Look Ahead Distance** | The distance the camera will look ahead of the target based on its current velocity. |
| **Grid Snapping** | Enable this to make the camera snap to "rooms" instead of following the target smoothly. |
| **Room Width** | The width of each grid cell (room). |
| **Room Height** | The height of each grid cell (room). |
| **Snap Duration** | How long (in seconds) it takes to transition between rooms. |
| **Clamp to Layout** | If enabled, the camera will never show areas outside the layout boundaries. |
| **Auto Zoom** | Automatically adjusts the layer scale based on the target's movement speed. |
| **Min Scale** | The lowest scale value (maximum zoom out) allowed for auto-zoom. |
| **Max Scale** | The highest scale value (maximum zoom in) allowed for auto-zoom. |
| **Max Speed for Zoom** | The target speed at which the camera reaches its `Min Scale`. |
| **Zoom Speed** | The interpolation speed for zoom changes (0 to 1). |

## Actions

*   **Set Enabled**: Enable or disable the behavior logic.
*   **Set Secondary Target**: Average the camera focus between the host object and a secondary object UID.
*   **Clear Secondary Target**: Return to tracking only the host object.
*   **Pan To Position**: Move the camera to a specific coordinate over a duration, with optional wait time and automatic return.
*   **Trigger Shake**: Apply a screen shake effect with custom intensity and decay.
*   **Set Custom Clamping**: Manually define the boundaries the camera is allowed to move within.
*   **Set Clamp To Layout**: Toggle layout boundary constraints.
*   **Set Smoothness / Deadzone / Look Ahead**: Update tracking parameters dynamically via events.

## Conditions

*   **Is Moving**: Returns true if the camera is currently panning or snapping.
*   **Is Shaking**: Returns true if a shake effect is active.
*   **Is Panning**: Returns true during a Pan To Position sequence.
*   **On Shake Finished**: Triggered when a shake effect ends.
*   **On Pan Finished**: Triggered when a pan sequence (including return) ends.
*   **On Snap Finished**: Triggered when grid snap completes.

## Expressions

*   `CameraX`: The current internal X position of the camera (center).
*   `CameraY`: The current internal X position of the camera (center).
*   `ShakeIntensity`: The current intensity of the shake (decays over time).
*   `CurrentScale`: The current scale factor of the layer.

## Usage Example

To create a cinematic "look at" sequence for a boss introduction:

1.  **Action**: `MyCam -> Pan To Position (Boss.X, Boss.Y, 1.5, 2.0, 1.0)`
    *   *Pans to the boss in 1.5s, stays for 2s, and returns to the player in 1s.*
2.  **Condition**: `MyCam -> On Pan Finished`
    *   *Trigger dialogue or resume gameplay.*

---

### Implementation Notes

[Inference] The behavior uses a framerate-independent Lerp formula for smoothness: `1 - Math.pow(smoothness, dt)`. This ensures the camera feel remains consistent across different monitor refresh rates (e.g., 60Hz vs 144Hz).

> [!TIP]
> When using **Auto Zoom**, ensure your layout is large enough. The behavior will prioritize `Clamp to Layout` and may override zoom levels if zooming out would show the "void" outside the layout.