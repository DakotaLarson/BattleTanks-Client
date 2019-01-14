import ChildComponent from "../component/ChildComponent";
import DomHandler from "../DomHandler";

export default class GameSuggestion extends ChildComponent {

    private element: HTMLElement;

    /*
    Create an arena and submit your creation on the <discord server>!
    You reload 3x faster when you don't move!
    Holding down the secondary mouse button locks the camera!
    Press <Key> to chat with other players!
    Want the full immersive experience? Go fullscreen!
    Want to move your turret independently? Switch to standard controls in the options menu!
    Pick up powerups to gain an advantage!
    We have a <discord server>!
    Remember you only respawn twice... Be careful!
    You are protected for 3 seconds after you spawn. Make it count!
    */

    constructor(menu: HTMLElement) {
        super();
        this.element = DomHandler.getElement(".game-suggestion", menu);
    }

    public enable() {

    }

    public disable() {

    }
}
