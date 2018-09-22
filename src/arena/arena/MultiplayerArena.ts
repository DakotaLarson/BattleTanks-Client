import Arena from './Arena';
import EventHandler from '../../EventHandler';
import Player from '../player/Player';
import ConnectedPlayer from '../player/ConnectedPlayer';

export default class MultiplayerArena extends Arena{

    player: Player;
    connectedPlayers: Map<number, ConnectedPlayer>;
    gameMenuOpen: boolean;
    
    constructor(){
        super();
        
        this.player = undefined;
        this.connectedPlayers = new Map();
        this.gameMenuOpen = false;
    }

    enable(){
        super.enable();

        EventHandler.addListener(this, EventHandler.Event.GAMEMENU_OPEN, this.onGameMenuOpen);
        EventHandler.addListener(this, EventHandler.Event.GAMEMENU_CLOSE, this.onGameMenuClose);
        
        EventHandler.addListener(this, EventHandler.Event.ARENA_PLAYER_ADDITION, this.onPlayerAddition);
        EventHandler.addListener(this, EventHandler.Event.ARENA_PLAYER_REMOVAL, this.onPlayerRemoval);
        EventHandler.addListener(this, EventHandler.Event.ARENA_PLAYER_MOVE, this.onPlayerMove);


        EventHandler.addListener(this, EventHandler.Event.ARENA_CONNECTED_PLAYER_ADDITION, this.onConnectedPlayerAddition);
        EventHandler.addListener(this, EventHandler.Event.ARENA_CONNECTED_PLAYER_MOVE, this.onConnectedPlayerMove);

        
    }

    disable(){
        super.disable();
        EventHandler.removeListener(this, EventHandler.Event.GAMEMENU_OPEN, this.onGameMenuOpen);
        EventHandler.removeListener(this, EventHandler.Event.GAMEMENU_CLOSE, this.onGameMenuClose);

        EventHandler.removeListener(this, EventHandler.Event.ARENA_PLAYER_ADDITION, this.onPlayerAddition);
        EventHandler.removeListener(this, EventHandler.Event.ARENA_PLAYER_REMOVAL, this.onPlayerRemoval);
        EventHandler.removeListener(this, EventHandler.Event.ARENA_PLAYER_MOVE, this.onPlayerMove);

        EventHandler.removeListener(this, EventHandler.Event.ARENA_CONNECTED_PLAYER_ADDITION, this.onConnectedPlayerAddition);
        EventHandler.removeListener(this, EventHandler.Event.ARENA_CONNECTED_PLAYER_MOVE, this.onConnectedPlayerMove);
        
        this.gameMenuOpen = false;
        this.connectedPlayers.clear();
    }

    onPlayerAddition(data){
        this.player = new Player(data.id, data.pos);
        if(!this.gameMenuOpen){
            this.attachChild(this.player);
        }
    }

    onPlayerRemoval(){
        if(!this.gameMenuOpen){
            this.detachChild(this.player);
        }
        this.player = undefined;
    }

    onPlayerMove(data){
        if(data.fromServer){
            this.player.position = data.pos;
            this.player.bodyRotation = data.bodyRot;
            this.player.headRotation = data.headRot;
        }
    }

    onConnectedPlayerAddition(data){
        let player = new ConnectedPlayer(data.id, data.name, data.pos, data.bodyRot, data.headRot)
        this.connectedPlayers.set(data.id, player);
    }

    onConnectedPlayerMove(data){
        let player = this.connectedPlayers.get(data.id);
        player.updatePosition(data.pos, data.bodyRot, data.headRot);
    }

    onConnectedPlayerRemoval(id){
        this.connectedPlayers.delete(id);
    }

    onGameMenuOpen(){
        if(this.player){
            this.detachChild(this.player);
            this.gameMenuOpen = true;
        }
    }

    onGameMenuClose(){
        if(this.player){
            this.attachChild(this.player);
            this.gameMenuOpen = false;
        }
    }
}
