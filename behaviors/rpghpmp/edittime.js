function GetBehaviorSettings()
{
	return {
		"name":			"Rpg Points",			// as appears in 'add behavior' dialog, can be changed as long as "id" stays the same
		"id":			"RpgPoints",			// this is used to identify this behavior and is saved to the project; never change it
		"version":		"1.0",					// (float in x.y format) Behavior version - C2 shows compatibility warnings based on this
		"description":	"A flexible resource manager for HP, MP, and any custom values like AP, Rage, etc.",
		"author":		"Gemini Code Assist",
		"help url":		"https://www.construct.net",
		"category":		"General",				// Prefer to re-use existing categories, but you can set anything here
		"flags":		0						// uncomment lines to enable flags...
					//	| bf_onlyone			// can only be added once to an object, e.g. solid
	};
};

////////////////////////////////////////
// Conditions

// On Health Depleted
AddCondition(0, cf_trigger, "On health depleted", "HP", "{my} On health depleted", "Triggered when the 'HP' resource drops to 0 or below.", "OnHealthDepleted");

// Is Resource Maxed
AddStringParam("Resource key", "The key for the resource to check (e.g., \"HP\", \"MP\", \"AP\").");
AddCondition(1, cf_none, "Is resource maxed", "Resources", "{my} Is resource <b>{0}</b> maxed", "True if the current value of a resource is equal to its maximum.", "IsResourceMaxed");

// Is Resource Available
AddStringParam("Resource key", "The key for the resource to check (e.g., \"HP\", \"MP\", \"AP\").");
AddNumberParam("Required amount", "The amount required for the check to pass.");
AddCondition(2, cf_none, "Is resource available", "Resources", "{my} Resource <b>{0}</b> has at least <b>{1}</b>", "True if the current value of a resource is greater than or equal to a specific amount.", "IsResourceAvailable");

// On Mana Depleted
AddCondition(3, cf_trigger, "On mana depleted", "MP", "{my} On mana depleted", "Triggered when the 'MP' resource drops to 0 or below.", "OnManaDepleted");

////////////////////////////////////////
// Actions

// Take Damage
AddNumberParam("Amount", "The amount of damage to take (will be subtracted from 'HP').");
AddAction(0, af_none, "Take damage", "HP", "Take <b>{0}</b> damage", "Deduct an amount from the 'HP' resource.", "TakeDamage");

// Heal
AddNumberParam("Amount", "The amount to heal (will be added to 'HP').");
AddAction(1, af_none, "Heal", "HP", "Heal <b>{0}</b> HP", "Add an amount to the 'HP' resource, capped at its maximum.", "Heal");

// Modify Resource
AddStringParam("Resource key", "The key for the resource to modify (e.g., \"HP\", \"MP\", \"AP\").");
AddAnyTypeParam("Amount", "The amount to add (positive) or subtract (negative) from the resource.");
AddAction(2, af_none, "Modify resource", "Resources", "Modify <b>{0}</b> by <b>{1}</b>", "Add to or subtract from any resource pool.", "ModifyResource");

// Set Max Resource
AddStringParam("Resource key", "The key for the resource to modify (e.g., \"HP\", \"MP\", \"AP\").");
AddNumberParam("New maximum", "The new maximum value for the resource.");
AddAction(3, af_none, "Set max resource", "Resources", "Set max <b>{0}</b> to <b>{1}</b>", "Set the maximum capacity for a resource.", "SetMaxResource");

// Add Custom Resource
AddStringParam("Resource key", "A unique name for the new resource (e.g., \"RAGE\", \"STAMINA\").");
AddNumberParam("Maximum amount", "The maximum capacity of this new resource.", "100");
AddNumberParam("Current amount", "The starting value of this new resource.", "100");
AddNumberParam("Regen rate", "The amount to regenerate per second (can be negative).", "0");
AddAction(4, af_none, "Add custom resource", "Resources", "Add custom resource <b>{0}</b> (max: {1}, current: {2}, regen: {3}/s)", "Initialize and register a new custom resource pool.", "AddCustomResource");

// Spend Mana
AddNumberParam("Amount", "The amount of mana to spend (will be subtracted from 'MP').");
AddAction(5, af_none, "Spend mana", "MP", "Spend <b>{0}</b> mana", "Deduct an amount from the 'MP' resource.", "SpendMana");

// Restore Mana
AddNumberParam("Amount", "The amount of mana to restore (will be added to 'MP').");
AddAction(6, af_none, "Restore mana", "MP", "Restore <b>{0}</b> MP", "Add an amount to the 'MP' resource, capped at its maximum.", "RestoreMana");

AddNumberParam("Max HP", "The new maximum HP.");
AddNumberParam("Max MP", "The new maximum MP.");
AddNumberParam("HP Regen", "The new HP regeneration rate.");
AddNumberParam("MP Regen", "The new MP regeneration rate.");
AddAction(7, af_none, "Set stats (Level Up)", "HP & MP", "Set stats: Max HP to <b>{0}</b>, Max MP to <b>{1}</b>, HP Regen to <b>{2}</b>, MP Regen to <b>{3}</b>", "Update Max HP, Max MP, and regeneration rates.", "SetStats");

////////////////////////////////////////
// Expressions

// CurrentResource
AddStringParam("ResourceKey", "The key of the resource to get the current value of.");
AddExpression(0, ef_return_number, "CurrentResource", "Resources", "CurrentResource", "Returns the current value of the specified resource pool.");

// MaxResource
AddStringParam("ResourceKey", "The key of the resource to get the maximum value of.");
AddExpression(1, ef_return_number, "MaxResource", "Resources", "MaxResource", "Returns the maximum capacity of the specified resource pool.");

// ResourcePercent
AddStringParam("ResourceKey", "The key of the resource to get the percentage of.");
AddExpression(2, ef_return_number, "ResourcePercent", "Resources", "ResourcePercent", "Returns the current value as a percentage (0-100) of the maximum.");


////////////////////////////////////////
// HP & MP Expressions
AddExpression(3, ef_return_number, "HP", "HP", "HP", "Returns the current value of the HP resource.");
AddExpression(4, ef_return_number, "MaxHP", "HP", "MaxHP", "Returns the maximum capacity of the HP resource.");
AddExpression(5, ef_return_number, "HPPercent", "HP", "HPPercent", "Returns the current HP as a percentage (0-100).");

AddExpression(6, ef_return_number, "MP", "MP", "MP", "Returns the current value of the MP resource.");
AddExpression(7, ef_return_number, "MaxMP", "MP", "MaxMP", "Returns the maximum capacity of the MP resource.");
AddExpression(8, ef_return_number, "MPPercent", "MP", "MPPercent", "Returns the current MP as a percentage (0-100).");

AddExpression(9, ef_return_number, "BaseMaxHP", "HP", "BaseMaxHP", "Returns the initial Max HP set in properties.");
AddExpression(10, ef_return_number, "BaseMaxMP", "MP", "BaseMaxMP", "Returns the initial Max MP set in properties.");
AddExpression(11, ef_return_number, "BaseRegenHP", "HP", "BaseRegenHP", "Returns the initial HP Regen set in properties.");
AddExpression(12, ef_return_number, "BaseRegenMP", "MP", "BaseRegenMP", "Returns the initial MP Regen set in properties.");

AddExpression(13, ef_return_number, "RegenHP", "HP", "RegenHP", "Returns the current HP regeneration rate.");
AddExpression(14, ef_return_number, "RegenMP", "MP", "RegenMP", "Returns the current MP regeneration rate.");

////////////////////////////////////////
ACESDone();

////////////////////////////////////////
// Array of property grid properties for this plugin
// new cr.Property(ept_integer,		name,	initial_value,	description)		// an integer value
// new cr.Property(ept_float,		name,	initial_value,	description)		// a float value
// new cr.Property(ept_text,		name,	initial_value,	description)		// a string
// new cr.Property(ept_combo,		name,	"Item 1",		description, "Item 1|Item 2|Item 3")	// a dropdown list (initial_value is string of initially selected item)

var property_list = [
	new cr.Property(ept_float, 	"Max HP",		100,		"The primary resource's maximum capacity."),
	new cr.Property(ept_float, 	"Max MP",		50,			"The secondary resource's maximum capacity."),
	new cr.Property(ept_float, 	"Default Regen Rate (HP)",		0,		"HP recovered per second."),
	new cr.Property(ept_float, 	"Default Regen Rate (MP)",		0,		"MP recovered per second.")
	];
	
//////////////////////////////////////////////////////////////
// The rest of this file is boilerplate logic; you may not need to edit it.

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
