# RPG Stats Behavior

Manages core numerical attributes (statistics) for character sheets, RPG units, or equipment. Handles permanent base stats, allocated user points, and temporary spell/item modifiers.

## Properties

| Property | Description |
| :--- | :--- |
| **Initial stats** | A comma-separated list of starting statistics in `Key:Value` format (e.g., `STR:10,INT:10,Defense:5`). |
| **Points to allocate** | The starting number of unspent allocation points available. |

---

## Actions

### Stats
*   **Set base stat**: Sets a permanent, unallocated base value for a stat (`Stat key`, `Base value`).
*   **Set bonus stat**: Sets the bonus value for a stat from allocated points (`Stat key`, `Bonus value`).

### Allocation
*   **Allocate points**: Deducts points from the unspent pool and adds them to a stat's bonus pool (`Stat key`, `Amount`).
*   **Set unspent points**: Sets the total number of unspent allocation points available (`Amount`).

### Modifiers
*   **Add temporary modifier**: Adds a temporary bonus or penalty to a stat (`Stat key`, `Amount`). Can be negative.
*   **Clear modifiers**: Removes all temporary modifiers from a specific stat or all stats if the key is empty (`Stat key`).

---

## Conditions

### Allocation
*   **Has unspent points**: True if there are unspent allocation points available.

### Stats
*   **Final stat meets**: Compares the final calculated value of a stat (`Stat key`, `Comparison` operator, `Value`).

### Modifiers
*   **Has modifiers**: True if the specified stat has any active temporary modifiers (`Stat key`).

---

## Expressions

### Stats
*   `FinalStat(StatKey)`: Returns the final calculated value: `Base + Bonus + ModifierTotal`.
*   `BaseStat(StatKey)`: Returns the initial raw base value before bonuses or modifiers.
*   `BonusStat(StatKey)`: Returns the total points allocated to this stat.
*   `ModifierTotal(StatKey)`: Returns the combined sum of all active temporary buffs and debuffs.

### Allocation
*   `UnspentPoints`: Returns the number of unspent points available to allocate.
