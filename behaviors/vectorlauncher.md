# Vector Launcher Behavior

A state-driven Input-to-Impulse Controller for launching projectiles. Supports gravity-based physics trajectories, Spline (Bezier) curves, ricochet/bouncing raycasts, drag constraints, and Top-Down or Side perspectives.

## Properties

| Property | Description |
| :--- | :--- |
| **Max Pull** | Maximum distance in pixels the projectile can be dragged from its anchor. |
| **Max Force** | Maximum impulse force applied when dragged to the full distance. |
| **Gravity** | Gravity value used for visual trajectory prediction. |
| **Cooldown** | Cooldown duration in seconds before the launcher can fire again. |
| **Path Mode** | Path movement type (`Gravity (Physics)`, `Spline (Bezier)`, or `Raycast (Ricochet)`). |
| **Initial state** | Controls if the behavior starts active (`Enabled` or `Disabled`). |
| **Drag Scale** | Input scaling multiplier for the drag distance. |
| **Max Bounces** | Maximum number of rebounds allowed in Raycast mode. |
| **View** | Gravity perspective setting (`Side` or `Top-Down`). |
| **Elevation** | Launch elevation angle in degrees (Top-Down only). |
| **Z Scale** | Visual scale factor applied to the Z-axis (Top-Down only). |
| **Trajectory Scaling** | Trajectory visual sprite scale multiplier based on Z-height (0 for none). |
| **Visual Speed** | Visual speed in pixels/sec for Gravity mode (0 to use physics speed). |
| **Set Angle** | Rotates the object to face its travel heading (`No` or `Yes`). |
| **Use Solids** | Enable collision checks with Solid objects (`Yes` or `No`). |

---

## Actions

### Launcher
*   **Load projectile**: Loads a projectile sprite into the launcher (`Projectile`).
*   **Set enabled**: Enables or disables the behavior (`State`).
*   **Set target**: Sets the fixed target (P2) destination for Spline mode (`X`, `Y`).
*   **Set path mode**: Sets the path trajectory mode (`Mode`).
*   **Set max pull**: Sets the maximum drag distance in pixels (`Max Pull`).
*   **Set max force**: Sets the maximum impulse force (`Max Force`).
*   **Set gravity**: Sets the prediction gravity value (`Gravity`).
*   **Set drag scale**: Sets the drag scale multiplier (`Scale`).
*   **Set Z scale**: Sets the Z-axis projection scale factor (`Scale`).
*   **Set elevation**: Sets the launch elevation angle in degrees (`Angle`).
*   **Set visual trajectory**: Sets the template object used to draw the trajectory (`Object`).
*   **Set trajectory scaling**: Sets trajectory scaling based on Z height (`Scale`).
*   **Set visual speed**: Sets the visual speed for Gravity mode (`Speed`).

### Raycast (Ricochet)
*   **Set max bounces**: Sets the maximum bounces for Raycast mode (`Max Bounces`).
*   **Add obstacle**: Adds a custom obstacle type to collide with in Raycast mode (`Object`).
*   **Clear obstacles**: Removes all custom Raycast obstacles.

---

## Conditions

### State
*   **Is dragging**: True if the user is currently dragging and aiming the projectile.
*   **On launch**: Triggered when the projectile is released and propelled.
*   **Is ready**: True if a projectile is loaded and ready.
*   **Is cooldown**: True if the launcher is currently in cooldown.
*   **On cooldown end**: Triggered when the cooldown period finishes.
*   **Is path mode**: Check the active movement path mode (`Mode`).

---

## Expressions

### General
*   `TrajectoryX(Index)`: Predicted X position of the projectile at a normalized index (0.0 to 1.0).
*   `TrajectoryY(Index)`: Predicted Y position of the projectile at a normalized index (0.0 to 1.0).
*   `TrajectoryZ(Index)`: Predicted Z height of the projectile at a normalized index (0.0 to 1.0).
*   `TargetX`: X coordinate of the current drag location.
*   `TargetY`: Y coordinate of the current drag location.

### Gravity (Physics)
*   `LaunchAngle`: Calculated launch angle in degrees.
*   `LaunchPower`: Calculated launch power (impulse magnitude).
*   `CalculatedTime`: Calculated time to reach the target distance.
*   `LaunchVelocityZ`: Calculated vertical (Z) velocity for Top-Down views.
*   `SolveElevation(Distance, Speed)`: Returns the required elevation angle to reach a distance at a given speed.

### Spline (Bezier)
*   `ControlX`: X coordinate of the Bezier control point (P1).
*   `ControlY`: Y coordinate of the Bezier control point (P1).

### Raycast (Ricochet)
*   `BounceCount`: Returns the number of bounce coordinates calculated.
*   `BounceX(Index)`: X coordinate of a bounce point index.
*   `BounceY(Index)`: Y coordinate of a bounce point index.
