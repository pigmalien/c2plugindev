// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.LightningStrike = function (runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.LightningStrike.prototype;

	/////////////////////////////////////
	// Object type
	pluginProto.Type = function (plugin)
	{
		this.plugin = plugin;
		this.runtime = plugin.runtime;
	};

	pluginProto.Type.prototype.onCreate = function () {};

	/////////////////////////////////////
	// Instance
	pluginProto.Instance = function (type)
	{
		this.type = type;
		this.runtime = type.runtime;

		this.lines = [];
		this.timer = 0;
	};

	var instanceProto = pluginProto.Instance.prototype;

	/////////////////////////////////////
	// Instance creation
	instanceProto.onCreate = function ()
	{
		this.displacement = this.properties[0];
		this.detail       = this.properties[1];
		this.duration     = this.properties[2];
		
		// Robust color parsing (handles both integer COLORREF and "rgb()" string)
		var c = this.properties[3];
		if (typeof c === "string") {
			var parts = c.match(/\d+/g);
			if (parts && parts.length >= 3) {
				this.r = parseInt(parts[0], 10) / 255;
				this.g = parseInt(parts[1], 10) / 255;
				this.b = parseInt(parts[2], 10) / 255;
			} else {
				this.r = 1; this.g = 1; this.b = 1;
			}
		} else {
			this.r = cr.GetRValue(c) / 255;
			this.g = cr.GetGValue(c) / 255;
			this.b = cr.GetBValue(c) / 255;
		}

		this.width        = this.properties[4];

		this.branchChance = 0;
		
		this.runtime.tickMe(this);
	};
	
	instanceProto.onDestroy = function ()
	{
	};

	instanceProto.saveToJSON = function ()
	{
		return { "bc": this.branchChance };
	};

	instanceProto.loadFromJSON = function (o)
	{
		this.branchChance = o["bc"];
	};

	/////////////////////////////////////
	// Canvas2D (unused)
	instanceProto.draw = function (ctx) {};

	/////////////////////////////////////
	// WebGL draw (Construct 2)
	instanceProto.drawGL = function (glw)
	{
		if (this.timer <= 0 || !this.lines.length)
			return;

		glw.setOpacity(this.opacity);
		
		glw.setColorFillMode(this.r, this.g, this.b, this.opacity);

		var halfW = this.width / 2;

		for (var i = 0; i < this.lines.length; i++)
		{
			var l = this.lines[i];
			var x1 = l.x1;
			var y1 = l.y1;
			var x2 = l.x2;
			var y2 = l.y2;

			var dx = x2 - x1;
			var dy = y2 - y1;
			var len = Math.sqrt(dx * dx + dy * dy);
			
			if (len === 0) continue;

			// Calculate normal vector for thickness
			var nx = (dy / len) * halfW;
			var ny = -(dx / len) * halfW;

			// Draw quad (TL, TR, BR, BL)
			glw.quad(x1 + nx, y1 + ny,
					 x2 + nx, y2 + ny,
					 x2 - nx, y2 - ny,
					 x1 - nx, y1 - ny);
		}
	};

	/////////////////////////////////////
	// Tick
	instanceProto.tick = function ()
	{
		if (this.timer > 0)
		{
			this.timer -= this.runtime.getDt(this);
			
			// Flicker effect
			if (this.timer > 0) {
				this.generateLightning(this.x, this.y, this.x2, this.y2, this.displacement);
			}

			if (this.timer < 0) {
				this.timer = 0;
			}

			this.runtime.redraw = true;
		}
	};

	/////////////////////////////////////
	// RNG
	instanceProto.srand = function (seed)
	{
		this.r_seed = seed;
	};

	instanceProto.rand = function ()
	{
		this.r_seed = (this.r_seed * 9301 + 49297) % 233280;
		return this.r_seed / 233280;
	};

	/////////////////////////////////////
	// Lightning generation
	instanceProto.generateLightning = function (x1, y1, x2, y2, displacement)
	{
		this.lines.length = 0;

		this.srand(Math.floor(Math.random() * 233280));

		this._recurse(x1, y1, x2, y2, displacement, this.detail);
	};

	instanceProto._recurse = function (x1, y1, x2, y2, d, i)
	{
		if (i <= 0)
		{
			this.lines.push({
				x1: x1, y1: y1,
				x2: x2, y2: y2
			});
			return;
		}

		var mx = (x1 + x2) * 0.5 + (this.rand() - 0.5) * d;
		var my = (y1 + y2) * 0.5 + (this.rand() - 0.5) * d;

		this._recurse(x1, y1, mx, my, d * 0.5, i - 1);
		this._recurse(mx, my, x2, y2, d * 0.5, i - 1);

		if (this.branchChance > 0 && this.rand() < this.branchChance)
		{
			var angle = Math.atan2(y2 - y1, x2 - x1);
			angle += (this.rand() - 0.5);
			var dist = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)) * 0.7;

			var bx = mx + Math.cos(angle) * dist;
			var by = my + Math.sin(angle) * dist;

			this._recurse(mx, my, bx, by, d * 0.5, i - 1);
		}
	};

	/////////////////////////////////////
	// Actions
	function Acts() {}

	Acts.prototype.StrikeTowards = function (angle, dist)
	{
		var rad = cr.to_radians(angle);

		this.x2 = this.x + Math.cos(rad) * dist;
		this.y2 = this.y + Math.sin(rad) * dist;

		this.generateLightning(this.x, this.y, this.x2, this.y2, this.displacement);
		this.timer = this.duration;

		this.runtime.redraw = true;
	};

	Acts.prototype.EnableBranching = function (chance)
	{
		this.branchChance = cr.clamp(chance, 0, 1);
	};

	Acts.prototype.SetColor = function (c)
	{
		if (typeof c === "string") {
			var parts = c.match(/\d+/g);
			if (parts && parts.length >= 3) {
				this.r = parseInt(parts[0], 10) / 255;
				this.g = parseInt(parts[1], 10) / 255;
				this.b = parseInt(parts[2], 10) / 255;
			} else {
				this.r = 1; this.g = 1; this.b = 1;
			}
		} else {
			this.r = cr.GetRValue(c) / 255;
			this.g = cr.GetGValue(c) / 255;
			this.b = cr.GetBValue(c) / 255;
		}
		this.runtime.redraw = true;
	};

	Acts.prototype.SetDisplacement = function (d)
	{
		this.displacement = d;
	};

	Acts.prototype.SetDetail = function (d)
	{
		this.detail = Math.floor(d);
	};

	Acts.prototype.SetDuration = function (d)
	{
		this.duration = d;
	};

	Acts.prototype.SetWidth = function (w)
	{
		this.width = w;
		this.runtime.redraw = true;
	};

	pluginProto.acts = new Acts();
	
	function Exps() {}

	Exps.prototype.BranchChance = function (ret)
	{
		ret.set_float(this.branchChance);
	};
	
	Exps.prototype.Duration = function (ret)
	{
		ret.set_float(this.duration);
	};
	
	pluginProto.exps = new Exps();
}());
