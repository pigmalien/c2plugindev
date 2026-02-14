// ECMAScript 5 strict mode
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
		this.mapWidth = this.properties[0];
		this.mapHeight = this.properties[1];
		this.numRooms = this.properties[2];
		this.minRoomSize = this.properties[3];
		this.maxRoomSize = this.properties[4];
		this.roomShape = this.properties[5]; // 0=Rect, 1=Circle
        this.wallThickness = this.properties[6];
		this.connectivity = this.properties[7];
		this.floorTile = this.properties[8];
		this.wallTile = this.properties[9];
		this.seed = this.properties[10];

		this.generatedRooms = 0;

		this.VOID_TILE = -2; // Internal constant for empty space
		this.prng = null;
	};
	
	behinstProto.onDestroy = function ()
	{
		// called when associated object is being destroyed
		// note runtime may keep the object and behavior alive after this call for recycling;
		// release, recycle or reset any references here as necessary
	};
	
	// called when saving the full state of the game
	behinstProto.saveToJSON = function ()
	{
		// return a Javascript object containing information about your behavior's state
		// note you MUST use double-quote syntax (e.g. "property": value) to prevent
		// Closure Compiler renaming and breaking the save format
		return {
			"mw": this.mapWidth,
			"mh": this.mapHeight,
			"nr": this.numRooms,
			"minr": this.minRoomSize,
			"maxr": this.maxRoomSize,
			"rs": this.roomShape,
            "wth": this.wallThickness,
			"conn": this.connectivity,
			"ft": this.floorTile,
			"wt": this.wallTile,
			"seed": this.seed
		};
	};
	
	// called when loading the full state of the game
	behinstProto.loadFromJSON = function (o)
	{
		// load from the state previously saved by saveToJSON
		this.mapWidth = o["mw"];
		this.mapHeight = o["mh"];
		this.numRooms = o["nr"];
		this.minRoomSize = o["minr"];
		this.maxRoomSize = o["maxr"];
		this.roomShape = o["rs"];
        this.wallThickness = o["wth"];
		this.connectivity = o["conn"];
		this.floorTile = o["ft"];
		this.wallTile = o["wt"];
		this.seed = o["seed"];
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
		if (seed === 0 || seed === "0" || seed === "") {
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

		var grid = [];
		for(var x=0; x<this.mapWidth; x++) {
			grid[x] = [];
			for(var y=0; y<this.mapHeight; y++) {
				grid[x][y] = this.VOID_TILE;
			}
		}

		// 2. Generate Rooms
		var rooms = [];
		var attempts = 0;
		var maxAttempts = this.numRooms * 20;
		
		while(rooms.length < this.numRooms && attempts < maxAttempts) {
			attempts++;
			var w = this._randInt(this.minRoomSize, this.maxRoomSize);
			var h = this._randInt(this.minRoomSize, this.maxRoomSize);
			var rx = this._randInt(1, this.mapWidth - w - 2);
			var ry = this._randInt(1, this.mapHeight - h - 2);
			
			var overlap = false;
			for(var i=0; i<rooms.length; i++) {
				var r = rooms[i];
				// Add 1 tile padding
				if(rx < r.x + r.w + 1 && rx + w + 1 > r.x && ry < r.y + r.h + 1 && ry + h + 1 > r.y) {
					overlap = true;
					break;
				}
			}
			
			if(!overlap) {
				var newRoom = {x: rx, y: ry, w: w, h: h, cx: rx + w/2, cy: ry + h/2, id: rooms.length};
				rooms.push(newRoom);

				// Carve room based on shape
				if (this.roomShape === 0) { // Rectangle
					for(var i=rx; i<rx+w; i++) {
						for(var j=ry; j<ry+h; j++) {
							if (i >= 0 && i < this.mapWidth && j >= 0 && j < this.mapHeight)
								grid[i][j] = this.floorTile;
						}
					}
				} else { // Circle
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
								grid[i][j] = this.floorTile;
							}
						}
					}
				}
			}
		}
		this.generatedRooms = rooms.length;

		// 3. Delaunay & MST
		if(rooms.length > 1 && this.connectivity > 0) {
			var edges = this._triangulate(rooms);
			var mstEdges = this._computeMST(rooms, edges, this.connectivity);
			
			// 4. Carve Corridors (L-Shaped)
			for(var i=0; i<mstEdges.length; i++) {
				var e = mstEdges[i];
				var x1 = Math.floor(e.u.cx);
				var y1 = Math.floor(e.u.cy);
				var x2 = Math.floor(e.v.cx);
				var y2 = Math.floor(e.v.cy);

				// Randomly choose horizontal-first or vertical-first
				if (this._random() < 0.5) {
					this._carveH(grid, x1, x2, y1);
					this._carveV(grid, y1, y2, x2);
				} else {
					this._carveV(grid, y1, y2, x1);
					this._carveH(grid, x1, x2, y2);
				}
			}
		}

		// 4.5. Generate Walls
		if (this.wallThickness === 0) {
			// Filled mode: Turn all VOID into WALL
			for (var x = 0; x < this.mapWidth; x++) {
				for (var y = 0; y < this.mapHeight; y++) {
					if (grid[x][y] === this.VOID_TILE) {
						grid[x][y] = this.wallTile;
					}
				}
			}
		} else if (this.wallThickness > 0) {
			// Thickness mode: Expand walls 'wallThickness' times
			for (var i = 0; i < this.wallThickness; i++) {
				var wallsToPlace = [];
				for (var x = 0; x < this.mapWidth; x++) {
					for (var y = 0; y < this.mapHeight; y++) {
						if (grid[x][y] === this.VOID_TILE) {
							var isAdjacent = false;
							// Check 8 neighbors
							for (var nx = x - 1; nx <= x + 1; nx++) {
								for (var ny = y - 1; ny <= y + 1; ny++) {
									if ((nx === x && ny === y) || nx < 0 || ny < 0 || nx >= this.mapWidth || ny >= this.mapHeight) continue;
									
									var neighbor = grid[nx][ny];
									// Attach to Floor or previously placed Wall
									if (neighbor === this.floorTile || neighbor === this.wallTile) {
										isAdjacent = true;
										break;
									}
								}
								if (isAdjacent) break;
							}
							if (isAdjacent) {
								wallsToPlace.push({x: x, y: y});
							}
						}
					}
				}
				
				if (wallsToPlace.length === 0) break;
				
				for(var j=0; j<wallsToPlace.length; j++) {
					var p = wallsToPlace[j];
					grid[p.x][p.y] = this.wallTile;
				}
			}
		}

		// 5. Apply to Tilemap
		if (tilemapActs && tilemapActs.SetTile) {
			for(var x=0; x<this.mapWidth; x++) {
				for(var y=0; y<this.mapHeight; y++) {
					var t = grid[x][y];
					if (t < 0) { // Covers -1 (user erase) and -2 (VOID)
						if (tilemapActs.EraseTile) tilemapActs.EraseTile.call(tilemapInst, x, y);
					} else {
						tilemapActs.SetTile.call(tilemapInst, x, y, t);
					}
				}
			}
		}
		
		this.runtime.redraw = true;
		this.runtime.trigger(cr.behaviors.DelaunayDungeon.prototype.cnds.OnGenerationComplete, this.inst);
	};

	behinstProto._carveH = function(grid, x1, x2, y) {
		for (var x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
			grid[x][y] = this.floorTile;
		}
	};

	behinstProto._carveV = function(grid, y1, y2, x) {
		for (var y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
			grid[x][y] = this.floorTile;
		}
	};
	
	// ... other actions here ...
	
	behaviorProto.acts = new Acts();

	//////////////////////////////////////
	// Expressions
	function Exps() {};

	Exps.prototype.RoomCount = function (ret)
	{
		ret.set_int(this.generatedRooms);
	};
	
	// ... other expressions here ...
	
	behaviorProto.exps = new Exps();
	
}());