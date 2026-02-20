﻿// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
// *** CHANGE THE BEHAVIOR ID HERE *** - must match the "id" property in edittime.js
//           vvvvvvvvvv
cr.behaviors.DelaunayDungeon = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	// *** CHANGE THE BEHAVIOR ID HERE *** - must match the "id" property in edittime.js
	//                               vvvvvvvvvvvvvvv
	var behaviorProto = cr.behaviors.DelaunayDungeon.prototype;
		
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
		this.mapWidth = p[0];
		this.mapHeight = p[1];
		this.seed = p[2];
		this.numRooms = p[3];
		this.minRoomSize = p[4];
		this.maxRoomSize = p[5];
		this.roomShape = p[6]; // 0=Rect, 1=Circle, 2=Organic
		this.connectivity = p[7];
		this.borderPadding = p[8];
		this.autotiling = p[9]; // 0=Disabled, 1=Enabled
		this.wallThickness = p[10];
		this.corridorSize = p[11];
		this.padding = p[12];
		this.gap = p[13];
		this.floorTile = p[14];
		this.wallTile = p[15];
		this.tileCornerInTR = p[16];
		this.tileSideTop = p[17];
		this.tileCornerOutTR = p[18];
		this.tileSideRight = p[19];
		this.tileCornerInBR = p[20];
		this.tileSideBottom = p[21];
		this.tileCornerOutBR = p[22];
		this.tileCornerOutBL = p[23];
		this.tileCornerInBL = p[24];
		this.tileSideLeft = p[25];
		this.tileCornerOutTL = p[26];
		this.tileCornerInTL = p[27];
		this.tileBelowCornerOutBL = p[28];
		this.tileBelowSideTop = p[29];
		this.tileBelowCornerOutBR = p[30];
		this.tileShadowSideRight = p[31];
		this.tileShadowCornerInTL = p[32];
		this.tileShadowBelowCornerOutBREnd = p[33];
		this.tileShadowBelowSideTop = p[34];

		this.generatedRooms = 0;
		this.prng = null;
		this.grid = [];
		this.rooms = [];
		this.loop_room_index = 0;

		this.variants = [];
		for(var i=0; i<21; i++) this.variants[i] = [];

		// Internal tile types
		this.VOID = 0;
		this.WALL = 1;
		this.FLOOR = 2;
		// this.ROOM = 3; // Not used in this generator, but keep for consistency

		this._setSeed(this.seed);
	};
	
	behinstProto.onDestroy = function ()
	{
		// called when associated object is being destroyed
		// note runtime may keep the object and behavior alive after this call for recycling;
		// release, recycle or reset any references here as necessary
		this.grid = null;
		this.prng = null;
	};
	
	// called when saving the full state of the game
	behinstProto.saveToJSON = function ()
	{
		// return a Javascript object containing information about your behavior's state
		// note you MUST use double-quote syntax (e.g. "property": value) to prevent
		// Closure Compiler renaming and breaking the save format
		return {
			"w": this.mapWidth,
			"h": this.mapHeight,
			"seed": this.seed,
			"nr": this.numRooms,
			"minr": this.minRoomSize,
			"maxr": this.maxRoomSize,
			"rs": this.roomShape,
			"conn": this.connectivity,
			"bp": this.borderPadding,
			"autotile": this.autotiling,
			"wth": this.wallThickness,
			"cs": this.corridorSize,
			"pad": this.padding,
			"gap": this.gap,
			"floor_t": this.floorTile,
			"wall_t": this.wallTile,
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
			"t_b_cobl": this.tileBelowCornerOutBL,
			"t_b_st": this.tileBelowSideTop,
			"t_b_cobr": this.tileBelowCornerOutBR,
			"t_s_sr": this.tileShadowSideRight,
			"t_s_citl": this.tileShadowCornerInTL,
			"t_s_bcobre": this.tileShadowBelowCornerOutBREnd,
			"t_s_bst": this.tileShadowBelowSideTop,
			"variants": this.variants,
			"grid": this.grid,
			"rooms": this.rooms
		};
	};
	
	// called when loading the full state of the game
	behinstProto.loadFromJSON = function (o)
	{
		// load from the state previously saved by saveToJSON
		this.mapWidth = o["w"];
		this.mapHeight = o["h"];
		this.seed = o["seed"];
		this.numRooms = o["nr"];
		this.minRoomSize = o["minr"];
		this.maxRoomSize = o["maxr"];
		this.roomShape = o["rs"];
		this.connectivity = o["conn"];
		this.borderPadding = (typeof o["bp"] !== "undefined") ? o["bp"] : 2;
		this.autotiling = o["autotile"] || 0;
		this.wallThickness = o["wth"];
		this.corridorSize = o["cs"] || 1;
		this.padding = (typeof o["pad"] !== "undefined") ? o["pad"] : 1;
		this.gap = (typeof o["gap"] !== "undefined") ? o["gap"] : 2;
		this.floorTile = o["floor_t"];
		this.wallTile = o["wall_t"];
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
		this.tileBelowCornerOutBL = o["t_b_cobl"] || -1;
		this.tileBelowSideTop = o["t_b_st"] || -1;
		this.tileBelowCornerOutBR = o["t_b_cobr"] || -1;
		this.tileShadowSideRight = o["t_s_sr"] || -1;
		this.tileShadowCornerInTL = o["t_s_citl"] || -1;
		this.tileShadowBelowCornerOutBREnd = o["t_s_bcobre"] || -1;
		this.tileShadowBelowSideTop = o["t_s_bst"] || -1;

		this.variants = o["variants"] || [];
		for(var i=0; i<21; i++) {
			if (!this.variants[i]) this.variants[i] = [];
		}
		this.grid = o["grid"];
		this.rooms = o["rooms"] || [];

		this._setSeed(this.seed); // Re-init PRNG
	};

	behinstProto.tick = function ()
	{
		var dt = this.runtime.getDt(this.inst);
		
	};

	// --- Algorithms ---

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
	};

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
		};
	};

	behinstProto._setSeed = function(seed) {
		if (seed === 0 || seed === "0" || !seed) {
			this.seed = Date.now().toString();
		} else {
			this.seed = seed;
		}
		
		var s = this._cyrb128(this.seed.toString());
		this.prng = this._sfc32(s[0], s[1], s[2], s[3]);
	};

	behinstProto._random = function() {
		if (!this.prng) this._setSeed(this.seed);
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

	behinstProto._triangulate = function (nodes) {
		// Bowyer-Watson algorithm
		// nodes: array of {x, y, id}
		
		// Super triangle covering the map area
		var w = this.mapWidth * 2;
		var h = this.mapHeight * 2;
		var superTri = {
			a: {x: -w, y: -h, id: -1},
			b: {x: w * 2, y: -h, id: -2},
			c: {x: 0, y: h * 2, id: -3}
		};
		
		var triangles = [superTri];
		
		for (var i = 0; i < nodes.length; i++) {
			var node = nodes[i];
			var badTriangles = [];
			
			for (var j = 0; j < triangles.length; j++) {
				var tri = triangles[j];
				if (this._circumcircleContains(tri, node)) {
					badTriangles.push(tri);
				}
			}
			
			var polygon = [];
			for (var j = 0; j < badTriangles.length; j++) {
				var tri = badTriangles[j];
				this._addEdgeToPolygon(polygon, tri.a, tri.b);
				this._addEdgeToPolygon(polygon, tri.b, tri.c);
				this._addEdgeToPolygon(polygon, tri.c, tri.a);
			}
			
			// Remove bad triangles
			for (var j = 0; j < badTriangles.length; j++) {
				var index = triangles.indexOf(badTriangles[j]);
				if (index > -1) triangles.splice(index, 1);
			}
			
			// Add new triangles
			for (var j = 0; j < polygon.length; j++) {
				var edge = polygon[j];
				triangles.push({a: edge.p1, b: edge.p2, c: node});
			}
		}
		
		// Extract unique edges, ignoring super triangle
		var edges = [];
		var edgeMap = {}; // To deduplicate

		for (var i = 0; i < triangles.length; i++) {
			var t = triangles[i];
			// If triangle shares vertex with super triangle, ignore
			if (t.a.id < 0 || t.b.id < 0 || t.c.id < 0) continue;

			this._pushUniqueEdge(edges, edgeMap, t.a, t.b);
			this._pushUniqueEdge(edges, edgeMap, t.b, t.c);
			this._pushUniqueEdge(edges, edgeMap, t.c, t.a);
		}
		
		return edges;
	};

	behinstProto._circumcircleContains = function(tri, p) {
		var ax = tri.a.x, ay = tri.a.y;
		var bx = tri.b.x, by = tri.b.y;
		var cx = tri.c.x, cy = tri.c.y;

		var D = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by));
		var center_x = ((ax * ax + ay * ay) * (by - cy) + (bx * bx + by * by) * (cy - ay) + (cx * cx + cy * cy) * (ay - by)) / D;
		var center_y = ((ax * ax + ay * ay) * (cx - bx) + (bx * bx + by * by) * (ax - cx) + (cx * cx + cy * cy) * (bx - ax)) / D;
		
		var dx = center_x - ax;
		var dy = center_y - ay;
		var r2 = dx * dx + dy * dy; // Radius squared
		
		var pdx = center_x - p.x;
		var pdy = center_y - p.y;
		var d2 = pdx * pdx + pdy * pdy; // Distance to p squared
		
		return d2 <= r2;
	};

	behinstProto._addEdgeToPolygon = function(polygon, p1, p2) {
		for (var i = 0; i < polygon.length; i++) {
			var edge = polygon[i];
			if ((edge.p1 === p1 && edge.p2 === p2) || (edge.p1 === p2 && edge.p2 === p1)) {
				polygon.splice(i, 1); // Duplicate edge (shared), remove it
				return;
			}
		}
		polygon.push({p1: p1, p2: p2});
	};

	behinstProto._pushUniqueEdge = function(edges, map, n1, n2) {
		var id1 = Math.min(n1.id, n2.id);
		var id2 = Math.max(n1.id, n2.id);
		var key = id1 + "_" + id2;
		
		if (!map[key]) {
			var dist = Math.sqrt(Math.pow(n1.x - n2.x, 2) + Math.pow(n1.y - n2.y, 2));
			var edge = {u: n1, v: n2, dist: dist};
			edges.push(edge);
			map[key] = true;
		}
	};

	// --- MST (Kruskal's) ---
	behinstProto._computeMST = function(nodes, edges, connectivity) {
		// Sort edges by distance
		edges.sort(function(a, b) { return a.dist - b.dist; });
		
		var parent = [];
		for (var i = 0; i < nodes.length; i++) parent[i] = i;
		
		function find(i) {
			if (parent[i] === i) return i;
			return parent[i] = find(parent[i]);
		}
		
		function union(i, j) {
			var rootI = find(i);
			var rootJ = find(j);
			if (rootI !== rootJ) {
				parent[rootI] = rootJ;
				return true;
			}
			return false;
		}
		
		var mstEdges = [];
		var edgesCount = 0;
		// Target edges: For full MST, it's N-1. 
		// Connectivity scales this. 0.5 means we stop halfway through connecting everything.
		var targetEdges = Math.floor((nodes.length - 1) * connectivity);
		if (connectivity >= 1.0) targetEdges = nodes.length - 1; // Ensure full connectivity

		for (var i = 0; i < edges.length; i++) {
			if (edgesCount >= targetEdges && connectivity < 1.0) break;

			var e = edges[i];
			if (union(e.u.id, e.v.id)) {
				mstEdges.push(e);
				edgesCount++;
			}
		}
		return mstEdges;
	};
	
	// --- Autotiling Logic (from Autodungen) ---
	behinstProto._resolveVariant = function(shapeIndex, defaultId) {
		if (!this.variants[shapeIndex] || this.variants[shapeIndex].length === 0) return defaultId;
        
        for (var i = 0; i < this.variants[shapeIndex].length; i++) {
            var v = this.variants[shapeIndex][i];
            if (this._random() * 100 < v.prob) {
                return v.id;
            }
        }
        return defaultId;
	};

	behinstProto._getWallTile = function(x, y) {
		var isWall = (tx, ty) => {
			if (tx < 0 || tx >= this.mapWidth || ty < 0 || ty >= this.mapHeight) return true;
			var tile = this.grid[tx][ty];
			return tile !== this.FLOOR;
		};
	
		var n = isWall(x, y - 1);
		var e = isWall(x + 1, y);
		var s = isWall(x, y + 1);
		var w = isWall(x - 1, y);
		
		// Helper to fallback to default wall tile if specific shape is not set (-1)
		var self = this;
		function r(idx, id) {
			return self._resolveVariant(idx, id !== -1 ? id : self.wallTile);
		}
		
		// Outer Corners (Exterior/Convex) - Wall sticking out
		if (!n && !w && e && s) return r(10, this.tileCornerOutTL);
		if (!n && !e && w && s) return r(2, this.tileCornerOutTR);
		if (!s && !w && (e || n)) return r(7, this.tileCornerOutBL);
		if (!s && !e && (w || n)) return r(6, this.tileCornerOutBR);
	
		// Inner Corners (Interior/Concave) - Wall surrounding floor
		if (n && e && s && w) {
			var ne = isWall(x + 1, y - 1);
			var se = isWall(x + 1, y + 1);
			var sw = isWall(x - 1, y + 1);
			var nw = isWall(x - 1, y - 1);

			if (!se) return r(11, this.tileCornerInTL);
			if (!sw) return r(0, this.tileCornerInTR);
			if (!ne) return r(8, this.tileCornerInBL);
			if (!nw) return r(4, this.tileCornerInBR);
		}
	
		// Sides
		if (!s && n && e && w) return r(1, this.tileSideTop);
		if (!n && s && e && w) return r(5, this.tileSideBottom);
		if (!e && n && s && w) return r(9, this.tileSideLeft);
		if (!w && n && s && e) return r(3, this.tileSideRight);
	
		return this._resolveVariant(20, this.wallTile); // Default wall tile
	};

	behinstProto._getDepthTile = function(x, y) {
		// (x, y) is the floor tile coordinate
		var isWall = (tx, ty) => {
			if (tx < 0 || tx >= this.mapWidth || ty < 0 || ty >= this.mapHeight) return true;
			var tile = this.grid[tx][ty];
			return tile !== this.FLOOR;
		};

		var wallNorth = isWall(x, y - 1);
		var wallWest = isWall(x - 1, y);

		// Inner Corner Shadow (North + West) - check first for priority
		if (wallNorth && wallWest) {
			return this._resolveVariant(16, this.tileShadowCornerInTL);
		}

		// 1. North Wall Shadows (Depth)
		if (wallNorth) {
			var wx = x;
			var wy = y - 1;
			var n = isWall(wx, wy - 1);
			var e = isWall(wx + 1, wy);
			var w = isWall(wx - 1, wy);
			
			if (n && e && w) return this._resolveVariant(13, this.tileBelowSideTop);
			if (n && e && !w) return this._resolveVariant(12, this.tileBelowCornerOutBL);
			if (n && !e && w) return this._resolveVariant(14, this.tileBelowCornerOutBR);
		}

		// 2. Shadow below the face (3/4 view corner shadow)
		if (!wallNorth && isWall(x, y - 2)) {
			var wx = x;
			var wy = y - 2;
			var n = isWall(wx, wy - 1);
			var e = isWall(wx + 1, wy);
			var w = isWall(wx - 1, wy);
			
			if (n && (e || w)) {
				if (wallWest) return this._resolveVariant(16, this.tileShadowCornerInTL);
				return this._resolveVariant(18, this.tileShadowBelowSideTop);
			}
		}

		// 4. West Wall Shadow (Side Right)
		if (wallWest) {
			return this._resolveVariant(15, this.tileShadowSideRight);
		}

		// 5. Shadow Side Right (Diagonal from CornerOutBR)
		if (!wallNorth && !wallWest) {
			if (isWall(x - 1, y - 1)) {
				var n = isWall(x - 1, y - 2);
				var w = isWall(x - 2, y - 1);
				if (n && w) {
					return this._resolveVariant(15, this.tileShadowSideRight);
				}
			}
			if (!isWall(x - 1, y - 1) && isWall(x - 1, y - 2)) {
				var n = isWall(x - 1, y - 3);
				var w = isWall(x - 2, y - 2);
				if (n && w) return this._resolveVariant(17, this.tileShadowBelowCornerOutBREnd);
			}
		}

		return -1;
	};

	behinstProto._getWallShapeAt = function(x, y) {
		if (x < 0 || x >= this.mapWidth || y < 0 || y >= this.mapHeight) return "OutOfBounds";
		
		var t = this.grid[x][y];
		var isWall = (tx, ty) => {
			if (tx < 0 || tx >= this.mapWidth || ty < 0 || ty >= this.mapHeight) return true;
			return this.grid[tx][ty] !== this.FLOOR;
		};

		if (t === this.FLOOR) {
			var wallNorth = isWall(x, y - 1);
			var wallWest = isWall(x - 1, y);

			// Inner Corner Shadow (North + West)
			if (wallNorth && wallWest && this.tileShadowCornerInTL !== -1) return "ShadowCornerInTL";

			// 1. North Wall Shadows (Depth)
			if (wallNorth) {
				var wx = x;
				var wy = y - 1;
				var n = isWall(wx, wy - 1);
				var e = isWall(wx + 1, wy);
				var w = isWall(wx - 1, wy);
				
				if (n && e && w && this.tileBelowSideTop !== -1) return "BelowSideTop";
				if (n && e && !w && this.tileBelowCornerOutBL !== -1) return "BelowCornerOutBL";
				if (n && !e && w && this.tileBelowCornerOutBR !== -1) return "BelowCornerOutBR";
			}

			// 2. Shadow below the face (3/4 view corner shadow)
			if (!wallNorth && isWall(x, y - 2)) {
				var wx = x;
				var wy = y - 2;
				var n = isWall(wx, wy - 1);
				var e = isWall(wx + 1, wy);
				var w = isWall(wx - 1, wy);
				
				if (n && (e || w)) {
					if (wallWest) {
						if (this.tileShadowCornerInTL !== -1) return "ShadowCornerInTL";
					} else {
						if (this.tileShadowBelowSideTop !== -1) return "ShadowBelowSideTop";
					}
				}
			}

			// 4. West Wall Shadow (Side Right)
			if (wallWest && this.tileShadowSideRight !== -1) return "ShadowSideRight";

			// 5. Shadow Side Right (Diagonal from CornerOutBR)
			if (!wallNorth && !wallWest) {
				if (isWall(x - 1, y - 1)) {
					var n = isWall(x - 1, y - 2);
					var w = isWall(x - 2, y - 1);
					if (n && w && this.tileShadowSideRight !== -1) return "ShadowSideRight";
				}
				if (!isWall(x - 1, y - 1) && isWall(x - 1, y - 2)) {
					var n = isWall(x - 1, y - 3);
					var w = isWall(x - 2, y - 2);
					if (n && w && this.tileShadowBelowCornerOutBREnd !== -1) return "ShadowBelowCornerOutBREnd";
				}
			}

			return "Floor";
		}
	
		var n = isWall(x, y - 1);
		var e = isWall(x + 1, y);
		var s = isWall(x, y + 1);
		var w = isWall(x - 1, y);
		
		// Outer Corners (Exterior/Convex)
		if (!n && !w && e && s) return "CornerOutTL";
		if (!n && !e && w && s) return "CornerOutTR";
		if (!s && !w && (e || n)) return "CornerOutBL";
		if (!s && !e && (w || n)) return "CornerOutBR";

		// Inner Corners (Interior/Concave)
		if (n && e && s && w) {
			var ne = isWall(x + 1, y - 1);
			var se = isWall(x + 1, y + 1);
			var sw = isWall(x - 1, y + 1);
			var nw = isWall(x - 1, y - 1);
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

	// The comments around these functions ensure they are removed when exporting, since the
	// debugger code is no longer relevant after publishing.
	/**BEGIN-PREVIEWONLY**/
	behinstProto.getDebuggerValues = function (propsections)
	{
		// Append to propsections any debugger sections you want to appear.
		// Each section is an object with two members: "title" and "properties".
		// "properties" is an array of individual debugger properties to display
		// with their name and value, and some other optional settings.
		propsections.push({
			"title": "Dungeon Gen",
			"properties": []
		});
	};
	
	behinstProto.onDebugValueEdited = function (header, name, value)
	{
		// Called when a non-readonly property has been edited in the debugger. Usually you only
		// will need 'name' (the property name) and 'value', but you can also use 'header' (the
		// header title for the section) to distinguish properties with the same name.
	};
	/**END-PREVIEWONLY**/

	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	
	Cnds.prototype.OnGenerationComplete = function () { return true; };
	
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

	// ... other conditions here ...
	
	behaviorProto.cnds = new Cnds();

	//////////////////////////////////////
	// Actions
	function Acts() {};

	Acts.prototype.GenerateDungeon = function ()
	{
		var tilemapInst = this.inst;
		var tilemapActs = tilemapInst.type.plugin.acts;

		this._setSeed(this.seed);
		
		// 1. Setup Grid & Clear
		if (tilemapActs && tilemapActs.SetSize)
			tilemapActs.SetSize.call(tilemapInst, this.mapWidth, this.mapHeight);

		var tw = tilemapInst.tilewidth || 32;
		var th = tilemapInst.tileheight || 32;
		tilemapInst.width = this.mapWidth * tw;
		tilemapInst.height = this.mapHeight * th;
		if (tilemapInst.set_bbox_changed) tilemapInst.set_bbox_changed();

		this.grid = [];
		for(var x=0; x<this.mapWidth; x++) {
			this.grid[x] = [];
			for(var y=0; y<this.mapHeight; y++) {
				this.grid[x][y] = this.VOID;
			}
		}

		// 2. Generate Rooms
		this.rooms = [];
		var attempts = 0;
		var maxAttempts = this.numRooms * 30;
		
		while(this.rooms.length < this.numRooms && attempts < maxAttempts) {
			attempts++;
			var w = this._randInt(this.minRoomSize, this.maxRoomSize);
			var h = this._randInt(this.minRoomSize, this.maxRoomSize);
			var bp = this.borderPadding;
			var rx = this._randInt(bp, this.mapWidth - w - bp);
			var ry = this._randInt(bp, this.mapHeight - h - bp);
			
			var overlap = false;
			for(var i=0; i<this.rooms.length; i++) {
				var r = this.rooms[i];
				// Add gap
				if(rx < r.x + r.w + this.gap && rx + w + this.gap > r.x && ry < r.y + r.h + this.gap && ry + h + this.gap > r.y) {
					overlap = true;
					break;
				}
			}
			
			if(!overlap) {
				var newRoom = {x: rx, y: ry, w: w, h: h, cx: rx + w/2, cy: ry + h/2, id: this.rooms.length};
				this.rooms.push(newRoom);

				// Carve room based on shape
				if (this.roomShape === 0) { // Rectangle
					for(var i=rx; i<rx+w; i++) {
						for(var j=ry; j<ry+h; j++) {
							if (i >= 0 && i < this.mapWidth && j >= 0 && j < this.mapHeight) {
								this.grid[i][j] = this.FLOOR;
							}
						}
					}
				} else { // Circle (1) or Organic (2)
					var centerX = Math.floor(newRoom.cx);
					var centerY = Math.floor(newRoom.cy);
					var radius = Math.floor(Math.min(w, h) / 2);
					var r2 = radius * radius;

					for(var i = centerX - radius; i <= centerX + radius; i++) {
						for(var j = centerY - radius; j <= centerY + radius; j++) {
							if (i < 0 || i >= this.mapWidth || j < 0 || j >= this.mapHeight) continue;
							
							var dx = i - centerX;
							var dy = j - centerY;
							if ((dx*dx) + (dy*dy) <= r2) {
								this.grid[i][j] = this.FLOOR;
							}
						}
					}
				}
			}
		}
		this.generatedRooms = this.rooms.length;

		// 3. Delaunay & MST
		if(this.rooms.length > 1 && this.connectivity > 0) {
			var edges = this._triangulate(this.rooms);
			var mstEdges = this._computeMST(this.rooms, edges, this.connectivity);
			
			// 4. Carve Corridors (L-Shaped)
			for(var i=0; i<mstEdges.length; i++) {
				var e = mstEdges[i];
				var x1 = Math.floor(e.u.cx);
				var y1 = Math.floor(e.u.cy);
				var x2 = Math.floor(e.v.cx);
				var y2 = Math.floor(e.v.cy);

				var corrWidth = this.corridorSize;

				// Randomly choose horizontal-first or vertical-first
				if (this._random() < 0.5) {
					this._carveH(this.grid, x1, x2, y1, corrWidth);
					this._carveV(this.grid, y1, y2, x2, corrWidth);
				} else {
					this._carveV(this.grid, y1, y2, x1, corrWidth);
					this._carveH(this.grid, x1, x2, y2, corrWidth);
				}
			}
		}

		// 4. Apply Cellular Automata for Organic mode
		if (this.roomShape === 2) {
			for(var k=0; k<2; k++) {
				this._applyCA(this.grid);
			}
		}

		// 4.5. Generate Walls
		if (this.wallThickness === 0) {
			// Filled mode: Turn all VOID into WALL
			for (var x = 0; x < this.mapWidth; x++) {
				for (var y = 0; y < this.mapHeight; y++) {
					if (this.grid[x][y] === this.VOID) {
						this.grid[x][y] = this.WALL;
					}
				}
			}
		} else if (this.wallThickness > 0) {
			// Thickness mode: Expand walls 'wallThickness' times from floor
			for (var i = 0; i < this.wallThickness; i++) {
				var wallsToPlace = [];
				for (var x = 0; x < this.mapWidth; x++) {
					for (var y = 0; y < this.mapHeight; y++) {
						if (this.grid[x][y] === this.VOID) {
							var isAdjacent = false;
							// Check 8 neighbors
							for (var nx = x - 1; nx <= x + 1; nx++) {
								for (var ny = y - 1; ny <= y + 1; ny++) {
									if ((nx === x && ny === y) || nx < 0 || ny < 0 || nx >= this.mapWidth || ny >= this.mapHeight) continue;
									
									var neighbor = this.grid[nx][ny];
									// Attach to Floor or previously placed Wall
									if (neighbor === this.FLOOR || neighbor === this.WALL) {
										isAdjacent = true;
										break;
									}
								}
								if (isAdjacent) break;
							}
							if (isAdjacent) wallsToPlace.push({x: x, y: y});
						}
					}
				}
				
				if (wallsToPlace.length === 0) break;
				for(var j=0; j<wallsToPlace.length; j++) {
					var p = wallsToPlace[j];
					this.grid[p.x][p.y] = this.WALL;
				}
			}
		}

		// 4.6 Cleanup
		this._cleanupGrid();

		// 5. Apply to Tilemap
		this._paintTilemap();
		
		this.runtime.redraw = true;
		this.runtime.trigger(cr.behaviors.DelaunayDungeon.prototype.cnds.OnGenerationComplete, this.inst);
	};

	behinstProto._carveH = function(grid, x1, x2, y, width) {
		width = width || 1;
		var half = Math.floor(width / 2);
		for (var x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
			for (var w = -half; w <= half; w++) {
				if (y+w >= 0 && y+w < this.mapHeight)
					grid[x][y+w] = this.FLOOR;
			}
		}
	};

	behinstProto._carveV = function(grid, y1, y2, x, width) {
		width = width || 1;
		var half = Math.floor(width / 2);
		for (var y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
			for (var w = -half; w <= half; w++) {
				if (x+w >= 0 && x+w < this.mapWidth)
					grid[x+w][y] = this.FLOOR;
			}
		}
	};

	behinstProto._applyCA = function(grid) {
		var newGrid = [];
		for(var x=0; x<this.mapWidth; x++) {
			newGrid[x] = grid[x].slice();
		}

		for(var x=1; x<this.mapWidth-1; x++) {
			for(var y=1; y<this.mapHeight-1; y++) {
				var wallCount = 0;
				for(var i=-1; i<=1; i++) {
					for(var j=-1; j<=1; j++) {
						if (grid[x+i][y+j] !== this.FLOOR) wallCount++;
					}
				}
				
				if (wallCount >= 5) newGrid[x][y] = this.VOID;
				else if (wallCount <= 2) newGrid[x][y] = this.FLOOR;
			}
		}
		
		for(var x=0; x<this.mapWidth; x++) {
			grid[x] = newGrid[x];
		}
	};

	behinstProto._cleanupGrid = function() {
		var changed = true;
		var maxIterations = 10; // Safety break to prevent infinite loops
		var iter = 0;

		var isNotWall = (tx, ty) => {
			if (tx < 0 || tx >= this.mapWidth || ty < 0 || ty >= this.mapHeight) return true;
			return this.grid[tx][ty] !== this.WALL;
		};

		while(changed && iter < maxIterations) {
			changed = false;
			iter++;
			var toRemove = [];

			for (var x = 0; x < this.mapWidth; x++) {
				for (var y = 0; y < this.mapHeight; y++) {
					if (this.grid[x][y] === this.WALL) {
						var wallNeighbors = 0;
						if (!isNotWall(x - 1, y)) wallNeighbors++;
						if (!isNotWall(x + 1, y)) wallNeighbors++;
						if (!isNotWall(x, y - 1)) wallNeighbors++;
						if (!isNotWall(x, y + 1)) wallNeighbors++;
						
						// Remove tips of walls (fewer than 2 neighbors)
						if (wallNeighbors < 2) {
							toRemove.push({x: x, y: y});
							continue;
						}

						// Remove 1-tile thick walls between two floor/void areas
						var isThinH = isNotWall(x, y - 1) && isNotWall(x, y + 1);
						var isThinV = isNotWall(x - 1, y) && isNotWall(x + 1, y);

						if (isThinH || isThinV) {
							toRemove.push({x: x, y: y});
						}
					}
				}
			}

			if (toRemove.length > 0) {
				changed = true;
				for(var i=0; i<toRemove.length; i++) {
					this.grid[toRemove[i].x][toRemove[i].y] = this.FLOOR;
				}
			}
		}
	};

	behinstProto._paintTilemap = function() {
		var tilemapInst = this.inst;
		if (!tilemapInst) return;
		
		var tilemapActs = tilemapInst.type.plugin.acts;
		
		if (tilemapActs && tilemapActs.SetTile)
		{
			for(var x = 0; x < this.mapWidth; x++) {
				for(var y = 0; y < this.mapHeight; y++) {
					var tileType = this.grid[x][y];
					var outputTile = -1;

					if (tileType === this.FLOOR) {
						var depthTile = -1;
						if (this.autotiling === 1) {
							depthTile = this._getDepthTile(x, y);
						}
						
						if (depthTile !== -1) outputTile = depthTile;
						else outputTile = this._resolveVariant(19, this.floorTile);
					}
					else if (tileType === this.WALL) {
                        if (this.autotiling === 1) {
                            outputTile = this._getWallTile(x, y);
                        } else {
						    outputTile = this._resolveVariant(20, this.wallTile);
                        }
					}
					// If VOID, outputTile remains -1, which will erase the tile.

					if (outputTile === -1 && tilemapActs.EraseTile)
						tilemapActs.EraseTile.call(tilemapInst, x, y);
					else if (outputTile > -1)
						tilemapActs.SetTile.call(tilemapInst, x, y, outputTile);
				}
			}
		}
		
		if (tilemapInst.set_bbox_changed)
			tilemapInst.set_bbox_changed();
		
		this.runtime.redraw = true;
	};
	
	// ... other actions here ...
	
	behaviorProto.acts = new Acts();

	//////////////////////////////////////
	// Actions
    Acts.prototype.SetAutotilingEnabled = function (state) {
        this.autotiling = state;
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

	Acts.prototype.AddAutotileVariant = function (shape_index, id, prob) {
        if (!this.variants[shape_index]) this.variants[shape_index] = [];
        this.variants[shape_index].push({id: id, prob: prob});
    };

	Acts.prototype.SetFloorTile = function (id) { this.floorTile = id; };
	Acts.prototype.SetWallTile = function (id) { this.wallTile = id; };
	Acts.prototype.SetSeed = function (seed) { this._setSeed(seed); };
	
	Acts.prototype.SetCorridorSize = function (size) {
		this.corridorSize = Math.max(1, Math.floor(size));
	};

	Acts.prototype.RevealCircle = function (centerX, centerY, radius, transparentTileID, floorTileID)
	{
		var maskTilemapInst = this.inst;
		var maskTilemapActs = maskTilemapInst.type.plugin.acts;
		if (!maskTilemapActs || !maskTilemapActs.SetTile || !maskTilemapActs.EraseTile) {
			return; // Not a valid tilemap object
		}

		var dungeonTilemap = this.inst;
		if (!dungeonTilemap.tilewidth || !dungeonTilemap.tileheight) return;

		var tx = Math.floor(centerX / dungeonTilemap.tilewidth);
		var ty = Math.floor(centerY / dungeonTilemap.tileheight);
		var r2 = radius * radius;

		var int_radius = Math.ceil(radius);

		for (var dx = -int_radius; dx <= int_radius; dx++) {
			for (var dy = -int_radius; dy <= int_radius; dy++) {
				
				if (dx * dx + dy * dy > r2) {
					continue;
				}

				var targetX = tx + dx;
				var targetY = ty + dy;

				// Check bounds of the dungeon grid
				if (targetX < 0 || targetX >= this.mapWidth || targetY < 0 || targetY >= this.mapHeight) {
					continue;
				}

				var tileType = this.grid[targetX][targetY];

				if (tileType === this.FLOOR) {
					if (floorTileID === -1) {
						// Erase the tile on the mask
						maskTilemapActs.EraseTile.call(maskTilemapInst, targetX, targetY);
					} else {
						maskTilemapActs.SetTile.call(maskTilemapInst, targetX, targetY, floorTileID);
					}
				}
				else if (tileType === this.WALL) {
					// Check if this wall is adjacent to a floor tile
					var isAdjacentToFloor = false;
					// Check 8-way neighbors
					for (var ni = -1; ni <= 1; ni++) {
						for (var nj = -1; nj <= 1; nj++) {
							if (ni === 0 && nj === 0) continue;

							var nx = targetX + ni;
							var ny = targetY + nj;

							if (nx >= 0 && nx < this.mapWidth && ny >= 0 && ny < this.mapHeight && this.grid[nx][ny] === this.FLOOR) {
								isAdjacentToFloor = true;
								break; // break inner loop
							}
						}
						if (isAdjacentToFloor) break; // break outer loop
					}

					if (isAdjacentToFloor) {
						// It's a wall bordering a floor, so set the transparent tile on the mask
						maskTilemapActs.SetTile.call(maskTilemapInst, targetX, targetY, transparentTileID);
					}
				}
			}
		}

		// Force the mask tilemap to redraw
		if (maskTilemapInst.runtime) {
			maskTilemapInst.runtime.redraw = true;
		}
	};


	//////////////////////////////////////
	// Expressions
	function Exps() {};

	Exps.prototype.RoomCount = function (ret)
	{
		ret.set_int(this.generatedRooms);
	};
	
	Exps.prototype.AutotileShapeAt = function (ret, x, y) {
		ret.set_string(this._getWallShapeAt(Math.floor(x), Math.floor(y)));
	};

	Exps.prototype.TileCornerInTR = function (ret) { ret.set_int(this.tileCornerInTR); };
	Exps.prototype.TileSideTop = function (ret) { ret.set_int(this.tileSideTop); };
	Exps.prototype.TileCornerOutTR = function (ret) { ret.set_int(this.tileCornerOutTR); };
	Exps.prototype.TileSideRight = function (ret) { ret.set_int(this.tileSideRight); };
	Exps.prototype.TileCornerInBR = function (ret) { ret.set_int(this.tileCornerInBR); };
	Exps.prototype.TileSideBottom = function (ret) { ret.set_int(this.tileSideBottom); };
	Exps.prototype.TileCornerOutBR = function (ret) { ret.set_int(this.tileCornerOutBR); };
	Exps.prototype.TileCornerOutBL = function (ret) { ret.set_int(this.tileCornerOutBL); };
	Exps.prototype.TileCornerInBL = function (ret) { ret.set_int(this.tileCornerInBL); };
	Exps.prototype.TileSideLeft = function (ret) { ret.set_int(this.tileSideLeft); };
	Exps.prototype.TileCornerOutTL = function (ret) { ret.set_int(this.tileCornerOutTL); };
	Exps.prototype.TileCornerInTL = function (ret) { ret.set_int(this.tileCornerInTL); };

	Exps.prototype.TileBelowCornerOutBL = function (ret) { ret.set_int(this.tileBelowCornerOutBL); };
	Exps.prototype.TileBelowSideTop = function (ret) { ret.set_int(this.tileBelowSideTop); };
	Exps.prototype.TileBelowCornerOutBR = function (ret) { ret.set_int(this.tileBelowCornerOutBR); };
	Exps.prototype.TileShadowSideRight = function (ret) { ret.set_int(this.tileShadowSideRight); };
	Exps.prototype.TileShadowCornerInTL = function (ret) { ret.set_int(this.tileShadowCornerInTL); };
	Exps.prototype.TileShadowBelowCornerOutBREnd = function (ret) { ret.set_int(this.tileShadowBelowCornerOutBREnd); };
	Exps.prototype.TileShadowBelowSideTop = function (ret) { ret.set_int(this.tileShadowBelowSideTop); };

	Exps.prototype.GetSeed = function (ret) {
		ret.set_string(this.seed.toString());
	};

	Exps.prototype.LoopRoomIndex = function (ret) {
		ret.set_int(this.loop_room_index);
	};

	Exps.prototype.RoomX = function (ret, index) {
		index = Math.floor(index);
		if (this.rooms && index >= 0 && index < this.rooms.length) {
			ret.set_int(this.rooms[index].x);
		} else {
			ret.set_int(0);
		}
	};

	Exps.prototype.RoomY = function (ret, index) {
		index = Math.floor(index);
		if (this.rooms && index >= 0 && index < this.rooms.length) {
			ret.set_int(this.rooms[index].y);
		} else {
			ret.set_int(0);
		}
	};

	Exps.prototype.RoomWidth = function (ret, index) {
		index = Math.floor(index);
		if (this.rooms && index >= 0 && index < this.rooms.length) {
			ret.set_int(this.rooms[index].w);
		} else {
			ret.set_int(0);
		}
	};

	Exps.prototype.RoomHeight = function (ret, index) {
		index = Math.floor(index);
		if (this.rooms && index >= 0 && index < this.rooms.length) {
			ret.set_int(this.rooms[index].h);
		} else {
			ret.set_int(0);
		}
	};

	// ... other expressions here ...
	
	behaviorProto.exps = new Exps();
	
}());