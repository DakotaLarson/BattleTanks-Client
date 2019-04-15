import { Vector3 } from "three";
import ChildComponent from "../../component/ChildComponent";
import EventHandler from "../../EventHandler";
import PacketSender from "../../PacketSender";
import Player from "../player/Player";
import Powerup from "./Powerup";

export default class PowerupCollisionHandler extends ChildComponent {

    private playerPosition: Vector3;

    private powerups: Powerup[];

    private listening: boolean;

    constructor() {
        super();
        this.powerups = [];
        this.playerPosition = new Vector3();
        this.listening = false;
    }

    public enable() {

        this.listening = false;
        this.powerups = [];
        EventHandler.addListener(this, EventHandler.Event.POWERUP_ADDITION, this.onPowerupAddition);
        EventHandler.addListener(this, EventHandler.Event.POWERUP_REMOVAL, this.onPowerupRemoval);

        EventHandler.addListener(this, EventHandler.Event.PLAYER_ADDITION, this.onPlayerAddition);
        EventHandler.addListener(this, EventHandler.Event.PLAYER_REMOVAL, this.onPlayerRemoval);
        EventHandler.addListener(this, EventHandler.Event.PLAYER_MOVE, this.onPlayerMove);

        EventHandler.addListener(this, EventHandler.Event.GAME_TICK, this.onTick);
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.POWERUP_ADDITION, this.onPowerupAddition);
        EventHandler.removeListener(this, EventHandler.Event.POWERUP_REMOVAL, this.onPowerupRemoval);

        EventHandler.removeListener(this, EventHandler.Event.PLAYER_ADDITION, this.onPlayerAddition);
        EventHandler.removeListener(this, EventHandler.Event.PLAYER_REMOVAL, this.onPlayerRemoval);
        EventHandler.removeListener(this, EventHandler.Event.PLAYER_MOVE, this.onPlayerMove);

        EventHandler.removeListener(this, EventHandler.Event.GAME_TICK, this.onTick);
    }

    private onPowerupAddition(powerup: Powerup) {
        this.powerups.push(powerup);
    }

    private onPowerupRemoval(powerup: Powerup) {
        let index = -1;
        for (let i = 0; i < this.powerups.length; i ++) {
            const otherPowerup = this.powerups[i];
            if (powerup.equals(otherPowerup)) {
                index = i;
                break;
            }
        }
        if (index > -1) {
            this.powerups.splice(index, 1);
        }
    }

    private onPlayerAddition(data: any) {
        this.playerPosition.copy(data.pos);
        this.listening = true;
    }

    private onPlayerRemoval() {
        this.listening = false;
    }

    private onPlayerMove(data: any) {
        this.playerPosition.copy(data.pos);
    }

    private onTick() {
        if (this.listening) {
            for (const powerup of this.powerups) {
                const powerupPos = powerup.position;
                if (powerupPos.distanceToSquared(this.playerPosition) < Math.pow(Player.RADIUS + Powerup.RADIUS, 2)) {
                    PacketSender.sendPowerupPickup([powerup.type, powerupPos.x, 0, powerupPos.z]);
                }
            }
        }
    }
}
