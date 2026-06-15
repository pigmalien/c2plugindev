# Delaunay Dungeon Behavior

Procedurally generates a dungeon layout using Delaunay Triangulation and Minimum Spanning Trees (MST). Attached to a Tilemap object, this behavior automates room generation, corridor connections, and sophisticated wall autotiling.

## Properties

### Generation Settings

| Property | Description |
| :--- | :--- |
| **Map Width** | Width of the dungeon in tiles. |
| **Map Height** | Height of the dungeon in tiles. |
| **Seed** | The seed for the random number generator. Leave empty for random. |

### Room Settings

| Property | Description |
| :--- | :--- |
| **Number of Rooms** | Target number of rooms to generate. |
| **Min Room Size** | Minimum size (width/diameter) of a room in tiles. |
| **Max Room Size** | Maximum size (width/diameter) of a room in tiles. |
| **Room Shape** | The shape of the generated rooms: `Rectangle`, `Circle`, or `Organic`. |
| **Connectivity** | Controls room connections (0.0 for none to 1.0 for Full MST/extra loops). |
| **Border Padding** | The minimum empty space (in tiles) between the map edge and any room. |

### Tiling Settings

| Property | Description |
| :--- | :--- |
| **Autotiling** | Enable or disable automatic wall tiling (`Enabled` or `Disabled`). |
| **Wall Thickness** | Thickness of walls around rooms/corridors. `0` for Filled, `>0` for Thickness in tiles, `-1` for No walls. |
| **Corridor Size** | The width of corridors in tiles. Odd numbers look best. |
| **Room Padding** | The minimum empty space (in tiles) between a room's edge and its partition boundary. |
| **Gap** | The minimum gap between rooms (in tiles). |
| **Floor Tile** | The tile ID to use for floors. |
| **Wall Tile (Default)** | The default tile ID for walls, or when autotiling is disabled. |

### Autotile Shapes (Walls)

| Property | Description |
| :--- | :--- |
| **Corner In Top-Right** | Tile ID for this shape (-1 to use default). |
| **Side Top** | Tile ID for this shape (-1 to use default). |
| **Corner Out Top-Right** | Tile ID for this shape (-1 to use default). |
| **Side Right** | Tile ID for this shape (-1 to use default). |
| **Corner In Bottom-Right** | Tile ID for this shape (-1 to use default). |
| **Side Bottom** | Tile ID for this shape (-1 to use default). |
| **Corner Out Bottom-Right** | Tile ID for this shape (-1 to use default). |
| **Corner Out Bottom-Left** | Tile ID for this shape (-1 to use default). |
| **Corner In Bottom-Left** | Tile ID for this shape (-1 to use default). |
| **Side Left** | Tile ID for this shape (-1 to use default). |
| **Corner Out Top-Left** | Tile ID for this shape (-1 to use default). |
| **Corner In Top-Left** | Tile ID for this shape (-1 to use default). |
| **Cleanup** | Remove isolated and thin walls (`Enabled` or `Disabled`). |

---

## Actions

### Generation
*   **Generate dungeon**: Generates the dungeon layout on the Tilemap using the behavior properties.

### Setup
*   **Set floor tile**: Sets the tile ID used for floors (`Floor Tile ID`).
*   **Set wall tile (default)**: Sets the default tile ID used for walls (`Wall Tile ID`).
*   **Set seed**: Sets the seed to ensure deterministic results (`Seed` string).
*   **Set corridor size**: Sets the width of generated corridors (`Size`).

### Autotiling
*   **Set autotiling enabled**: Enable or disable automatic wall tiling dynamically (`State`).
*   **Set autotile ID**: Sets a specific tile ID for a specific wall shape (`Shape`, `Tile ID`).
*   **Add autotile variant**: Adds a variant tile for a specific shape with a given probability (`Shape`, `Tile ID`, `Probability` 0-100).

### Masking
*   **Erase circle**: Erases a circular area of tiles on the tilemap (`Center X`, `Center Y`, `Radius` in tiles).

---

## Conditions

### Generation
*   **On generation complete**: Triggered when the dungeon generation is finished.

### Rooms
*   **For each room**: Loop through each room that was generated.

---

## Expressions

### Generation
*   `RoomCount`: Returns the number of rooms generated.

### Setup
*   `GetSeed`: Returns the current seed string being used by the generator.

### Rooms
*   `LoopRoomIndex`: Returns the current 0-based index in a `For each room` loop.
*   `RoomX(Index)`: Returns the X coordinate (in pixels) of the center of a specific room.
*   `RoomY(Index)`: Returns the Y coordinate (in pixels) of the center of a specific room.
*   `RoomWidth(Index)`: Returns the width of a specific room in tiles.
*   `RoomHeight(Index)`: Returns the height of a specific room in tiles.

### Autotiling
*   `AutotileShapeAt(X, Y)`: Returns the name of the autotile shape at the given tile coordinates.
*   `TileCornerInTR`: Returns the tile ID for Corner In Top-Right.
*   `TileSideTop`: Returns the tile ID for Side Top.
*   `TileCornerOutTR`: Returns the tile ID for Corner Out Top-Right.
*   `TileSideRight`: Returns the tile ID for Side Right.
*   `TileCornerInBR`: Returns the tile ID for Corner In Bottom-Right.
*   `TileSideBottom`: Returns the tile ID for Side Bottom.
*   `TileCornerOutBR`: Returns the tile ID for Corner Out Bottom-Right.
*   `TileCornerOutBL`: Returns the tile ID for Corner Out Bottom-Left.
*   `TileCornerInBL`: Returns the tile ID for Corner In Bottom-Left.
*   `TileSideLeft`: Returns the tile ID for Side Left.
*   `TileCornerOutTL`: Returns the tile ID for Corner Out Top-Left.
*   `TileCornerInTL`: Returns the tile ID for Corner In Top-Left.

---

## Usage Example

To procedurally generate a dungeon layout and populate rooms with players and enemies:

1.  **Action**: `DelaunayDungeon -> Generate dungeon`
    *   *Generates layout onto the Tilemap.*
2.  **Condition**: `DelaunayDungeon -> On generation complete`
    *   *Now we can start populating our dungeon!*
3.  **Action**: `DelaunayDungeon -> For each room`
    *   **Sub-Condition**: `DelaunayDungeon -> LoopRoomIndex == 0`
        *   **Action**: `System -> Create Player at (DelaunayDungeon.RoomX(DelaunayDungeon.LoopRoomIndex), DelaunayDungeon.RoomY(DelaunayDungeon.LoopRoomIndex))`
    *   **Sub-Condition**: `DelaunayDungeon -> LoopRoomIndex > 0`
        *   **Action**: `System -> Create Enemy at (DelaunayDungeon.RoomX(DelaunayDungeon.LoopRoomIndex), DelaunayDungeon.RoomY(DelaunayDungeon.LoopRoomIndex))`

---

### Implementation Notes

[Inference] The Delaunay Dungeon behavior generates a graph of rooms represented as vertices, triangulates them using Bowyer-Watson Delaunay Triangulation, computes the Minimum Spanning Tree (MST) to find the essential connections, and adds back a portion of the non-MST edges based on the `Connectivity` property to introduce circular paths and loops. It then paths corridors along these edges.

> [!TIP]
> Setting **Connectivity** to `1.0` ensures a fully connected dungeon with loops, while setting it to `0.0` yields a tree-like dungeon layout with only one path between any two rooms.
