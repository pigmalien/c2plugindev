# Construct 2 Addons Repository

A collection of custom Behaviors, Plugins, and Effects for Construct 2.

> [!WARNING]
> **Updates may break projects.**
> These addons are in active development. Properties or internal logic may change between versions, which can reset values or break functionality in existing projects. Always back up your project before updating these files.

## 📦 Behaviors

### Autodungen
A procedural dungeon generator based on Binary Space Partitioning (BSP). Must be attached to a Tilemap object.
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

### Delaunay Dungeon
Procedurally generates a dungeon layout using Delaunay Triangulation and Minimum Spanning Trees (MST).
*   **How to Use:**
    1.  Add the behavior to your controller or generator object.
    2.  Set rooms data and boundaries, then run triangulation.
    3.  Utilize MST to filter connections, leaving some loops for more interesting layouts.

*   **Features:**
    *   Fast Delaunay Triangulation generation.
    *   Computes Minimum Spanning Tree (MST).
    *   Highly customizable parameters for dungeon grid/room connectivity.

### Encircle
Orbit around another object smoothly.
*   **How to Use:**
    1.  Attach the behavior to the orbiting sprite.
    2.  Use `Set Orbit Target` to select the object to encircle.
    3.  Configure speed, radius, and rotation direction in the properties or actions.

*   **Features:**
    *   Configure orbit radius, angular speed, and direction.
    *   Supports smooth interpolation when approaching the target orbit.

### FindPath (A*)
Enables movement on a defined grid with pathfinding capabilities (A*).
*   **How to Use:**
    1.  Set the `Cell Size` to match your layout's grid.
    2.  Use `AddWallObstacle` to define impassable objects.
    3.  Trigger `FindPath` to a specific destination.
    4.  On `OnPathFound`, use the `ForEachNode` loop to guide your object along the path.

*   **Features:**
    *   Optimized A* algorithm with corner-cutting prevention.
    *   Bakes wall objects into a temporary map for fast querying.

### Follow Path
Move an object along a path of coordinates, with optional angle setting and corner rounding.
*   **How to Use:**
    1.  Supply coordinates as nodes to the behavior.
    2.  Enable movement to traverse the path node-by-node.
    3.  Configure speed, deceleration, and corner-rounding radius.

*   **Features:**
    *   Angle setting option to rotate the moving object towards the next node.
    *   Corner rounding options for smoother curved trajectories.

### KnockBack
Animate pushing an object back.
*   **How to Use:**
    1.  Attach to sprite objects subject to knockback (e.g. players, enemies).
    2.  Trigger the `KnockBack` action by providing direction, force, and deceleration.

*   **Features:**
    *   Decelerating movement along the knockback vector.
    *   Automatic cleanup and event triggers upon completion.

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

### Multipath
Stores and navigates multiple reusable lists of X/Y coordinates (paths).
*   **How to Use:**
    1.  Store multiple paths by unique IDs.
    2.  Set the active path key and command the behavior to start navigation.

*   **Features:**
    *   Manage multiple named paths on a single object.
    *   Dynamic path modification and traversal controls.

### MyCam
Advanced camera control system with deadzones, look-ahead prediction, room grid-snapping, and auto-zoom.
*   **How to Use:**
    1.  Add to a dummy camera focus object or directly to your player.
    2.  Configure smoothness, deadzones, and zoom properties.
    3.  Use actions to pan, screen shake, or lock within layout borders.

*   **Features:**
    *   Look-ahead offsets based on velocity.
    *   Grid snapping room transitions.
    *   Smart auto-zooming linked to movement speed.

### Pro Line of Sight
Advanced line of sight behavior with performance optimizations and cone of vision.
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

### Pro Weapon Controller
Highly optimized weapon targeting, scheduler, and predictive aiming controller.
*   **How to Use:**
    1.  Setup `TargetTypes` (what the weapon should look for).
    2.  Configure projectile speed and weapon range.
    3.  On the `OnFire` trigger, spawn your bullet at the weapon's position.
    4.  Set the bullet's angle to the behavior's `PredictFiringAngle` to lead shots against moving targets.

*   **Features:**
    *   **Predictive Aiming**: Solves quadratic interception equations to hit moving targets.
    *   Integrated burst-fire and reload cycles.
    *   Sticky targeting options.

### Raycasting
Fires a ray from the object's origin and checks for collision with specific objects.
*   **How to Use:**
    1.  Attach to a scanner or weapon emitter.
    2.  Trigger the raycast action in a specific direction.
    3.  Retrieve the intersection point, distance, and hit object.

*   **Features:**
    *   Performant intersection checks.
    *   Returns intersection coordinates (X, Y) and hit object details.

### Rpg Points
A flexible resource manager for HP, MP, and any custom values like AP, Rage, etc.
*   **How to Use:**
    1.  Configure the resource's capacity, regeneration rate, and initial value.
    2.  Modify the resource value via actions (e.g., Damage, Heal, Spend).

*   **Features:**
    *   Built-in regeneration over time.
    *   Max resource constraints.
    *   Events for resource depletion (e.g., On HP Zero) or resource full.

### RPG Leveler
Manages experience points and leveling for characters using configurable mathematical curves.
*   **How to Use:**
    1.  Set experience thresholds per level using mathematical curves or explicit values.
    2.  Reward experience via actions and listen for `On Level Up` triggers.

*   **Features:**
    *   Exponential, linear, or custom leveling curves.
    *   Saves and manages overall level and experience pools.

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

### Shadow Skip
Animates bouncing/squashing a child puppet object relative to a parent shadow object.
*   **How to Use:**
    1.  Add the behavior to a parent "shadow" object.
    2.  Link the child "puppet" object (e.g., the character's visual sprite) via container properties.
    3.  Define properties like bounce amplitude, frequency, squashing ratio, and lean amount.

*   **Features:**
    *   Automatic secondary visual animation (bouncing, squashing, leaning).
    *   Aligns child with parent shadow object coordinate anchors.
    *   Horizontal flipping mode support.

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

### Smooth Move
Makes an object smoothly move towards a target object.
*   **How to Use:**
    1.  Attach to a follower sprite.
    2.  Use the `Set Target` action to specify the target sprite.
    3.  Configure movement speed, damping, and arrival thresholds.

*   **Features:**
    *   Smooth follow interpolation.
    *   Dynamic target repositioning.

### Snake Chain
Automatically generates and manages a chain of trailing body segments.
*   **How to Use:**
    1.  Attach to the head segment of a snake-like creature.
    2.  Set the body segment object type and the desired length.
    3.  Move the head; the body segments will follow automatically.

*   **Features:**
    *   Dynamic segment creation and destruction.
    *   Trailing segment positioning based on head movement history.

### SOL Manager
Manages links to other instances by their UID (Selected Object List).
*   **How to Use:**
    1.  Attach to a controller or agent.
    2.  Link other objects to it using UID references.
    3.  Perform operations selectively on linked objects.

*   **Features:**
    *   Selected Object List (SOL) manipulation.
    *   UID-based link querying and verification.

### Spline Path Mover
Moves an object smoothly along a Catmull-Rom spline path.
*   **How to Use:**
    1.  Add control points to the path.
    2.  Use the `Move` action to start path traversal.
    3.  Adjust traversal duration and easing modes.

*   **Features:**
    *   Smooth Catmull-Rom spline interpolation.
    *   Supports dynamic node addition and removal.

### Tile-To Path
Move a sprite across a grid, tile by tile.
*   **How to Use:**
    1.  Specify tile size and speed.
    2.  Trigger tile-based movements (e.g. Move Left, Move Right).

*   **Features:**
    *   Grid aligned movement constraint.
    *   Trigger conditions for arrival at a tile.

### Tile to Mob
Manages child sprites from a Tilemap perspective.
*   **How to Use:**
    1.  Associate tile positions with spawned mob instances.
    2.  Perform queries to get mobs present on specific tile coordinates.

*   **Features:**
    *   Tilemap grid coordination for entity tracking.

### Vector Launcher
A State-Driven Input-to-Impulse Controller for launching projectiles.
*   **How to Use:**
    1.  Attach to a launcher object.
    2.  Use input vectors to specify angle and power.
    3.  Trigger launcher impulses to propel target objects.

*   **Features:**
    *   State-driven launcher power accumulation.
    *   Custom vector angle and force outputs.


## 🧩 Plugins

### Game Master
Manage monster databases, scale monster stats by level and difficulty, and roll loot.
*   **How to Use:**
    1.  Load the monster database from a JSON string.
    2.  Call `Generate monster` to calculate stats for a monster based on level and difficulty.
    3.  Call `Roll loot` to trigger loot drops.

*   **Features:**
    *   Loads monster parameters from JSON.
    *   Formula-based stat scaling (HP, Attack).
    *   Integrated drops table rolling.

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

### Itch.io
Integrate with the Itch.io API with secure environment variable authentication.
*   **How to Use:**
    1.  Initialize the Itch API in your event sheet.
    2.  Authenticate requests using environment variables or key tokens.
    3.  Retrieve user profile or purchase details.

*   **Features:**
    *   Itch.io API integration.
    *   Secure environment variable injection helper.

### Lifeguard
A singleton plugin for optimization and game flow.
*   **How to Use:**
    *   **Pooling**: Call `SetupPool` at layout start. Instead of "Create Object", use `SpawnInstance`. When finished, use `ReturnInstance` instead of "Destroy".
    *   **Global Events**: Use `TriggerGlobalEvent` to broadcast a message. Any event sheet can use the `On global event` condition to react, regardless of context.

*   **Features:**
    *   **Object Pooling**: Pre-create, spawn, and return objects to a pool to reduce garbage collection overhead.
    *   **Elastic Pools**: Automatically creates new instances if the pool is exhausted.
    *   **Global Events**: Trigger and listen for named events globally across the project.

### MiniMap Pro
High-performance WebGL Mini-map with Framebuffer Object (FBO) batching.
*   **How to Use:**
    1.  Add the MiniMap object to a UI layer.
    2.  Register layout layers or specific objects to render to the map.
    3.  Render viewport indicator and target blips.

*   **Features:**
    *   Fast WebGL texture-copying / rendering approach.
    *   FBO batching minimizes performance overhead.
    *   Support for camera indicators and marker blips.

### NPC State / RPG Drops
*   *Current Status: Work In Progress / Template Code.*

### Radial Gauge
A customizable radial gauge UI element.
*   **How to Use:**
    1.  Place the gauge in the layout.
    2.  Configure min/max values, radius, start/end angles, and colors.
    3.  Set the gauge value dynamically in event sheets.

*   **Features:**
    *   WebGL rendering for clean, aliased gauge rings.
    *   Custom color bands and value ranges.

### RibbonTrail
A performant, continuous WebGL ribbon mesh trail plugin.
*   **How to Use:**
    1.  Attach to moving sprites (bullets, blades, particles).
    2.  Define ribbon width, decay time, texture coordinates, and colors.
    3.  The plugin will automatically generate a continuous connected mesh as the object moves.

*   **Features:**
    *   Dynamic mesh generation for trails.
    *   Texture wrapping and color fade controls.

### Rich Text Renderer
Displays text with advanced formatting using markup, custom fonts, and effects.
*   **How to Use:**
    1.  Place the renderer object in the layout.
    2.  Input text containing tags (e.g. `[color=red]Text[/color]` or `[b]Bold[/b]`).
    3.  Configure font resources and layout alignment.

*   **Features:**
    *   Tag-based rich text rendering.
    *   Custom inline formatting (size, color, weight, icons, typewriter effects).

### Spawn Point
Generates random coordinates based on area constraints.
*   **How to Use:**
    1.  Define the area using `SetArea`.
    2.  Choose a mode: `Inside Area` or `Outside Area` (for spawning enemies off-screen).
    3.  Call `SetPoint`.
    4.  Access the results via `PointX` and `PointY` expressions.

*   **Features:**
    *   Generates coordinates relative to camera view or custom rectangle.
    *   Checks for overlap constraints before selecting coordinates.

### Lightning Strike
Simulates lightning strikes with jagged paths and branching.
*   **How to Use:**
    1.  Call the `Create strike` action, specifying start and end coordinates.
    2.  Configure amplitude, detail level, and branch chance.
    3.  Render the strike to a canvas or layer.

*   **Features:**
    *   Recursive fractal algorithm for lightning paths.
    *   Branching strike logic.

### Global Timer
A global timer system for managing named timers.
*   **How to Use:**
    1.  Start a named timer with a duration.
    2.  Listen for `On Timer Finished` triggers specifying the name of the timer.

*   **Features:**
    *   Time-scale independent or dependent options.
    *   Retrieve remaining time or elapsed percentage.

### Tentacle
A physics-based tentacle or rope using Verlet integration and a textured quad-strip.
*   **How to Use:**
    1.  Configure length, segment count, gravity, and stiffness.
    2.  Anchor one or both ends of the tentacle to objects.
    3.  Applies forces dynamically to animate natural movement.

*   **Features:**
    *   Verlet integration physics simulation.
    *   Quad-strip mesh rendering with custom texture mapping.


## ✨ Effects

### Sprite Bolt
*   **Description**: Creates a lightning bolt WebGL distortion effect down the middle of a sprite.
*   **Parameters**: Bolt Width, Wonkiness, and RGBA Color settings.

### Mirror Floor
*   **Description**: WebGL effect that flips the background texture vertically to simulate a mirror reflection.
*   **Parameters**: Reflection Line (Y anchor, 0.0 to 1.0), Opacity (0.0 to 1.0).

### Tilt Shift
*   **Description**: WebGL depth-of-field blur effect simulating miniature photography.
*   **Parameters**: Intensity (blur strength), Vertical Center (Y focus), Vertical Spread, Horizontal Spread.
