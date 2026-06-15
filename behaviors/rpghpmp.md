# RPG Points Behavior

A highly flexible resource manager designed to track HP (Health Points), MP (Mana Points), and custom pools such as AP, Stamina, Rage, or Shield. Supports automatic regeneration over time, resource maximum caps, and level-up updates.

## Properties

| Property | Description |
| :--- | :--- |
| **Max HP** | The primary resource (HP) maximum capacity. |
| **Max MP** | The secondary resource (MP) maximum capacity. |
| **Default Regen Rate (HP)** | HP recovered per second. |
| **Default Regen Rate (MP)** | MP recovered per second. |

---

## Actions

### HP
*   **Take damage**: Subtracts an amount from the 'HP' resource (`Amount`).
*   **Heal**: Adds an amount to the 'HP' resource, capped at its maximum (`Amount`).

### MP
*   **Spend mana**: Subtracts an amount from the 'MP' resource (`Amount`).
*   **Restore mana**: Adds an amount to the 'MP' resource, capped at its maximum (`Amount`).

### HP & MP
*   **Set stats (Level Up)**: Updates Max HP, Max MP, and HP/MP regeneration rates instantly (`Max HP`, `Max MP`, `HP Regen`, `MP Regen`).

### Resources (Custom)
*   **Modify resource**: Adds (positive) or subtracts (negative) from any resource pool (`Resource key`, `Amount`).
*   **Set max resource**: Sets the maximum capacity for a resource pool (`Resource key`, `New maximum`).
*   **Add custom resource**: Registers and initializes a new custom resource pool (`Resource key`, `Maximum amount`, `Current amount`, `Regen rate`).

---

## Conditions

### HP
*   **On health depleted**: Triggered when the HP resource drops to 0 or below.

### MP
*   **On mana depleted**: Triggered when the MP resource drops to 0 or below.

### Resources
*   **Is resource maxed**: True if the resource's current value is equal to its maximum (`Resource key`).
*   **Is resource available**: True if the resource's current value is greater than or equal to a specific threshold (`Resource key`, `Required amount`).

---

## Expressions

### Resources (General)
*   `CurrentResource(ResourceKey)`: Returns the current value of the specified resource pool.
*   `MaxResource(ResourceKey)`: Returns the maximum capacity of the specified resource.
*   `ResourcePercent(ResourceKey)`: Returns the resource percentage (0 to 100).

### HP
*   `HP`: The current HP value.
*   `MaxHP`: The maximum HP value.
*   `HPPercent`: The current HP as a percentage (0 to 100).
*   `BaseMaxHP`: The initial Max HP set in properties.
*   `BaseRegenHP`: The initial HP regeneration rate set in properties.
*   `RegenHP`: The current HP regeneration rate.

### MP
*   `MP`: The current MP value.
*   `MaxMP`: The maximum MP value.
*   `MPPercent`: The current MP as a percentage (0 to 100).
*   `BaseMaxMP`: The initial Max MP set in properties.
*   `BaseRegenMP`: The initial MP regeneration rate set in properties.
*   `RegenMP`: The current MP regeneration rate.
