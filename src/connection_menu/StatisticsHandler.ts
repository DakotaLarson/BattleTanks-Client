import ChildComponent from "../component/ChildComponent";
import DomHandler from "../DomHandler";
import DOMMutationHandler from "../DOMMutationHandler";
import EventHandler from "../EventHandler";

export default class StatisticsHandler extends ChildComponent {

    private parentElt: HTMLElement;

    constructor(menuElt: HTMLElement) {
        super();
        this.parentElt = DomHandler.getElement(".last-match-statistics", menuElt);
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.STATISTICS_RECEPTION, this.onStatsReception);
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.STATISTICS_RECEPTION, this.onStatsReception);
        DOMMutationHandler.clear(this.parentElt);
        this.parentElt.parentElement!.classList.remove("connection-menu-content-container-with-multiple");
    }

    private onStatsReception(stats: any) {
        const elt = this.createStatisticsMarkup(stats);
        this.parentElt.parentElement!.classList.add("connection-menu-content-container-with-multiple");
        DOMMutationHandler.clear(this.parentElt);
        DOMMutationHandler.add(elt, this.parentElt);
    }

    private createStatisticsMarkup(stats: any) {
        const parent = document.createElement("div");
        parent.appendChild(this.createStatisticsTitle());
        if (stats.win !== undefined) {
            parent.appendChild(this.createStatisticMarkup("Status", stats.win ? "Win" : "Loss", true, true));
        }

        parent.appendChild(this.createStatisticMarkup("Points Earned", stats.points));
        parent.appendChild(this.createStatisticMarkup("Currency Earned", stats.currency, true));

        parent.appendChild(this.createStatisticMarkup("Kills", stats.kills));
        parent.appendChild(this.createStatisticMarkup("Shots", stats.shots, true));

        parent.appendChild(this.createStatisticMarkup("K/D Ratio", this.createRatioText(stats.kills, stats.deaths, false) + " (" + stats.deaths + " deaths)"));
        parent.appendChild(this.createStatisticMarkup("Accuracy", this.createRatioText(stats.hits, stats.shots, true) + " (" + stats.hits + " hits)", true));

        parent.appendChild(this.createStatisticMarkup("Team Kills", stats.teamKills));
        parent.appendChild(this.createStatisticMarkup("Enemy Kills", stats.enemyTeamKills, true));

        parent.appendChild(this.createStatisticMarkup("Team Hits", stats.teamHits));
        parent.appendChild(this.createStatisticMarkup("Enemy Hits", stats.enemyTeamHits, true));

        parent.appendChild(this.createStatisticMarkup("Team Shots", stats.teamShots));
        parent.appendChild(this.createStatisticMarkup("Enemy Shots", stats.enemyTeamShots));
        return parent;
    }

    private createStatisticsTitle() {
        const elt = document.createElement("div");
        elt.classList.add("stats-title");
        elt.textContent = "Last Match Statistics:";
        return elt;
    }

    private createStatisticMarkup(title: string, value: any, hasPadding?: boolean, isLarge?: boolean) {
        const elt = document.createElement("div");
        if (hasPadding) {
            elt.classList.add("stats-pad");
        }
        if (isLarge) {
            elt.classList.add("stats-large");
        }
        elt.textContent = title + ": " + value;
        return elt;
    }

    private createRatioText(a: number, b: number, isPercentage: boolean) {
        let num = a;
        if (b !== 0) {
            num = Math.round(a / b * 100);
        }
        if (!isPercentage) {
            if (b !== 0) {
                num /= 100;
            }
            return "" + num;
        } else {
            return num + "%";
        }
    }

}
