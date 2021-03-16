import * as fs from "fs";
import path from "path";
import { createCanvas, loadImage } from "canvas";
import * as Hex from "../lib/hex";
import Tiles from "../lib/tiles";
import TIMapArray from "../lib/twilightmap";
import { rotation } from "../types";

class MapCompositor {
  static HRT3 = 0.8660254037844386;
  tilesDir: string;
  tileWidth: number;
  tileHeight: number;

  constructor(tilesDir: string, width: number, height?: number) {
    this.tilesDir = tilesDir;
    this.tileWidth = width;
    this.tileHeight =
      height === undefined ? width * MapCompositor.HRT3 : height;
  }

  async drawTTSMap({
    tts,
    size,
    scale,
    color = "#000000",
  }: {
    tts: string;
    size?: number;
    scale?: number;
    color: string;
  }): Promise<Buffer> {
    const map = TIMapArray.fromTTSString(tts);
    if (map instanceof Error) throw new Error(`Map string is invalid TTS map`);
    const unscaledWidth = this.tileWidth * (1 + 1.5 * map.rings);
    const unscaledHeight = this.tileHeight * (1 + 2 * map.rings);
    if (scale === undefined) scale = size ? size / unscaledWidth : 1;
    const [bw, bh] = [unscaledWidth * scale, unscaledHeight * scale];
    const [tw, th] = [this.tileWidth * scale, this.tileHeight * scale];

    const canvas = createCanvas(bw, bh);
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = color;
    ctx.fillRect(0, 0, bw, bh);
    ctx.restore();
    for (const [i, t] of map.board.entries()) {
      const [name, rotation] = [Tiles.getName(t), Tiles.getRotation(t) || 0];
      const imgPath = path.join(this.tilesDir, `ST_${name}.png`);
      const [x_, y_] = Hex.spiralToXY(i, tw, th);
      const [x, y] = [0.5 * bw + x_, 0.5 * bh - y_];
      ctx.translate(x, y);
      ctx.rotate((Math.PI / 3) * rotation);
      ctx.drawImage(await loadImage(imgPath), -tw / 2, -th / 2, tw, th);
      ctx.resetTransform();
    }
    return canvas.toBuffer("image/jpeg", { quality: 0.9 });
  }
}

export default MapCompositor;
