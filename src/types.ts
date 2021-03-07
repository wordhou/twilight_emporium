//import { State, Edit, ReversibleEdit } from "./lib/chain";

type Result<T> = T | Error;

type rotation = 0 | 1 | 2 | 3 | 4 | 5 | undefined;
type face = "A" | "B" | undefined;

type Tile = number;

/**
 * Stores a section of a TwilightMap as a map from indices to tiles
 */
type MapSection = Map<TileIndex, Tile>;

/**
 * A non-negative integer that indexes a location on the TwilightMap. The
 * center of the map starts at index 0, and then are ordered in rings expanding
 * outwards from the center. The indices in each ring start from the top and
 * increase going clockwise around the ring.
 */
type TileIndex = number;
type TileSelection = Set<TileIndex>;

export { Result, rotation, face, Tile, TileIndex, TileSelection, MapSection };
