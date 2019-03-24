import ChildComponent from "../component/ChildComponent";
import DomHandler from "../DomHandler";
import EventHandler from "../EventHandler";
import Globals from "../Globals";
import Options from "../Options";

export default class PlayerList extends ChildComponent {

    private parentElt: HTMLElement;
    private titleElt: HTMLElement;
    private container: HTMLElement;

    private playerCount: number;

    constructor(guiElt: HTMLElement) {
        super();
        this.parentElt = DomHandler.getElement(".player-list", guiElt);
        this.titleElt = DomHandler.getElement(".player-list-title", this.parentElt);
        this.container = DomHandler.getElement(".player-list-container", this.parentElt);

        this.playerCount = 0;
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.CONNECTED_PLAYER_JOIN, this.onPlayerJoin);
        EventHandler.addListener(this, EventHandler.Event.CONNECTED_PLAYER_LEAVE, this.onPlayerLeave);
        EventHandler.addListener(this, EventHandler.Event.PLAYER_ADDITION, this.onPlayerAddition);
        EventHandler.addListener(this, EventHandler.Event.CONNECTED_PLAYER_ADDITION, this.onPlayerAddition);
        EventHandler.addListener(this, EventHandler.Event.PLAYER_REMOVAL, this.onPlayerRemoval);
        EventHandler.addListener(this, EventHandler.Event.CONNECTED_PLAYER_REMOVAL, this.onPlayerRemoval);

        EventHandler.addListener(this, EventHandler.Event.STATISTICS_UPDATE, this.onStatisticUpdate);

        EventHandler.addListener(this, EventHandler.Event.DOM_KEYDOWN, this.onKeyDown);
        EventHandler.addListener(this, EventHandler.Event.DOM_KEYUP, this.onKeyUp);
        EventHandler.addListener(this, EventHandler.Event.DOM_BLUR, this.onBlur);
        EventHandler.addListener(this, EventHandler.Event.OPTIONS_UPDATE, this.onOptionsUpdate);
        EventHandler.addListener(this, EventHandler.Event.GAMEMENU_OPEN, this.hidePlayerList);
        this.updateTitle();
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.CONNECTED_PLAYER_JOIN, this.onPlayerJoin);
        EventHandler.removeListener(this, EventHandler.Event.CONNECTED_PLAYER_LEAVE, this.onPlayerLeave);
        EventHandler.removeListener(this, EventHandler.Event.PLAYER_ADDITION, this.onPlayerAddition);
        EventHandler.removeListener(this, EventHandler.Event.CONNECTED_PLAYER_ADDITION, this.onPlayerAddition);
        EventHandler.removeListener(this, EventHandler.Event.PLAYER_REMOVAL, this.onPlayerRemoval);
        EventHandler.removeListener(this, EventHandler.Event.CONNECTED_PLAYER_REMOVAL, this.onPlayerRemoval);

        EventHandler.removeListener(this, EventHandler.Event.STATISTICS_UPDATE, this.onStatisticUpdate);

        EventHandler.removeListener(this, EventHandler.Event.DOM_KEYDOWN, this.onKeyDown);
        EventHandler.removeListener(this, EventHandler.Event.DOM_KEYUP, this.onKeyUp);
        EventHandler.removeListener(this, EventHandler.Event.DOM_BLUR, this.onBlur);
        EventHandler.removeListener(this, EventHandler.Event.OPTIONS_UPDATE, this.onOptionsUpdate);
        EventHandler.removeListener(this, EventHandler.Event.GAMEMENU_OPEN, this.hidePlayerList);

        this.clearPlayers();
    }

    private onPlayerJoin(event: any) {
        this.playerCount ++;

        if (event.sendMessage) {
            this.sendMessage(event.name, " joined the game!");
        }
        this.addPlayer(event.id, event.name, event.hasProfile);
    }

    private onPlayerLeave(event: any) {
        this.playerCount --;

        if (event.sendMessage) {
            this.sendMessage(event.name, " left the game.");
        }
        this.removePlayer(event.id);
    }

    private onPlayerAddition(event: any) {
        const elt = DomHandler.getElement(".player-list-" + event.id, this.parentElt);
        const color = this.getCSSColorString(event.color);
        elt.style.color = color;
    }

    private onPlayerRemoval(event: any) {
        const elt = DomHandler.getElement(".player-list-" + event.id, this.parentElt);
        elt.style.color = "#ffffff";
    }

    private onKeyDown(event: KeyboardEvent) {
        if (event.code === Options.options.playerList.code && !Globals.getGlobal(Globals.Global.GAME_MENU_OPEN)) {
            this.showPlayerList();
        }
    }

    private onKeyUp(event: KeyboardEvent) {
        if (event.code === Options.options.playerList.code) {
            this.hidePlayerList();
        }
    }

    private onStatisticUpdate(stat: any) {
        const statTitles = ["points", "kills", "deaths"];
        for (const title of statTitles) {
            if (title in stat) {
                const query = ".player-list-entry-" + title + ".player-list-" + stat.id;
                const elt = DomHandler.getElements(query, this.container)[0];
                elt.textContent = stat[title];
            }
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
        this.parentElt.style.display = "inline-block";
    }

    private hidePlayerList() {
        this.parentElt.style.display = "";
    }

    private addPlayer(id: number, name: string, hasProfile: boolean) {

        const entryClasses = [
            hasProfile ? "profile-link" : "player-list-entry",
            "player-list-entry-points",
            "player-list-entry-kills",
            "player-list-entry-deaths",
        ];

        for (let i = 0; i < 4; i ++) {
            const elt = document.createElement("span");
            elt.classList.add("player-list-entry", entryClasses[i], "player-list-" + id);
            elt.textContent = i === 0 ? name : "0";
            this.container.appendChild(elt);
        }

        this.updateTitle();
    }

    private removePlayer(id: number) {
        const elts = DomHandler.getElements(".player-list-" + id, this.parentElt);
        for (const elt of Array.from(elts)) {
            this.container.removeChild(elt);
        }
        this.updateTitle();
    }

    private clearPlayers() {
        const elts = DomHandler.getElements(".player-list-entry", this.container);
        for (const elt of Array.from(elts)) {
            this.container.removeChild(elt);
        }
        this.playerCount = 0;
        this.updateTitle();
    }

    private updateTitle() {
        this.titleElt.textContent = this.playerCount + " Players";
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

    private getCSSColorString(value: number) {
        if (value) {
            let cssValue = value.toString(16);
            while (cssValue.length < 6) {
                cssValue = "0" + cssValue;
            }
            return "#" + cssValue;
        } else {
            return "#ffffff";
        }
    }
}
