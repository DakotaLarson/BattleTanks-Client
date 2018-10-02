import Component from "../../component/ChildComponent";
import EventHandler from "../../EventHandler";
import BlockCreationTool from "./BlockCreationTool";
import GameSpawnCreationTool from "./GameSpawnCreationTool";
import InitialSpawnCreationTool from "./InitialSpawnCreationTool";

export default class CreationToolHandler extends Component {

    private blockCreationTool: BlockCreationTool;
    private gameSpawnCreationTool: GameSpawnCreationTool;
    private initialSpawnCreationTool: InitialSpawnCreationTool;
    private mode: number;

    constructor() {
        super();
        this.blockCreationTool = new BlockCreationTool();
        this.gameSpawnCreationTool = new GameSpawnCreationTool();
        this.initialSpawnCreationTool = new InitialSpawnCreationTool();
        this.mode = Mode.CAMERA;
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.GAMEMENU_OPEN, this.onGameMenuOpen);
        EventHandler.addListener(this, EventHandler.Event.GAMEMENU_CLOSE, this.onGameMenuClose);

        EventHandler.addListener(this, EventHandler.Event.ARENA_CREATE_MODE_TOGGLE_BLOCK, this.handleToggleToBlock);
        EventHandler.addListener(this, EventHandler.Event.ARENA_CREATE_MODE_TOGGLE_CAMERA, this.handleToggleToCamera);
        EventHandler.addListener(this, EventHandler.Event.ARENA_CREATE_MODE_TOGGLE_GAMESPAWN, this.handleToggleToGameSpawn);
        EventHandler.addListener(this, EventHandler.Event.ARENA_CREATE_MODE_TOGGLE_INITIALSPAWN, this.handleToggleToInitialSpawn);
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.GAMEMENU_OPEN, this.onGameMenuOpen);
        EventHandler.removeListener(this, EventHandler.Event.GAMEMENU_CLOSE, this.onGameMenuClose);

        EventHandler.removeListener(this, EventHandler.Event.ARENA_CREATE_MODE_TOGGLE_BLOCK, this.handleToggleToBlock);
        EventHandler.removeListener(this, EventHandler.Event.ARENA_CREATE_MODE_TOGGLE_CAMERA, this.handleToggleToCamera);
        EventHandler.removeListener(this, EventHandler.Event.ARENA_CREATE_MODE_TOGGLE_GAMESPAWN, this.handleToggleToGameSpawn);
        EventHandler.removeListener(this, EventHandler.Event.ARENA_CREATE_MODE_TOGGLE_INITIALSPAWN, this.handleToggleToInitialSpawn);
    }

    private onGameMenuOpen() {
        if (this.mode === Mode.BLOCK) {
            this.detachChild(this.blockCreationTool);
        } else if (this.mode === Mode.GAMESPAWN) {
            this.detachChild(this.gameSpawnCreationTool);
        } else if (this.mode === Mode.INITIALSPAWN) {
            this.detachChild(this.initialSpawnCreationTool);
        }
    }

    private onGameMenuClose() {
        if (this.mode === Mode.BLOCK) {
            this.attachChild(this.blockCreationTool);
        } else if (this.mode === Mode.GAMESPAWN) {
            this.attachChild(this.gameSpawnCreationTool);
        } else if (this.mode === Mode.INITIALSPAWN) {
            this.attachChild(this.initialSpawnCreationTool);
        }
    }

    private handleToggleToCamera() {
        this.removeTool();
        this.mode = Mode.CAMERA;
    }

    private handleToggleToBlock() {
        this.removeTool();
        this.attachChild(this.blockCreationTool);
        this.mode = Mode.BLOCK;
    }

    private handleToggleToGameSpawn() {
        this.removeTool();
        this.attachChild(this.gameSpawnCreationTool);
        this.mode = Mode.GAMESPAWN;
    }

    private handleToggleToInitialSpawn() {
        this.removeTool();
        this.attachChild(this.initialSpawnCreationTool);
        this.mode = Mode.INITIALSPAWN;
    }

    private removeTool() {
        switch (this.mode) {
            case Mode.BLOCK:
                this.detachChild(this.blockCreationTool);
                break;
            case Mode.GAMESPAWN:
                this.detachChild(this.gameSpawnCreationTool);
                break;
            case Mode.INITIALSPAWN:
                this.detachChild(this.initialSpawnCreationTool);
                break;
        }
    }
}

enum Mode {
    CAMERA,
    BLOCK,
    GAMESPAWN,
    INITIALSPAWN,
}
