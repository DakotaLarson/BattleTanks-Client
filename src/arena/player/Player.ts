import { Plane, Ray, Vector3, Vector4 } from "three";
import Component from "../../component/ChildComponent";
import EventHandler from "../../EventHandler";
import Globals from "../../Globals";
import Options from "../../Options";
import PacketSender from "../../PacketSender";
import RaycastHandler from "../../RaycastHandler";
import BlockCollisionHandler from "../collision/BlockCollisionHandler";
import PlayerCollisionHandler from "../collision/PlayerCollisionHandler";

export default class Player extends Component {

    public static radius = Math.sqrt(Math.pow(0.5, 2) + Math.pow(0.75, 2));

    private static readonly MOVEMENT_SPEED = 4;
    private static readonly ROTATION_SPEED = 2;
    private static readonly RAMMING_SPEED_MULTI = 2;
    private static readonly DECREASE_MULTIPLIER = 4;

    private static readonly X_OFFSET = 0.5;
    private static readonly Z_OFFSET = 0.75;

    public position: Vector3;

    public id: number;

    public color: number;

    public bodyRotation: number;
    public headRotation: number;

    private movementVelocity: number;
    private rotationVelocity: number;
    private speedMultiplier: number;

    private movingForward: boolean;
    private movingBackward: boolean;
    private rotatingLeft: boolean;
    private rotatingRight: boolean;

    private movingLastFrame: boolean;
    private rammingSpeedEnabled: boolean;

    private frameDelta: number;

    private lookingBehind: boolean;
    private ramResponse: Vector3 | undefined;

    constructor(id: number, color: number, pos: Vector4) {
        super();
        this.id = id;

        this.position = new Vector3(pos.x, pos.y, pos.z);
        this.bodyRotation = pos.w;
        this.headRotation = pos.w;

        this.color = color;

        this.movingForward = false;
        this.movingBackward = false;

        this.rotatingLeft = false;
        this.rotatingRight = false;

        this.movingLastFrame = false;
        this.rammingSpeedEnabled = false;

        this.movementVelocity = 0;
        this.rotationVelocity = 0;
        this.speedMultiplier = 1;

        this.frameDelta = 0;

        this.lookingBehind = false;
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.DOM_KEYDOWN, this.onKeyDown);
        EventHandler.addListener(this, EventHandler.Event.DOM_KEYUP, this.onKeyUp);

        EventHandler.addListener(this, EventHandler.Event.DOM_MOUSEDOWN, this.onMouseDown);
        EventHandler.addListener(this, EventHandler.Event.DOM_MOUSEUP, this.onMouseUp);

        EventHandler.addListener(this, EventHandler.Event.GAMEMENU_OPEN, this.onOverlayOpen);
        EventHandler.addListener(this, EventHandler.Event.CHAT_OPEN, this.onOverlayOpen);

        EventHandler.addListener(this, EventHandler.Event.GAME_ANIMATION_UPDATE, this.onUpdate);

        EventHandler.addListener(this, EventHandler.Event.PLAYER_SPEED_MULTIPLIER, this.onMultiplier);

        EventHandler.addListener(this, EventHandler.Event.PLAYER_RAM, this.onRam);
        EventHandler.addListener(this, EventHandler.Event.PLAYER_RAM_RESPONSE, this.onRamResponse);

        EventHandler.addListener(this, EventHandler.Event.GAME_TICK, this.onTick);

        EventHandler.addListener(this, EventHandler.Event.DOM_BLUR, this.onBlur);

        EventHandler.addListener(this, EventHandler.Event.PLAYER_LOOKING_BEHIND, this.onLookingBehind);

        this.movementVelocity = 0;
        this.rotationVelocity = 0;

        this.movingForward = false;
        this.movingBackward = false;

        this.rotatingLeft = false;
        this.rotatingRight = false;

        this.movingLastFrame = false;
        this.rammingSpeedEnabled = false;

        this.speedMultiplier = 1;

        this.lookingBehind = false;

        PacketSender.sendPlayerMove(this.position, this.movementVelocity, this.rotationVelocity, this.bodyRotation, this.headRotation);
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.DOM_KEYDOWN, this.onKeyDown);
        EventHandler.removeListener(this, EventHandler.Event.DOM_KEYUP, this.onKeyUp);

        EventHandler.removeListener(this, EventHandler.Event.DOM_MOUSEDOWN, this.onMouseDown);
        EventHandler.removeListener(this, EventHandler.Event.DOM_MOUSEUP, this.onMouseUp);

        EventHandler.removeListener(this, EventHandler.Event.GAMEMENU_OPEN, this.onOverlayOpen);
        EventHandler.removeListener(this, EventHandler.Event.CHAT_OPEN, this.onOverlayOpen);

        EventHandler.removeListener(this, EventHandler.Event.GAME_ANIMATION_UPDATE, this.onUpdate);

        EventHandler.removeListener(this, EventHandler.Event.PLAYER_SPEED_MULTIPLIER, this.onMultiplier);
        EventHandler.removeListener(this, EventHandler.Event.PLAYER_RAM, this.onRam);
        EventHandler.removeListener(this, EventHandler.Event.PLAYER_RAM_RESPONSE, this.onRamResponse);

        EventHandler.removeListener(this, EventHandler.Event.GAME_TICK, this.onTick);

        EventHandler.removeListener(this, EventHandler.Event.DOM_BLUR, this.onBlur);

        EventHandler.removeListener(this, EventHandler.Event.PLAYER_LOOKING_BEHIND, this.onLookingBehind);

        PacketSender.sendReloadMoveToggle(false);
        this.movingLastFrame = false;
        this.rammingSpeedEnabled = false;
    }

    public getCenterPosition() {
        return this.position.clone().add(new Vector3(0.5, 0, 0.5));
    }

    public getInternalPosition(center: Vector3) {
        return center.clone().sub(new Vector3(0.5, 0, 0.5));
    }

    private onKeyDown(event: KeyboardEvent) {
        this.onInputDown(event.code);
    }

    private onKeyUp(event: KeyboardEvent) {
       this.onInputUp(event.code);
    }

    private onMouseDown(event: MouseEvent) {
        this.onInputDown(event.button);
    }

    private onMouseUp(event: MouseEvent) {
        this.onInputUp(event.button);
    }

    private onInputDown(code: string | number) {
        if (code === Options.options.forward.code) {
            this.movingForward = true;
        } else if (code === Options.options.backward.code) {
            this.movingBackward = true;
        } else if (code === Options.options.left.code) {
            this.rotatingLeft = true;
        } else if (code === Options.options.right.code) {
            this.rotatingRight = true;
        } else if (code === Options.options.shoot.code && !this.isOverlayOpen()) {
            PacketSender.sendPlayerShoot();
        } else if (code === Options.options.reload.code && !this.isOverlayOpen()) {
            PacketSender.sendReloadRequest();
        } else if (code === Options.options.ram.code && !this.isOverlayOpen()) {
            PacketSender.sendPlayerRam();
        }
    }

    private onInputUp(code: string | number) {
        if (code === Options.options.forward.code) {
            this.movingForward = false;
        } else if (code === Options.options.backward.code) {
            this.movingBackward = false;
        } else if (code === Options.options.left.code) {
            this.rotatingLeft = false;
        } else if (code === Options.options.right.code) {
            this.rotatingRight = false;
        }
    }

    private onUpdate(delta: number) {
        let increaseMultiplier = Player.DECREASE_MULTIPLIER * this.speedMultiplier;
        if (this.rammingSpeedEnabled) {
            increaseMultiplier *= Player.RAMMING_SPEED_MULTI;
        }

        // Velocity always goes to 0 with this calculation.
        this.movementVelocity -= this.movementVelocity * Player.DECREASE_MULTIPLIER * delta;
        this.rotationVelocity -= this.rotationVelocity * Player.DECREASE_MULTIPLIER * delta;

        if (this.movingForward && !this.movingBackward && !this.isOverlayOpen()) {
            this.movementVelocity += Player.MOVEMENT_SPEED * delta * increaseMultiplier;
        } else if (this.movingBackward && !this.movingForward && !this.isOverlayOpen()) {
            this.movementVelocity -= Player.MOVEMENT_SPEED * delta * increaseMultiplier;
        }

        if (this.rotatingLeft && !this.rotatingRight && !this.isOverlayOpen()) {
            this.rotationVelocity += Player.ROTATION_SPEED * delta * increaseMultiplier * Options.options.rotationSensitivity;
        } else if (this.rotatingRight && !this.rotatingLeft && !this.isOverlayOpen()) {
            this.rotationVelocity -=  Player.ROTATION_SPEED * delta * increaseMultiplier * Options.options.rotationSensitivity;
        }

        const moving = this.movingForward || this.movingBackward || this.rotatingLeft || this.rotatingRight;

        if (!moving && Math.abs(this.movementVelocity) < 0.01) {
            this.movementVelocity = 0;
        }

        if (!moving && Math.abs(this.rotationVelocity) < 0.01) {
            this.rotationVelocity = 0;
        }

        let rotationDiff = delta * this.rotationVelocity;
        if (Math.abs(rotationDiff) < Math.abs(this.frameDelta)) {
            rotationDiff = this.frameDelta;
        }
        this.frameDelta = 0;

        let potentialRotation = (this.bodyRotation + rotationDiff) % (2 * Math.PI);
        if (potentialRotation < 0) {
            potentialRotation = 2 * Math.PI - potentialRotation;
        }

        const potentialPosition = this.getCenterPosition();
        if (this.ramResponse) {
            potentialPosition.x += delta * this.movementVelocity * this.ramResponse.x;
            potentialPosition.z += delta * this.movementVelocity * this.ramResponse.z;
            potentialRotation = this.bodyRotation;
        } else {
            potentialPosition.x += delta * this.movementVelocity * Math.sin(potentialRotation),
            potentialPosition.z += delta * this.movementVelocity * Math.cos(potentialRotation);
        }

        const playerCollision = PlayerCollisionHandler.getCollision(potentialPosition.clone(), potentialRotation, Player.X_OFFSET, Player.Z_OFFSET, this.id);
        potentialPosition.sub(playerCollision.correction);

        const blockCollision = BlockCollisionHandler.getCollision(potentialPosition.clone(), potentialRotation, Player.X_OFFSET, Player.Z_OFFSET);
        potentialPosition.sub(blockCollision.correction);

        if (blockCollision.sandwiched) {
            if (blockCollision.sandwiched === 1) {
                if (potentialRotation < Math.PI) {
                    potentialRotation = Math.PI / 2;
                } else if (potentialRotation > Math.PI) {
                    potentialRotation = 3 * Math.PI / 2;
                }

            } else if (blockCollision.sandwiched === -1) {
                if (potentialRotation > Math.PI / 2 && potentialRotation < 3 * Math.PI / 2 ) {
                    potentialRotation = Math.PI;
                } else if (potentialRotation < Math.PI / 2 || potentialRotation > 3 * Math.PI / 2) {
                    potentialRotation = 0;
                }
            }
        }

        if (!this.isOverlayOpen()) {
            if (!this.lookingBehind) {
                this.computeTurretRotation();
            } else {
                this.headRotation += rotationDiff;
            }
        }

        if (playerCollision.playerId) {
            if (this.rammingSpeedEnabled) {
                this.rammingSpeedEnabled = false;
                PacketSender.sendRamCollision(playerCollision.playerId);
            }
        }

        this.position.copy(this.getInternalPosition(potentialPosition));
        this.bodyRotation = potentialRotation;

        const movementData = {
            id: this.id,
            pos: this.position,
            bodyRot: this.bodyRotation,
            headRot: this.headRotation,
            fromServer: false,
            delta,
        };

        const movingThisFrame = this.movingForward || this.movingBackward;

        if (movingThisFrame !== this.movingLastFrame) {
            PacketSender.sendReloadMoveToggle(movingThisFrame);
            this.movingLastFrame = movingThisFrame;
        }

        EventHandler.callEvent(EventHandler.Event.PLAYER_MOVE, movementData);
    }

    private onTick() {
        PacketSender.sendPlayerMove(this.position, this.movementVelocity, this.rotationVelocity, this.bodyRotation, this.headRotation);
    }

    private onMultiplier(multiplier: number) {
        this.speedMultiplier = multiplier;
    }

    private onRam(time: number) {
        this.rammingSpeedEnabled = true;
        setTimeout(() => {
            this.rammingSpeedEnabled = false;
        }, time);
    }

    private onRamResponse(vec: Vector3) {
        this.ramResponse = vec;
        this.movementVelocity = 50;
        setTimeout(() => {
            this.ramResponse = undefined;
        }, 1000);
    }

    private onBlur() {
        this.movementVelocity = 0;
        this.rotationVelocity = 0;
        this.onTick(); // Prevents jitter in other clients.
    }

    private onOverlayOpen() {
        this.movingForward = false;
        this.movingBackward = false;

        this.rotatingLeft = false;
        this.rotatingRight = false;
    }

    private onLookingBehind(lookingBehind: boolean) {
        this.lookingBehind = lookingBehind;
    }

    private computeTurretRotation() {
        const ray: Ray = RaycastHandler.getRaycaster().ray;
        const intersection = new Vector3();
        const playerPosition = this.position.clone().add(new Vector3(0.5, 0, 0.5));
        ray.intersectPlane(new Plane(new Vector3(0, 1, 0), -0.75), intersection);
        if (!intersection.equals(new Vector3())) {
            const slope = (playerPosition.x - intersection.x) / (playerPosition.z - intersection.z);
            let angle = Math.atan(slope);

            if (playerPosition.z > intersection.z) {
                angle += Math.PI;
            }
            this.headRotation = angle;
        }
    }

    private isOverlayOpen() {
        return Globals.getGlobal(Globals.Global.CHAT_OPEN) || Globals.getGlobal(Globals.Global.GAME_MENU_OPEN);
    }
}
