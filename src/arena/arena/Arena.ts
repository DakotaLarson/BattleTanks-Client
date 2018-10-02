import Component from "../../component/ChildComponent";

export default class Arena extends Component {

    // private blockPositions: Vector3[];
    // private initialSpawnPositions: Vector4[];
    // private gameSpawnPositions: Vector4[];

    constructor() {
        super();

        // this.blockPositions = [];
        // this.initialSpawnPositions = [];
        // this.gameSpawnPositions = [];
    }
    public enable() {
        // EventHandler.addListener(this, EventHandler.Event.ARENA_BLOCKPOSITION_UPDATE, this.onBlockLocationUpdate);
        // EventHandler.addListener(this, EventHandler.Event.ARENA_GAMESPAWN_UPDATE, this.onGameSpawnUpdate);
        // EventHandler.addListener(this, EventHandler.Event.ARENA_INITIALSPAWN_UPDATE, this.onInitialSpawnUpdate);
    }

    public disable() {
        // EventHandler.removeListener(this, EventHandler.Event.ARENA_BLOCKPOSITION_UPDATE, this.onBlockLocationUpdate);
        // EventHandler.removeListener(this, EventHandler.Event.ARENA_GAMESPAWN_UPDATE, this.onGameSpawnUpdate);
        // EventHandler.removeListener(this, EventHandler.Event.ARENA_INITIALSPAWN_UPDATE, this.onInitialSpawnUpdate);
    }

    // private onBlockLocationUpdate(blockPositions: Vector3[]) {
    //     this.blockPositions = blockPositions;
    // }

    // private onGameSpawnUpdate(gameSpawnPositions: Vector4[]) {
    //     this.gameSpawnPositions = gameSpawnPositions;
    // }

    // private onInitialSpawnUpdate(initialSpawnPositions: Vector4[]) {
    //     this.initialSpawnPositions = initialSpawnPositions;
    // }
}
