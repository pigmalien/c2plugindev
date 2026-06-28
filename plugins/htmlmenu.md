HTML Menu Plugin Manual
=======================

An immersive, production-grade Construct 2 plugin that overlays responsive HTML/CSS structures directly over the WebGL/Canvas game layer. It implements high-fidelity transitions, sound delegation, data bindings, input capturing, and deep integration with the GSAP (GreenSock) animation suite.

Table of Contents
-----------------

1. [Core Architecture & Lifecycle](#_1-core-architecture-amp-lifecycle)
2. [Plugin Properties](#_2-plugin-properties)
3. [Universal Sync & Data Binding (Tier 4)](#_3-universal-sync-amp-data-binding-tier-4)
4. [Input Guarding & Interaction Modes](#_4-input-guarding-amp-interaction-modes)
5. [GSAP Animation Engine](#_5-gsap-animation-engine)
6. [Events, Conditions, & Expressions Reference](#_6-events-conditions-amp-expressions-reference)
7. [Sound & Interaction Bridge](#_7-sound-amp-interaction-bridge)
8. [Setup & Best Practices](#_8-setup-amp-best-practices)


1\. Core Architecture & Lifecycle
---------------------------------

The **HTML Menu** plugin is configured as a `"world"` type plugin in Construct 2\. This means it occupies spatial layout coordinates (X, Y, Width, Height) inside the Construct 2 editor layout while managing a dynamically layered external DOM (Document Object Model) hierarchy inside the user's browser during runtime.

### DOM Overlay Setup

During runtime initialization (`onCreate`), the plugin:

1.  Dynamically constructs an isolated wrapper HTML `<div>` with a unique ID format: `c2-htmlmenu-[uid]`.

2.  Sets its positioning properties (`absolute`, `z-index: 100`) and applies CSS rendering parameters such as `image-rendering: pixelated` to guarantee crisp rendering alongside retro or pixel-art WebGL canvases.

3.  Injects the specified **HTML template** via an asynchronous `XMLHttpRequest` and appends the linked **CSS stylesheet** directly to the document `<head>`.

4.  Evaluates and executes internal inline `<script>` tags found within the loaded markup to ensure your custom interactive scripts run as expected.

### Spatial Synchronization

Every tick, the plugin converts local layout coordinates (accounting for layers, scale, camera zoom, scroll positions, parallax, and custom hotspots) into global viewport pixel positions:

```
Global Viewport Position = Canvas Screen Offset + Layer-to-Canvas Translation

```

It updates the DOM wrapper's absolute positioning (`offset`, `width`, `height`) using jQuery. If the object or layer becomes invisible or is moved entirely offscreen, the wrapper is hidden using CSS (`display: none`) to optimize browser rendering cycles and prevent unnecessary layout thrashing.

2\. Plugin Properties
---------------------

These properties are configured in the Construct 2 Properties Bar upon selecting an instance of the HTML Menu:

-   **HTML file** (Text, Default: `menu.html`): The filename of the main HTML structural template. This file must be imported into the project's **Files** folder in the C2 Projects bar.

-   **CSS file** (Text, Default: `style.css`): The filename of the styling sheet used to style the menu. Must reside in the **Files** folder.

-   **Initially visible** (Combo: `No` | `Yes`, Default: `Yes`): Sets the starting state of the overlay. If set to `No`, the wrapper is immediately initialized with `display: none`.

-   **Auto-Sync** (Combo: `No` | `Yes`, Default: `Yes`): Activates automatic polling of Construct 2 variables and sync data, automatically reflecting modifications inside matching HTML elements on every game tick.

-   **Two-Way Binding** (Combo: `No` | `Yes`, Default: `No`): When enabled, modifications made to interactive elements (like typing in text fields or checking boxes) are pushed back dynamically into their corresponding Construct 2 Global Variables.

3\. Universal Sync & Data Binding (Tier 4)
------------------------------------------

The HTML Menu features a highly decoupled, priority-driven data-binding engine that updates structural DOM content dynamically without manual event sheet scripting.

### Element Mapping Keys

The synchronization system parses the DOM within the menu wrapper for any elements containing either a standard **`id`** attribute or a custom **`data-sync-id`** attribute.

### Evaluation Priority Hierarchy

When updating elements, values are assigned according to the following strict hierarchy:

1.  **Local Dictionary Cache:** Values loaded into the instance via the `Sync from Dictionary` action.

2.  **Global Variable Scope:** Any active Construct 2 Global Variable that shares an exact matching name with the element's identifier.

```
       [ C2 Global Variable ]             [ Dictionary JSON ]
                 │                                 │
                 ▼ (Priority 2)                    ▼ (Priority 1)
         ┌─────────────────────────────────────────────────┐
         │             HTML Menu Sync Mapper               │
         └────────────────────────┬────────────────────────┘
                                  │
                                  ▼
                     [ DOM Element: id / data-sync-id ]

```

### Advanced Data Attributes

You can fine-tune how values are formatted and rendered directly from your HTML layout markup using specialized attributes:

-   **`data-format`**: Formats raw numeric values.

    -   `data-format="percent"`: Multiplies a decimal float by 100 and appends a percent sign (e.g., `0.75` becomes `75%`).

    -   `data-format="0.00"` / `data-format="0.000"`: Renders numbers fixed to the specified decimal precision.

-   **`data-raw`**: Controls security sanitization.

    -   By default, text inputs are scrubbed of HTML tags to prevent cross-site scripting vulnerabilities.

    -   `data-raw="true"`: Skips the sanitation parser and injects the value as unescaped raw HTML, letting you format text dynamically with standard tags like `<b>`, `<i>`, or inline wrappers.

-   **`data-is-animating`**: Read-only flag. When active, it tells the data-binding system to pause updates to this element so that ongoing GSAP animations (like typewriter reveals) are not interrupted.

### Two-Way Binding Engine

When **Two-Way Binding** is active, interactive form elements (`<input>`, `<textarea>`, `<select>`) report changes back to Construct 2.

-   **Feedback Loop Prevention:** To prevent active inputs from stuttering or losing cursor focus while typing, the system registers the currently active element under `this.activeInput` on focus. This temporarily pauses the outward sync loop for that active element, while still accepting inward key inputs.

-   **Numeric Type Auto-Resolution:** The system checks value strings. If a value can be converted to a valid number, it is stored in Construct 2 as a numeric float/integer; otherwise, it is stored as a string.

4\. Input Guarding & Interaction Modes
--------------------------------------

Managing pointer captures and focus states is essential when blending HTML elements over an active WebGL canvas.

### Interaction Modes

Use the `Set interaction mode` action to specify how pointer inputs behave:

| **Mode** | **Pointer-Events Resolution** | **Behavioral Description** |
|

**Full Block** (0)

 |

`pointer-events: auto`

 |

The entire menu container blocks mouse clicks and touch events. Pointer events cannot penetrate through to the game canvas underneath.

 |
|

**Buttons Only** (1)

 |

Wrapper: `none`

Interactives: `auto`

 |

Default setting. Only specific interactive tags (`<a>`, `<button>`, `<input>`, `<textarea>`, `<select>`, and elements with `data-c2-id`, `data-sfx-click`, or `data-sfx-hover`) capture pointer inputs. Background clicks pass directly through to the canvas.

 |
|

**None** (2)

 |

`pointer-events: none`

 |

Disables all interactions. The entire overlay behaves as a visual-only layer, allowing all pointer clicks and touch events to pass through directly to the game.

 |

### Focus Management & Keyboard Guarding

Focus changes are monitored via event-delegation listeners (`focusin` and `focusout`):

-   **Key Guard:** When form input controls (textareas, text inputs) are actively focused, keyboard event bubbling is blocked (`e.stopPropagation()`). This prevents typing inside a text field from accidentally triggering game actions (such as WASD movement or hotkeys mapped in Construct 2's Keyboard plugin).

-   **Focus Wrapping:** You can control navigation with the actions `Focus next element` and `Focus previous element`. These actions filter all focusable elements using a standard visibility selector:

    `'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'`

    Focus wraps seamlessly between the first and last focusable elements in the menu.

5\. GSAP Animation Engine
-------------------------

The plugin includes deep integration with the **GSAP (GreenSock Animation Platform)** library. It attempts to detect a global `window.gsap` instance. If not found, it automatically attempts to load `gsap.min.js` from the project's local root directory.

### GSAP Tweening Action

You can animate layout properties using either the preset `Tween property` action or the freeform `Tween property (custom)` action.

-   **Auto-Fix Translation Coordinate Conversion:** If you specify a property of `left` or `top`, the system automatically maps the property to hardware-accelerated 2D translations (`x` and `y`). This prevents sub-pixel layout rendering artifacts and guarantees smooth 60fps performance on mobile devices.

-   **Value Offsets:** Supports absolute targeting values (such as `100` or `0.5`) as well as relative string modifications (such as `+=50` or `-=20`).

-   **Tween Direction Modes:** Supports both **To** (interpolates from current status to target coordinates) and **From** (snaps instantly to target coordinates and interpolates back to initial status).

-   **Conflict Prevention:** All tweens are built with `overwrite: "auto"`. This safely halts and overrides any active animations on a property if a new tween starts, preventing conflicting animation cycles.

### Presets and Custom Easing Options

The preset dropdown maps index values to classic high-quality animation curves:

```
Index 0  : power2.out           (Smooth Standard)
Index 1  : expo.out             (Sharp Snap)
Index 2  : back.out(1.7)        (Juicy Pop)
Index 3  : elastic.out(1, 0.3)  (Rubber Band)
Index 4  : bounce.out           (Heavy Thud)
Index 5  : steps(8)             (Retro Step)
Index 6  : power4.inOut         (Dramatic Cinematic)
Index 7  : elastic.out(2.5, 0.1)(Vibrate / Screen Shake)
Index 8  : circ.out             (Slow-Mo Reveal)
Index 9  : back.in(1.7)         (Anticipate / Pull Back)
Index 10 : circ.inOut           (Ice Slide)
Index 11 : none                 (Linear Constant)

```

Custom tweens allow you to pass any valid GSAP easing string (e.g., `"back.out(4)"` or `"rough"`).

### Typewriter Effect

The `Typewriter text` action provides an authentic text-typing reveal for containers:

1.  Applies the temporary CSS class `gsap-typewriter-container` and sets `data-is-animating="true"` on the element to prevent universal variable syncs from overwriting the text.

2.  Initializes an internal numeric tween proxy ranging from `0` to the length of the target string.

3.  On update, it updates the element's raw text content: `target.textContent = newText.substring(0, Math.ceil(proxy.count))`.

4.  Once completed, it removes the animation lock to resume normal data binding.

6\. Events, Conditions, & Expressions Reference
-----------------------------------------------

```
 ┌──────────────────────────────────────────────────────────────┐
 │                      CONDITIONS (Triggers)                   │
 ├──────────────────────────────────────────────────────────────┤
 │  [0] On button clicked  ──► Fired by [data-c2-id] click      │
 │  [1] On sound triggered ──► Fired by hover / click attributes │
 │  [2] On focus gained    ──► Fired when input focus is active │
 │  [3] On focus lost      ──► Fired when input focus is cleared│
 └──────────────────────────────────────────────────────────────┘

```

### Conditions

-   **`OnButtonClicked` (ID: 0, Category: "Menu")**

    -   Triggered when the user clicks an HTML element marked with the `data-c2-id` attribute.

-   **`OnSoundTriggered` (ID: 1, Category: "Sound")**

    -   Fires when an interactive hover or click sound action is performed.

-   **`OnFocusGained` (ID: 2, Category: "Focus")**

    -   Fires when any interactive element inside the menu gains focus.

-   **`OnFocusLost` (ID: 3, Category: "Focus")**

    -   Fires when an interactive element loses focus.

### Expressions

-   **`ClickedID` (ID: 0, Return: String)**

    -   Returns the value of the `data-c2-id` attribute of the last clicked element.

-   **`LastSFX` (ID: 1, Return: String)**

    -   Returns the name of the sound file key requested by the last hovered or clicked element.

-   **`FocusedID` (ID: 2, Return: String)**

    -   Returns the HTML `id` attribute of the element that last gained or lost focus.

-   **`IsInputActive` (ID: 3, Return: Number)**

    -   Returns `1` if a text field or form input element is currently focused (useful for pausing player movement controls globally), otherwise returns `0`.

7\. Sound & Interaction Bridge
------------------------------

To keep your visual design completely decoupled from your core event sheets, the HTML Menu plugin delegates interactive sound cues back to Construct 2 using attributes:

```
<!-- Hover and Click Sounds defined within HTML Markup -->
<button class="menu-btn"
        data-c2-id="start_game"
        data-sfx-hover="btn_hover_sfx"
        data-sfx-click="btn_confirm_sfx">
  START GAME
</button>

```

### Execution Flow

1.  **Interaction:** The user moves their pointer over the button or clicks it.

2.  **Capture:** The plugin's event listeners intercept `mousedown` (for click sounds) or `mouseenter` (for hover sounds).

3.  **Assignment:** The plugin updates the internal `this.lastSFX` variable with the value of the attribute (`btn_hover_sfx` or `btn_confirm_sfx`).

4.  **Trigger:** The plugin fires the `OnSoundTriggered` condition in Construct 2.

5.  **Playback:** In your Construct 2 Event Sheet, you play the sound using your audio system:

```
+ HTMLMenu: On sound triggered
└── Audio: Play Sound (HTMLMenu.LastSFX) tag "" (not looping)

```

8\. Setup & Best Practices
--------------------------

### Step-by-Step Installation

1.  Save `edittime.js` and `runtime.js` into your Construct 2 directory at:

    `Construct 2\exporters\html5\plugins\HTMLMenu\`

2.  Place `gsap.min.js` alongside your custom HTML and CSS files inside your Construct 2 project. Right-click the **Files** folder in the Project Bar, select **Import Files**, and import your resources:

    -   `menu.html`

    -   `style.css`

    -   `gsap.min.js`

### Best Practices for Designing Menus

-   **Use CSS Flexbox/Grid:** Make sure your CSS layouts are responsive. Use relative units (like `%`, `vh`, `vw`, or `rem`) rather than fixed pixels so that the menu scales correctly along with the game canvas on different devices.

-   **Keep Class Names Unique:** Use clear prefixes for your CSS classes (e.g., `.c2-menu-btn` instead of `.btn`) to prevent conflict with other stylesheets or Construct 2's default export styling.

-   **Leverage GSAP classes:** Take advantage of GSAP styling inside your CSS:

    ```
    /* Add a transition to make typewriter carets blink */
    .gsap-typewriter-container::after {
      content: '|';
      animation: blink 0.8s infinite;
    }
    @keyframes blink {
      50% { opacity: 0; }
    }

    ```