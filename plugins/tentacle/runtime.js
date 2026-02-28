// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
// *** CHANGE THE PLUGIN ID HERE *** - must match the "id" property in edittime.js
//          vvvvvvvvvv
cr.plugins_.Tentacle = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Tentacle.prototype;
		
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
		if (this.is_family) return;

		this.texture_img = new Image();
		this.texture_img.src = this.texture_file;
		this.runtime.wait_for_textures.push(this.texture_img);

		this.texture = null;
	};

	/////////////////////////////////////
	// Instance class
	pluginProto.Instance = function(type)
	{
		this.type = type;
		this.runtime = type.runtime;
		
		this.segments = [];
		this.quad = new cr.quad();
		this.rcTex = new cr.rect(0, 0, 1, 1);
	};
	
	var instanceProto = pluginProto.Instance.prototype;

	// called whenever an instance is created
	instanceProto.onCreate = function()
	{	
		this.segment_count = this.properties[0];
		this.segment_length = this.properties[1];
		this.start_width = this.properties[2];
		this.end_width = this.properties[3];
		this.gravity = this.properties[4];
		this.damping = this.properties[5];
		this.constraint_iterations = this.properties[6];
		this.uv_mode = this.properties[7]; // 0=Stretch, 1=Tile
		this.wave_amount = this.properties[8];
		this.wave_speed = this.properties[9];
		this.wave_freq = this.properties[10];

		this.wave_time = 0;
		this.is_moving = false;

		if (this.segments.length !== this.segment_count)
		{
			this.segments.length = 0;
			var i, seg;
			for (i = 0; i < this.segment_count; i++)
			{
				seg = {};
				seg.x = this.x - (i * this.segment_length * Math.cos(this.angle));
				seg.y = this.y - (i * this.segment_length * Math.sin(this.angle));
				seg.oldx = seg.x;
				seg.oldy = seg.y;
				seg.width = cr.lerp(this.start_width, this.end_width, i / (this.segment_count - 1));
				this.segments.push(seg);
			}
		}
		
		this.runtime.tickMe(this);
	};

	instanceProto.tick = function()
	{
		var dt = this.runtime.getDt(this.inst);
		if (dt === 0) return;

		this.wave_time += dt * this.wave_speed;

		this.updatePhysics(dt);
		this.applyConstraints();
		this.applySineWave();
		this.runtime.redraw = true;
	};

	// called whenever an instance is destroyed
	// note the runtime may keep the object after this call for recycling; be sure
	// to release/recycle/reset any references to other objects in this function.
	instanceProto.onDestroy = function ()
	{
	};
	
	// called when saving the full state of the game
	instanceProto.saveToJSON = function ()
	{
		// return a Javascript object containing information about your object's state
		// note you MUST use double-quote syntax (e.g. "property": value) to prevent
		// Closure Compiler renaming and breaking the save format
		var segs = [];
		for (var i = 0; i < this.segment_count; i++)
		{
			segs.push([this.segments[i].x, this.segments[i].y, this.segments[i].oldx, this.segments[i].oldy]);
		}

		return {
			"segs": segs
		};
	};
	
	// called when loading the full state of the game
	instanceProto.loadFromJSON = function (o)
	{
		// load from the state previously saved by saveToJSON
		var segs = o["segs"];
		this.segment_count = segs.length;
		this.segments.length = this.segment_count;

		for (var i = 0; i < this.segment_count; i++)
		{
			this.segments[i] = {};
			this.segments[i].x = segs[i][0];
			this.segments[i].y = segs[i][1];
			this.segments[i].oldx = segs[i][2];
			this.segments[i].oldy = segs[i][3];
		}
	};

	instanceProto.updatePhysics = function(dt)
	{
		var i, seg, vx, vy;
		var total_vel_sq = 0;

		for (i = 1; i < this.segment_count; i++)
		{
			seg = this.segments[i];
			vx = (seg.x - seg.oldx) * this.damping;
			vy = (seg.y - seg.oldy) * this.damping;

			total_vel_sq += vx * vx + vy * vy;

			seg.oldx = seg.x;
			seg.oldy = seg.y;

			seg.x += vx;
			seg.y += vy + (this.gravity * dt);
		}

		this.is_moving = total_vel_sq > 0.1;
	};

	instanceProto.applyConstraints = function()
	{
		this.segments[0].x = this.x;
		this.segments[0].y = this.y;

		var i, j, seg1, seg2, dx, dy, dist, diff, offX, offY;

		for (j = 0; j < this.constraint_iterations; j++)
		{
			for (i = 0; i < this.segment_count - 1; i++)
			{
				seg1 = this.segments[i];
				seg2 = this.segments[i+1];

				dx = seg2.x - seg1.x;
				dy = seg2.y - seg1.y;
				dist = Math.sqrt(dx * dx + dy * dy);

				if (dist > this.segment_length)
				{
					diff = (this.segment_length - dist) / dist;
					offX = dx * diff * 0.5;
					offY = dy * diff * 0.5;

					seg2.x += offX;
					seg2.y += offY;
					
					// Pin base segment
					if (i > 0)
					{
						seg1.x -= offX;
						seg1.y -= offY;
					}
				}
			}
		}
	};

	instanceProto.applySineWave = function()
	{
		if (this.wave_amount === 0) return;

		var i, seg1, seg2, angle, dx, dy, wave_offset;
		for (i = 0; i < this.segment_count - 1; i++)
		{
			seg1 = this.segments[i];
			seg2 = this.segments[i+1];

			dx = seg2.x - seg1.x;
			dy = seg2.y - seg1.y;
			angle = Math.atan2(dy, dx);

			wave_offset = Math.sin(this.wave_time + (i * this.wave_freq)) * this.wave_amount;

			if (i > 0) // Don't move base
			{
				seg1.x += Math.cos(angle + Math.PI / 2) * wave_offset;
				seg1.y += Math.sin(angle + Math.PI / 2) * wave_offset;
			}
		}
	};

	// only called if a layout object - draw to a canvas 2D context
	instanceProto.draw = function(ctx)
	{
		// Not used, WebGL only
	};
	
	// only called if a layout object in WebGL mode - draw to the WebGL context
	instanceProto.drawGL = function (glw)
	{
		if (!this.type.texture)
		{
			this.type.texture = glw.loadTexture(this.type.texture_img, true, this.runtime.linearSampling);
		}
		glw.setTexture(this.type.texture);
		glw.setOpacity(this.opacity);

		if (this.segment_count < 2) return;

		var i, p1, p2, w1, w2, dx, dy, len, p1x, p1y, p2x, p2y;

		for (i = 0; i < this.segment_count - 1; i++)
		{
			p1 = this.segments[i];
			p2 = this.segments[i+1];
			w1 = p1.width / 2;
			w2 = p2.width / 2;

			dx = p2.x - p1.x;
			dy = p2.y - p1.y;
			len = Math.sqrt(dx * dx + dy * dy);
			if (len === 0) continue;

			p1x = -dy / len;
			p1y = dx / len;

			this.quad.tlx = p1.x + p1x * w1; this.quad.tly = p1.y + p1y * w1;
			this.quad.trx = p2.x + p1x * w2; this.quad.try_ = p2.y + p1y * w2;
			this.quad.brx = p2.x - p1x * w2; this.quad.bry = p2.y - p1y * w2;
			this.quad.blx = p1.x - p1x * w1; this.quad.bly = p1.y - p1y * w1;

			var u1 = 0, u2 = 1;
			if (this.uv_mode === 0) // Stretch
			{
				u1 = i / (this.segment_count - 1);
				u2 = (i + 1) / (this.segment_count - 1);
			}
			this.rcTex.set(u1, 0, u2, 1);
			
			glw.quadTex(this.quad.tlx, this.quad.tly,
					   this.quad.trx, this.quad.try_,
					   this.quad.brx, this.quad.bry,
					   this.quad.blx, this.quad.bly,
					   this.rcTex);
		}
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

	function circlepart_intersects_rect(c, r) {
		var testX = c.x;
		var testY = c.y;

		if (c.x < r.l) testX = r.l;
		else if (c.x > r.r) testX = r.r;
		if (c.y < r.t) testY = r.t;
		else if (c.y > r.b) testY = r.b;

		var distX = c.x - testX;
		var distY = c.y - testY;
		var distanceSq = (distX * distX) + (distY * distY);

		return distanceSq <= (c.radius * c.radius);
	}

	Cnds.prototype.OnSegmentCollision = function (obj)
	{
		if (!obj) return false;

		var sol = obj.getCurrentSol();
		var instances = sol.getObjects();
		if (instances.length === 0) return false;

		var l = instances.length;
		var i, j, inst, segment;
		var triggered = false;
		var circle = {x:0, y:0, radius:0};

		for (j = 1; j < this.segment_count; ++j)
		{
			segment = this.segments[j];
			segment.width = cr.lerp(this.start_width, this.end_width, j / (this.segment_count - 1));
			circle.x = segment.x;
			circle.y = segment.y;
			circle.radius = segment.width / 2;

			for (i = 0; i < l; ++i)
			{
				inst = instances[i];
				inst.update_bbox();
				if (circlepart_intersects_rect(circle, inst.bbox))
				{
					triggered = true;
					this.runtime.pushCopySol(sol);
					sol.select_all = false;
					sol.instances.length = 1;
					sol.instances[0] = inst;
					
					this.runtime.getCurrentEventStack().current_event.retrigger();

					this.runtime.popSol(sol);
				}
			}
		}

		return false; // Triggers are fired inside the loop
	};

	Cnds.prototype.IsMoving = function()
	{
		return this.is_moving;
	};

	Cnds.prototype.IsWithinDistanceOfTip = function(x, y, dist)
	{
		var tip = this.segments[this.segment_count - 1];
		return cr.distanceTo(tip.x, tip.y, x, y) <= dist;
	};
	
	pluginProto.cnds = new Cnds();
	
	//////////////////////////////////////
	// Actions
	function Acts() {};

	Acts.prototype.SetStartWidth = function(w) { this.start_width = w; };
	Acts.prototype.SetEndWidth = function(w) { this.end_width = w; };
	Acts.prototype.SetGravity = function(g) { this.gravity = g; };
	Acts.prototype.SetTilingMode = function(m) { this.uv_mode = m; };

	Acts.prototype.SetTipPosition = function(x, y)
	{
		if (this.segment_count > 0)
		{
			var tip = this.segments[this.segment_count - 1];
			tip.x = x;
			tip.y = y;
		}
	};

	Acts.prototype.ApplyImpulseToSegment = function(index, force, angle)
	{
		index = Math.floor(index);
		if (index <= 0 || index >= this.segment_count) return;

		var seg = this.segments[index];
		var rad = cr.to_radians(angle);
		seg.oldx -= Math.cos(rad) * force;
		seg.oldy -= Math.sin(rad) * force;
	};
	
	pluginProto.acts = new Acts();
	
	//////////////////////////////////////
	// Expressions
	function Exps() {};

	Exps.prototype.SegmentX = function(ret, index)
	{
		index = Math.floor(index);
		if (index < 0 || index >= this.segment_count)
			ret.set_float(0);
		else
			ret.set_float(this.segments[index].x);
	};

	Exps.prototype.SegmentY = function(ret, index)
	{
		index = Math.floor(index);
		if (index < 0 || index >= this.segment_count)
			ret.set_float(0);
		else
			ret.set_float(this.segments[index].y);
	};

	Exps.prototype.TotalLength = function(ret)
	{
		ret.set_float((this.segment_count - 1) * this.segment_length);
	};

	Exps.prototype.SegmentCount = function(ret)
	{
		ret.set_int(this.segment_count);
	};
	
	pluginProto.exps = new Exps();

}());