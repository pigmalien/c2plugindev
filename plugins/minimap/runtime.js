// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.MiniMapPro = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.MiniMapPro.prototype;
		
	pluginProto.Type = function(plugin)
	{
		this.plugin = plugin;
		this.runtime = plugin.runtime;
	};

	var typeProto = pluginProto.Type.prototype;
	typeProto.onCreate = function()
	{
	};

	pluginProto.Instance = function(type)
	{
		this.type = type;
		this.runtime = type.runtime;
	};
	
	var instanceProto = pluginProto.Instance.prototype;

	instanceProto.onCreate = function()
	{
		// [Inference] Construct 2 prepends properties like "Initial Visibility" and "Opacity" 
		// when pf_appearance_aces is set. We calculate the offset based on the plugin flags.
		var hasAppearance = !!(this.type.plugin.settings_flags & cr.pf_appearance_aces);
		var offset = hasAppearance ? 2 : 0;

		if (this.properties.length < offset + 1) offset = 0;
		
		this.mapScale = (this.properties.length > offset) ? this.properties[offset] : 0.1;
		this.displayShape = (this.properties.length > offset + 1) ? this.properties[offset + 1] : 0; // 0=Rect, 1=Circle
		
		this.scrollX = 0;
		this.scrollY = 0;
		this.scrollObj = null;
		
		this.trackedPrototypes = []; // Stores {proto, size, color}
		
		this.lastWidth = 0;
		this.lastHeight = 0;
		this.uidOverrides = {};      // Stores {uid: {r, g, b, blink}}
		this.instanceState = {};     // For OnObjectEntered tracking {uid: wasInside}
		this.instanceReached = {};   // For OnObjectReached tracking {uid: wasReached}
		this.trigger_inst = null;    // Temporary storage for picking in triggers

		// WebGL Resources
		this.fbo = null;
		this.fboTex = null;

		this.initializedGL = false;
	};
	
	instanceProto.onDestroy = function ()
	{
		var gl = this.runtime.gl;
		if (gl && this.fbo) {
			gl.deleteFramebuffer(this.fbo);
			if (this.fboTex && this.runtime.glwrap)
				this.runtime.glwrap.deleteTexture(this.fboTex);
		}
	};

	instanceProto.initGL = function(glw) {
		var gl = glw.gl;
		if (!gl) return;
		
		// [Inference] WebGL texture dimensions must be non-zero integers. 
		// Using Math.floor to ensure valid allocation.
		var w = Math.floor(this.width);
		var h = Math.floor(this.height);
		if (w <= 0 || h <= 0) return;

		// [Inference] Cleanup existing resources if we are re-initializing (e.g., on resize)
		if (this.fbo) {
			gl.deleteFramebuffer(this.fbo);
			if (this.fboTex) glw.deleteTexture(this.fboTex);
		}

		// [Inference] Use 'true' for the four_byte parameter to ensure a 32-bit RGBA texture.
		// This is critical for FBOs to correctly store the alpha and color data from gl.clear operations.
		this.fboTex = glw.createEmptyTexture(w, h, this.runtime.linearSampling, true);
		if (!this.fboTex) return;

		this.fbo = gl.createFramebuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.fboTex, 0);
		
		// Check completeness to prevent "Framebuffer must be complete" warnings
		var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
		if (status !== gl.FRAMEBUFFER_COMPLETE) {
			console.warn("MiniMapPro: Framebuffer incomplete (status: " + status + ")");
			this.initializedGL = false;
			return;
		} else {
			this.initializedGL = true;
		}
		
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		this.lastWidth = this.width;
		this.lastHeight = this.height;
	};
	instanceProto.saveToJSON = function ()
	{
		return { "scale": this.mapScale, "shape": this.displayShape };
	};
	
	instanceProto.loadFromJSON = function (o)
	{
		if (typeof o["scale"] !== "undefined")
			this.mapScale = o["scale"];
		if (typeof o["shape"] !== "undefined")
			this.displayShape = o["shape"];
	};
	
	instanceProto.draw = function(ctx)
	{
		// [Inference] Background color is removed; Canvas 2D fallback is now 
		// fully transparent to match WebGL behavior.
	};
	
	instanceProto.drawGL = function (glw)
	{
		var gl = glw.gl;
		var runtime = this.runtime;

		// [Inference] Force re-initialization if the object dimensions have changed in the layout.
		var w = Math.floor(this.width);
		var h = Math.floor(this.height);
		if (w <= 0 || h <= 0) return;

		if (!this.initializedGL || this.lastWidth !== w || this.lastHeight !== h) {
			this.initGL(glw);
		}

		// [Inference] If we are drawing, we must ensure the quad is up to date with the object position
		this.update_bbox();
		var q = this.bquad;
		
		if (!this.initializedGL || !this.fbo) return;

		// Coordinate Mapping: Center view on scroll target
		if (this.scrollObj) {
			this.scrollX = this.scrollObj.x;
			this.scrollY = this.scrollObj.y;
		} else {
			this.scrollX = runtime.running_layout.scrollX;
			this.scrollY = runtime.running_layout.scrollY;
		}

		// 1. Prepare FBO
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
		gl.viewport(0, 0, w, h);
		
		// [Inference] Ensure all color channels are writable and scissor test is disabled
		// before clearing the FBO background. This prevents interference from previous
		// rendering states in Construct 2's engine.
		gl.disable(gl.SCISSOR_TEST);
		gl.colorMask(true, true, true, true);
		
		// [Inference] Background color removed. Clearing with 0 alpha creates a 
		// transparent FBO, allowing the map to act as an overlay.
		gl.clearColor(0, 0, 0, 0);
		gl.clear(gl.COLOR_BUFFER_BIT);

		// 2. Batch Objects via Scissor-Clear
		var self = this;
		var centerX = w / 2;
		var centerY = h / 2;
		var radius = Math.min(w, h) / 2;
		var radiusSq = radius * radius;

		var blinkCycle = (Math.floor(runtime.kahanTime.sum * 5) % 2 === 0);

		gl.enable(gl.SCISSOR_TEST);

		this.trackedPrototypes.forEach(function(t) {
			var instances = t.proto.instances;

			for (var i = 0; i < instances.length; i++) {
				var inst = instances[i];
				
				// High Perf: Immediate Distance Culling (10k pixel threshold)
				var dx = inst.x - self.scrollX;
				var dy = inst.y - self.scrollY;
				if (Math.abs(dx) > 10000 || Math.abs(dy) > 10000) continue;

				// Coordinate Mapping
				var mapX = centerX + (dx * self.mapScale);
				var mapY = centerY + (dy * self.mapScale);

				var dx_center = mapX - centerX;
				var dy_center = mapY - centerY;
				var distSq = dx_center * dx_center + dy_center * dy_center;

				// Trigger: On Object Entered Map
				var isInside = false;
				if (self.displayShape === 0) { // Rectangle
					isInside = (mapX >= 0 && mapX <= w && mapY >= 0 && mapY <= h);
				} else { // Circle
					isInside = (distSq <= radiusSq);
				}

				if (isInside && !self.instanceState[inst.uid]) {
					self.trigger_inst = inst;
					self.runtime.trigger(cr.plugins_.MiniMapPro.prototype.cnds.OnObjectEntered, self);
				}
				self.instanceState[inst.uid] = isInside;

				if (!isInside) continue;

				// Trigger: On Object Reached (Proximity to center)
				var isReached = (distSq < 4); // Within 2 pixels of center
				if (isReached && !self.instanceReached[inst.uid]) {
					self.trigger_inst = inst;
					self.runtime.trigger(cr.plugins_.MiniMapPro.prototype.cnds.OnObjectReached, self);
				}
				self.instanceReached[inst.uid] = isReached;

				// Local overrides (UID based)
				var override = self.uidOverrides[inst.uid];
				if (override && override.blink && !blinkCycle) continue;

				var bR = (override && typeof override.r !== "undefined" ? override.r : t.r) / 255;
				var bG = (override && typeof override.g !== "undefined" ? override.g : t.g) / 255;
				var bB = (override && typeof override.b !== "undefined" ? override.b : t.b) / 255;
				var blipSize = (override && typeof override.size !== "undefined" ? override.size : t.size);

				// [Inference] WebGL Scissor uses bottom-left origin. 
				// Since glw.quad applies a vertical flip when drawing FBOs to the screen,
				// we use the mapY directly to ensure Down in world = Down on Map.
				var s = blipSize;
				var sx = Math.floor(mapX - (s / 2));
				var sy = Math.floor(mapY - (s / 2));

				gl.scissor(sx, sy, s, s);
				gl.clearColor(bR, bG, bB, 1);
				gl.clear(gl.COLOR_BUFFER_BIT);
			}
		});

		// 3. Final Blit to Screen - CRITICAL STATE RESTORATION
		gl.disable(gl.SCISSOR_TEST);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		
		gl.colorMask(true, true, true, true);
		gl.clearColor(0, 0, 0, 0);

		// [Inference] Use the wrapper's dimensions for restoration. This handles 
		// High-DPI displays correctly, whereas runtime.canvas.width/height 
		// only returns the CSS pixel size.
		gl.viewport(0, 0, glw.width, glw.height);

		glw.setOpacity(this.opacity);
		glw.setTexture(this.fboTex);
		glw.quad(q.tlx, q.tly, q.trx, q.try_, q.brx, q.bry, q.blx, q.bly);
	};
	
	/**BEGIN-PREVIEWONLY**/
	instanceProto.getDebuggerValues = function (propsections)
	{
		// Append to propsections any debugger sections you want to appear.
		// Each section is an object with two members: "title" and "properties".
		// "properties" is an array of individual debugger properties to display
		// with their name and value, and some other optional settings.
		propsections.push({
			"title": "Mini Map Pro",
			"properties": [
				{"name": "Map Scale", "value": this.mapScale}
			]
		});
	};
	/**END-PREVIEWONLY**/

	function Cnds() {};
	Cnds.prototype.OnObjectEntered = function (obj) 
	{ 
		if (!obj || !this.trigger_inst) return false;

		// [Inference] Manually filtering the SOL ensures that "On Object Entered" 
		// only executes for the specific object type and instance that triggered it.
		var is_match = (obj.is_family) ? (this.trigger_inst.type.families.indexOf(obj) !== -1) : (this.trigger_inst.type === obj);
		if (!is_match) return false;

		var sol = obj.getCurrentSol();
		sol.select_all = false;
		sol.instances.length = 0;
		sol.instances.push(this.trigger_inst);
		return true; 
	};
	Cnds.prototype.OnObjectReached = function (obj) 
	{ 
		if (!obj || !this.trigger_inst) return false;
		var is_match = (obj.is_family) ? (this.trigger_inst.type.families.indexOf(obj) !== -1) : (this.trigger_inst.type === obj);
		if (!is_match) return false;

		var sol = obj.getCurrentSol();
		sol.select_all = false;
		sol.instances.length = 0;
		sol.instances.push(this.trigger_inst);
		return true; 
	};
	
	pluginProto.cnds = new Cnds();
	
	function Acts() {};
	Acts.prototype.AddTracking = function (objtype, size, r, g, b)
	{
		if (!objtype) return;

		// If the name refers to a Family, track all its member object types
		if (objtype.is_family) {
			var members = objtype.members;
			for (var i = 0; i < members.length; i++) {
				this.trackedPrototypes.push({proto: members[i], size: size, r: r, g: g, b: b});
			}
		} else {
			// Otherwise, just track the single object type
			this.trackedPrototypes.push({proto: objtype, size: size, r: r, g: g, b: b});
		}
	};

	Acts.prototype.UpdateIcon = function (uid, r, g, b, blink)
	{
		this.uidOverrides[uid] = { r: r, g: g, b: b, blink: (blink === 1) };
	};

	Acts.prototype.RemoveIcon = function (uid)
	{
		if (this.uidOverrides[uid]) delete this.uidOverrides[uid];
	};

	Acts.prototype.ScrollTo = function (mode, obj) 
	{
		if (mode === 0) this.scrollObj = null;
		else this.scrollObj = obj.getFirstPicked();
	};

	Acts.prototype.SetDisplayShape = function (shape)
	{
		this.displayShape = shape;
		this.runtime.redraw = true;
	};
	
	pluginProto.acts = new Acts();
	
	function Exps() {};
	Exps.prototype.MapScale = function (ret) { ret.set_float(this.mapScale); };
	
	pluginProto.exps = new Exps();
}());