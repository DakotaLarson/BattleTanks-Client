import Component from "../component/ChildComponent";
import DomHandler from "../DomHandler";
import EventHandler from "../EventHandler";

export default class MultiplayerMenu extends Component {

    private element: HTMLElement;

    private serverListElt: HTMLElement;
    private addServerBtn: HTMLElement;
    private joinServerBtn: HTMLElement;
    private removeServerBtn: HTMLElement;
    private cancelBtn: HTMLElement;

    private servers: any[] | undefined;

    private selectedElt: HTMLElement | undefined;
    private selectedIndex: number;

    constructor(mainMenu: HTMLElement) {
        super();
        this.element = DomHandler.getElement("#main-menu-mp", mainMenu);

        this.serverListElt = DomHandler.getElement(".server-list", this.element);

        this.addServerBtn = DomHandler.getElement("#mp-opt-add-server", this.element);
        this.joinServerBtn = DomHandler.getElement("#mp-opt-join-server", this.element);
        this.removeServerBtn = DomHandler.getElement("#mp-opt-remove-server", this.element);
        this.cancelBtn = DomHandler.getElement("#mp-opt-cancel", this.element);

        this.selectedIndex = -1;
    }

    public enable() {
        this.servers = this.getServers();

        this.createMenuServerList(this.servers);
        this.joinServerBtn.classList.add("disabled");
        this.removeServerBtn.classList.add("disabled");

        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK, this.onAddServerClick);
        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK, this.onCancelClick);
        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK, this.onJoinServerClick);
        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK, this.onRemoveServerClick);

        this.element.style.display = "block";
    }

    public disable() {
        this.joinServerBtn.classList.remove("disabled");
        this.removeServerBtn.classList.remove("disabled");

        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK, this.onAddServerClick);
        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK, this.onCancelClick);
        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK, this.onJoinServerClick);
        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK, this.onRemoveServerClick);

        while (this.serverListElt.firstChild) {
            this.serverListElt.removeChild(this.serverListElt.firstChild);
        }

        this.selectedElt = undefined;
        this.servers = undefined;

        this.element.style.display = "";
    }

    // SERVER CLICK HANDLERS

    private onServerClick(index: number, element: HTMLElement) {
        if (this.selectedElt) {
            if (this.selectedElt !== element) {
                this.selectedElt.classList.remove("server-opt-selected");
                element.classList.add("server-opt-selected");
                this.selectedElt = element;
            }
        } else {
            element.classList.add("server-opt-selected");
            this.selectedElt = element;
        }
        this.selectedIndex = index;
        this.joinServerBtn.classList.remove("disabled");
        this.removeServerBtn.classList.remove("disabled");
    }

    private onServerDblClick(index: number) {
        if (this.servers) {
            const address = this.servers[index].address;
            EventHandler.callEvent(EventHandler.Event.MPMENU_JOIN_OPT_CLICK, address);
        }
    }

    // OPTION HANDLERS

    private onAddServerClick(event: MouseEvent) {
        if (event.target === this.addServerBtn) {
            EventHandler.callEvent(EventHandler.Event.MPMENU_ADDSERVER_OPT_CLICK);
        }
    }

    private onJoinServerClick(event: MouseEvent) {
        if (event.target === this.joinServerBtn) {
            if (this.servers && this.selectedIndex !== -1) {
                if (!this.joinServerBtn.classList.contains("disabled")) {
                    const address = this.servers[this.selectedIndex].address;
                    EventHandler.callEvent(EventHandler.Event.MPMENU_JOIN_OPT_CLICK, address);
                }
            }
        }
    }

    private onRemoveServerClick(event: MouseEvent) {
        if (event.target === this.removeServerBtn) {
            if (this.servers && this.selectedIndex !== -1) {
                if (!this.removeServerBtn.classList.contains("disabled")) {
                    const confirmation = window.confirm("Are you sure you want to remove this server?");
                    if (confirmation) {
                        this.servers.splice(this.selectedIndex, 1);
                        this.updateMenuServerList(this.servers);
                    }
                    localStorage.setItem("serverList", JSON.stringify(this.servers));
                }
            }
        }
    }

    private onCancelClick(event: MouseEvent) {
        if (event.target === this.cancelBtn) {
            EventHandler.callEvent(EventHandler.Event.MPMENU_CANCEL_OPT_CLICK);
        }
    }

    private getServers() {
        const rawServerList = localStorage.getItem("serverList");
        let serverList;
        if (rawServerList) {
            serverList = JSON.parse(rawServerList);
        } else {
            serverList = new Array({
                name: "Offical Server",
                address: "wss://battle-tanks-server.herokuapp.com",
            });
            localStorage.setItem("serverList", JSON.stringify(serverList));
        }
        return serverList;
    }

    private createMenuServerList(servers?: any[]) {
        if (servers) {
            for (let i = 0; i < servers.length; i ++) {
                const server = servers[i];

                // parent
                const serverOptParent = document.createElement("div");
                serverOptParent.classList.add("server-opt-parent", "opt-title");

                // name
                const serverOptName = document.createElement("div");
                serverOptName.classList.add("server-opt-name");
                serverOptName.textContent = server.name;
                serverOptParent.appendChild(serverOptName);

                // address
                const serverOptAddress = document.createElement("div");
                serverOptAddress.classList.add("server-opt-address");
                serverOptAddress.textContent = server.address;
                serverOptParent.appendChild(serverOptAddress);

                // ending break tag
                if (i !== servers.length - 1) {
                    const breakTag = document.createElement("br");
                    serverOptParent.appendChild(breakTag);
                }

                this.serverListElt.appendChild(serverOptParent);
                serverOptParent.addEventListener("click", () => {
                    this.onServerClick(i, serverOptParent);
                });
                serverOptParent.addEventListener("dblclick", () => {
                    this.onServerDblClick(i);
                });
            }
        }
    }
    private updateMenuServerList(servers?: any[]) {
        while (this.serverListElt.firstChild) {
            this.serverListElt.removeChild(this.serverListElt.firstChild);
        }
        this.selectedElt = undefined;
        this.createMenuServerList(servers);
        this.joinServerBtn.classList.add("disabled");
        this.removeServerBtn.classList.add("disabled");
    }
}
