function GetBehaviorSettings()
{
	return {
		"name":			"Autodungen",			// as appears in 'add behavior' dialog, can be changed as long as "id" stays the same
		"id":			"Autodungen",			// this is used to identify this behavior and is saved to the project; never change it
		"version":		"1.0",					// (float in x.y format) Behavior version - C2 shows compatibility warnings based on this
		"description":	"Generates a BSP dungeon. Must be attached to a Tilemap object.",
		"author":		"Gemini Code Assist",
		"help url":		"",
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
				
AddCondition(0, cf_trigger, "On generation complete", "Generation", "On generation complete", "Triggered when the dungeon generation algorithm has finished.", "OnGenerationComplete");

AddNumberParam("X", "The X coordinate (in tiles) to check.", "0");
AddNumberParam("Y", "The Y coordinate (in tiles) to check.", "0");
AddCondition(1, cf_none, "Is room at", "Queries", "Tile at ({0}, {1}) is a room", "Returns true if the specified tile coordinate is part of a room.", "IsRoomAt");

AddCondition(2, cf_looping | cf_not_invertible, "For each room", "Rooms", "For each room", "Loop through each room that was generated.", "ForEachRoom");

AddNumberParam("X", "The X coordinate (in tiles) to check.", "0");
AddNumberParam("Y", "The Y coordinate (in tiles) to check.", "0");
AddCondition(3, cf_none, "Is wall at", "Queries", "Tile at ({0}, {1}) is a wall", "Checks the internal grid data to see if a tile is a wall.", "IsWallAt");

////////////////////////////////////////
// Actions

AddStringParam("Seed", "The seed for the random number generator. Use the same seed for the same layout. Use '0' for a random seed.", "\"0\"");
AddAction(0, af_none, "Set seed", "Setup", "Set generation seed to {0}", "Sets the seed to ensure deterministic results.", "SetSeed");

AddNumberParam("Min Room Size", "The minimum width or height of a room. Partitions smaller than this will not be split.", "8");
AddNumberParam("Max Room Size", "The maximum width or height of a room. Partitions larger than this will always be split.", "20");
AddNumberParam("Padding", "The minimum empty space (in tiles) between a room's edge and its partition boundary.", "1");
AddAction(1, af_none, "Set constraints", "Setup", "Set constraints: Min Room Size <b>{0}</b>, Max Room Size <b>{1}</b>, Padding <b>{2}</b>", "Defines the size constraints for room generation.", "SetConstraints");

AddNumberParam("Width", "The width of the dungeon in tiles.", "50");
AddNumberParam("Height", "The height of the dungeon in tiles.", "50");
AddAction(2, af_none, "Generate dungeon", "Generation", "Generate dungeon with size ({0}, {1})", "Runs the BSP algorithm to generate the dungeon layout and applies it to the connected Tilemap.", "GenerateDungeon");

AddNumberParam("Wall Tile ID", "The tile ID to use for walls.", "1");
AddAction(3, af_none, "Set wall tile (default)", "Setup", "Set default wall tile ID to <b>{0}</b>", "Sets the default tile ID used for walls.", "SetWallTile");

AddNumberParam("Floor Tile ID", "The tile ID to use for floors.", "0");
AddAction(4, af_none, "Set floor tile", "Setup", "Set floor tile ID to <b>{0}</b>", "Sets the tile ID used for floors.", "SetFloorTile");

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
AddComboParamOption("Shadow Side Left");
AddComboParam("Shape", "The wall shape to set the tile for.");
AddNumberParam("Tile ID", "The tile ID to use (-1 for default).");
AddAction(5, af_none, "Set autotile ID", "Autotiling", "Set autotile for <b>{0}</b> to <b>{1}</b>", "Sets a specific tile ID for autotiling.", "SetAutotileID");

AddComboParamOption("Disabled");
AddComboParamOption("Enabled");
AddComboParam("State", "Set whether to use autotiling.", 1);
AddAction(6, af_none, "Set autotiling enabled", "Autotiling", "Set autotiling to <b>{0}</b>", "Enable or disable automatic wall tiling.", "SetAutotilingEnabled");

AddNumberParam("Size", "The width of corridors in tiles (odd numbers are best).", "1");
AddAction(7, af_none, "Set corridor size", "Setup", "Set corridor size to <b>{0}</b>", "Sets the width of generated corridors.", "SetCorridorSize");



////////////////////////////////////////
// Expressions

AddExpression(0, ef_return_number, "RoomCount", "Rooms", "RoomCount", "Returns the total number of rooms generated.");

AddNumberParam("Index", "The 0-based index of the room.");
AddExpression(1, ef_return_number, "RoomCenterX", "Rooms", "RoomCenterX", "Returns the X coordinate of the center of a specific room, in pixels.");

AddNumberParam("Index", "The 0-based index of the room.");
AddExpression(2, ef_return_number, "RoomCenterY", "Rooms", "RoomCenterY", "Returns the Y coordinate of the center of a specific room, in pixels.");

AddExpression(3, ef_return_number, "MapWidth", "Generation", "MapWidth", "Returns the width of the last generated map in tiles.");

AddExpression(4, ef_return_number, "MapHeight", "Generation", "MapHeight", "Returns the height of the last generated map in tiles.");

AddExpression(5, ef_return_string, "GetSeed", "Setup", "GetSeed", "Returns the current seed being used by the generator.");

AddExpression(6, ef_return_number, "LoopRoomIndex", "Rooms", "LoopRoomIndex", "Returns the current 0-based index in a 'For each room' loop.");

AddExpression(7, ef_return_number, "TileCornerInTR", "Autotiling", "TileCornerInTR", "Returns the tile ID for Corner In Top-Right.");
AddExpression(8, ef_return_number, "TileSideTop", "Autotiling", "TileSideTop", "Returns the tile ID for Side Top.");
AddExpression(9, ef_return_number, "TileCornerOutTR", "Autotiling", "TileCornerOutTR", "Returns the tile ID for Corner Out Top-Right.");
AddExpression(10, ef_return_number, "TileSideRight", "Autotiling", "TileSideRight", "Returns the tile ID for Side Right.");
AddExpression(11, ef_return_number, "TileCornerInBR", "Autotiling", "TileCornerInBR", "Returns the tile ID for Corner In Bottom-Right.");
AddExpression(12, ef_return_number, "TileSideBottom", "Autotiling", "TileSideBottom", "Returns the tile ID for Side Bottom.");
AddExpression(13, ef_return_number, "TileCornerOutBR", "Autotiling", "TileCornerOutBR", "Returns the tile ID for Corner Out Bottom-Right.");
AddExpression(14, ef_return_number, "TileCornerOutBL", "Autotiling", "TileCornerOutBL", "Returns the tile ID for Corner Out Bottom-Left.");
AddExpression(15, ef_return_number, "TileCornerInBL", "Autotiling", "TileCornerInBL", "Returns the tile ID for Corner In Bottom-Left.");
AddExpression(16, ef_return_number, "TileSideLeft", "Autotiling", "TileSideLeft", "Returns the tile ID for Side Left.");
AddExpression(17, ef_return_number, "TileCornerOutTL", "Autotiling", "TileCornerOutTL", "Returns the tile ID for Corner Out Top-Left.");
AddExpression(18, ef_return_number, "TileCornerInTL", "Autotiling", "TileCornerInTL", "Returns the tile ID for Corner In Top-Left.");

AddNumberParam("X", "The X coordinate (in tiles).");
AddNumberParam("Y", "The Y coordinate (in tiles).");
AddExpression(19, ef_return_string, "AutotileShapeAt", "Autotiling", "AutotileShapeAt", "Returns the name of the autotile shape at the given coordinates.");

AddExpression(20, ef_return_number, "TileBelowCornerOutBL", "Autotiling", "TileBelowCornerOutBL", "Returns the tile ID for Below Corner Out Bottom-Left.");
AddExpression(21, ef_return_number, "TileBelowSideTop", "Autotiling", "TileBelowSideTop", "Returns the tile ID for Below Side Top.");
AddExpression(22, ef_return_number, "TileBelowCornerOutBR", "Autotiling", "TileBelowCornerOutBR", "Returns the tile ID for Below Corner Out Bottom-Right.");
AddExpression(23, ef_return_number, "TileShadowSideRight", "Autotiling", "TileShadowSideRight", "Returns the tile ID for Shadow Side Right.");
AddExpression(24, ef_return_number, "TileShadowCornerInTL", "Autotiling", "TileShadowCornerInTL", "Returns the tile ID for Shadow Corner In Top-Left.");
AddExpression(26, ef_return_number, "TileShadowBelowCornerOutBREnd", "Autotiling", "TileShadowBelowCornerOutBREnd", "Returns the tile ID for Shadow Below Corner Out Bottom-Right End.");
AddExpression(27, ef_return_number, "TileShadowSideLeft", "Autotiling", "TileShadowSideLeft", "Returns the tile ID for Shadow Side Left.");

////////////////////////////////////////
ACESDone();

////////////////////////////////////////
// Array of property grid properties for this plugin
// new cr.Property(ept_integer,		name,	initial_value,	description)		// an integer value
// new cr.Property(ept_float,		name,	initial_value,	description)		// a float value
// new cr.Property(ept_text,		name,	initial_value,	description)		// a string
// new cr.Property(ept_combo,		name,	"Item 1",		description, "Item 1|Item 2|Item 3")	// a dropdown list (initial_value is string of initially selected item)

var property_list = [
	new cr.Property(ept_integer, 	"Min Room Size",			8,		"The minimum width or height of a room. Partitions smaller than this will not be split."),
	new cr.Property(ept_integer, 	"Max Room Size",			20,		"Partitions larger than this will always be split to create smaller rooms."),
	new cr.Property(ept_integer, 	"Room Padding",				1,		"The minimum empty space (in tiles) between a room's edge and its partition boundary."),
    new cr.Property(ept_integer, 	"Corridor Size",			1,		"The width of corridors in tiles. Odd numbers look best."),
    new cr.Property(ept_text, 		"Seed",						"0",	"The seed for the random number generator. Use '0' for a random seed on startup."),
	new cr.Property(ept_integer, 	"Floor Tile",				0,		"The tile ID to use for floors and corridors."),
    new cr.Property(ept_combo,      "Autotiling",           	"Disabled", "Enable or disable automatic wall tiling.", "Disabled|Enabled"),
	new cr.Property(ept_integer, 	"Wall Tile (Default)",		1,		"The default tile ID for walls, or when autotiling is disabled."),
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
    new cr.Property(ept_combo, 		"Thick Walls",				"No",	"Ensure walls are at least 2 tiles thick.", "No|Yes"),
    new cr.Property(ept_integer, 	"Below Corner Out BL",		-1,		"Tile ID below Corner Out Bottom-Left. -1 to use default."),
    new cr.Property(ept_integer, 	"Below Side Top",		    -1,		"Tile ID below Side Top. -1 to use default."),
    new cr.Property(ept_integer, 	"Below Corner Out BR",		-1,		"Tile ID below Corner Out Bottom-Right. -1 to use default."),
    new cr.Property(ept_integer, 	"Shadow Side Right",		-1,		"Tile ID for Shadow Side Right. -1 to use default."),
    new cr.Property(ept_integer, 	"Shadow Corner In TL",		-1,		"Tile ID for Shadow Corner In Top-Left. -1 to use default."),
    new cr.Property(ept_integer, 	"Shadow Below Corner Out BR End", -1, "Tile ID for Shadow Below Corner Out Bottom-Right End. -1 to use default."),
    new cr.Property(ept_integer, 	"Shadow Side Left",			-1,		"Tile ID for Shadow Side Left. -1 to use default.")
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
