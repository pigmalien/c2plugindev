# Pro Weapon Controller Behavior

A highly optimized weapon controller handling target candidate sorting, burst/reload schedulers, and predictive quadratic aiming equations to lead moving targets.

## Properties

| Property | Description |
| :--- | :--- |
| **Initial state** | Controls if the behavior starts active (`Enabled` or `Disabled`). |
| **Max Ammo** | Maximum ammo capacity. Set to `0` or negative for infinite ammo. |
| **Reload Duration** | Time in seconds to reload when ammo is empty. |
| **Burst Count** | Number of shots in a single burst. Set to `1` for standard firing. |
| **Time Between Shots (Burst)** | Time in seconds between consecutive shots within a single burst. |
| **Time Between Bursts/Regular Fire** | Time in seconds between bursts (or standard shots if burst count is 1). |
| **Target Sorting** | How to sort target candidates inside range (`Nearest` or `First in Range`). |
| **Range** | Maximum targeting range in pixels. |
| **Projectile Speed** | Speed of the bullet/projectile in pixels per second. Used for predictive leading. |

---

## Actions

### General
*   **Set enabled**: Enables or disables the weapon controller (`State`).

### Targeting
*   **Add target object**: Adds an object type or family to the targeting list (`Target`).
*   **Clear target list**: Clears all targeted object types from the controller.
*   **Set range**: Sets the maximum range in pixels (`Range`).
*   **Set projectile speed**: Sets the projectile speed in pixels per second for predictive calculations (`Projectile Speed`).
*   **Clear current target**: Forces the weapon to drop its current target.

### Weapon Firing
*   **Manual reload**: Forces the weapon to reload if ammo is not full and it is not already reloading.

---

## Conditions

### Weapon Firing
*   **On fire**: Triggered when the weapon fires a shot (use this to spawn your bullet!).
*   **On reload start**: Triggered when the weapon starts its reload duration.
*   **On reload complete**: Triggered when the weapon finishes reloading and ammo is replenished.
*   **Is reloading**: True if the weapon is currently reloading.

### Targeting
*   **Has target**: True if the weapon currently has a valid active target in range.

### General
*   **Is enabled**: True if the weapon controller is enabled.

---

## Expressions

### Predictive Aiming
*   `PredictFiringAngle`: Returns the calculated angle in degrees to fire, leading a moving target based on its current velocity.
*   `PredictX`: The predicted interception X coordinate.
*   `PredictY`: The predicted interception Y coordinate.
*   `ProjectileSpeed`: Returns the current projectile speed.

### Targeting
*   `RawAngleToTarget`: The direct, straight-line angle in degrees to the target without leading.
*   `TargetUID`: The UID of the current target, or -1 if no target.
*   `TargetX`: The target's current X coordinate.
*   `TargetY`: The target's current Y coordinate.
*   `Range`: Returns the current targeting range.

### Weapon Firing
*   `CurrentAmmo`: Returns the current ammo count.
