# Custom WebGL Effects

A collection of custom WebGL shader effects for Construct 2 to add visual polish, distortions, and filters.

---

## Mirror Floor

Flips the background texture vertically to simulate a mirror reflection.

*   **ID**: `mirrorfloor`
*   **Category**: Visual
*   **Blends Background**: Yes (True)
*   **Animated**: Yes (True)

### Parameters

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| **Reflection Line** | float | `0.5` | The Y anchor coordinate where the reflection starts flipping (0.0 to 1.0). |
| **Opacity** | float | `0.5` | How visible the reflection is (0.0 to 1.0). |

---

## Sprite Bolt

Creates a dynamic, animated lightning bolt effect down the middle of a sprite.

*   **ID**: `spritebolt`
*   **Category**: Distortion
*   **Blends Background**: No (False)
*   **Animated**: Yes (True)

### Parameters

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| **Bolt Width** | float | `0.05` | Width of the lightning bolt. |
| **Wonkiness** | float | `0.15` | Controls the jaggedness and height of the bolt's peaks. |
| **Bolt Color R** | float | `1.0` | Red component of the bolt color. |
| **Bolt Color G** | float | `1.0` | Green component of the bolt color. |
| **Bolt Color B** | float | `1.0` | Blue component of the bolt color. |
| **Bolt Color A** | float | `1.0` | Alpha component of the bolt color. |

---

## Tilt Shift

Applies a vertical and horizontal gradient blur to simulate miniature camera depth-of-field photography.

*   **ID**: `tiltshift`
*   **Category**: Blur
*   **Blends Background**: No (False)
*   **Animated**: Yes (True)

### Parameters

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| **Intensity** | float | `5.0` | Strength of the blur effect. |
| **Vertical Center** | float | `0.5` | Y coordinate of focus. |
| **Vertical Spread** | float | `0.1` | How wide the vertical focus area is. |
| **Horizontal Spread** | float | `0.3` | How wide the horizontal focus area is. |
