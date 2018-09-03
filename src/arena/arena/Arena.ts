import Component from '../../Component';
import EventHandler from '../../EventHandler';
import { Vector3 } from 'three';


export default class Arena extends Component{

    blockLocations: Array<Vector3>;
    initialSpawnLocations: Array<Vector3>;
    gameSpawnLocations: Array<Vector3>;

    constructor(){
        super();

        this.blockLocations = [];
        this.initialSpawnLocations = [];
        this.gameSpawnLocations = [];
    }

    enable(){
        EventHandler.addListener(this, EventHandler.Event.ARENA_BLOCKLOCATION_UPDATE, this.onBlockLocationUpdate);
        EventHandler.addListener(this, EventHandler.Event.ARENA_GAMESPAWN_UPDATE, this.onGameSpawnUpdate);
        EventHandler.addListener(this, EventHandler.Event.ARENA_INITIALSPAWN_UPDATE, this.onInitialSpawnUpdate);
    }

    disable(){
        EventHandler.removeListener(this, EventHandler.Event.ARENA_BLOCKLOCATION_UPDATE, this.onBlockLocationUpdate);
        EventHandler.removeListener(this, EventHandler.Event.ARENA_GAMESPAWN_UPDATE, this.onGameSpawnUpdate);
        EventHandler.removeListener(this, EventHandler.Event.ARENA_INITIALSPAWN_UPDATE, this.onInitialSpawnUpdate);
    }

    onBlockLocationUpdate(blockLocations: Array<Vector3>){
        this.blockLocations = blockLocations;
    }

    onGameSpawnUpdate(gameSpawnLocations: Array<Vector3>){
        this.gameSpawnLocations = gameSpawnLocations;
    }
    
    onInitialSpawnUpdate(initialSpawnLocations: Array<Vector3>){
        this.initialSpawnLocations = initialSpawnLocations;
    }
}
