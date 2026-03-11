// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
// *** CHANGE THE PLUGIN ID HERE *** - must match the "id" property in edittime.js
//          vvvvvvvv
cr.plugins_.HTMLMenu = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	/////////////////////////////////////
	// *** CHANGE THE PLUGIN ID HERE *** - must match the "id" property in edittime.js
	//                            vvvvvvvv
	var pluginProto = cr.plugins_.HTMLMenu.prototype;
		
	/////////////////////////////////////
	// Object type class
	pluginProto.Type = function(plugin)
	{
		this.plugin = plugin;
		this.runtime = plugin.runtime;
	};

	var typeProto = pluginProto.Type.prototype;

	// called on startup for each object type
	typeProto.onCreate = function()
	{
	};

	/////////////////////////////////////
	// Instance class
	pluginProto.Instance = function(type)
	{
		this.type = type;
		this.runtime = type.runtime;
		
		// any other properties you need, e.g...
		// this.myValue = 0;
	};
	
	var instanceProto = pluginProto.Instance.prototype;

	// called whenever an instance is created
	instanceProto.onCreate = function()
	{
		this.htmlFile = this.properties[0];
		this.cssFile = this.properties[1];
		this.visible = (this.properties[2] === 1); // 0=No, 1=Yes
		this.autoSync = (this.properties[3] === 1); // 0=No, 1=Yes
		this.twoWayBinding = (this.properties[4] === 1); // 0=No, 1=Yes
		this.activeInput = null; // For two-way binding loop prevention
		this.syncData = {}; // For "Sync from Dictionary" action
		this.lastSFX = ""; // For Sound Bridge
		this.lastClickedID = "";
		this.lastFocusedID = "";
		this.isInputActive = false; // For Key Guard
		this.interactionMode = 1; // Default to "Buttons Only"

		// Create the DOM element
		this.elem = document.createElement("div");
		this.elem.id = "c2-htmlmenu-" + this.uid;
		this.elem.style.position = "absolute"; // Necessary for z-index and positioning
		// this.elem.style.pointerEvents is now handled by SetInteractionMode
		this.elem.style.zIndex = "100"; // Ensure it's on top of the canvas
		this.elem.style.imageRendering = "pixelated"; // Ensure crisp rendering for pixel art games

		// Append to the document body to use absolute page coordinates for positioning
		document.body.appendChild(this.elem);
		this.jQueryElem = jQuery(this.elem);

		// Load external CSS file
		this.cssLink = null;
		if (this.cssFile)
		{
			this.cssLink = document.createElement("link");
			this.cssLink.rel = "stylesheet";
			this.cssLink.type = "text/css";
			this.cssLink.href = this.cssFile;
			document.getElementsByTagName('head')[0].appendChild(this.cssLink);
		}

		// Load external HTML file via AJAX
		if (this.htmlFile)
		{
			var self = this;
			
			// Define an error handler to show clear visual feedback in the layout
			var onError = function(status) {
				self.elem.style.backgroundColor = "red";
				self.elem.style.color = "white";
				self.elem.style.fontFamily = "sans-serif";
				self.elem.style.padding = "10px";
				self.elem.style.boxSizing = "border-box";
				self.elem.innerHTML = "<strong>HTMLMenu Error:</strong><br>Failed to load '" + self.htmlFile + "'.<br>Status: " + status + "<br>Check filename and ensure it's in the project 'Files' folder. Check browser console (F12) for more details.";
				console.error("HTMLMenu: Error loading '" + self.htmlFile + "'. Status: " + status);
			};

			var request = new XMLHttpRequest();
			request.open("GET", this.htmlFile, true);
			request.onload = function () {
				if (request.status >= 200 && request.status < 400) {
					self.elem.innerHTML = request.responseText;

					// Set initial interaction mode after content is loaded
					self._setInteractionModeImpl(self.interactionMode);
					
					// Tier 3: Manually execute any <script> tags found in the injected HTML
					var scripts = self.elem.getElementsByTagName("script");
					for (var i = 0; i < scripts.length; i++) {
						var script = document.createElement("script");
						if (scripts[i].src) script.src = scripts[i].src;
						else script.text = scripts[i].text;
						// Append to body to execute, then remove to keep DOM clean
						document.body.appendChild(script).parentNode.removeChild(script);
					}
				} else {
					// File found, but server returned an error (e.g. 404 Not Found, 500)
					onError(request.status);
				}
			};
			request.onerror = function () { onError("Network Error"); }; // Network errors (e.g. CORS, no connection)
			request.send();
		} else {
			// If no HTML file, still need to set interaction mode
			this._setInteractionModeImpl(this.interactionMode);
		}

		// Tier 2: JS-to-Event-Sheet Bridge (Delegated Listener)
		var self = this;
		this.jQueryElem.on("click", "[data-c2-id]", function (e) {
			e.stopPropagation(); // Prevent event from bubbling to other listeners
			self.lastClickedID = jQuery(this).attr("data-c2-id");
			self.runtime.trigger(cr.plugins_.HTMLMenu.prototype.cnds.OnButtonClicked, self);
		});
		
		// Focus Bridge (HTML -> C2)
		this.jQueryElem.on("focusin", "*", function (e) {
			var target = e.target;

			// Key Guard: check if the focused element is an input type
			if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT") {
				self.isInputActive = true;
			}

			// Ensure the focused element has an ID to report back
			if (target && target.id) {
				self.lastFocusedID = target.id;
				self.runtime.trigger(cr.plugins_.HTMLMenu.prototype.cnds.OnFocusGained, self);
			}
		});

		// Focus Lost Bridge (HTML -> C2)
		this.jQueryElem.on("focusout", "*", function (e) {
			var target = e.target;

			// Key Guard: if an input loses focus, deactivate the guard
			if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT") {
				self.isInputActive = false;
			}

			// Trigger the "On Focus Lost" condition
			self.lastFocusedID = target.id || ""; // Report the ID of the element that lost focus
			self.runtime.trigger(cr.plugins_.HTMLMenu.prototype.cnds.OnFocusLost, self);
		});

		// Key Guard: Prevent keyboard events from bubbling to C2 when an input is active
		this.jQueryElem.on("keydown", "input, textarea", function(e) {
			if (self.isInputActive) {
				e.stopPropagation();
			}
		});
		
		// Tier 5: Sound Bridge (HTML -> C2 SFX)
		// Delegated listener for click sounds. Looks for 'data-sfx-click' attribute.
		this.jQueryElem.on("mousedown", "[data-sfx-click]", function(e) {
			e.stopPropagation(); // Prevent event from bubbling up further
			self.lastSFX = jQuery(this).attr("data-sfx-click");
			self.runtime.trigger(cr.plugins_.HTMLMenu.prototype.cnds.OnSoundTriggered, self);
		});

		// Delegated listener for hover sounds. Looks for 'data-sfx-hover' attribute.
		this.jQueryElem.on("mouseenter", "[data-sfx-hover]", function(e) {
			// Stop propagation is less critical for mouseenter but good for consistency.
			e.stopPropagation();
			self.lastSFX = jQuery(this).attr("data-sfx-hover");
			self.runtime.trigger(cr.plugins_.HTMLMenu.prototype.cnds.OnSoundTriggered, self);
		});

		// Tier 4: Two-Way Data Binding (HTML -> C2)
		if (this.twoWayBinding) {
			var self = this;

			// Set a flag when an input is focused to prevent forward-sync from overwriting it while typing.
			this.jQueryElem.on("focus", "input[id], textarea[id], select[id]", function(e) {
				self.activeInput = e.target;
			});

			// On blur, clear the flag. The final value is already set by the 'input' event.
			// We use 'focusout' because it bubbles, unlike 'blur', making it suitable for delegated events.
			this.jQueryElem.on("focusout", "input[id], textarea[id], select[id]", function(e) {
				if (self.activeInput === e.target) {
					self.activeInput = null;
				}
			});

			// Listener for the actual data change.
			this.jQueryElem.on("input", "input[id], textarea[id], select[id]", function(e) {
				var target = e.target;
				var varName = target.id;
				if (!varName) return;

				// Find and update the corresponding C2 global variable.
				var gv = self.getGlobalVarByName(varName);
				if (gv) {
					var value = target.value;
					var num = Number(value); // Use stricter Number() conversion

					// Convert to number if it's a valid number string, otherwise keep as string.
					// Handle empty strings explicitly to avoid them becoming 0.
					if (value.trim() === "") {
						gv.data = ""; // C2 will treat this as 0 for number variables.
					} else if (!isNaN(num) && isFinite(num)) {
						gv.data = num;
					} else {
						gv.data = value;
					}
				}
			});
		}

		// For tracking changes to avoid unnecessary DOM updates
		this.last_visible = !this.visible;
		this.last_left = -1;
		this.last_top = -1;
		this.last_w = -1;
		this.last_h = -1;
		this.last_opacity = -1;

		this.runtime.tickMe(this);
	};
	
	// called whenever an instance is destroyed
	// note the runtime may keep the object after this call for recycling; be sure
	// to release/recycle/reset any references to other objects in this function.
	instanceProto.onDestroy = function ()
	{
		if (this.jQueryElem)
			this.jQueryElem.remove();
		this.elem = null;
		this.jQueryElem = null;

		if (this.cssLink)
			jQuery(this.cssLink).remove();
		this.cssLink = null;
	};
	
	// called when saving the full state of the game
	instanceProto.saveToJSON = function ()
	{
		return {
			// e.g.
			//"myValue": this.myValue
		};
	};
	
	// called when loading the full state of the game
	instanceProto.loadFromJSON = function (o)
	{
	};

	instanceProto._setInteractionModeImpl = function (mode) {
		this.interactionMode = mode; // 0=Full Block, 1=Buttons Only, 2=None
		
		if (!this.elem) return;

		const interactiveSelector = 'a[href], button, input, textarea, select, [data-c2-id], [data-sfx-click], [data-sfx-hover]';
		const interactiveElements = this.elem.querySelectorAll(interactiveSelector);

		if (mode === 0) { // Full Block
			this.elem.style.pointerEvents = "auto";
			// Reset children to inherit/default
			for (let i = 0; i < interactiveElements.length; i++) {
				interactiveElements[i].style.pointerEvents = "";
			}
			return;
		}
		
		// For "Buttons Only" or "None", the container itself doesn't receive pointer events.
		this.elem.style.pointerEvents = "none";

		const childPointerEvents = (mode === 1) ? "auto" : "none"; // "auto" for Buttons Only, "none" for None

		for (let i = 0; i < interactiveElements.length; i++) {
			interactiveElements[i].style.pointerEvents = childPointerEvents;
		}
	};

	instanceProto.getFocusableElements = function () {
		if (!this.elem) return [];
		// This selector is based on jQuery UI's :focusable selector, but adapted for querySelectorAll
		const focusableSelector = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
		const elements = Array.from(this.elem.querySelectorAll(focusableSelector));
		
		// Filter out elements that are not visible to the user
		return elements.filter(el => {
			// offsetParent is null for elements that are not rendered or have display: none
			return el.offsetParent !== null;
		});
	};

	/**
	 * Safely finds an element within the plugin's div and executes a callback.
	 * This is the requested "SafeUpdate" function.
	 * @param {string} elemId The ID of the element to find.
	 * @param {function(HTMLElement)} callback The function to execute with the found element.
	 * @returns {boolean} True if the element was found and the callback was executed, otherwise false.
	 */
	instanceProto.safeUpdateElement = function (elemId, callback) {
		if (!this.elem || !elemId || !callback) return false;
		const target = this.elem.querySelector("#" + elemId);
		if (target) {
			callback(target);
			return true;
		}
		return false;
	};

	/**
	 * Helper to find a C2 global variable object by its name.
	 * @param {string} name The name of the global variable.
	 * @returns {object|null} The global variable object {name, data, ...} or null if not found.
	 */
	instanceProto.getGlobalVarByName = function (name) {
		if (this.runtime.all_global_vars && this.runtime.all_global_vars.length) {
			for (var i = 0, len = this.runtime.all_global_vars.length; i < len; i++) {
				var gv = this.runtime.all_global_vars[i];
				if (gv.name === name) return gv;
			}
		}
		return null;
	};

	/**
	 * Universal Sync system. Finds elements with 'id' or 'data-sync-id' and populates them
	 * with data from C2.
	 */
	instanceProto.doUniversalSync = function () {
		if (!this.elem) return;

		// Create a key-value map of global variables for efficient lookup.
		// this.runtime.all_global_vars is the correct C2 SDK way to access them.
		var gvars_map = {};
		if (this.runtime.all_global_vars && this.runtime.all_global_vars.length) {
			for (var j = 0, len = this.runtime.all_global_vars.length; j < len; j++) {
				var gv = this.runtime.all_global_vars[j];
				gvars_map[gv.name] = gv.data;
			}
		}

		// Find all elements that can be synced
		const elements = this.elem.querySelectorAll('[id], [data-sync-id]');
		
		for (let i = 0; i < elements.length; i++) {
			const elem = elements[i];
			const syncKey = elem.getAttribute('data-sync-id') || elem.id;

			// Two-way binding: Don't sync forward to the element the user is currently typing in.
			if (elem === this.activeInput) continue;
			if (!syncKey) continue;

			let value = undefined;

			// Priority 1: Data from the "Sync from Dictionary" action.
			if (this.syncData.hasOwnProperty(syncKey)) {
				value = this.syncData[syncKey];
			}
			// Priority 2: C2 Global Variables.
			else if (gvars_map.hasOwnProperty(syncKey)) {
				value = gvars_map[syncKey];
			}

			if (value !== undefined) {
				let formattedValue = value;
				const format = elem.getAttribute('data-format');
				if (format && typeof value === 'number') {
					if (format === 'percent') {
						formattedValue = (value * 100).toFixed(0) + '%';
					} else if (!isNaN(parseFloat(format))) { // e.g. "0.00"
						const decimalPlaces = (format.split('.')[1] || '').length;
						formattedValue = value.toFixed(decimalPlaces);
					}
				}
				
				// Use .value for form elements, .innerHTML for others.
				var isInput = (elem.tagName === "INPUT" || elem.tagName === "TEXTAREA" || elem.tagName === "SELECT");
				if (isInput) {
					if (elem.value !== String(formattedValue)) {
						elem.value = formattedValue;
					}
				} else {
					if (elem.innerHTML !== String(formattedValue)) { // Simple optimization
						elem.innerHTML = formattedValue;
					}
				}
			}
		}
	};

	instanceProto.tick = function ()
	{
		// Handle visibility from C2's 'Set visible' action
		var vis = this.visible;
		if (this.last_visible !== vis) {
			this.jQueryElem.css("display", vis ? "block" : "none");
			this.last_visible = vis;
		}

		if (!vis) {
			return;
		}

		// Auto-Sync polling
		if (this.autoSync) {
			this.doUniversalSync();
		}

		// Get object's top-left and bottom-right in layout co-ordinates, accounting for hotspot
		var lx = this.x - (this.hotspotX * this.width);
		var ly = this.y - (this.hotspotY * this.height);
		var lr = lx + this.width;
		var lb = ly + this.height;

		// Convert to canvas co-ordinates
		var left = this.layer.layerToCanvas(lx, ly, true);
		var top = this.layer.layerToCanvas(lx, ly, false);
		var right = this.layer.layerToCanvas(lr, lb, true);
		var bottom = this.layer.layerToCanvas(lr, lb, false);

		// Is entirely offscreen or invisible: hide
		if (!this.layer.visible || right <= 0 || bottom <= 0 || left >= this.runtime.width || top >= this.runtime.height)
		{
			this.jQueryElem.hide();
			return;
		}

		this.jQueryElem.show();

		var canvas_offset = jQuery(this.runtime.canvas).offset();
		if (!canvas_offset) return;

		var offx = left + canvas_offset.left;
		var offy = top + canvas_offset.top;
		var w = right - left;
		var h = bottom - top;
		var opacity = this.opacity;

		// Optimization: check if anything changed to avoid DOM thrashing
		if (this.last_left === offx && this.last_top === offy && this.last_w === w && this.last_h === h && this.last_opacity === opacity) {
			return;
		}

		this.jQueryElem.offset({left: Math.round(offx), top: Math.round(offy)});
		this.jQueryElem.width(Math.round(w));
		this.jQueryElem.height(Math.round(h));

		// Cache the last values
		this.last_left = offx;
		this.last_top = offy;
		this.last_w = w;
		this.last_h = h;
		this.last_opacity = opacity;
	};
	
	// only called if a layout object - draw to a canvas 2D context
	instanceProto.draw = function(ctx)
	{
	};
	
	// only called if a layout object in WebGL mode - draw to the WebGL context
	// 'glw' is not a WebGL context, it's a wrapper - you can find its methods in GLWrap.js in the install
	// directory or just copy what other plugins do.
	instanceProto.drawGL = function (glw)
	{
	};
	
	// The comments around these functions ensure they are removed when exporting, since the
	// debugger code is no longer relevant after publishing.
	/**BEGIN-PREVIEWONLY**/
	instanceProto.getDebuggerValues = function (propsections)
	{
		// Append to propsections any debugger sections you want to appear.
		// Each section is an object with two members: "title" and "properties".
		// "properties" is an array of individual debugger properties to display
		// with their name and value, and some other optional settings.
		propsections.push({
			"title": "My debugger section",
			"properties": [
				// Each property entry can use the following values:
				// "name" (required): name of the property (must be unique within this section)
				// "value" (required): a boolean, number or string for the value
				// "html" (optional, default false): set to true to interpret the name and value
				//									 as HTML strings rather than simple plain text
				// "readonly" (optional, default false): set to true to disable editing the property
				
				// Example:
				// {"name": "My property", "value": this.myValue}
			]
		});
	};
	
	instanceProto.onDebugValueEdited = function (header, name, value)
	{
		// Called when a non-readonly property has been edited in the debugger. Usually you only
		// will need 'name' (the property name) and 'value', but you can also use 'header' (the
		// header title for the section) to distinguish properties with the same name.
		if (name === "My property")
			this.myProperty = value;
	};
	/**END-PREVIEWONLY**/

	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	
	Cnds.prototype.OnButtonClicked = function ()
	{
		return true; // It's a trigger
	};
	
	Cnds.prototype.OnFocusLost = function ()
	{
		return true; // It's a trigger
	};

	Cnds.prototype.OnSoundTriggered = function ()
	{
		return true; // It's a trigger
	};

	Cnds.prototype.OnFocusGained = function ()
	{
		return true; // It's a trigger
	};
	
	pluginProto.cnds = new Cnds();
	
	//////////////////////////////////////
	// Actions
	function Acts() {};
	
	Acts.prototype.UpdateContent = function (elemId, content)
	{
		// Use the new safeUpdateElement helper function
		const success = this.safeUpdateElement(elemId, function(element) {
			element.innerHTML = content;
		});
		
		// Re-apply interaction mode to ensure new elements adhere to the rules
		if (success) {
			this._setInteractionModeImpl(this.interactionMode);
		}

		if (!success) {
			console.warn("HTMLMenu: Element with ID '" + elemId + "' not found.");
		}
	};

	Acts.prototype.ForceSyncNow = function ()
	{
		this.doUniversalSync();
	};

	Acts.prototype.SyncFromDictionary = function (jsonString)
	{
		if (!jsonString) {
			this.syncData = {};
			return;
		}
		try {
			var parsed = JSON.parse(jsonString);
			// Handle C2's Dictionary.AsJSON format which wraps data in a "data" property
			if (parsed && parsed.c2dictionary && parsed.hasOwnProperty("data")) {
				this.syncData = parsed.data;
			} else {
				// Fallback for raw JSON objects if not from a C2 dictionary
				this.syncData = parsed;
			}
		} catch (e) {
			console.error("HTMLMenu: Invalid JSON string provided for 'Sync from Dictionary'.", e);
		}
	};

	Acts.prototype.FocusElementByID = function (elemId) {
		if (!this.elem || !elemId) return;
		const target = this.elem.querySelector("#" + elemId);
		if (target && typeof target.focus === 'function') {
			target.focus();
		}
	};

	Acts.prototype.SetInteractionMode = function (mode) {
		this._setInteractionModeImpl(mode);
	};

	Acts.prototype.ReleaseFocus = function () {
		if (!this.elem) return;
		// Check if the currently active element is a child of our menu
		if (document.activeElement && this.elem.contains(document.activeElement)) {
			document.activeElement.blur();
		}
	};

	Acts.prototype.FocusNext = function () {
		const focusable = this.getFocusableElements();
		if (focusable.length === 0) return;

		const current = document.activeElement;
		let currentIndex = focusable.indexOf(current);

		// If nothing is focused, or focused element is not in our menu, focus the first one.
		if (currentIndex === -1) {
			focusable[0].focus();
			return;
		}

		const nextIndex = (currentIndex + 1) % focusable.length;
		focusable[nextIndex].focus();
	};

	Acts.prototype.FocusPrevious = function () {
		const focusable = this.getFocusableElements();
		if (focusable.length === 0) return;

		const current = document.activeElement;
		let currentIndex = focusable.indexOf(current);

		// If nothing is focused, or focused element is not in our menu, focus the last one.
		if (currentIndex === -1) {
			focusable[focusable.length - 1].focus();
			return;
		}

		const prevIndex = (currentIndex - 1 + focusable.length) % focusable.length;
		focusable[prevIndex].focus();
	};
	
	pluginProto.acts = new Acts();
	
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	Exps.prototype.ClickedID = function (ret)
	{
		ret.set_string(this.lastClickedID);
	};
	
	Exps.prototype.LastSFX = function (ret)
	{
		ret.set_string(this.lastSFX);
	};
	
	Exps.prototype.FocusedID = function (ret)
	{
		ret.set_string(this.lastFocusedID);
	};
	
	Exps.prototype.IsInputActive = function (ret)
	{
		ret.set_int(this.isInputActive ? 1 : 0);
	};

	pluginProto.exps = new Exps();

}());