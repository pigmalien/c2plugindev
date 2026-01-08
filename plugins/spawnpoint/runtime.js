// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

cr.plugins_.SpawnPoint = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	// Mulberry32 PRNG
	function mulberry32(a) {
		return function() {
		  var t = a += 0x6D2B79F5;
		  t = Math.imul(t ^ t >>> 15, t | 1);
		  t ^= t + Math.imul(t ^ t >>> 7, t | 61);
		  return ((t ^ t >>> 14) >>> 0) / 4294967296;
		}
	}

	// cyrb53 (string hashing function)
	function cyrb53(str, seed = 0) {
		let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
		for (let i = 0, ch; i < str.length; i++) {
			ch = str.charCodeAt(i);
			h1 = Math.imul(h1 ^ ch, 2654435761);
			h2 = Math.imul(h2 ^ ch, 1597334677);
		}
		h1 = Math.imul(h1 ^ (h1>>>16), 2246822507) ^ Math.imul(h2 ^ (h2>>>13), 3266489909);
		h2 = Math.imul(h2 ^ (h2>>>16), 2246822507) ^ Math.imul(h1 ^ (h1>>>13), 3266489909);
		return 4294967296 * (2097151 & h2) + (h1>>>0);
	};

	var pluginProto = cr.plugins_.SpawnPoint.prototype;
		
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

	instanceProto.reseed = function (seed) {
		this.seed = seed;
		if (this.seed) {
			this.random = mulberry32(cyrb53(this.seed));
		} else {
			this.random = Math.random;
		}
	};

	instanceProto.onCreate = function()
	{
		this.spawn_mode = 0; // 0 = outside area, 1 = inside area
		this.area_x = 0;
		this.area_y = 0;
		this.area_w = 100;
		this.area_h = 100;
		this.padding = 0;

		this.pointX = 0;
		this.pointY = 0;

		this.reseed(this.properties[0]);
	};

	instanceProto.onDestroy = function ()
	{
	};
	
	instanceProto.saveToJSON = function ()
	{
		return {
			"sm": this.spawn_mode,
			"ax": this.area_x,
			"ay": this.area_y,
			"aw": this.area_w,
			"ah": this.area_h,
			"p": this.padding,
			"px": this.pointX,
			"py": this.pointY,
			"seed": this.seed
		};
	};
	
	instanceProto.loadFromJSON = function (o)
	{
		this.spawn_mode = o["sm"];
		this.area_x = o["ax"];
		this.area_y = o["ay"];
		this.area_w = o["aw"];
		this.area_h = o["ah"];
		this.padding = o["p"];
		this.pointX = o["px"];
		this.pointY = o["py"];
		
		this.reseed(o["seed"]);
	};

	function Cnds() {};
	Cnds.prototype.IsSpawningOutside = function () { return this.spawn_mode === 0; };
	Cnds.prototype.IsSpawningInside = function () { return this.spawn_mode === 1; };
	Cnds.prototype.OnSetPoint = function () { return true; };
	pluginProto.cnds = new Cnds();
	
	function Acts() {};

	Acts.prototype.SetMode = function (mode) { this.spawn_mode = mode; };
	Acts.prototype.SetArea = function (x, y, w, h) { this.area_x = x; this.area_y = y; this.area_w = w; this.area_h = h; };
	Acts.prototype.SetPadding = function (padding) { this.padding = padding; };

	Acts.prototype.SetPoint = function () {
		var x = 0;
		var y = 0;

		if (this.spawn_mode === 0) { // Spawn outside area
			// Define inner "keep-out" zone, expanded by padding
			var inner_x1 = this.area_x - this.padding;
			var inner_y1 = this.area_y - this.padding;
			var inner_w = this.area_w + (this.padding * 2);
			var inner_h = this.area_h + (this.padding * 2);
			var inner_x2 = inner_x1 + inner_w;
			var inner_y2 = inner_y1 + inner_h;

			// Define outer spawn zone, expanded by padding
			var outer_x1 = inner_x1 - this.padding;
			var outer_y1 = inner_y1 - this.padding;
			var outer_x2 = inner_x2 + this.padding;
			var outer_y2 = inner_y2 + this.padding;

			const side = Math.floor(this.random() * 4);

			switch (side) {
				case 0: // Top slice
					x = this.random() * (outer_x2 - outer_x1) + outer_x1;
					y = this.random() * (inner_y1 - outer_y1) + outer_y1;
					break;
				case 1: // Bottom slice
					x = this.random() * (outer_x2 - outer_x1) + outer_x1;
					y = this.random() * (outer_y2 - inner_y2) + inner_y2;
					break;
				case 2: // Left slice
					x = this.random() * (inner_x1 - outer_x1) + outer_x1;
					y = this.random() * (inner_y2 - inner_y1) + inner_y1;
					break;
				case 3: // Right slice
					x = this.random() * (outer_x2 - inner_x2) + inner_x2;
					y = this.random() * (inner_y2 - inner_y1) + inner_y1;
					break;
			}
		} 
		else { // Spawn inside area
			x = this.random() * this.area_w + this.area_x;
			y = this.random() * this.area_h + this.area_y;
		}
		
		// Handle potential NaN results if width/height/spread are invalid
		if (isNaN(x)) x = this.area_x;
		if (isNaN(y)) y = this.area_y;

		this.pointX = x;
		this.pointY = y;
		this.runtime.trigger(cr.plugins_.SpawnPoint.prototype.cnds.OnSetPoint, this);
	};
	
	Acts.prototype.SetSeed = function (seed)
	{
		this.reseed(seed);
	};
	
	pluginProto.acts = new Acts();
	
	function Exps() {};
	Exps.prototype.PointX = function (ret) { ret.set_float(this.pointX); };
	Exps.prototype.PointY = function (ret) { ret.set_float(this.pointY); };
	pluginProto.exps = new Exps();

}());