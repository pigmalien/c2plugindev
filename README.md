# Construct 2 Addons Repository

A collection of custom Behaviors, Plugins, and Effects for Construct 2.

> [!WARNING]
> **Updates may break projects.**
> These addons are in active development. Properties or internal logic may change between versions, which can reset values or break functionality in existing projects. Always back up your project before updating these files.

## 📦 Behaviors

### Autodungen
A procedural dungeon generator based on Binary Space Partitioning (BSP).
*   **Features:**
    *   Generates rooms and corridors within a Tilemap.
    *   Supports **Autotiling** with extensive bitmasking options (Corners, Sides, Shadows).
    *   Configurable room size constraints, padding, and corridor width.
    *   Seed support for deterministic generation.
    *   "Thick Walls" option to prevent single-tile walls.

### Shake
Adds a "juice" effect to objects by shaking them.
*   **Features:**
    *   Shake **Position** (X/Y) or **Angle**.
    *   Configurable **Magnitude** and **Duration**.
    *   **Fade Mode**: Shake intensity can decay over time or remain constant.

### RPG Stats
A system for managing character statistics.
*   **Features:**
    *   Handles **Base Stats**, **Bonus Stats** (allocated points), and **Temporary Modifiers**.
    *   Manages a pool of **Unspent Points** for leveling up.
    *   Expressions to calculate final stat values (Base + Bonus + Mods).

### Smooth Move
A movement behavior for smooth object tracking.
*   **Features:**
    *   Moves an object towards a target object or position.
    *   **Steering Mode**: Rotates to face the target with angular acceleration.
    *   **Direct Mode**: Moves straight to the target.
    *   Configurable **Acceleration**, **Deceleration**, and **Max/Min Speed**.

## 🧩 Plugins

### Lifeguard
A singleton plugin for optimization and game flow.
*   **Features:**
    *   **Object Pooling**: Pre-create, spawn, and return objects to a pool to reduce garbage collection overhead.
    *   **Global Events**: Trigger and listen for named events globally across the project.

### Itch.io
Integration with the Itch.io API.
*   **Features:**
    *   **Authentication**: Supports secure login via Environment Variables (for the Itch app) or manual API keys.
    *   **Data**: Fetch user profile, user's games, and check ownership of specific game IDs.

### NPC State / RPG Drops
*   *Current Status: Work In Progress / Template Code.*

## ✨ Effects

### Sprite Bolt
A WebGL distortion effect.
*   **Description**: Creates a lightning bolt effect down the middle of a sprite.
*   **Parameters**: Bolt Width, Wonkiness, and RGBA Color settings.

