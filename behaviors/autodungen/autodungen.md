# Autodungen Behavior

Procedurally generates a dungeon layout using Binary Space Partitioning (BSP). Must be attached to a Tilemap object, this behavior automates partitioning room cells, connecting rooms with corridors, and advanced wall autotiling with full shadow/depth variant options.

## Properties

### Generation Settings

| Property | Description |
| :--- | :--- |
| **Min Room Size** | The minimum width or height of a room. Partitions smaller than this will not be split. |
| **Max Room Size** | Partitions larger than this will always be split to create smaller rooms. |
| **Max Rooms** | The maximum number of rooms to generate. `0` means no limit. |
| **Room Padding** | The minimum empty space (in tiles) between a room's edge and its partition boundary. |
| **Corridor Size** | The width of corridors in tiles. Odd numbers look best. |
| **Thick Walls** | Ensure walls are at least 2 tiles thick (`No` or `Yes`). |
| **Seed** | The seed for the random number generator. Use `0` for a random seed on startup. |

### Tiling Settings

| Property | Description |
| :--- | :--- |
| **Autotiling** | Enable or disable automatic wall tiling (`Enabled` or `Disabled`). |
| **Floor Tile** | The tile ID to use for floors and corridors. |
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

### Autotile Shapes (Depth & Shadow)

| Property | Description |
| :--- | :--- |
| **Below Corner Out BL** | Tile ID below Corner Out Bottom-Left (-1 to use default). |
| **Below Side Top** | Tile ID below Side Top (-1 to use default). |
| **Below Corner Out BR** | Tile ID below Corner Out Bottom-Right (-1 to use default). |
| **Shadow Side Right** | Tile ID for Shadow Side Right (-1 to use default). |
| **Shadow Corner In TL** | Tile ID for Shadow Corner In Top-Left (-1 to use default). |
| **Shadow Below Corner Out BR End** | Tile ID for Shadow Below Corner Out Bottom-Right End (-1 to use default). |
| **Shadow Below Side Top** | Tile ID for Shadow Below Side Top (-1 to use default). |

---

## Actions

### Setup
*   **Set seed**: Sets the seed to ensure deterministic results (`Seed` string).
*   **Set constraints**: Defines the size constraints for room generation (`Min Room Size`, `Max Room Size`, `Padding`).
*   **Set wall tile (default)**: Sets the default tile ID used for walls (`Wall Tile ID`).
*   **Set floor tile**: Sets the tile ID used for floors (`Floor Tile ID`).
*   **Set corridor size**: Sets the width of generated corridors (`Size`).
*   **Set max rooms**: Sets the maximum number of rooms to generate (`Max Rooms`).

### Generation
*   **Generate dungeon**: Runs the BSP algorithm to generate the dungeon layout with specified dimensions and applies it to the connected Tilemap (`Width`, `Height`).

### Autotiling
*   **Set autotiling enabled**: Enable or disable automatic wall tiling dynamically (`State`).
*   **Set autotile ID**: Sets a specific tile ID for a specific wall shape (`Shape`, `Tile ID`).
*   **Add autotile variant**: Adds a variant tile for a specific shape with a given probability (`Shape`, `Tile ID`, `Probability` 0-100).

---

## Conditions

### Generation
*   **On generation complete**: Triggered when the dungeon generation algorithm has finished.

### Queries
*   **Is room at**: Returns true if the specified tile coordinate is part of a room (`X`, `Y`).
*   **Is wall at**: Checks the internal grid data to see if a tile is a wall (`X`, `Y`).

### Rooms
*   **For each room**: Loop through each room that was generated.

---

## Expressions

### Generation
*   `MapWidth`: Returns the width of the last generated map in tiles.
*   `MapHeight`: Returns the height of the last generated map in tiles.

### Setup
*   `GetSeed`: Returns the current seed string being used by the generator.

### Rooms
*   `RoomCount`: Returns the total number of rooms generated.
*   `RoomCenterX(Index)`: Returns the X coordinate of the center of a specific room, in pixels.
*   `RoomCenterY(Index)`: Returns the Y coordinate of the center of a specific room, in pixels.
*   `RoomWidth(Index)`: Returns the width of a specific room in tiles.
*   `RoomHeight(Index)`: Returns the height of a specific room in tiles.
*   `LoopRoomIndex`: Returns the current 0-based index in a `For each room` loop.

### Autotiling
*   `AutotileShapeAt(X, Y)`: Returns the name of the autotile shape at the given tile coordinates.
*   `TileCornerInTR` to `TileCornerInTL`: Returns the tile ID for Corner In Top-Right, Side Top, etc.
*   `TileBelowCornerOutBL`: Returns the tile ID for Below Corner Out Bottom-Left.
*   `TileBelowSideTop`: Returns the tile ID for Below Side Top.
*   `TileBelowCornerOutBR`: Returns the tile ID for Below Corner Out Bottom-Right.
*   `TileShadowSideRight`: Returns the tile ID for Shadow Side Right.
*   `TileShadowCornerInTL`: Returns the tile ID for Shadow Corner In Top-Left.
*   `TileShadowBelowCornerOutBREnd`: Returns the tile ID for Shadow Below Corner Out Bottom-Right End.
*   `TileShadowBelowSideTop`: Returns the tile ID for Shadow Below Side Top.

---

## Usage Example

To procedurally generate a BSP dungeon layout and place items inside rooms:

1.  **Action**: `Autodungen -> Generate dungeon (60, 60)`
    *   *Generates the layout onto the Tilemap with the specified dimensions.*
2.  **Condition**: `Autodungen -> On generation complete`
    *   *Triggered once the dungeon layout is built.*
3.  **Action**: `Autodungen -> For each room`
    *   **Action**: `System -> Create Chest at (Autodungen.RoomCenterX(Autodungen.LoopRoomIndex), Autodungen.RoomCenterY(Autodungen.LoopRoomIndex))`

---

### Implementation Notes

[Inference] Binary Space Partitioning (BSP) recursively divides the specified map boundaries into smaller partition cells (either horizontally or vertically) until the sub-cells reach the configured `Min Room Size`. Within each partition node, a room of randomized size (constrained by `Padding`) is generated, and a tree of horizontal/vertical corridors is connected across division boundaries to ensure every room is fully reachable.

> [!TIP]
> Setting **Thick Walls** to `Yes` ensures that rooms and corridors have at least 2 tiles of solid wall separation, which prevents single-tile boundaries from rendering incorrectly with complex tile sets.
