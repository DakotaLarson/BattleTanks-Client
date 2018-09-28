import EventHandler from "../../EventHandler";
import ConnectedPlayer from "../player/ConnectedPlayer";
import Player from "../player/Player";
import Arena from "./Arena";

export default class MultiplayerArena extends Arena {

    public player: Player | undefined;
    public connectedPlayers: Map<number, ConnectedPlayer>;
    public gameMenuOpen: boolean;

    constructor() {
        super();

        this.player = undefined;
        this.connectedPlayers = new Map();
        this.gameMenuOpen = false;
    }

    public enable() {
        super.enable();

        EventHandler.addListener(this, EventHandler.Event.GAMEMENU_OPEN, this.onGameMenuOpen);
        EventHandler.addListener(this, EventHandler.Event.GAMEMENU_CLOSE, this.onGameMenuClose);

        EventHandler.addListener(this, EventHandler.Event.ARENA_PLAYER_ADDITION, this.onPlayerAddition);
        EventHandler.addListener(this, EventHandler.Event.ARENA_PLAYER_REMOVAL, this.onPlayerRemoval);
        EventHandler.addListener(this, EventHandler.Event.ARENA_PLAYER_MOVE, this.onPlayerMove);

        EventHandler.addListener(this, EventHandler.Event.ARENA_CONNECTED_PLAYER_ADDITION, this.onConnectedPlayerAddition);
        EventHandler.addListener(this, EventHandler.Event.ARENA_CONNECTED_PLAYER_MOVE, this.onConnectedPlayerMove);

    }

    public disable() {
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

    public onPlayerAddition(data: any) {
        this.player = new Player(data.id, data.pos);
        if (!this.gameMenuOpen) {
            this.attachChild(this.player);
        }
    }

    public onPlayerRemoval() {
        if (!this.gameMenuOpen) {
            this.detachChild(this.player as Player);
        }
        this.player = undefined;
    }

    public onPlayerMove(data: any) {
        if (data.fromServer && this.player) {
            this.player.position = data.pos;
            this.player.bodyRotation = data.bodyRot;
            this.player.headRotation = data.headRot;
        }
    }

    public onConnectedPlayerAddition(data: any) {
        const player = new ConnectedPlayer(data.id, data.name, data.pos, data.headRot);
        this.connectedPlayers.set(data.id, player);
    }

    public onConnectedPlayerMove(data: any) {
        const player = this.connectedPlayers.get(data.id);
        if (player) {
            player.updatePosition(data.pos, data.bodyRot, data.headRot);

        }
    }

    public onConnectedPlayerRemoval(id: number) {
        this.connectedPlayers.delete(id);
    }

    public onGameMenuOpen() {
        if (this.player) {
            this.detachChild(this.player);
        }
        this.gameMenuOpen = true;
    }

    public onGameMenuClose() {
        if (this.player) {
            this.attachChild(this.player);
        }
        this.gameMenuOpen = false;
    }
}
