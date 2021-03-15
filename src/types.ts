import data from "./data.json";

type Result<T> = T | Error;
type Maybe<T> = T | null;

type rotation = 0 | 1 | 2 | 3 | 4 | 5 | undefined;
type face = "A" | "B" | undefined;

type Tile = number;
type TileSelection = Array<TileIndex>;
type TileNameSet = Set<string>;

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

const TILE_TYPES = ["red", "blue", "green", "hyperlane"] as const;
type TileType = typeof TILE_TYPES[number];

const ANOMALIES = [
  "muaat-supernova",
  "supernova",
  "asteroid-field",
  "gravity-rift",
  "nebula",
] as const;
type Anomaly = typeof ANOMALIES[number];

const WORMHOLES = ["alpha", "beta", "delta"] as const;
type Wormhole = typeof WORMHOLES[number];

type HexDirection = 0 | 1 | 2 | 3 | 4 | 5;
type Hyperlane = [HexDirection, HexDirection];

type TileInfo = {
  type: TileType;
  planets: Array<string>;
  pok?: true;
  faction?: string;
  anomaly?: Anomaly;
  wormholes?: Wormhole | Array<Wormhole>;
  hyperlanes?: Array<Hyperlane>;
  unplayable?: true;
};

type PlanetType = "industrial" | "hazardous" | "cultural";
type TechnologyType = "warfare" | "propulsion" | "biotic" | "cybernetic";

type PlanetInfo = {
  resources: number;
  influence: number;
  type: PlanetType;
  tech_skip: TechnologyType;
  legendary: boolean;
};

const Tiles = data.tiles;
type TileName = keyof typeof Tiles;
//type TileName = string;

type TwilightData = {
  tiles: {
    [key: string]: TileInfo;
  };
  planets: {
    [key: string]: PlanetInfo;
  };
};

export {
  Result,
  Maybe,
  rotation,
  face,
  Tile,
  TileIndex,
  TileName,
  TileSelection,
  MapSection,
  Wormhole,
  Anomaly,
  TileNameSet,
  TileType,
  TileInfo,
  HexDirection,
  Hyperlane,
  PlanetType,
  TechnologyType,
  PlanetInfo,
  TwilightData,
};
