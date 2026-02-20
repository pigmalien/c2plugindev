﻿function GetBehaviorSettings()
{
	return {
		"name":			"Delaunay Dungeon",			// as appears in 'add behavior' dialog, can be changed as long as "id" stays the same
		"id":			"DelaunayDungeon",			// this is used to identify this behavior and is saved to the project; never change it
		"version":		"1.0",					// (float in x.y format) Behavior version - C2 shows compatibility warnings based on this
		"description":	"Procedurally generates a dungeon using Delaunay Triangulation and MST.",
		"author":		"Gemini Code Assist",
		"help url":		"<your website or a manual entry on Scirra.com>",
		"category":		"General",				// Prefer to re-use existing categories, but you can set anything here
		"flags":		bf_onlyone				// uncomment lines to enable flags...
	};
};

////////////////////////////////////////
// Parameter types:
// AddNumberParam(label, description [, initial_string = "0"])			// a number
// AddStringParam(label, description [, initial_string = "\"\""])		// a string
// AddAnyTypeParam(label, description [, initial_string = "0"])			// accepts either a number or string
// AddCmpParam(label, description)										// combo with equal, not equal, less, etc.
// AddComboParamOption(text)											// (repeat before "AddComboParam" to add combo items)
// AddComboParam(label, description [, initial_selection = 0])			// a dropdown list parameter
// AddObjectParam(label, description)									// a button to click and pick an object type
// AddLayerParam(label, description)									// accepts either a layer number or name (string)
// AddLayoutParam(label, description)									// a dropdown list with all project layouts
// AddKeybParam(label, description)										// a button to click and press a key (returns a VK)
// AddAudioFileParam(label, description)								// a dropdown list with all imported project audio files

////////////////////////////////////////
// Conditions

// AddCondition(id,					// any positive integer to uniquely identify this condition
//				flags,				// (see docs) cf_none, cf_trigger, cf_fake_trigger, cf_static, cf_not_invertible,
//									// cf_deprecated, cf_incompatible_with_triggers, cf_looping
//				list_name,			// appears in event wizard list
//				category,			// category in event wizard list
//				display_str,		// as appears in event sheet - use {0}, {1} for parameters and also <b></b>, <i></i>, and {my} for the current behavior icon & name
//				description,		// appears in event wizard dialog when selected
//				script_name);		// corresponding runtime function name
				
// example				
AddCondition(0, cf_trigger, "On generation complete", "Generation", "On generation complete", "Triggered when the dungeon generation is finished.", "OnGenerationComplete");
AddCondition(1, cf_looping | cf_not_invertible, "For each room", "Rooms", "For each room", "Loop through each room that was generated.", "ForEachRoom");

////////////////////////////////////////
// Actions

// AddAction(id,				// any positive integer to uniquely identify this action
//			 flags,				// (see docs) af_none, af_deprecated
//			 list_name,			// appears in event wizard list
//			 category,			// category in event wizard list
//			 display_str,		// as appears in event sheet - use {0}, {1} for parameters and also <b></b>, <i></i>
//			 description,		// appears in event wizard dialog when selected
//			 script_name);		// corresponding runtime function name

// example
AddAction(0, af_none, "Generate dungeon", "Generation", "Generate dungeon", "Generates the dungeon layout on the Tilemap.", "GenerateDungeon");

AddComboParamOption("Disabled");
AddComboParamOption("Enabled");
AddComboParam("State", "Set whether to use autotiling.", 1);
AddAction(1, af_none, "Set autotiling enabled", "Autotiling", "Set autotiling to <b>{0}</b>", "Enable or disable automatic wall tiling.", "SetAutotilingEnabled");

AddComboParamOption("Corner In Top-Right");
AddComboParamOption("Side Top");
AddComboParamOption("Corner Out Top-Right");
AddComboParamOption("Side Right");
AddComboParamOption("Corner In Bottom-Right");
AddComboParamOption("Side Bottom");
AddComboParamOption("Corner Out Bottom-Right");
AddComboParamOption("Corner Out Bottom-Left");
AddComboParamOption("Corner In Bottom-Left");
AddComboParamOption("Side Left");
AddComboParamOption("Corner Out Top-Left");
AddComboParamOption("Corner In Top-Left");
AddComboParamOption("Below Corner Out Bottom-Left");
AddComboParamOption("Below Side Top");
AddComboParamOption("Below Corner Out Bottom-Right");
AddComboParamOption("Shadow Side Right");
AddComboParamOption("Shadow Corner In Top-Left");
AddComboParamOption("Shadow Below Corner Out Bottom-Right End");
AddComboParamOption("Shadow Below Side Top");
AddComboParam("Shape", "The wall shape to set the tile for.");
AddNumberParam("Tile ID", "The tile ID to use (-1 for default).");
AddAction(2, af_none, "Set autotile ID", "Autotiling", "Set autotile for <b>{0}</b> to <b>{1}</b>", "Sets a specific tile ID for autotiling.", "SetAutotileID");

AddComboParamOption("Corner In Top-Right");
AddComboParamOption("Side Top");
AddComboParamOption("Corner Out Top-Right");
AddComboParamOption("Side Right");
AddComboParamOption("Corner In Bottom-Right");
AddComboParamOption("Side Bottom");
AddComboParamOption("Corner Out Bottom-Right");
AddComboParamOption("Corner Out Bottom-Left");
AddComboParamOption("Corner In Bottom-Left");
AddComboParamOption("Side Left");
AddComboParamOption("Corner Out Top-Left");
AddComboParamOption("Corner In Top-Left");
AddComboParamOption("Below Corner Out Bottom-Left");
AddComboParamOption("Below Side Top");
AddComboParamOption("Below Corner Out Bottom-Right");
AddComboParamOption("Shadow Side Right");
AddComboParamOption("Shadow Corner In Top-Left");
AddComboParamOption("Shadow Below Corner Out Bottom-Right End");
AddComboParamOption("Shadow Below Side Top");
AddComboParamOption("Floor");
AddComboParamOption("Wall");
AddComboParam("Shape", "The wall shape to add a variant for.");
AddNumberParam("Tile ID", "The tile ID to use as a variant.");
AddNumberParam("Probability", "The percentage chance (0-100) to use this variant.", "50");
AddAction(3, af_none, "Add autotile variant", "Autotiling", "Add variant tile <b>{1}</b> for <b>{0}</b> with <b>{2}%</b> chance", "Adds a variant tile for a specific shape with a given probability.", "AddAutotileVariant");

AddNumberParam("Floor Tile ID", "The tile ID to use for floors.", "0");
AddAction(4, af_none, "Set floor tile", "Setup", "Set floor tile ID to <b>{0}</b>", "Sets the tile ID used for floors.", "SetFloorTile");

AddNumberParam("Wall Tile ID", "The tile ID to use for walls.", "1");
AddAction(5, af_none, "Set wall tile (default)", "Setup", "Set default wall tile ID to <b>{0}</b>", "Sets the default tile ID used for walls.", "SetWallTile");

AddStringParam("Seed", "The seed for the random number generator. Use the same seed for the same layout. Use '0' for a random seed.", "\"\"");
AddAction(6, af_none, "Set seed", "Setup", "Set generation seed to {0}", "Sets the seed to ensure deterministic results.", "SetSeed");

AddNumberParam("Size", "The width of corridors in tiles. Odd numbers look best.", "1");
AddAction(7, af_none, "Set corridor size", "Setup", "Set corridor size to <b>{0}</b>", "Sets the width of generated corridors.", "SetCorridorSize");

AddNumberParam("Center X", "The world X coordinate for the center of the view.");
AddNumberParam("Center Y", "The world Y coordinate for the center of the view.");
AddNumberParam("Radius", "The radius of the circle in tiles.", "5");
AddNumberParam("Transparent Tile", "The tile ID to set for revealed walls on the mask.", "0");
AddNumberParam("Floor Tile", "The tile ID to set for revealed floors on the mask (-1 to erase).", "-1");
AddAction(8, af_none, "Reveal circle", "Masking", "Reveal circle at ({0}, {1}) with radius {2} (Wall: {3}, Floor: {4})", "Reveals a circular area on the tilemap.", "RevealCircle");

////////////////////////////////////////
// Expressions

// AddExpression(id,			// any positive integer to uniquely identify this expression
//				 flags,			// (see docs) ef_none, ef_deprecated, ef_return_number, ef_return_string,
//								// ef_return_any, ef_variadic_parameters (one return flag must be specified)
//				 list_name,		// currently ignored, but set as if appeared in event wizard
//				 category,		// category in expressions panel
//				 exp_name,		// the expression name after the dot, e.g. "foo" for "myobject.foo" - also the runtime function name
//				 description);	// description in expressions panel

// example
AddExpression(0, ef_return_number, "RoomCount", "Generation", "RoomCount", "Returns the number of rooms generated.");

AddNumberParam("X", "The X coordinate (in tiles).");
AddNumberParam("Y", "The Y coordinate (in tiles).");
AddExpression(1, ef_return_string, "AutotileShapeAt", "Autotiling", "AutotileShapeAt", "Returns the name of the autotile shape at the given coordinates.");

AddExpression(2, ef_return_number, "TileCornerInTR", "Autotiling", "TileCornerInTR", "Returns the tile ID for Corner In Top-Right.");
AddExpression(3, ef_return_number, "TileSideTop", "Autotiling", "TileSideTop", "Returns the tile ID for Side Top.");
AddExpression(4, ef_return_number, "TileCornerOutTR", "Autotiling", "TileCornerOutTR", "Returns the tile ID for Corner Out Top-Right.");
AddExpression(5, ef_return_number, "TileSideRight", "Autotiling", "TileSideRight", "Returns the tile ID for Side Right.");
AddExpression(6, ef_return_number, "TileCornerInBR", "Autotiling", "TileCornerInBR", "Returns the tile ID for Corner In Bottom-Right.");
AddExpression(7, ef_return_number, "TileSideBottom", "Autotiling", "TileSideBottom", "Returns the tile ID for Side Bottom.");
AddExpression(8, ef_return_number, "TileCornerOutBR", "Autotiling", "TileCornerOutBR", "Returns the tile ID for Corner Out Bottom-Right.");
AddExpression(9, ef_return_number, "TileCornerOutBL", "Autotiling", "TileCornerOutBL", "Returns the tile ID for Corner Out Bottom-Left.");
AddExpression(10, ef_return_number, "TileCornerInBL", "Autotiling", "TileCornerInBL", "Returns the tile ID for Corner In Bottom-Left.");
AddExpression(11, ef_return_number, "TileSideLeft", "Autotiling", "TileSideLeft", "Returns the tile ID for Side Left.");
AddExpression(12, ef_return_number, "TileCornerOutTL", "Autotiling", "TileCornerOutTL", "Returns the tile ID for Corner Out Top-Left.");
AddExpression(13, ef_return_number, "TileCornerInTL", "Autotiling", "TileCornerInTL", "Returns the tile ID for Corner In Top-Left.");

AddExpression(14, ef_return_number, "TileBelowCornerOutBL", "Autotiling", "TileBelowCornerOutBL", "Returns the tile ID for Below Corner Out Bottom-Left.");
AddExpression(15, ef_return_number, "TileBelowSideTop", "Autotiling", "TileBelowSideTop", "Returns the tile ID for Below Side Top.");
AddExpression(16, ef_return_number, "TileBelowCornerOutBR", "Autotiling", "TileBelowCornerOutBR", "Returns the tile ID for Below Corner Out Bottom-Right.");
AddExpression(17, ef_return_number, "TileShadowSideRight", "Autotiling", "TileShadowSideRight", "Returns the tile ID for Shadow Side Right.");
AddExpression(18, ef_return_number, "TileShadowCornerInTL", "Autotiling", "TileShadowCornerInTL", "Returns the tile ID for Shadow Corner In Top-Left.");
AddExpression(19, ef_return_number, "TileShadowBelowCornerOutBREnd", "Autotiling", "TileShadowBelowCornerOutBREnd", "Returns the tile ID for Shadow Below Corner Out Bottom-Right End.");
AddExpression(20, ef_return_number, "TileShadowBelowSideTop", "Autotiling", "TileShadowBelowSideTop", "Returns the tile ID for Shadow Below Side Top.");

AddExpression(21, ef_return_string, "GetSeed", "Setup", "GetSeed", "Returns the current seed being used by the generator.");
AddExpression(22, ef_return_number, "LoopRoomIndex", "Rooms", "LoopRoomIndex", "Returns the current 0-based index in a 'For each room' loop.");

AddNumberParam("Index", "The 0-based index of the room.");
AddExpression(23, ef_return_number, "RoomX", "Rooms", "RoomX", "Returns the X coordinate (in pixels) of the center of a specific room.");

AddNumberParam("Index", "The 0-based index of the room.");
AddExpression(24, ef_return_number, "RoomY", "Rooms", "RoomY", "Returns the Y coordinate (in pixels) of the center of a specific room.");

AddNumberParam("Index", "The 0-based index of the room.");
AddExpression(25, ef_return_number, "RoomWidth", "Rooms", "RoomWidth", "Returns the width of a specific room in tiles.");

AddNumberParam("Index", "The 0-based index of the room.");
AddExpression(26, ef_return_number, "RoomHeight", "Rooms", "RoomHeight", "Returns the height of a specific room in tiles.");

////////////////////////////////////////
ACESDone();

////////////////////////////////////////
// Array of property grid properties for this plugin
// new cr.Property(ept_integer,		name,	initial_value,	description)		// an integer value
// new cr.Property(ept_float,		name,	initial_value,	description)		// a float value
// new cr.Property(ept_text,		name,	initial_value,	description)		// a string
// new cr.Property(ept_combo,		name,	"Item 1",		description, "Item 1|Item 2|Item 3")	// a dropdown list (initial_value is string of initially selected item)

var property_list = [
    // --- Generation Settings ---
	new cr.Property(ept_integer, 	"Map Width",		50,		"Width of the dungeon in tiles."),
	new cr.Property(ept_integer, 	"Map Height",		50,		"Height of the dungeon in tiles."),
	new cr.Property(ept_text, 		"Seed",				"",		"The seed for the random number generator. Leave empty for random."),

    // --- Room Settings ---
	new cr.Property(ept_integer, 	"Number of Rooms",	10,		"Target number of rooms to generate."),
	new cr.Property(ept_integer, 	"Min Room Size",	4,		"Minimum size (width/diameter) of a room in tiles."),
	new cr.Property(ept_integer, 	"Max Room Size",	10,		"Maximum size (width/diameter) of a room in tiles."),
	new cr.Property(ept_combo,      "Room Shape",       "Rectangle", "The shape of the generated rooms.", "Rectangle|Circle|Organic"),
	new cr.Property(ept_float, 		"Connectivity",		1.0,	"0.0 (None) to 1.0 (Full MST). Controls how connected the rooms are."),
	new cr.Property(ept_integer, 	"Border Padding",	2,		"The minimum empty space (in tiles) between the map edge and any room."),

    // --- Tiling Settings ---
    new cr.Property(ept_combo,      "Autotiling",           	"Enabled", "Enable or disable automatic wall tiling.", "Disabled|Enabled"),
	new cr.Property(ept_integer,    "Wall Thickness",   1,      "Thickness of walls around rooms/corridors. 0: Filled, >0: Thickness in tiles. -1: No walls."),
	new cr.Property(ept_integer, 	"Corridor Size",	1,		"The width of corridors in tiles. Odd numbers look best."),
	new cr.Property(ept_integer, 	"Room Padding",		1,		"The minimum empty space (in tiles) between a room's edge and its partition boundary."),
	new cr.Property(ept_integer, 	"Gap",		        2,		"The minimum gap between rooms (in tiles)."),
	new cr.Property(ept_integer, 	"Floor Tile",	    0,		"The tile ID to use for floors."),
	new cr.Property(ept_integer, 	"Wall Tile (Default)",		1,		"The default tile ID for walls, or when autotiling is disabled."),
	
	// --- Autotile Shapes (Walls) ---
    new cr.Property(ept_integer, 	"Corner In Top-Right",		-1,		"Tile ID for this shape. -1 to use default."),
    new cr.Property(ept_integer, 	"Side Top",		            -1,		"Tile ID for this shape. -1 to use default."),
    new cr.Property(ept_integer, 	"Corner Out Top-Right",		-1,		"Tile ID for this shape. -1 to use default."),
    new cr.Property(ept_integer, 	"Side Right",		        -1,		"Tile ID for this shape. -1 to use default."),
    new cr.Property(ept_integer, 	"Corner In Bottom-Right",	-1,		"Tile ID for this shape. -1 to use default."),
    new cr.Property(ept_integer, 	"Side Bottom",		        -1,		"Tile ID for this shape. -1 to use default."),
    new cr.Property(ept_integer, 	"Corner Out Bottom-Right",	-1,		"Tile ID for this shape. -1 to use default."),
    new cr.Property(ept_integer, 	"Corner Out Bottom-Left",	-1,		"Tile ID for this shape. -1 to use default."),
    new cr.Property(ept_integer, 	"Corner In Bottom-Left",	-1,		"Tile ID for this shape. -1 to use default."),
    new cr.Property(ept_integer, 	"Side Left",		        -1,		"Tile ID for this shape. -1 to use default."),
    new cr.Property(ept_integer, 	"Corner Out Top-Left",		-1,		"Tile ID for this shape. -1 to use default."),
    new cr.Property(ept_integer, 	"Corner In Top-Left",		-1,		"Tile ID for this shape. -1 to use default."),
	
	// --- Autotile Shapes (Depth & Shadow) ---
    new cr.Property(ept_integer, 	"Below Corner Out BL",		-1,		"Tile ID below Corner Out Bottom-Left. -1 to use default."),
    new cr.Property(ept_integer, 	"Below Side Top",		    -1,		"Tile ID below Side Top. -1 to use default."),
    new cr.Property(ept_integer, 	"Below Corner Out BR",		-1,		"Tile ID below Corner Out Bottom-Right. -1 to use default."),
    new cr.Property(ept_integer, 	"Shadow Side Right",		-1,		"Tile ID for Shadow Side Right. -1 to use default."),
    new cr.Property(ept_integer, 	"Shadow Corner In TL",		-1,		"Tile ID for Shadow Corner In Top-Left. -1 to use default."),
    new cr.Property(ept_integer, 	"Shadow Below Corner Out BR End", -1, "Tile ID for Shadow Below Corner Out Bottom-Right End. -1 to use default."),
    new cr.Property(ept_integer, 	"Shadow Below Side Top",	-1,		"Tile ID for Shadow Below Side Top. -1 to use default.")
	];
	
// Called by IDE when a new behavior type is to be created
function CreateIDEBehaviorType()
{
	return new IDEBehaviorType();
}

// Class representing a behavior type in the IDE
function IDEBehaviorType()
{
	assert2(this instanceof arguments.callee, "Constructor called as a function");
}

// Called by IDE when a new behavior instance of this type is to be created
IDEBehaviorType.prototype.CreateInstance = function(instance)
{
	return new IDEInstance(instance, this);
}

// Class representing an individual instance of the behavior in the IDE
function IDEInstance(instance, type)
{
	assert2(this instanceof arguments.callee, "Constructor called as a function");
	
	// Save the constructor parameters
	this.instance = instance;
	this.type = type;
	
	// Set the default property values from the property table
	this.properties = {};
	
	for (var i = 0; i < property_list.length; i++)
		this.properties[property_list[i].name] = property_list[i].initial_value;
		
	// any other properties here, e.g...
	// this.myValue = 0;
}

// Called by the IDE after all initialization on this instance has been completed
IDEInstance.prototype.OnCreate = function()
{
}

// Called by the IDE after a property has been changed
IDEInstance.prototype.OnPropertyChanged = function(property_name)
{
}
