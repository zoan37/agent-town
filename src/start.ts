import { Direction, GridEngine } from "grid-engine";
import * as Phaser from "phaser";

import Agent from "./agent";

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
    active: false,
    visible: false,
    key: "Game",
};

export class GameScene extends Phaser.Scene {
    private gridEngine!: GridEngine;
    private tilemap!: Phaser.Tilemaps.Tilemap;
    private agent!: Agent;

    constructor() {
        super(sceneConfig);
    }

    create() {
        const cloudCityTilemap = this.make.tilemap({ key: "cloud-city-map" });
        cloudCityTilemap.addTilesetImage("cloud_tileset", "tiles");
        this.tilemap = cloudCityTilemap;

        for (let i = 0; i < cloudCityTilemap.layers.length; i++) {
            const layer = cloudCityTilemap.createLayer(i, "cloud_tileset", 0, 0);
            layer.scale = 3;
        }
        const playerSprite = this.add.sprite(0, 0, "player");
        playerSprite.scale = 1.5;
        this.cameras.main.startFollow(playerSprite, true);
        this.cameras.main.setFollowOffset(-playerSprite.width, -playerSprite.height);

        const gridEngineConfig = {
            characters: [
                {
                    id: "player",
                    sprite: playerSprite,
                    walkingAnimationMapping: 6,
                    startPosition: { x: 8, y: 8 },
                },
            ],
        };

        this.gridEngine.create(cloudCityTilemap, gridEngineConfig);

        this.agent = new Agent();

        this.executeNextMove();
    }

    async executeNextMove() {
        if (!(window as any).ai) {
            alert("window.ai not found. Please install at https://windowai.io/");
            return;
        }
        
        try {
            const move = await this.agent.getNextMove();
            if (move == 'up') {
                this.gridEngine.move("player", Direction.UP);
            } else if (move == 'down') {
                this.gridEngine.move("player", Direction.DOWN);
            } else if (move == 'left') {
                this.gridEngine.move("player", Direction.LEFT);
            } else if (move == 'right') {
                this.gridEngine.move("player", Direction.RIGHT);
            }
        } catch (error) {
            console.error(error);
        }

        setTimeout(this.executeNextMove.bind(this), 1000);
    }

    public update() {
        const arrowCursors = this.input.keyboard.createCursorKeys();
        const wasdCursors = this.input.keyboard.addKeys(
            {
                up: Phaser.Input.Keyboard.KeyCodes.W,
                down: Phaser.Input.Keyboard.KeyCodes.S,
                left: Phaser.Input.Keyboard.KeyCodes.A,
                right: Phaser.Input.Keyboard.KeyCodes.D
            }) as Phaser.Types.Input.Keyboard.CursorKeys;
        if (arrowCursors.left.isDown || wasdCursors.left.isDown) {
            this.gridEngine.move("player", Direction.LEFT);
        } else if (arrowCursors.right.isDown || wasdCursors.right.isDown) {
            this.gridEngine.move("player", Direction.RIGHT);
        } else if (arrowCursors.up.isDown || wasdCursors.up.isDown) {
            this.gridEngine.move("player", Direction.UP);
        } else if (arrowCursors.down.isDown || wasdCursors.down.isDown) {
            this.gridEngine.move("player", Direction.DOWN);
        }
    }

    preload() {
        this.load.image("tiles", "assets/cloud_tileset.png");
        this.load.tilemapTiledJSON("cloud-city-map", "assets/cloud_city_large.json");

        this.load.spritesheet("player", "assets/characters.png", {
            frameWidth: 52,
            frameHeight: 72,
        });
    }
}

const gameConfig: Phaser.Types.Core.GameConfig = {
    title: "Sample",
    render: {
        antialias: false,
    },
    type: Phaser.AUTO,
    scene: GameScene,
    scale: {
        width: window.innerWidth,
        height: window.innerHeight,
        mode: Phaser.Scale.RESIZE,
    },
    plugins: {
        scene: [
            {
                key: "gridEngine",
                plugin: GridEngine,
                mapping: "gridEngine",
            },
        ],
    },
    parent: "game",
    backgroundColor: "#48C4F8",
};

export const game = new Phaser.Game(gameConfig);