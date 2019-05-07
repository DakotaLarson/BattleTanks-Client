import { Scene } from "three";
import ChildComponent from "../../../component/ChildComponent";
import EventHandler from "../../../EventHandler";
import Options from "../../../Options";
import Firework from "./Firework";

export default class FireworkHandler extends ChildComponent {

    private static readonly FIREWORK_LIFESPAN = 1500;

    private scene: Scene;
    private fireworks: Firework[];

    constructor(scene: Scene) {
        super();

        this.scene = scene;
        this.fireworks = [];
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.FIREWORK_ADDITION, this.addFirework);
        EventHandler.addListener(this, EventHandler.Event.GAME_ANIMATION_UPDATE, this.onUpdate);

    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.FIREWORK_ADDITION, this.addFirework);
        EventHandler.removeListener(this, EventHandler.Event.GAME_ANIMATION_UPDATE, this.onUpdate);

        this.clearFireworks();
    }

    private onUpdate(delta: number) {
        for (const firework of this.fireworks) {
            firework.update(delta);
        }
    }

    private addFirework(event: any) {
        if (Options.options.fireworksEnabled) {
            const pos = event.position;
            const color = event.color;

            const firework = new Firework(pos, color);

            this.scene.add(firework.points);
            this.fireworks.push(firework);

            setTimeout(() => {
                this.removeFirework(firework);
            }, FireworkHandler.FIREWORK_LIFESPAN);
        }
    }

    private removeFirework(firework: Firework) {
        const index = this.fireworks.indexOf(firework);
        if (index > -1) {
            this.fireworks.splice(index, 1);
            this.scene.remove(firework.points);
        }
    }

    private clearFireworks() {
        for (const firework of this.fireworks) {
            this.removeFirework(firework);
            this.fireworks = [];
        }
    }
}
