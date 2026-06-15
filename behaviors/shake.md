# Shake Behavior

Adds a juicy screen shake effect or object vibrations to position or rotation. Supports constant magnitude or fading decay over time.

## Properties

*(This behavior has no initial properties defined in the property grid; configure shakes dynamically via Actions)*

---

## Actions

### Shake
*   **Shake**: Starts shaking the object on position or rotation (`Magnitude` in pixels, `Duration` in seconds, `Mode` [Constant magnitude or Fade out], `Shake on` [Position or Angle]).
*   **Stop**: Immediately cancels any active shaking.

---

## Conditions

### Shake
*   **Is shaking**: True if the object is currently shaking.

---

## Expressions

### Shake
*   `Magnitude`: Returns the current magnitude of the shake.
*   `Duration`: Returns the remaining duration of the shake in seconds.
*   `Progress`: Returns the progress of the shake from 0.0 to 1.0.
