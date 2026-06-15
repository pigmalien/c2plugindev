# Mobs Movement Behavior

A steering and flocking movement behavior for NPCs. Features target tracking, random wandering with bounds, flocking/repulsion to prevent clumping, tile/solid obstacle avoidance, stuck checks, and automatic animation orientation (up/down/sideways).

## Properties

| Property | Description |
| :--- | :--- |
| **Initial state** | Set whether the behavior is initially active or inactive (`Active` or `Inactive`). |
| **Max speed** | The maximum speed of the object in pixels per second. |
| **Rotation speed** | The speed at which the object rotates to face its direction (0 for none to 100 for instant). |
| **Flip** | Automatically flip the object's appearance horizontally (only applies if Rotation speed is 0). |
| **Repulsion radius** | The distance in pixels at which objects will start pushing each other away. |
| **Repulsion force** | The strength of the push-away force, from 0.0 to 1.0. |
| **Mode** | Choose whether to follow the target or wander randomly (`Follow target` or `Wander`). |
| **Wander radius** | The maximum distance from the starting point to wander. |
| **Wander rate** | How often (in seconds) to pick a new wander position. |
| **Stuck padding** | The distance in pixels the object must move within the 'Stuck wait' time to not be considered stuck. |
| **Stuck wait** | The time in seconds to wait before checking if the object is stuck. |
| **Side animation index** | The animation index used for sideways and downward movement. |
| **Up animation index** | The animation index used for upward movement. |
| **Direction bias** | How much stronger vertical movement must be to switch to the Up animation (prevents jitter). |

---

## Actions

### Target
*   **Set target**: Set the object to follow (`Target`).
*   **Set target position**: Set the target coordinates to move towards (`X`, `Y` in pixels).

### State
*   **Set active**: Enable the flocking movement behavior.
*   **Set inactive**: Disable the flocking movement behavior.
*   **Set mode**: Set the movement behavior mode (`Mode`: Follow target or Wander).

### Parameters
*   **Set max speed**: Set the maximum speed for the object (`Speed`).
*   **Set rotation speed**: Set the rotation speed for the object (`Speed`).
*   **Set repulsion radius**: Set the repulsion radius for the object (`Radius`).
*   **Set repulsion force**: Set the repulsion force for the object (`Force` 0 to 1).
*   **Set stuck padding**: Set the distance threshold for the stuck check (`Padding`).
*   **Set stuck wait**: Set the time between stuck checks (`Wait`).

### Obstacles
*   **Add obstacle**: Add an object type to avoid (`Obstacle`).
*   **Clear obstacles**: Remove all added obstacles.
*   **Add solid**: Add an object type to block movement (`Solid`).
*   **Clear solids**: Remove all added solids.

### Animations
*   **Set side animation index**: Set the animation index used for sideways and downward movement (`Index`).
*   **Set up animation index**: Set the animation index used for upward movement (`Index`).

### Wander
*   **Pick new wander position**: Force the object to choose a new random wander destination immediately.
*   **Set wander center**: Set the center point around which the object wanders (`X`, `Y`).
*   **Set wander center to object**: Set the wander center to the current position of an object (`Object`).
*   **Set wander radius**: Set the maximum distance the object will wander from its center (`Radius`).

---

## Conditions

### State
*   **Is active**: True if the behavior is currently active.
*   **Is moving**: True if the object is currently moving.
*   **Is wandering**: True if the object is currently in wander mode.
*   **On stuck**: Triggered when the object fails to move a significant distance while in Follow mode.

---

## Expressions

### Parameters
*   `StuckPadding`: Get the current stuck padding value.
*   `StuckWait`: Get the current stuck wait time.
