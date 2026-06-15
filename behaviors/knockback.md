# KnockBack Behavior

Animates pushing an object backward along a specific vector. Handles decay over a defined duration and triggers a finish condition.

## Properties

*(This behavior has no initial properties defined in the property grid; configure knockback values dynamically via Actions)*

---

## Actions

### General
*   **Knock back**: Knocks the object back along a specific angle and distance over a duration (`Angle` in degrees, `Distance` in pixels, `Duration` in seconds).

---

## Conditions

### General
*   **On knock back finished**: Triggered when the knockback animation finishes.

---

## Expressions

*(This behavior has no expressions)*

---

## Usage Example

To apply a knockback effect when a player is hit by an enemy:

1.  **Condition**: `Player -> On collision with Enemy`
    *   **Action**: `Player -> Knock back (angle(Enemy.X, Enemy.Y, Player.X, Player.Y), 50, 0.2)`
        *   *Pushes the player 50 pixels away from the enemy over 0.2 seconds.*
2.  **Condition**: `Player -> On knock back finished`
    *   *Resume normal player controls or invulnerability states.*
