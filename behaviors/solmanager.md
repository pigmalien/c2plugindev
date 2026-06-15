# SOL Manager Behavior

Manages Selected Object List (SOL) links to other instances by their Unique ID (UID). Allows establishing links, checking existence of linked units, and picking linked targets selectively.

## Properties

*(This behavior has no initial properties defined in the property grid)*

---

## Actions

### Linking
*   **Link instance by UID**: Establishes a permanent link to a specific instance of an object type via its unique ID (`Target object`, `Instance UID`).
*   **Clear link**: Removes the link to an instance of a specific object type (`Target object`).

---

## Conditions

### Linking
*   **Has linked instance of**: True if a linked instance of a specific object type is currently stored (`Target object`).
*   **Pick linked instance**: Picks and selects the linked instance for subsequent actions in the event sheet (`Target object`).

---

## Expressions

### Linking
*   `LinkedUID(Object)`: Returns the Unique ID (UID) of the currently linked instance of an object type (0 if none).
