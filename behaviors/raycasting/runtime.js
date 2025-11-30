﻿"use strict";
assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// The behavior constructor
cr.behaviors.Raycasting = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Raycasting.prototype;
		
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
		this.inst = inst;
		this.runtime = type.runtime;
	};
	
	var behinstProto = behaviorProto.Instance.prototype;

	behinstProto.onCreate = function()
	{
		this.myProperty = this.properties[0];
	};
	
	behinstProto.saveToJSON = function ()
	{
		return { "myprop": this.myProperty };
	};
	
	behinstProto.loadFromJSON = function (o)
	{
		this.myProperty = o["myprop"];
	};

	behinstProto.tick = function ()
	{
		// This function is called every tick.
	};

	//////////////////////////////////////
	// Actions
	function Acts() {};
	Acts.prototype.LogMessage = function ()
	{
		console.log("Raycasting behavior loaded! Property is: " + this.myProperty);
	};
	behaviorProto.acts = new Acts();

	behaviorProto.cnds = {};
	behaviorProto.exps = {};
}());