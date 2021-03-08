"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sharp_1 = __importDefault(require("sharp"));
const fs = __importStar(require("fs"));
const Hex = __importStar(require("../lib/hex"));
const twilightmap_1 = __importDefault(require("../lib/twilightmap"));
const tiles_1 = __importDefault(require("../lib/tiles"));
class MapCompositor {
    constructor(tilesDir, width, height) {
        this.tilesDir = tilesDir;
        this.cachedImages = new Map();
        this.ready = false;
        this.tileWidth = width;
        this.tileHeight = height === undefined ? width * MapCompositor.HRT3 : 317;
        const rotWidth = 0.5 * this.tileWidth + MapCompositor.HRT3 * this.tileHeight;
        const rotHeight = 0.5 * this.tileHeight + MapCompositor.HRT3 * this.tileWidth;
        this.rotLeftOffset = Math.trunc(0.5 * (rotWidth - this.tileWidth));
        this.rotTopOffset = Math.trunc(0.5 * (rotHeight - this.tileHeight));
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.preloadBuffers(this.cachedImages);
            this.ready = true;
        });
    }
    preloadBuffers(map) {
        return __awaiter(this, void 0, void 0, function* () {
            const files = yield fs.promises.readdir(this.tilesDir);
            yield Promise.all(files.map((file) => __awaiter(this, void 0, void 0, function* () {
                const re = /ST_(-?[0-9a-zAB_]+).png/.exec(file);
                if (re === null)
                    throw new Error(`regex does not match map tile ${file}`);
                const name = re[1] === "undefined" ? undefined : re[1];
                const buf = yield sharp_1.default(this.tilesDir + file).toBuffer();
                map.set(name, buf);
            })));
        });
    }
    rotateBuffer(buf, r) {
        return __awaiter(this, void 0, void 0, function* () {
            if (r === undefined || r === 0)
                return buf;
            const extractOptions = r % 3 === 0
                ? { left: 0, top: 0, width: this.tileWidth, height: this.tileHeight }
                : {
                    left: this.rotLeftOffset,
                    top: this.rotTopOffset,
                    width: this.tileWidth,
                    height: this.tileHeight,
                };
            return sharp_1.default(buf)
                .rotate(60 * r, { background: MapCompositor.transparent })
                .extract(extractOptions)
                .toBuffer();
        });
    }
    drawTTSMap(tts, output) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.ready === false)
                throw new Error(`MapCompositor not initiated`);
            const map = twilightmap_1.default.fromTTSString(tts);
            if (map instanceof Error)
                return;
            const boardWidth = this.tileWidth * (1 + 1.5 * map.rings);
            const boardHeight = this.tileHeight * (1 + 2 * map.rings);
            const images = yield Promise.all(Array.from(map.board).map((t, i) => __awaiter(this, void 0, void 0, function* () {
                const buf = this.cachedImages.get(tiles_1.default.getName(t));
                if (buf === undefined)
                    throw new Error(`no tile with name ${tiles_1.default.getName(t)}`);
                const [x, y] = Hex.spiralToXY(i, this.tileWidth, this.tileHeight);
                return {
                    input: yield this.rotateBuffer(buf, tiles_1.default.getRotation(t)),
                    top: Math.round(0.5 * boardHeight - 0.5 * this.tileHeight - y),
                    left: Math.round(0.5 * boardWidth - 0.5 * this.tileWidth + x),
                };
            })));
            try {
                yield sharp_1.default({
                    create: {
                        width: Math.round(boardWidth),
                        height: Math.round(boardHeight),
                        channels: 4,
                        background: MapCompositor.transparent,
                    },
                })
                    .composite(images)
                    .jpeg({ quality: 60 })
                    .toFile(output);
            }
            catch (err) {
                console.log(err);
            }
        });
    }
}
MapCompositor.transparent = { r: 0, b: 0, g: 0, alpha: 0 };
MapCompositor.HRT3 = 0.8660254037844386;
exports.default = MapCompositor;
(() => __awaiter(void 0, void 0, void 0, function* () {
    const mc = new MapCompositor("public/tiles/large/", 364, 317);
    yield mc.init();
    yield mc.drawTTSMap(process.argv[2], process.argv[3]);
}))();
