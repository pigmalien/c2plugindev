// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.KnockBack = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.KnockBack.prototype;
		
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
		// Knockback state
		this.isActive = false;
		this.startX = 0;
		this.startY = 0;
		this.targetX = 0;
		this.targetY = 0;
		this.progress = 0;
		this.duration = 0.2;
	};
	
	behinstProto.onDestroy = function ()
	{
	};
	
	behinstProto.saveToJSON = function ()
	{
		return {
			"isActive": this.isActive,
			"startX": this.startX,
			"startY": this.startY,
			"targetX": this.targetX,
			"targetY": this.targetY,
			"progress": this.progress,
			"duration": this.duration
		};
	};
	
	behinstProto.loadFromJSON = function (o)
	{
		this.isActive = o["isActive"];
		this.startX = o["startX"];
		this.startY = o["startY"];
		this.targetX = o["targetX"];
		this.targetY = o["targetY"];
		this.progress = o["progress"];
		this.duration = o["duration"];
	};

	behinstProto.tick = function ()
	{
		var dt = this.runtime.getDt(this.inst);
		
		if (!this.isActive)
			return;

		this.progress += dt / this.duration;

		if (this.progress >= 1)
		{
			this.progress = 1;
			this.inst.x = this.targetX;
			this.inst.y = this.targetY;
			this.isActive = false;
			this.runtime.trigger(cr.behaviors.KnockBack.prototype.cnds.OnKnockBackFinished, this.inst);
		}
		else
		{
			this.inst.x = cr.lerp(this.startX, this.targetX, this.progress);
			this.inst.y = cr.lerp(this.startY, this.targetY, this.progress);
		}
		
		this.inst.set_bbox_changed();
	};

	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	
	Cnds.prototype.OnKnockBackFinished = function ()
	{
		return true;
	};
	
	behaviorProto.cnds = new Cnds();

	//////////////////////////////////////
	// Actions
	function Acts() {};

	Acts.prototype.KnockBack = function (angle, distance, duration)
	{
		this.duration = duration;
		
		var angle_rad = cr.to_radians(angle);
		var targetX = this.inst.x + Math.cos(angle_rad) * distance;
		var targetY = this.inst.y + Math.sin(angle_rad) * distance;

		if (this.duration === 0)
		{
			this.isActive = false;
			this.inst.x = targetX;
			this.inst.y = targetY;
			this.runtime.trigger(cr.behaviors.KnockBack.prototype.cnds.OnKnockBackFinished, this.inst);
			return;
		}

		if (this.isActive)
		{
			// If we are already knocking back, update target from current position
			this.startX = this.inst.x;
			this.startY = this.inst.y;
		}
		else
		{
			this.isActive = true;
			this.startX = this.inst.x;
			this.startY = this.inst.y;
		}
		
		this.progress = 0;
		this.targetX = targetX;
		this.targetY = targetY;
	};
	
	behaviorProto.acts = new Acts();

	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();
	
}());