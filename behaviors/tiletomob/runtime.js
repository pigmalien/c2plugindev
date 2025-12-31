// Tile to Mob - Runtime
// This behavior is attached to a Tilemap and manages multiple Sprites as "Dumb Proxies"

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

cr.behaviors.TileToMob = function(runtime)
{
	this.runtime = runtime;
};

(function () {
    const behaviorProto = cr.behaviors.TileToMob.prototype;

    behaviorProto.Type = function (behavior, objtype) {
        this.behavior = behavior;
        this.objtype = objtype;
        this.runtime = behavior.runtime;
    };

    behaviorProto.Type.prototype.onCreate = function() {};

    behaviorProto.Instance = function (type, inst) {
        this.type = type;
        this.behavior = type.behavior;
        this.inst = inst; // The Tilemap instance
        this.runtime = type.runtime;

        // Internal State
        this.managedMobs = new Map(); // Map UID -> MobData object
        this.occupiedTiles = new Set(); // String "x,y" for quick collision lookup
        this.targetUid = -1; // UID of the target object to follow
        this.collisionMode = 0; // 0 = Solid, 1 = None
    };

    behaviorProto.Instance.prototype.onCreate = function() {
        this.collisionMode = this.properties[0];
    };

    const MobData = function (uid, tx, ty, speed) {
        this.uid = uid;
        this.targetX = tx; // Current Grid X
        this.targetY = ty; // Current Grid Y
        this.visualX = 0;  // Actual Pixel X
        this.visualY = 0;  // Actual Pixel Y
        this.isMoving = false;
        this.moveProgress = 0;
        this.speed = speed || 2; // Tiles per second
        this.active = true;
    };

    behaviorProto.Instance.prototype.tick = function () {
        const dt = this.runtime.getDt();
        const tilemap = this.inst;

        // Ensure tilemap is valid and initialized
        if (!tilemap.tilewidth || !tilemap.tileheight) return;

        // 1. Resolve Target Position (AI)
        let targetGridX = null;
        let targetGridY = null;
        if (this.targetUid !== -1) {
            const target = this.runtime.getObjectByUID(this.targetUid);
            if (target) {
                targetGridX = Math.floor((target.x - tilemap.x) / tilemap.tilewidth);
                targetGridY = Math.floor((target.y - tilemap.y) / tilemap.tileheight);
            }
        }

        for (let [uid, mob] of this.managedMobs) {
            const sprite = this.runtime.getObjectByUID(uid);
            
            if (!sprite) {
                // Auto-cleanup if sprite was destroyed externally
                this.removeMob(uid);
                continue;
            }

            if (!mob.active) continue;

            // 2. AI Decision Making (if idle and target exists)
            if (!mob.isMoving && targetGridX !== null) {
                const dx = targetGridX - mob.targetX;
                const dy = targetGridY - mob.targetY;

                if (dx !== 0 || dy !== 0) {
                    const stepX = (dx > 0) ? 1 : (dx < 0 ? -1 : 0);
                    const stepY = (dy > 0) ? 1 : (dy < 0 ? -1 : 0);
                    
                    // Simple axis-aligned pathfinding
                    // Prioritize the axis with the larger distance
                    if (Math.abs(dx) >= Math.abs(dy)) {
                        if (this.isTileFree(mob.targetX + stepX, mob.targetY)) {
                            this.startMove(mob, mob.targetX + stepX, mob.targetY);
                        } else if (stepY !== 0 && this.isTileFree(mob.targetX, mob.targetY + stepY)) {
                            this.startMove(mob, mob.targetX, mob.targetY + stepY);
                        }
                    } else {
                        if (this.isTileFree(mob.targetX, mob.targetY + stepY)) {
                            this.startMove(mob, mob.targetX, mob.targetY + stepY);
                        } else if (stepX !== 0 && this.isTileFree(mob.targetX + stepX, mob.targetY)) {
                            this.startMove(mob, mob.targetX + stepX, mob.targetY);
                        }
                    }
                }
            }

            // 3. Movement Execution
            if (mob.isMoving) {
                mob.moveProgress += dt * mob.speed;
                
                if (mob.moveProgress >= 1) {
                    mob.moveProgress = 0;
                    mob.isMoving = false;
                    // Snap to final position
                    sprite.x = tilemap.x + mob.targetX * tilemap.tilewidth;
                    sprite.y = tilemap.y + mob.targetY * tilemap.tileheight;
                    sprite.set_bbox_changed();
                } else {
                    // Interpolate pixel position
                    const startX = tilemap.x + mob.startX * tilemap.tilewidth;
                    const startY = tilemap.y + mob.startY * tilemap.tileheight;
                    const destX = tilemap.x + mob.targetX * tilemap.tilewidth;
                    const destY = tilemap.y + mob.targetY * tilemap.tileheight;
                    
                    sprite.x = cr.lerp(startX, destX, mob.moveProgress);
                    sprite.y = cr.lerp(startY, destY, mob.moveProgress);
                    sprite.set_bbox_changed();
                }
            }
        }
    };

    // --- Internal Methods ---
    
    behaviorProto.Instance.prototype.getTileAt = function (tx, ty) {
        if (!this.inst.tiles || !this.inst.mapwidth || !this.inst.mapheight) return -1;

        if (tx < 0 || ty < 0 || tx >= this.inst.mapwidth || ty >= this.inst.mapheight) return -1;
        var t = this.inst.tiles[tx + ty * this.inst.mapwidth];
        
        if (typeof t === "undefined" || t === -1 || t === 0xFFFFFFFF) return -1; // Check for empty
        return t & 0x1FFFFFFF; // Mask out flipping flags
    };

    behaviorProto.Instance.prototype.isTileFree = function (tx, ty) {
        // Check Tilemap Collision if mode is Solid (0)
        if (this.collisionMode === 0 && this.getTileAt(tx, ty) !== -1) return false;
        
        // Check Mob Collision
        if (this.occupiedTiles.has(`${tx},${ty}`)) return false; // Occupied check
        return true;
    };

    behaviorProto.Instance.prototype.startMove = function (mob, tx, ty) {
        this.occupiedTiles.delete(`${mob.targetX},${mob.targetY}`);
        mob.startX = mob.targetX;
        mob.startY = mob.targetY;
        mob.targetX = tx;
        mob.targetY = ty;
        mob.isMoving = true;
        mob.moveProgress = 0;
        this.occupiedTiles.add(`${tx},${ty}`);
    };

    behaviorProto.Instance.prototype.addMob = function (uid, tx, ty) {
        if (this.managedMobs.has(uid)) return;

        const mob = new MobData(uid, tx, ty);
        const sprite = this.runtime.getObjectByUID(uid);
        
        if (sprite) {
            // Initial placement
            sprite.x = this.inst.x + tx * this.inst.tilewidth;
            sprite.y = this.inst.y + ty * this.inst.tileheight;
            sprite.set_bbox_changed();
            this.occupiedTiles.add(`${tx},${ty}`);
            this.managedMobs.set(uid, mob);
        }
    };

    behaviorProto.Instance.prototype.removeMob = function (uid) {
        const mob = this.managedMobs.get(uid);
        if (mob) {
            this.occupiedTiles.delete(`${mob.targetX},${mob.targetY}`);
            this.managedMobs.delete(uid);
        }
    };

    // --- Actions ---
    function Acts() {};

    Acts.prototype.AddInstance = function (objType, tx, ty) {
        const inst = objType.getFirstPicked();
        if (inst) {
            this.addMob(inst.uid, tx, ty);
        }
    };

    Acts.prototype.RemoveInstance = function (objType) {
        const inst = objType.getFirstPicked();
        if (inst) {
            this.removeMob(inst.uid);
        }
    };

    Acts.prototype.MoveToTile = function (uid, tx, ty) {
        const mob = this.managedMobs.get(uid);
        if (!mob || mob.isMoving) return;
        
        if (this.isTileFree(tx, ty)) {
            this.startMove(mob, tx, ty);
        }
    };

    Acts.prototype.SetTarget = function (objType) {
        const inst = objType.getFirstPicked();
        if (inst) {
            this.targetUid = inst.uid;
        }
    };

    Acts.prototype.AddInstanceByUID = function (uid, tx, ty) {
        this.addMob(uid, tx, ty);
    };

    Acts.prototype.AddInstanceAtPosition = function (objType) {
        const inst = objType.getFirstPicked();
        if (!inst) return;
        
        const tilemap = this.inst;
        if (!tilemap.tilewidth || !tilemap.tileheight) return;

        const tx = Math.floor((inst.x - tilemap.x) / tilemap.tilewidth);
        const ty = Math.floor((inst.y - tilemap.y) / tilemap.tileheight);
        
        this.addMob(inst.uid, tx, ty);
    };

    Acts.prototype.SetMobActive = function (uid, state) {
        const mob = this.managedMobs.get(uid);
        if (mob) {
            mob.active = (state === 0);
        }
    };

    Acts.prototype.SetObjectActive = function (objType, state) {
        const inst = objType.getFirstPicked();
        if (inst) {
            const mob = this.managedMobs.get(inst.uid);
            if (mob) {
                mob.active = (state === 0);
            }
        }
    };

    behaviorProto.acts = new Acts();

}());