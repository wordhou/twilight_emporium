import * as fs from "fs";
import path from "path";
import sharp from "sharp";
import * as Hex from "../lib/hex";
import Tiles from "../lib/tiles";
import TIMapArray from "../lib/twilightmap";
import { rotation } from "../types";

class MapCompositor {
  static transparent = { r: 0, b: 0, g: 0, alpha: 0 };
  static HRT3 = 0.8660254037844386;
  tilesDir: string;
  tileWidth: number;
  tileHeight: number;
  rotLeftOffset: number;
  rotTopOffset: number;

  constructor(tilesDir: string, width: number, height?: number) {
    this.tilesDir = tilesDir;
    this.tileWidth = width;
    this.tileHeight = height === undefined ? width * MapCompositor.HRT3 : 317;
    const rotWidth =
      0.5 * this.tileWidth + MapCompositor.HRT3 * this.tileHeight;
    const rotHeight =
      0.5 * this.tileHeight + MapCompositor.HRT3 * this.tileWidth;
    this.rotLeftOffset = Math.trunc(0.5 * (rotWidth - this.tileWidth));
    this.rotTopOffset = Math.trunc(0.5 * (rotHeight - this.tileHeight));
  }

  async init(): Promise<this> {
    return this;
  }

  async getBuffer(tileName: string, r: rotation): Promise<Buffer | string> {
    const imgPath = path.join(this.tilesDir, `ST_${tileName}.png`);
    if (r === undefined || r === 0) return imgPath;
    const extractOptions =
      r % 3 === 0
        ? { left: 0, top: 0, width: this.tileWidth, height: this.tileHeight }
        : {
            left: this.rotLeftOffset,
            top: this.rotTopOffset,
            width: this.tileWidth,
            height: this.tileHeight,
          };
    return sharp(imgPath)
      .rotate(60 * r, { background: MapCompositor.transparent })
      .extract(extractOptions)
      .toBuffer();
  }

  async drawTTSMap(
    tts: string,
    size?: number,
    color = "#000000"
  ): Promise<Buffer> {
    const map = TIMapArray.fromTTSString(tts);
    if (map instanceof Error) throw new Error(`Map string is invalid TTS map`);
    const boardWidth = this.tileWidth * (1 + 1.5 * map.rings);
    const boardHeight = this.tileHeight * (1 + 2 * map.rings);
    const images = await Promise.all(
      Array.from(map.board).map(async (t, i) => {
        const [x, y] = Hex.spiralToXY(i, this.tileWidth, this.tileHeight);
        return {
          input: await this.getBuffer(Tiles.getName(t), Tiles.getRotation(t)),
          top: Math.round(0.5 * boardHeight - 0.5 * this.tileHeight - y),
          left: Math.round(0.5 * boardWidth - 0.5 * this.tileWidth + x),
        };
      })
    );
    const img = await sharp({
      create: {
        width: Math.round(boardWidth),
        height: Math.round(boardHeight),
        channels: 4,
        background: color,
      },
    })
      .composite(images)
      .jpeg({ quality: 80 })
      .toBuffer();
    return await sharp(img).resize(size).toBuffer();
  }
}

export default MapCompositor;
