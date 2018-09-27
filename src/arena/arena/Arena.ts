import { Vector3, Vector4 } from "three";
import Component from "../../component/ChildComponent";
import EventHandler from "../../EventHandler";

export default class Arena extends Component {

    public blockPositions: Vector3[];
    public initialSpawnPositions: Vector4[];
    public gameSpawnPositions: Vector4[];

    constructor() {
        super();

        this.blockPositions = [];
        this.initialSpawnPositions = [];
        this.gameSpawnPositions = [];
    }
    public enable() {
        EventHandler.addListener(this, EventHandler.Event.ARENA_BLOCKPOSITION_UPDATE, this.onBlockLocationUpdate);
        EventHandler.addListener(this, EventHandler.Event.ARENA_GAMESPAWN_UPDATE, this.onGameSpawnUpdate);
        EventHandler.addListener(this, EventHandler.Event.ARENA_INITIALSPAWN_UPDATE, this.onInitialSpawnUpdate);
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.ARENA_BLOCKPOSITION_UPDATE, this.onBlockLocationUpdate);
        EventHandler.removeListener(this, EventHandler.Event.ARENA_GAMESPAWN_UPDATE, this.onGameSpawnUpdate);
        EventHandler.removeListener(this, EventHandler.Event.ARENA_INITIALSPAWN_UPDATE, this.onInitialSpawnUpdate);
    }

    public onBlockLocationUpdate(blockPositions: Vector3[]) {
        this.blockPositions = blockPositions;
    }

    public onGameSpawnUpdate(gameSpawnPositions: Vector4[]) {
        this.gameSpawnPositions = gameSpawnPositions;
    }

    public onInitialSpawnUpdate(initialSpawnPositions: Vector4[]) {
        this.initialSpawnPositions = initialSpawnPositions;
    }
}
