# Construct 2 Addons Repository

A collection of custom Behaviors, Plugins, and Effects for Construct 2.

> [!WARNING]
> **Updates may break projects.**
> These addons are in active development. Properties or internal logic may change between versions, which can reset values or break functionality in existing projects. Always back up your project before updating these files.

## 📦 Behaviors

### Autodungen
A procedural dungeon generator based on Binary Space Partitioning (BSP).
*   **How to Use:**
    1.  Add the behavior to a **Tilemap** object.
    2.  Use the `Generate Dungeon` action, providing a seed and dimensions.
    3.  Configure room and corridor constraints in the property grid.
    4.  Use the `On Generation Complete` trigger to spawn players or items within the generated rooms.

*   **Features:**
    *   Generates rooms and corridors within a Tilemap.
    *   Supports **Autotiling** with extensive bitmasking options (Corners, Sides, Shadows).
    *   Configurable room size constraints, padding, and corridor width.
    *   Seed support for deterministic generation.
    *   "Thick Walls" option to prevent single-tile walls.

### Shake
Adds a "juice" effect to objects by shaking them.
*   **How to Use:**
    1.  Attach to any visible object.
    2.  Trigger the `Shake` action by specifying the magnitude (pixels/degrees) and duration.
    3.  Set the `Fade Mode` to determine if the shake should lose intensity over time.

*   **Features:**
    *   Shake **Position** (X/Y) or **Angle**.
    *   Configurable **Magnitude** and **Duration**.
    *   **Fade Mode**: Shake intensity can decay over time or remain constant.

### RPG Stats
A system for managing character statistics.
*   **How to Use:**
    1.  Initialize stats via the property string (e.g., `"STR:10,AGI:5"`).
    2.  Use the `AllocatePoints` action to spend the `UnspentPoints` pool on specific stats.
    3.  Apply temporary buffs or debuffs using `AddTemporaryModifier`.
    4.  Retrieve the final calculated value (Base + Bonus + Mods) using the `FinalStat` expression.

*   **Features:**
    *   Handles **Base Stats**, **Bonus Stats** (allocated points), and **Temporary Modifiers**.
    *   Manages a pool of **Unspent Points** for leveling up.
    *   Expressions to calculate final stat values (Base + Bonus + Mods).

### Mobs Movement (Steering)
A high-performance movement behavior for NPCs utilizing steering forces and repulsion.
*   **How to Use:**
    1.  Add the behavior to your NPC sprite.
    2.  Set a target using `SetTarget (Object)` or `SetTargetXY`.
    3.  Configure the `Repulsion Radius` to prevent NPCs from overlapping each other.
    4.  Add solid objects to the behavior's obstacle list using `AddObstacle`.
    5.  Listen for the `On Stuck` trigger to handle path recalculations.

*   **Features:**
    *   Dual-mode: **Follow** or **Wander** (within a radius).
    *   Automatic flocking/repulsion to prevent clumping.
    *   Built-in animation switching for Side/Up directions based on movement vector.
    *   Smart sliding logic when hitting corners.

### Pro Line of Sight
An optimized vision system for NPCs with cone-of-vision and raycasting.
*   **How to Use:**
    1.  Attach to an NPC sprite.
    2.  Use `AddTarget` to track specific objects (e.g., the Player).
    3.  Use `AddObstacle` to define objects that block vision.
    4.  Check the `HasLineOfSight` condition to trigger AI logic.
    5.  Adjust the `Check Interval` (e.g., every 5 frames) to balance accuracy and performance.

*   **Features:**
    *   Performance staggering: Uses an auto-offset based on UID to spread CPU load.
    *   Supports **Cone of Vision** angles.
    *   Tilemap-aware raycasting.

### FindPath (A*)
A grid-based pathfinding behavior for intelligent navigation.
*   **How to Use:**
    1.  Set the `Cell Size` to match your layout's grid.
    2.  Use `AddWallObstacle` to define impassable objects.
    3.  Trigger `FindPath` to a specific destination.
    4.  On `OnPathFound`, use the `ForEachNode` loop to guide your object along the path.

*   **Features:**
    *   Optimized A* algorithm with corner-cutting prevention.
    *   Bakes wall objects into a temporary map for fast querying.

### Pro Weapon Controller
Manages weapons, ammo, and provides predictive aiming for projectile-based combat.
*   **How to Use:**
    1.  Setup `TargetTypes` (what the weapon should look for).
    2.  Configure projectile speed and weapon range.
    3.  On the `OnFire` trigger, spawn your bullet at the weapon's position.
    4.  Set the bullet's angle to the behavior's `PredictFiringAngle` to lead shots against moving targets.

*   **Features:**
    *   **Predictive Aiming**: Solves quadratic interception equations to hit moving targets.
    *   Integrated burst-fire and reload cycles.
    *   Sticky targeting options.

## 🧩 Plugins

### Lifeguard
A singleton plugin for optimization and game flow.
*   **How to Use:**
    *   **Pooling**: Call `SetupPool` at layout start. Instead of "Create Object", use `SpawnInstance`. When finished, use `ReturnInstance` instead of "Destroy".
    *   **Global Events**: Use `TriggerGlobalEvent` to broadcast a message. Any event sheet can use the `On global event` condition to react, regardless of context.

*   **Features:**
    *   **Object Pooling**: Pre-create, spawn, and return objects to a pool to reduce garbage collection overhead.
    *   **Elastic Pools**: Automatically creates new instances if the pool is exhausted.
    *   **Global Events**: Trigger and listen for named events globally across the project.

### HTML Menu
Displays an interactive HTML/CSS UI layer over the game.
*   **How to Use:**
    1.  Place `menu.html` and `style.css` in your project files.
    2.  In your HTML, use `data-c2-id="ButtonName"` on clickable elements.
    3.  In C2, use the `On button clicked` condition and check `ClickedID` to see which button was pressed.
    4.  Update UI text dynamically using `Update element content` by passing an HTML ID.

*   **Features:**
    *   **GSAP Integration**: Built-in actions for tweening CSS properties and typewriter effects.
    *   **Two-Way Binding**: Can sync HTML input fields directly to Construct 2 global variables.

### Spawn Point
Generates random coordinates based on area constraints.
*   **How to Use:**
    1.  Define the area using `SetArea`.
    2.  Choose a mode: `Inside Area` or `Outside Area` (for spawning enemies off-screen).
    3.  Call `SetPoint`.
    4.  Access the results via `PointX` and `PointY` expressions.

### NPC State / RPG Drops
*   *Current Status: Work In Progress / Template Code.*

## ✨ Effects

### Sprite Bolt
A WebGL distortion effect.
*   **Description**: Creates a lightning bolt effect down the middle of a sprite.
*   **Parameters**: Bolt Width, Wonkiness, and RGBA Color settings.
