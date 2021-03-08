import { Result } from "../types";
import { Reset } from "../lib/chain";
import Shape from "../lib/shape";
import TwilightMap from "../lib/twilightmap";

type Settings = {
  value: number;
};

const DEFAULT_SETTINGS = {
  value: 5,
};

export default class TwilightMapGenerator {
  settings: Settings;

  constructor(settings: Partial<Settings>) {
    const tmp = {};
    Object.assign(DEFAULT_SETTINGS, tmp);
    Object.assign(settings, tmp);
    this.settings = tmp as Settings;
  }

  setSettings(settings: Partial<Settings>): Result<void> {
    Object.assign(settings, this.settings);
  }

  generate(seed: number): Reset<TwilightMap> {}
}
