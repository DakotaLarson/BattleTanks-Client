import ChildComponent from "../../component/ChildComponent";
import DomHandler from "../../DomHandler";
import DOMMutationHandler from "../../DOMMutationHandler";

export default class PlayerStats extends ChildComponent {

    private parentElt: HTMLElement;
    private containerElt: HTMLElement;

    constructor(menuElt: HTMLElement) {
        super();

        this.parentElt = DomHandler.getElement(".side-panel-stats", menuElt);
        this.containerElt = DomHandler.getElement(".data-container", this.parentElt);
    }

    public enable() {
        DOMMutationHandler.show(this.parentElt);
    }

    public disable() {
        DOMMutationHandler.hide(this.parentElt);
    }

    public updateStats(stats: any) {
        if (stats) {
            this.formatStats(stats);
            this.renderStats(stats);
        } else {
            this.clearStats();
        }
    }

    private renderStats(stats: any) {
        const statTitles = ["points", "rank", "victories", "defeats", "V/D", "kills", "deaths", "K/D", "shots", "hits", "accuracy"];
        for (const title of statTitles) {
            if (stats[title] !== undefined) {
                this.containerElt.appendChild(this.createStatElt(title));
                this.containerElt.appendChild(this.createStatElt(stats[title]));
            }
        }
    }

    private formatStats(stats: any) {
        if (stats.victories !== undefined) {
            let vdRatio = stats.victories;
            if (stats.defeats) {
                vdRatio = Math.round(vdRatio / stats.defeats * 100) / 100;
            }
            stats["V/D"] = vdRatio;
        }
        if (stats.kills !== undefined) {
            let kdRatio = stats.kills;
            if (stats.deaths) {
                kdRatio = Math.round(kdRatio / stats.deaths * 100) / 100;
            }
            stats["K/D"] = kdRatio;
        }
        if (stats.hits !== undefined) {
            let accuracy = stats.hits * 100;
            if (stats.shots) {
                accuracy = Math.round(accuracy / stats.shots);
            }
            stats.accuracy = accuracy + "%";
        }
    }

    private clearStats() {
        DOMMutationHandler.clear(this.containerElt);
    }

    private createStatElt(title: string) {
        const element = document.createElement("div");
        element.textContent = title;
        element.classList.add("player-stat");
        return element;
    }
}
