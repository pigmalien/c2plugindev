# Smooth Move Behavior

Moves an object smoothly towards a target object or position. Supports steering (turning curves), deceleration radius scaling, collision stops on solids, and solid obstacle avoidance.

## Properties

| Property | Description |
| :--- | :--- |
| **Initial state** | Controls if the behavior starts active (`Enabled` or `Disabled`). |
| **Movement mode** | Choose how the object moves: `Steering (Use object angle)` creates turning motions, while `Direct (Use target angle)` moves straight to target. |
| **Max speed** | The maximum speed of the object in pixels per second. |
| **Min speed** | The minimum speed when the object is close to the target. |
| **Deceleration** | Rate of deceleration (friction) in pixels per second squared. |
| **Acceleration** | Rate of acceleration in pixels per second squared. Set to `0` for instant speed. |
| **Rotation speed** | How quickly the object rotates to face the target in steering mode (higher is faster). |
| **Flip** | Automatically flip the object horizontally (useful if rotation speed is 0). |
| **Effective radius** | The distance from the target in pixels at which speed scaling is maxed out. |
| **Stop on solids** | Enable to stop when colliding with Solid objects (`No` or `Yes`). |
| **Avoidance** | Look-ahead distance in pixels to avoid solids (set to `0` to disable). |

---

## Actions

### State
*   **Set enabled**: Enables or disables the smooth movement behavior (`State`).

### Movement
*   **Stop**: Immediately stops all movement and clears any active target.

### Target
*   **Set target**: Sets the target object instance to follow (`Target`).
*   **Set target position**: Sets the target to specific coordinates (`X`, `Y`).

### Parameters
*   **Set max speed**: Sets the maximum speed in pixels per second (`Speed`).
*   **Set min speed**: Sets the minimum speed in pixels per second (`Speed`).
*   **Set deceleration**: Sets the deceleration rate in pixels/sec² (`Deceleration`).
*   **Set acceleration**: Sets the acceleration rate in pixels/sec² (`Acceleration`).
*   **Set rotation speed**: Sets the rotation speed (`Speed`).
*   **Set effective radius**: Sets the distance in pixels at which speed scaling is maxed out (`Radius`).
*   **Set stop on solids**: Enables or disables collision with solids (`Stop on solids`).
*   **Set avoidance**: Sets the obstacle avoidance look-ahead distance in pixels (`Avoidance`).

### Obstacles
*   **Add obstacle**: Adds a general object type to avoid (`Obstacle`).
*   **Clear obstacles**: Removes all general obstacle types from avoidance.

---

## Conditions

### State
*   **IsEnabled**: True if the behavior is currently enabled and processing.
*   **IsMoving**: True if the object's speed is greater than zero.

---

## Expressions

### Movement
*   `CurrentSpeed`: Returns the current speed of the object in pixels per second.
*   `AngleOfMotion`: Returns the current angle of motion in degrees.

### Parameters
*   `Acceleration`: Returns the current acceleration rate.
