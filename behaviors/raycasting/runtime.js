﻿"use strict";
assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");
(function ()
{
    cr.behaviors.Raycasting = function(runtime) {
        this.runtime = runtime;
    };

    var behaviorProto = cr.behaviors.Raycasting.prototype;

    behaviorProto.Type = function(behavior, objtype) {
        this.behavior = behavior;
        this.objtype = objtype;
        this.runtime = behavior.runtime;
    };

    var behtypeProto = behaviorProto.Type.prototype;

    behtypeProto.onCreate = function() {
        this.solidTypes = [];
    };

    behaviorProto.Instance = function(type, inst) {
        this.type = type;
        this.behavior = type.behavior;
        this.inst = inst;
        this.runtime = type.runtime;
    };

    var behinstProto = behaviorProto.Instance.prototype;

    behinstProto.onCreate = function() {

        // State for the last ray cast
        this.didHit = false;
        this.hitX = 0;
        this.hitY = 0;
        this.hitDist = 0;
        this.hitUID = -1;
    };

    behinstProto.saveToJSON = function() {
        return {
            "didHit": this.didHit,
            "hitX": this.hitX,
            "hitY": this.hitY,
            "hitDist": this.hitDist,
            "hitUID": this.hitUID
        };
    };

    behinstProto.loadFromJSON = function(o) {
        this.didHit = o["didHit"];
        this.hitX = o["hitX"];
        this.hitY = o["hitY"];
        this.hitDist = o["hitDist"];
        this.hitUID = o["hitUID"];
    };

    behinstProto.tick = function() {};

    function Cnds() {};
    Cnds.prototype.OnRayHit = function() { return true; };
    Cnds.prototype.DidHit = function() { return this.didHit; };
    Cnds.prototype.OnRayFailed = function() { return true; };
    Cnds.prototype.OnRayHitSolid = function() { return true; };
    
    Cnds.prototype.HasLOS = function (obj) {
        if (!obj) return false;
        var target = obj.getFirstPicked(this.inst);
        if (!target) return false;

        var startX = this.inst.x;
        var startY = this.inst.y;
        var endX = target.x;
        var endY = target.y;

        // Check if any solid blocks the way
        // We trace the ray from start to end. If we hit anything, LOS is blocked.
        for (var k = 0; k < this.type.solidTypes.length; k++) {
            var solidType = this.type.solidTypes[k];
            var solids = solidType.instances;
            for (var i = 0; i < solids.length; i++) {
                var inst = solids[i];
                if (inst === this.inst || inst === target) continue; // Ignore self and target

                var hit = check_intersection(startX, startY, endX, endY, inst);
                if (hit) {
                    // If we hit a solid, we are blocked.
                    return false;
                }
            }
        }

        return true;
    };
    
    behaviorProto.cnds = new Cnds();

    // Helper function for squared distance, as cr.distanceSqTo is not in the C2 SDK
    function distanceSqTo(x1, y1, x2, y2) {
        var dx = x2 - x1;
        var dy = y2 - y1;
        return dx * dx + dy * dy;
    }

    // Helper function to find the intersection point of two line segments
    // Returns null if they don't intersect, or {x, y} if they do.
    function line_segment_intersection(x1, y1, x2, y2, x3, y3, x4, y4) {
        var den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
        if (den === 0) {
            return null; // Lines are parallel or collinear
        }

        var t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
        var u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;

        if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
            return {
                x: x1 + t * (x2 - x1),
                y: y1 + t * (y2 - y1)
            };
        }

        return null;
    }

    // Helper function to check for the closest intersection between a ray and a bounding box
    function ray_box_intersection(ray_x1, ray_y1, ray_x2, ray_y2, bbox) {
        var closest_hit = null;
        var closest_dist_sq = Infinity;

        // Check all 4 sides without allocating arrays
        for (var i = 0; i < 4; i++) {
            var x1, y1, x2, y2;
            if (i === 0)      { x1 = bbox.left;  y1 = bbox.top;    x2 = bbox.right; y2 = bbox.top; }    // Top
            else if (i === 1) { x1 = bbox.right; y1 = bbox.top;    x2 = bbox.right; y2 = bbox.bottom; } // Right
            else if (i === 2) { x1 = bbox.right; y1 = bbox.bottom; x2 = bbox.left;  y2 = bbox.bottom; } // Bottom
            else              { x1 = bbox.left;  y1 = bbox.bottom; x2 = bbox.left;  y2 = bbox.top; }    // Left

            var hit = line_segment_intersection(ray_x1, ray_y1, ray_x2, ray_y2, x1, y1, x2, y2);
            
            if (hit) {
                var dist_sq = distanceSqTo(ray_x1, ray_y1, hit.x, hit.y);
                if (dist_sq < closest_dist_sq) {
                    closest_dist_sq = dist_sq;
                    closest_hit = hit;
                }
            }
        }
        return closest_hit;
    }

    // Helper to check intersection with any object type (Box or Tilemap)
    function check_intersection(startX, startY, endX, endY, inst) {
        // Use the object's own ray intersection method if available (e.g. Tilemap)
        if (inst.rayIntersection)
            return inst.rayIntersection(startX, startY, endX, endY);

        // Default bounding box handling
        inst.update_bbox();
        return ray_box_intersection(startX, startY, endX, endY, inst.bbox);
    }

    function Acts() {};
    Acts.prototype.CastRay = function(angle, distance, obj) {
        if (!obj) return;

        var startX = this.inst.x;
        var startY = this.inst.y;
        var rad = cr.to_radians(angle);
        var endX = startX + Math.cos(rad) * distance;
        var endY = startY + Math.sin(rad) * distance;

        // 1. Check Target Objects
        var candidates = obj.getCurrentSol().getObjects();
        var closestHit = null;
        var closestDistSq = Number.MAX_VALUE;

        // Reset state before casting
        this.didHit = false;
        this.hitUID = -1;
        
        // Default hit point to end of ray (max distance) in case of miss
        // This ensures that if we are blocked, we overwrite this, but if we miss, we have a valid "end" point.
        // (Optional improvement over original code which left stale values)
        // However, to maintain original behavior for misses (which didn't update X/Y), 
        // we only update these if we actually hit something or are blocked.
        // For now, we'll stick to updating only on hits/blocks to be safe.

        for (var i = 0; i < candidates.length; i++) {
            var inst = candidates[i];
            if (inst === this.inst) continue; // Don't hit self

            var result = check_intersection(startX, startY, endX, endY, inst);

            if (result) {
                var distSq = distanceSqTo(startX, startY, result.x, result.y);
                if (distSq < closestDistSq) {
                    closestDistSq = distSq;
                    closestHit = {
                        x: result.x,
                        y: result.y,
                        inst: inst
                    };
                }
            }
        }

        // 2. Check Solid Objects (Blocking)
        var closestSolidDistSq = Number.MAX_VALUE;
        var closestSolidHit = null;

        for (var k = 0; k < this.type.solidTypes.length; k++) {
            var solidType = this.type.solidTypes[k];
            var solids = solidType.instances;
            for (var i = 0; i < solids.length; i++) {
                var inst = solids[i];
                if (inst === this.inst) continue;

                var result = check_intersection(startX, startY, endX, endY, inst);
                if (result) {
                    var distSq = distanceSqTo(startX, startY, result.x, result.y);
                    if (distSq < closestSolidDistSq) {
                        closestSolidDistSq = distSq;
                        closestSolidHit = { x: result.x, y: result.y, inst: inst, type: solidType };
                    }
                }
            }
        }

        // 3. Determine Final Result
        // If we hit a solid closer than the target (or we didn't hit a target at all but hit a solid)
        if (closestSolidHit && closestSolidDistSq < closestDistSq) {
            // Blocked by solid
            this.didHit = false; // Blocked means we didn't hit the target
            this.hitX = closestSolidHit.x;
            this.hitY = closestSolidHit.y;
            this.hitDist = Math.sqrt(closestSolidDistSq);
            this.hitUID = closestSolidHit.inst.uid;

            // Pick the solid instance
            var sol = closestSolidHit.type.getCurrentSol();
            sol.select_all = false;
            sol.instances.length = 1;
            sol.instances[0] = closestSolidHit.inst;
            this.runtime.trigger(cr.behaviors.Raycasting.prototype.cnds.OnRayHitSolid, this.inst);
        }
        else if (closestHit) {
            this.didHit = true;
            this.hitX = closestHit.x;
            this.hitY = closestHit.y;
            this.hitDist = Math.sqrt(closestDistSq);
            this.hitUID = closestHit.inst.uid;

            // Pick the specific instance that was hit
            var sol = obj.getCurrentSol();
            sol.select_all = false;
            sol.instances.length = 1;
            sol.instances[0] = closestHit.inst;

            this.runtime.trigger(cr.behaviors.Raycasting.prototype.cnds.OnRayHit, this.inst);
        }

        if (!this.didHit) {
            this.runtime.trigger(cr.behaviors.Raycasting.prototype.cnds.OnRayFailed, this.inst);
        }
    };

    Acts.prototype.AddSolid = function(obj) {
        if (!obj) return;
        if (this.type.solidTypes.indexOf(obj) === -1)
            this.type.solidTypes.push(obj);
    };

    Acts.prototype.ClearSolids = function() {
        this.type.solidTypes.length = 0;
    };

    behaviorProto.acts = new Acts();

    function Exps() {};
    Exps.prototype.RayHitX = function(ret) {
        ret.set_float(this.hitX);
    };
    Exps.prototype.RayHitY = function(ret) {
        ret.set_float(this.hitY);
    };
    Exps.prototype.RayHitDistance = function(ret) {
        ret.set_float(this.hitDist);
    };
    Exps.prototype.RayHitUID = function(ret) {
        ret.set_int(this.hitUID);
    };
    behaviorProto.exps = new Exps();

}());