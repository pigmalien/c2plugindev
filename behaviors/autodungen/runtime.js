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
		var p = this.properties;
		var isNewVersion = p.length > 19; // Previous version had 19 properties

		// Properties
		this.minRoomSize = p[0];
		this.maxRoomSize = p[1];
		this.padding = p[2];

		var offset = 0;
		if (isNewVersion) {
			this.corridorSize = p[3];
			offset = 1;
		} else {
			this.corridorSize = 1; // Default for old projects
		}

		this.seed = p[3 + offset];
		this.floorTile = p[4 + offset];
        this.autotiling = p[5 + offset];
		this.wallTile = p[6 + offset];
		this.tileCornerInTR = p[7 + offset];
        this.tileSideTop = p[8 + offset];
        this.tileCornerOutTR = p[9 + offset];
        this.tileSideRight = p[10 + offset];
        this.tileCornerInBR = p[11 + offset];
        this.tileSideBottom = p[12 + offset];
        this.tileCornerOutBR = p[13 + offset];
        this.tileCornerOutBL = p[14 + offset];
        this.tileCornerInBL = p[15 + offset];
        this.tileSideLeft = p[16 + offset];
        this.tileCornerOutTL = p[17 + offset];
        this.tileCornerInTL = p[18 + offset];
        this.thickWalls = (p.length > 20) ? p[20] : 0; // 0=No, 1=Yes
        this.tileBelowCornerOutBL = (p.length > 21) ? p[21] : -1;
        this.tileBelowSideTop = (p.length > 22) ? p[22] : -1;
        this.tileBelowCornerOutBR = (p.length > 23) ? p[23] : -1;
        this.tileShadowSideRight = (p.length > 24) ? p[24] : -1;
        this.tileShadowCornerInTL = (p.length > 25) ? p[25] : -1;
        this.tileShadowBelowCornerOutBREnd = (p.length > 26) ? p[26] : -1;
        this.tileShadowBelowSideTop = (p.length > 27) ? p[27] : -1;

		// Backwards compatibility for old property order
		if (typeof this.autotiling === "undefined") {
			this.wallTile = p[4];
			this.floorTile = p[5];
			this.autotiling = 0; // Disabled by default for old projects
		}

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
			"cs": this.corridorSize,
			"w": this.mapWidth,
			"h": this.mapHeight,
			"grid": this.grid,
			"rooms": this.rooms,
			"autotile": this.autotiling,
            "wall_t": this.wallTile,
            "floor_t": this.floorTile,
            "t_citr": this.tileCornerInTR,
            "t_st": this.tileSideTop,
            "t_cotr": this.tileCornerOutTR,
            "t_sr": this.tileSideRight,
            "t_cibr": this.tileCornerInBR,
            "t_sb": this.tileSideBottom,
            "t_cobr": this.tileCornerOutBR,
            "t_cobl": this.tileCornerOutBL,
            "t_cibl": this.tileCornerInBL,
            "t_sl": this.tileSideLeft,
            "t_cotl": this.tileCornerOutTL,
            "t_citl": this.tileCornerInTL,
            "thick": this.thickWalls,
            "t_b_cobl": this.tileBelowCornerOutBL,
            "t_b_st": this.tileBelowSideTop,
            "t_b_cobr": this.tileBelowCornerOutBR,
            "t_s_sr": this.tileShadowSideRight,
            "t_s_citl": this.tileShadowCornerInTL,
            "t_s_bcobre": this.tileShadowBelowCornerOutBREnd,
            "t_s_bst": this.tileShadowBelowSideTop
		};
	};
	
	// called when loading the full state of the game
	behinstProto.loadFromJSON = function (o)
	{
		this.seed = o["seed"];
		this.minRoomSize = o["minrs"];
		this.maxRoomSize = o["maxrs"];
		this.padding = o["pad"];
		this.corridorSize = o["cs"] || 1;
		this.mapWidth = o["w"];
		this.mapHeight = o["h"];
		this.grid = o["grid"];
		this.rooms = o["rooms"];

		this.autotiling = o["autotile"] || 0;
        this.wallTile = typeof o["wall_t"] !== 'undefined' ? o["wall_t"] : 1;
        this.floorTile = typeof o["floor_t"] !== 'undefined' ? o["floor_t"] : 0;
        this.tileCornerInTR = o["t_citr"] || -1;
        this.tileSideTop = o["t_st"] || -1;
        this.tileCornerOutTR = o["t_cotr"] || -1;
        this.tileSideRight = o["t_sr"] || -1;
        this.tileCornerInBR = o["t_cibr"] || -1;
        this.tileSideBottom = o["t_sb"] || -1;
        this.tileCornerOutBR = o["t_cobr"] || -1;
        this.tileCornerOutBL = o["t_cobl"] || -1;
        this.tileCornerInBL = o["t_cibl"] || -1;
        this.tileSideLeft = o["t_sl"] || -1;
        this.tileCornerOutTL = o["t_cotl"] || -1;
        this.tileCornerInTL = o["t_citl"] || -1;
        this.thickWalls = o["thick"] || 0;
        this.tileBelowCornerOutBL = o["t_b_cobl"] || -1;
        this.tileBelowSideTop = o["t_b_st"] || -1;
        this.tileBelowCornerOutBR = o["t_b_cobr"] || -1;
        this.tileShadowSideRight = o["t_s_sr"] || -1;
        this.tileShadowCornerInTL = o["t_s_citl"] || -1;
        this.tileShadowBelowCornerOutBREnd = o["t_s_bcobre"] || -1;
        this.tileShadowBelowSideTop = o["t_s_bst"] || -1;
		
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
		if (min % 2 !== 0) min++;

		// Stop splitting if the partition is too small to contain two rooms
		if (len < min * 2) {
			this.leafNodes.push(p);
			return;
		}
		
		// Split if partition is too big, or by random chance
		if (len > this.maxRoomSize || this._random() > 0.25) {
			var split_at = this._randInt(min, len - min);
			
			if (split_at % 2 !== 0) split_at--;
			if (split_at < min) split_at = min;
			
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
			if (minSize % 2 !== 0) minSize++;

			var roomW = this._randInt(minSize, leaf.w - this.padding * 2);
			if (roomW % 2 !== 0) roomW--;
			var roomH = this._randInt(minSize, leaf.h - this.padding * 2);
			if (roomH % 2 !== 0) roomH--;
			
			var roomX = leaf.x + this._randInt(this.padding, leaf.w - roomW - this.padding);
			var roomY = leaf.y + this._randInt(this.padding, leaf.h - roomH - this.padding);
			
			if (roomX % 2 !== 0) roomX--;
			if (roomY % 2 !== 0) roomY--;
			
			if (roomX < leaf.x + this.padding) roomX += 2;
			if (roomY < leaf.y + this.padding) roomY += 2;
			
			if (roomX + roomW > leaf.x + leaf.w - this.padding) roomW -= 2;
			if (roomY + roomH > leaf.y + leaf.h - this.padding) roomH -= 2;
			
			var cX = roomX + Math.floor(roomW / 2);
			if (cX % 2 !== 0) cX--;
			var cY = roomY + Math.floor(roomH / 2);
			if (cY % 2 !== 0) cY--;

			var room = {
				x: roomX, y: roomY, w: roomW, h: roomH,
				centerX: cX,
				centerY: cY
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
		var size = Math.max(2, Math.floor(this.corridorSize));
		if (size % 2 !== 0) size++;
		
		for(var x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
			for (var i = 0; i < size; i++) {
				var currentY = y + i;
				if (this.grid[x] && typeof this.grid[x][currentY] !== "undefined" && this.grid[x][currentY] === this.WALL)
					this.grid[x][currentY] = this.FLOOR;
			}
		}
	};

	behinstProto._carveVCorridor = function(y1, y2, x) {
		var size = Math.max(2, Math.floor(this.corridorSize));
		if (size % 2 !== 0) size++;
		
		for(var y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
			for (var i = 0; i < size; i++) {
				var currentX = x + i;
				if (this.grid[currentX] && typeof this.grid[currentX][y] !== "undefined" && this.grid[currentX][y] === this.WALL)
					this.grid[currentX][y] = this.FLOOR;
			}
		}
	};

	behinstProto._enforceThickWalls = function() {
		if (this.thickWalls === 0) return;

		// Iterate grid to find single walls and thicken them into adjacent rooms
		for (var x = 1; x < this.mapWidth - 1; x++) {
			for (var y = 1; y < this.mapHeight - 1; y++) {
				if (this.grid[x][y] === this.WALL) {
					// Vertical thickness (Horizontal walls)
					if (this.grid[x][y-1] !== this.WALL && this.grid[x][y+1] !== this.WALL) {
						if (this.grid[x][y-1] === this.ROOM) this.grid[x][y-1] = this.WALL;
						else if (this.grid[x][y+1] === this.ROOM) this.grid[x][y+1] = this.WALL;
					}
					
					// Horizontal thickness (Vertical walls)
					if (this.grid[x-1][y] !== this.WALL && this.grid[x+1][y] !== this.WALL) {
						if (this.grid[x-1][y] === this.ROOM) this.grid[x-1][y] = this.WALL;
						else if (this.grid[x+1][y] === this.ROOM) this.grid[x+1][y] = this.WALL;
					}
				}
			}
		}
	};

	behinstProto._getWallTile = function(x, y) {
		var useDefault = -1;
	
		var isWall = (tx, ty) => {
			if (tx < 0 || tx >= this.mapWidth || ty < 0 || ty >= this.mapHeight) return true;
			var tile = this.grid[tx][ty];
			return tile !== this.ROOM && tile !== this.FLOOR;
		};
	
		var n = isWall(x, y - 1);
		var e = isWall(x + 1, y);
		var s = isWall(x, y + 1);
		var w = isWall(x - 1, y);
		
		var ne = isWall(x + 1, y - 1);
		var se = isWall(x + 1, y + 1);
		var sw = isWall(x - 1, y + 1);
		var nw = isWall(x - 1, y - 1);
	
		// Outer Corners (Exterior/Convex) - Wall sticking out
		if (!n && !w && e && s && this.tileCornerOutTL !== useDefault) return this.tileCornerOutTL;
		if (!n && !e && w && s && this.tileCornerOutTR !== useDefault) return this.tileCornerOutTR;
		if (!s && !w && e && n && this.tileCornerOutBL !== useDefault) return this.tileCornerOutBL;
		if (!s && !e && w && n && this.tileCornerOutBR !== useDefault) return this.tileCornerOutBR;
	
		// Inner Corners (Interior/Concave) - Wall surrounding floor
		if (n && e && s && w) {
			if (!se && this.tileCornerInTL !== useDefault) return this.tileCornerInTL;
			if (!sw && this.tileCornerInTR !== useDefault) return this.tileCornerInTR;
			if (!ne && this.tileCornerInBL !== useDefault) return this.tileCornerInBL;
			if (!nw && this.tileCornerInBR !== useDefault) return this.tileCornerInBR;
		}
	
		// Sides
		if (!s && n && e && w && this.tileSideTop !== useDefault) return this.tileSideTop;
		if (!n && s && e && w && this.tileSideBottom !== useDefault) return this.tileSideBottom;
		if (!e && n && s && w && this.tileSideLeft !== useDefault) return this.tileSideLeft;
		if (!w && n && s && e && this.tileSideRight !== useDefault) return this.tileSideRight;
	
		return this.wallTile; // Default wall tile
	};

	behinstProto._getDepthTile = function(x, y) {
		// This function now handles all floor shadow logic (Depth, Side, Corner)
		// (x, y) is the floor tile coordinate

		var isWall = (tx, ty) => {
			if (tx < 0 || tx >= this.mapWidth || ty < 0 || ty >= this.mapHeight) return true;
			var tile = this.grid[tx][ty];
			return tile !== this.ROOM && tile !== this.FLOOR;
		};

		var wallNorth = isWall(x, y - 1);
		var wallWest = isWall(x - 1, y);
		var wallEast = isWall(x + 1, y);

		// 1. North Wall Shadows (Depth) - Priority over Corner
		if (wallNorth) {
			// Check shape of the wall above
			var wx = x;
			var wy = y - 1;
			var n = isWall(wx, wy - 1);
			var e = isWall(wx + 1, wy);
			var w = isWall(wx - 1, wy);
			
			if (n && e && w && this.tileBelowSideTop !== -1) {
				return this.tileBelowSideTop;
			}
			if (n && e && !w && this.tileBelowCornerOutBL !== -1) return this.tileBelowCornerOutBL;
			if (n && !e && w) {
				if (this.tileBelowCornerOutBR !== -1) return this.tileBelowCornerOutBR;
			}
		}

		// 2. Shadow below the face (3/4 view corner shadow)
		if (!wallNorth && isWall(x, y - 2)) {
			var wx = x;
			var wy = y - 2;
			var n = isWall(wx, wy - 1);
			var e = isWall(wx + 1, wy);
			var w = isWall(wx - 1, wy);
			
			if (n && (e || w)) {
				if (wallWest && this.tileShadowCornerInTL !== -1) {
					return this.tileShadowCornerInTL;
				}
				if (this.tileShadowBelowSideTop !== -1) return this.tileShadowBelowSideTop;
			}
		}

		// 2. Inner Corner Shadow (North + West)
		if (wallNorth && wallWest && this.tileShadowCornerInTL !== -1) {
			return this.tileShadowCornerInTL;
		}

		// 3. West Wall Shadow (Side Right - Renamed from EastSideBorder)
		if (wallWest) {
			if (this.tileShadowSideRight !== -1) return this.tileShadowSideRight;
		}

		// 4. Shadow Side Right (Diagonal from CornerOutBR)
		if (!wallNorth && !wallWest) {
			if (isWall(x - 1, y - 1)) {
				var n = isWall(x - 1, y - 2);
				var w = isWall(x - 2, y - 1);
				if (n && w) {
					if (this.tileShadowSideRight !== -1) return this.tileShadowSideRight;
				}
			}
			if (!isWall(x - 1, y - 1) && isWall(x - 1, y - 2)) {
				var n = isWall(x - 1, y - 3);
				var w = isWall(x - 2, y - 2);
				if (n && w && this.tileShadowBelowCornerOutBREnd !== -1) return this.tileShadowBelowCornerOutBREnd;
			}
		}

		return -1;
	};

	behinstProto._getWallShapeAt = function(x, y) {
		if (x < 0 || x >= this.mapWidth || y < 0 || y >= this.mapHeight) return "OutOfBounds";
		
		var t = this.grid[x][y];
		var isWall = (tx, ty) => {
			if (tx < 0 || tx >= this.mapWidth || ty < 0 || ty >= this.mapHeight) return true;
			var tile = this.grid[tx][ty];
			return tile !== this.ROOM && tile !== this.FLOOR;
		};

		if (t === this.ROOM || t === this.FLOOR) {
			var wallNorth = isWall(x, y - 1);
			var wallWest = isWall(x - 1, y);
			var wallEast = isWall(x + 1, y);

			if (wallNorth) {
				var n = isWall(x, y - 2);
				var e = isWall(x + 1, y - 1);
				var w = isWall(x - 1, y - 1);

				if (n && e && w) {
					if (wallWest) return "ShadowCornerInTL";

					var ne_n = isWall(x + 1, y - 2);
					var ne_e = isWall(x + 2, y - 1);
					var ne_s = isWall(x + 1, y);
					if (ne_n && !ne_e && !ne_s) return "ShadowSideRight";

					return "BelowSideTop";
				}
				if (n && e && w) {
					if (wallWest) return "ShadowCornerInTL";

					var ne_n = isWall(x + 1, y - 2);
					var ne_e = isWall(x + 2, y - 1);
					var ne_s = isWall(x + 1, y);
					if (ne_n && !ne_e && !ne_s) return "ShadowSideRight";

					return "BelowSideTop";
				}
				if (n && e && !w) return "BelowCornerOutBL";
				if (n && !e && w) {
					return "BelowCornerOutBR";
				}
			}

			if (!wallNorth && isWall(x, y - 2)) {
				var n = isWall(x, y - 3);
				var e = isWall(x + 1, y - 2);
				var w = isWall(x - 1, y - 2);
				
				if (n && (e || w)) {
					if (wallWest) return "ShadowCornerInTL";
					return "ShadowBelowSideTop";
				}
			}

			if (wallNorth && wallWest) return "ShadowCornerInTL";

			if (wallWest) {
				return "ShadowSideRight";
			}

			if (!wallNorth && !wallWest) {
				if (isWall(x - 1, y - 1)) {
					var n = isWall(x - 1, y - 2);
					var w = isWall(x - 2, y - 1);
					if (n && w) return "ShadowSideRight";
				}
				if (!isWall(x - 1, y - 1) && isWall(x - 1, y - 2)) {
					var n = isWall(x - 1, y - 3);
					var w = isWall(x - 2, y - 2);
					if (n && w) return "ShadowBelowCornerOutBREnd";
				}
			}

			return "Floor";
		}
	
		var n = isWall(x, y - 1);
		var e = isWall(x + 1, y);
		var s = isWall(x, y + 1);
		var w = isWall(x - 1, y);
		
		var ne = isWall(x + 1, y - 1);
		var se = isWall(x + 1, y + 1);
		var sw = isWall(x - 1, y + 1);
		var nw = isWall(x - 1, y - 1);
	
		// Outer Corners (Exterior/Convex)
		if (!n && !w && e && s) return "CornerOutTL";
		if (!n && !e && w && s) return "CornerOutTR";
		if (!s && !w && e && n) return "CornerOutBL";
		if (!s && !e && w && n) return "CornerOutBR";

		// Inner Corners (Interior/Concave)
		if (n && e && s && w) {
			if (!se) return "CornerInTL";
			if (!sw) return "CornerInTR";
			if (!ne) return "CornerInBL";
			if (!nw) return "CornerInBR";
		}
	
		// Sides
		if (!s && n && e && w) return "SideTop";
		if (!n && s && e && w) return "SideBottom";
		if (!e && n && s && w) return "SideLeft";
		if (!w && n && s && e) return "SideRight";
	
		return "Wall";
	};

	behinstProto._paintTilemap = function() {
		var tilemapInst = this.inst;
		if (!tilemapInst) return;
		
		var tilemapActs = tilemapInst.type.plugin.acts;

		if (tilemapActs && tilemapActs.SetSize)
			tilemapActs.SetSize.call(tilemapInst, this.mapWidth, this.mapHeight);
		
		var tw = tilemapInst.tilewidth || 32;
		var th = tilemapInst.tileheight || 32;
		tilemapInst.width = this.mapWidth * tw;
		tilemapInst.height = this.mapHeight * th;
		
		if (tilemapActs && tilemapActs.SetTile)
		{
			for(var x = 0; x < this.mapWidth; x++) {
				for(var y = 0; y < this.mapHeight; y++) {
					var tileType = this.grid[x][y];
					var outputTile;
					if (tileType === this.ROOM || tileType === this.FLOOR) {
						var depthTile = -1;
						if (this.autotiling === 1) {
							depthTile = this._getDepthTile(x, y);
						}
						
						if (depthTile !== -1) outputTile = depthTile;
						else outputTile = this.floorTile;
					}
					else { // It's a wall
                        if (this.autotiling === 1) {
                            outputTile = this._getWallTile(x, y);
                        } else {
						    outputTile = this.wallTile;
                        }
					}
					if (outputTile === -1 && tilemapActs.EraseTile)
						tilemapActs.EraseTile.call(tilemapInst, x, y);
					else
						tilemapActs.SetTile.call(tilemapInst, x, y, outputTile);
				}
			}
		}
		
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

	Acts.prototype.SetAutotileID = function (shape_index, id) {
        switch(shape_index) {
            case 0: this.tileCornerInTR = id; break;
            case 1: this.tileSideTop = id; break;
            case 2: this.tileCornerOutTR = id; break;
            case 3: this.tileSideRight = id; break;
            case 4: this.tileCornerInBR = id; break;
            case 5: this.tileSideBottom = id; break;
            case 6: this.tileCornerOutBR = id; break;
            case 7: this.tileCornerOutBL = id; break;
            case 8: this.tileCornerInBL = id; break;
            case 9: this.tileSideLeft = id; break;
            case 10: this.tileCornerOutTL = id; break;
            case 11: this.tileCornerInTL = id; break;
            case 12: this.tileBelowCornerOutBL = id; break;
            case 13: this.tileBelowSideTop = id; break;
            case 14: this.tileBelowCornerOutBR = id; break;
            case 15: this.tileShadowSideRight = id; break;
            case 16: this.tileShadowCornerInTL = id; break;
            case 17: this.tileShadowBelowCornerOutBREnd = id; break;
            case 18: this.tileShadowBelowSideTop = id; break;
        }
    };

    Acts.prototype.SetAutotilingEnabled = function (state) {
        this.autotiling = state;
    };

	Acts.prototype.SetCorridorSize = function (size) {
		this.corridorSize = Math.max(1, Math.floor(size));
	};

	Acts.prototype.GenerateDungeon = function (width, height)
	{
		this._setSeed(this.seed);

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
		this._enforceThickWalls();
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

	Exps.prototype.TileCornerInTR = function (ret) {
		ret.set_int(this.tileCornerInTR);
	};

	Exps.prototype.TileSideTop = function (ret) {
		ret.set_int(this.tileSideTop);
	};

	Exps.prototype.TileCornerOutTR = function (ret) {
		ret.set_int(this.tileCornerOutTR);
	};

	Exps.prototype.TileSideRight = function (ret) {
		ret.set_int(this.tileSideRight);
	};

	Exps.prototype.TileCornerInBR = function (ret) {
		ret.set_int(this.tileCornerInBR);
	};

	Exps.prototype.TileSideBottom = function (ret) {
		ret.set_int(this.tileSideBottom);
	};

	Exps.prototype.TileCornerOutBR = function (ret) {
		ret.set_int(this.tileCornerOutBR);
	};

	Exps.prototype.TileCornerOutBL = function (ret) {
		ret.set_int(this.tileCornerOutBL);
	};

	Exps.prototype.TileCornerInBL = function (ret) {
		ret.set_int(this.tileCornerInBL);
	};

	Exps.prototype.TileSideLeft = function (ret) {
		ret.set_int(this.tileSideLeft);
	};

	Exps.prototype.TileCornerOutTL = function (ret) {
		ret.set_int(this.tileCornerOutTL);
	};

	Exps.prototype.TileCornerInTL = function (ret) {
		ret.set_int(this.tileCornerInTL);
	};

	Exps.prototype.TileBelowCornerOutBL = function (ret) {
		ret.set_int(this.tileBelowCornerOutBL);
	};

	Exps.prototype.TileBelowSideTop = function (ret) {
		ret.set_int(this.tileBelowSideTop);
	};

	Exps.prototype.TileBelowCornerOutBR = function (ret) {
		ret.set_int(this.tileBelowCornerOutBR);
	};

	Exps.prototype.TileShadowSideRight = function (ret) {
		ret.set_int(this.tileShadowSideRight);
	};

	Exps.prototype.TileShadowCornerInTL = function (ret) {
		ret.set_int(this.tileShadowCornerInTL);
	};

	Exps.prototype.TileShadowBelowCornerOutBREnd = function (ret) {
		ret.set_int(this.tileShadowBelowCornerOutBREnd);
	};

	Exps.prototype.TileShadowBelowSideTop = function (ret) {
		ret.set_int(this.tileShadowBelowSideTop);
	};

	Exps.prototype.AutotileShapeAt = function (ret, x, y) {
		ret.set_string(this._getWallShapeAt(Math.floor(x), Math.floor(y)));
	};
	
	behaviorProto.exps = new Exps();
	
}());