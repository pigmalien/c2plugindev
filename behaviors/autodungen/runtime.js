// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
// *** CHANGE THE BEHAVIOR ID HERE *** - must match the "id" property in edittime.js
//           vvvvvvvvvvvv
cr.behaviors.Autodungen = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	// The behavior ID must match the "id" property in edittime.js
	var behaviorProto = cr.behaviors.Autodungen.prototype;
		
	/////////////////////////////////////
	// Behavior type class
	behaviorProto.Type = function(behavior, objtype)
	{
		this.behavior = behavior;
		this.objtype = objtype;
		this.runtime = behavior.runtime;
	};
	
	var behtypeProto = behaviorProto.Type.prototype;

	behtypeProto.onCreate = function()
	{
	};

	/////////////////////////////////////
	// Behavior instance class
	behaviorProto.Instance = function(type, inst)
	{
		this.type = type;
		this.behavior = type.behavior;
		this.inst = inst;				// associated object instance to modify
		this.runtime = type.runtime;
	};
	
	var behinstProto = behaviorProto.Instance.prototype;

	behinstProto.onCreate = function()
	{
		// Properties
		this.minRoomSize = this.properties[0];
		this.maxRoomSize = this.properties[1];
		this.padding = this.properties[2];
		this.seed = this.properties[3];
		this.wallTile = this.properties[4];
		this.floorTile = this.properties[5];

		// Internal state
		this.prng = null;
		this.grid = [];
		this.rooms = [];
		this.leafNodes = [];
		this.rootNode = null;
		this.mapWidth = 0;
		this.mapHeight = 0;
		
		// Looping state
		this.loop_room_index = 0;
		
		// Internal tile types
		this.VOID = 0;
		this.WALL = 1;
		this.FLOOR = 2;
		this.ROOM = 3;

		this._setSeed(this.seed);
	};
	
	behinstProto.onDestroy = function ()
	{
		this.grid = null;
		this.rooms = null;
		this.leafNodes = null;
		this.prng = null;
		this.rootNode = null;
	};
	
	// called when saving the full state of the game
	behinstProto.saveToJSON = function ()
	{
		return {
			"seed": this.seed,
			"minrs": this.minRoomSize,
			"maxrs": this.maxRoomSize,
			"pad": this.padding,
			"w": this.mapWidth,
			"h": this.mapHeight,
			"grid": this.grid,
			"rooms": this.rooms,
			// Properties are saved/loaded automatically
		};
	};
	
	// called when loading the full state of the game
	behinstProto.loadFromJSON = function (o)
	{
		this.seed = o["seed"];
		this.minRoomSize = o["minrs"];
		this.maxRoomSize = o["maxrs"];
		this.padding = o["pad"];
		this.mapWidth = o["w"];
		this.mapHeight = o["h"];
		this.grid = o["grid"];
		this.rooms = o["rooms"];
		
		this._setSeed(this.seed); // Re-init PRNG
		this.leafNodes = []; // Not saved, can be left empty
		this.rootNode = null; // Not saved
	};

	behinstProto.tick = function () {};

	// --- PRNG (SFC32) ---
	behinstProto._cyrb128 = function(str) {
		let h1 = 1779033703, h2 = 3144134277,
			h3 = 1013904242, h4 = 2773480762;
		for (let i = 0, k; i < str.length; i++) {
			k = str.charCodeAt(i);
			h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
			h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
			h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
			h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
		}
		h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
		h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
		h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
		h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
		return [(h1^h2^h3^h4)>>>0, (h2^h1)>>>0, (h3^h1)>>>0, (h4^h1)>>>0];
	}

	behinstProto._sfc32 = function (a, b, c, d) {
		return function() {
		  a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0; 
		  var t = (a + b) | 0;
		  a = b ^ (b >>> 9);
		  b = c + (c << 3) | 0;
		  c = (c << 21 | c >>> 11);
		  d = d + 1 | 0;
		  t = t + d | 0;
		  c = c + t | 0;
		  return (t >>> 0) / 4294967296;
		}
	};

	behinstProto._setSeed = function(seed) {
		if (seed === 0 || seed === "0" || seed === "") {
			this.seed = Date.now();
		} else {
			this.seed = seed;
		}
		
		var s = this._cyrb128(this.seed.toString());
		this.prng = this._sfc32(s[0], s[1], s[2], s[3]);
	};

	behinstProto._random = function() {
		return this.prng();
	};

	behinstProto._randInt = function(min, max) {
		if (min > max) {
			var temp = min;
			min = max;
			max = temp;
		}
		return Math.floor(this._random() * (max - min + 1)) + min;
	};

	// --- BSP ALGORITHM ---
	behinstProto._splitPartition = function(p) {
		// Decide split direction
		var splitHorizontally = this._random() > 0.5;
		if (p.w > p.h && p.w / p.h >= 1.25)
			splitHorizontally = false; // Wide, so split vertically
		else if (p.h > p.w && p.h / p.w >= 1.25)
			splitHorizontally = true; // Tall, so split horizontally

		var len = splitHorizontally ? p.h : p.w;
		var min = Math.max(4, this.minRoomSize);

		// Stop splitting if the partition is too small to contain two rooms
		if (len < min * 2) {
			this.leafNodes.push(p);
			return;
		}
		
		// Split if partition is too big, or by random chance
		if (len > this.maxRoomSize || this._random() > 0.25) {
			var split_at = this._randInt(min, len - min);
			
			var p1, p2;
			if (splitHorizontally) {
				p1 = { x: p.x, y: p.y, w: p.w, h: split_at, parent: p };
				p2 = { x: p.x, y: p.y + split_at, w: p.w, h: p.h - split_at, parent: p };
			} else { // Vertically
				p1 = { x: p.x, y: p.y, w: split_at, h: p.h, parent: p };
				p2 = { x: p.x + split_at, y: p.y, w: p.w - split_at, h: p.h, parent: p };
			}
			p.children = [p1, p2];
			this._splitPartition(p1);
			this._splitPartition(p2);
		} else {
			this.leafNodes.push(p);
		}
	};

	behinstProto._createRooms = function() {
		for(var i = 0; i < this.leafNodes.length; i++) {
			var leaf = this.leafNodes[i];
			
			var minSize = Math.max(4, this.minRoomSize - this.padding * 2);

			var roomW = this._randInt(minSize, leaf.w - this.padding * 2);
			var roomH = this._randInt(minSize, leaf.h - this.padding * 2);
			
			var roomX = leaf.x + this._randInt(this.padding, leaf.w - roomW - this.padding);
			var roomY = leaf.y + this._randInt(this.padding, leaf.h - roomH - this.padding);
			
			var room = {
				x: roomX, y: roomY, w: roomW, h: roomH,
				centerX: roomX + Math.floor(roomW / 2),
				centerY: roomY + Math.floor(roomH / 2)
			};
			this.rooms.push(room);
			leaf.room = room; // Link room to leaf for corridors
			
			// Carve room into grid
			for(var x = room.x; x < room.x + room.w; x++) {
				for(var y = room.y; y < room.y + room.h; y++) {
					if (x >= 0 && x < this.mapWidth && y >= 0 && y < this.mapHeight)
						this.grid[x][y] = this.ROOM;
				}
			}
		}
	};

	behinstProto._getRoomFromPartition = function(p) {
		if (p.room) return p.room;
		if (p.children) {
			return this._getRoomFromPartition(p.children[this._randInt(0,1)]);
		}
		return null;
	};

	behinstProto._createCorridors = function() {
		var queue = [this.rootNode];
		while(queue.length > 0) {
			var p = queue.shift();
			if (!p.children) continue;
			
			var room1 = this._getRoomFromPartition(p.children[0]);
			var room2 = this._getRoomFromPartition(p.children[1]);
			
			if (room1 && room2) {
				var x1 = room1.centerX;
				var y1 = room1.centerY;
				var x2 = room2.centerX;
				var y2 = room2.centerY;

				if (this._random() > 0.5) { // H-then-V
					this._carveHCorridor(x1, x2, y1);
					this._carveVCorridor(y1, y2, x2);
				} else { // V-then-H
					this._carveVCorridor(y1, y2, x1);
					this._carveHCorridor(x1, x2, y2);
				}
			}
			
			queue.push(p.children[0]);
			queue.push(p.children[1]);
		}
	};

	behinstProto._carveHCorridor = function(x1, x2, y) {
		for(var x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
			if (this.grid[x] && this.grid[x][y] === this.WALL)
				this.grid[x][y] = this.FLOOR;
		}
	};

	behinstProto._carveVCorridor = function(y1, y2, x) {
		for(var y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
			if (this.grid[x] && this.grid[x][y] === this.WALL)
				this.grid[x][y] = this.FLOOR;
		}
	};

	behinstProto._paintTilemap = function() {
		var tilemapInst = this.inst;
		if (!tilemapInst) return;
		
		// Access the Tilemap plugin's actions directly via the type definition
		// This ensures we call the correct logic for the specific plugin instance
		var tilemapActs = tilemapInst.type.plugin.acts;

		if (tilemapActs && tilemapActs.SetSize)
			tilemapActs.SetSize.call(tilemapInst, this.mapWidth, this.mapHeight);
		
		// Force update the object's pixel dimensions to match the new map size.
		// This ensures the renderer doesn't clip the map to the old size.
		var tw = tilemapInst.tilewidth || 32;
		var th = tilemapInst.tileheight || 32;
		tilemapInst.width = this.mapWidth * tw;
		tilemapInst.height = this.mapHeight * th;
		
		if (tilemapActs && tilemapActs.SetTile)
		{
			for(var x = 0; x < this.mapWidth; x++) {
				for(var y = 0; y < this.mapHeight; y++) {
					var tileType = this.grid[x][y];
					var outputTile = this.wallTile;
					if (tileType === this.ROOM || tileType === this.FLOOR) {
						outputTile = this.floorTile;
					}
					tilemapActs.SetTile.call(tilemapInst, x, y, outputTile);
				}
			}
		}
		
		// Ensure the Tilemap updates its bounding box and redraws after bulk changes
		if (tilemapInst.set_bbox_changed)
			tilemapInst.set_bbox_changed();
		
		this.runtime.redraw = true;
	};

	//////////////////////////////////////
	// Conditions
	function Cnds() {};

	Cnds.prototype.OnGenerationComplete = function () { return true; };

	Cnds.prototype.IsRoomAt = function (x, y) {
		x = Math.floor(x);
		y = Math.floor(y);
		if (x < 0 || x >= this.mapWidth || y < 0 || y >= this.mapHeight) return false;
		return this.grid[x][y] === this.ROOM;
	};

	Cnds.prototype.IsWallAt = function (x, y) {
		x = Math.floor(x);
		y = Math.floor(y);
		if (x < 0 || x >= this.mapWidth || y < 0 || y >= this.mapHeight) return true; // Treat out of bounds as a wall
		return this.grid[x][y] === this.WALL;
	};

	Cnds.prototype.ForEachRoom = function ()
	{
		if (!this.rooms || this.rooms.length === 0)
			return false;

		var current_event = this.runtime.getCurrentEventStack().current_event;
		var sol = this.type.objtype.getCurrentSol();
		var solModifierAfterCnds = !sol.select_all;

		var loop_count = this.rooms.length;
		this.loop_room_index = 0;

		for (; this.loop_room_index < loop_count; this.loop_room_index++)
		{
			if (solModifierAfterCnds)
				this.runtime.pushCopySol(sol);

			current_event.retrigger();

			if (solModifierAfterCnds)
				this.runtime.popSol(sol);
		}

		return false;
	};
	
	behaviorProto.cnds = new Cnds();

	//////////////////////////////////////
	// Actions
	function Acts() {};

	Acts.prototype.SetSeed = function (seed) {
		this._setSeed(seed);
	};

	Acts.prototype.SetConstraints = function (minRoom, maxRoom, padding) {
		this.minRoomSize = minRoom;
		this.maxRoomSize = maxRoom;
		this.padding = padding;
	};

	Acts.prototype.SetWallTile = function (id) {
		this.wallTile = id;
	};

	Acts.prototype.SetFloorTile = function (id) {
		this.floorTile = id;
	};

	Acts.prototype.GenerateDungeon = function (width, height)
	{
		this.mapWidth = Math.floor(Math.max(1, width));
		this.mapHeight = Math.floor(Math.max(1, height));
		
		this.grid = new Array(this.mapWidth);
		for(var i = 0; i < this.mapWidth; i++) {
			this.grid[i] = new Array(this.mapHeight);
			for(var j = 0; j < this.mapHeight; j++) {
				this.grid[i][j] = this.WALL;
			}
		}
		
		this.rooms = [];
		this.leafNodes = [];
		
		this.rootNode = { x: 0, y: 0, w: this.mapWidth, h: this.mapHeight, parent: null };
		this._splitPartition(this.rootNode);
		
		this._createRooms();
		this._createCorridors();
		this._paintTilemap();
		this.runtime.trigger(cr.behaviors.Autodungen.prototype.cnds.OnGenerationComplete, this.inst);
	};
	
	behaviorProto.acts = new Acts();

	//////////////////////////////////////
	// Expressions
	function Exps() {};

	Exps.prototype.RoomCount = function (ret) {
		ret.set_int(this.rooms.length);
	};

	Exps.prototype.RoomCenterX = function (ret, index) {
		index = Math.floor(index);
		if (index < 0 || index >= this.rooms.length) {
			ret.set_float(0);
			return;
		}
		
		var tilemapInst = this.inst;
		var tileW = tilemapInst.tilewidth || 32; // Default if no tilemap
		
		var room = this.rooms[index];
		ret.set_float((room.centerX * tileW) + (tileW / 2));
	};

	Exps.prototype.RoomCenterY = function (ret, index) {
		index = Math.floor(index);
		if (index < 0 || index >= this.rooms.length) {
			ret.set_float(0);
			return;
		}
		
		var tilemapInst = this.inst;
		var tileH = tilemapInst.tileheight || 32; // Default if no tilemap
		
		var room = this.rooms[index];
		ret.set_float((room.centerY * tileH) + (tileH / 2));
	};

	Exps.prototype.MapWidth = function (ret) {
		ret.set_int(this.mapWidth);
	};

	Exps.prototype.MapHeight = function (ret) {
		ret.set_int(this.mapHeight);
	};

	Exps.prototype.GetSeed = function (ret) {
		ret.set_string(this.seed.toString());
	};

	// For 'For Each Room' loop
	Exps.prototype.LoopRoomIndex = function (ret) {
		ret.set_int(this.loop_room_index);
	};
	
	behaviorProto.exps = new Exps();
	
}());