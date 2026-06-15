# RPG Leveler Behavior

Manages character experience points (XP) and leveling progression. Supports polynomial, exponential, or linear curves, custom formula parsing, level caps, and allocation points on level up.

## Properties

| Property | Description |
| :--- | :--- |
| **Initial level** | The starting level of the object. |
| **Max level** | The maximum level the object can achieve. |
| **Curve type** | Formula used to calculate XP required for the next level (`Polynomial`, `Exponential`, or `Linear`). |
| **Base XP** | The base XP value used in the curve calculations. |
| **Growth factor** | The growth factor multiplier used in the `Exponential` curve formula. |
| **Bonus points per level** | The number of bonus stat points awarded to spend on level up. |
| **Custom curve formula** | A custom JavaScript expression for XP requirements (e.g., `'100 * Math.pow(L, 3)'`). Overrides `Curve type` if provided, where `L` represents current level. |

---

## Actions

### Experience
*   **Add experience**: Adds experience points to the object (`Amount`).

### Configuration
*   **Set curve type**: Dynamically updates the experience curve formula (`Curve Type`).

### Leveling
*   **Reset level**: Resets the level to 1 and total XP to 0.

### Debug
*   **Set level**: Instantly sets the level to a specific value (`Level`).
*   **Set experience**: Instantly sets total experience to a specific value (`Experience`).

---

## Conditions

### Leveling
*   **On level up**: Triggered when the object levels up.
*   **On max level reached**: Triggered once when the object reaches its maximum level cap.

---

## Expressions

### Leveling
*   `CurrentLevel`: Returns the current level.

### Experience
*   `CurrentXP`: Returns the total accumulated experience points.
*   `XPRemaining`: Returns the remaining experience points needed to reach the next level.
*   `XPForNextLevel`: Returns the total experience points required for the next level up.

### Stats
*   `BonusPointsAvailable`: Returns the current pool of unspent bonus points.
*   `CalculateStat(Level, Base, Growth, Curve)`: Calculates a polynomial stat value: `Base + (Growth * ((Level - 1) ^ Curve))`.

### UI
*   `XPPercentageToNextLevel`: Returns progress to the next level as a float (0.0 to 1.0).
