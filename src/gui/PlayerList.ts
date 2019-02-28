import ChildComponent from "../component/ChildComponent";
import DomHandler from "../DomHandler";
import EventHandler from "../EventHandler";
import Options from "../Options";

export default class PlayerList extends ChildComponent {

    private container: HTMLElement;

    constructor(guiElt: HTMLElement) {
        super();
        this.container = DomHandler.getElement(".player-list", guiElt);
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.CONNECTED_PLAYER_JOIN, this.onPlayerJoin);
        EventHandler.addListener(this, EventHandler.Event.CONNECTED_PLAYER_LEAVE, this.onPlayerLeave);

        EventHandler.addListener(this, EventHandler.Event.DOM_KEYDOWN, this.onKeyDown);
        EventHandler.addListener(this, EventHandler.Event.DOM_KEYUP, this.onKeyUp);
        EventHandler.addListener(this, EventHandler.Event.DOM_BLUR, this.onBlur);
        EventHandler.addListener(this, EventHandler.Event.OPTIONS_UPDATE, this.onOptionsUpdate);
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.CONNECTED_PLAYER_JOIN, this.onPlayerJoin);
        EventHandler.removeListener(this, EventHandler.Event.CONNECTED_PLAYER_LEAVE, this.onPlayerLeave);

        EventHandler.removeListener(this, EventHandler.Event.DOM_KEYDOWN, this.onKeyDown);
        EventHandler.removeListener(this, EventHandler.Event.DOM_KEYUP, this.onKeyUp);
        EventHandler.removeListener(this, EventHandler.Event.DOM_BLUR, this.onBlur);
        EventHandler.removeListener(this, EventHandler.Event.OPTIONS_UPDATE, this.onOptionsUpdate);

        this.clearPlayers();
    }

    private onPlayerJoin(event: any) {
        if (event.sendMessage) {
            this.sendMessage(event.name, " joined the game!");
        }
        this.addPlayer(event.id, event.name);
    }

    private onPlayerLeave(event: any) {
        if (event.sendMessage) {
            this.sendMessage(event.name, " left the game.");
        }
        this.removePlayer(event.id);
    }

    private onKeyDown(event: KeyboardEvent) {
        if (event.code === Options.options.playerList.code) {
            this.showPlayerList();
        }
    }

    private onKeyUp(event: KeyboardEvent) {
        if (event.code === Options.options.playerList.code) {
            this.hidePlayerList();
        }
    }

    private onOptionsUpdate(event: any) {
        if (event.attribute === "playerList") {
            this.hidePlayerList();
        }
    }

    private onBlur() {
        this.hidePlayerList();
    }

    private showPlayerList() {
        this.container.style.display = "inline-block";
    }

    private hidePlayerList() {
        this.container.style.display = "";
    }

    private addPlayer(id: number, name: string) {
        const elt = document.createElement("div");
        elt.classList.add("player-list-entry", "player-list-" + id);
        elt.textContent = name;
        this.container.appendChild(elt);
    }

    private removePlayer(id: number) {
        const elt = DomHandler.getElement(".player-list-" + id, this.container);
        this.container.removeChild(elt);
    }

    private clearPlayers() {
        while (this.container.firstChild) {
            this.container.removeChild(this.container.firstChild);
        }
    }

    private sendMessage(name: string, text: string) {
        const segments = [];
        segments.push({
            color: 0xffffff,
            text: name,
        },
        {
            color: 0xe8be17,
            text,
        });
        EventHandler.callEvent(EventHandler.Event.CHAT_UPDATE, segments);
    }
}
