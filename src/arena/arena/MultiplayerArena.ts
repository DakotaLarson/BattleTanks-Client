import Arena from './Arena';
import EventHandler from '../../EventHandler';
import Player from '../player/Player';
import { Vector3 } from 'three';

export default class MultiplayerArena extends Arena{

    player: Player;
    
    constructor(){
        super();
        
        this.player = undefined;
    }

    enable(){
        super.enable();
        EventHandler.addListener(this, EventHandler.Event.ARENA_INITIALSPAWN_ASSIGNMENT, this.onInitialSpawnAssignment);
    }

    disable(){
        super.disable();
        EventHandler.removeListener(this, EventHandler.Event.ARENA_INITIALSPAWN_ASSIGNMENT, this.onInitialSpawnAssignment);
    }

    onInitialSpawnAssignment(loc: Vector3){
        let playerId = this.getNewPlayerId();
        this.player = new Player(playerId, loc);
        this.attachChild(this.player);
        EventHandler.callEvent(EventHandler.Event.ARENA_PLAYER_ADDITION, this.player);
    }

    getNewPlayerId(): number{
        return latestId ++;
    }
}

let latestId = 0;
