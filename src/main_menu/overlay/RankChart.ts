import DomEventHandler from "../../DomEventHandler";
import DomHandler from "../../DomHandler";
import RankCalculator from "../../RankCalculator";
import Overlay from "./Overlay";

export default class RankChart extends Overlay {

    private chartParent: HTMLElement;

    constructor(contentQuery: string) {
        super(contentQuery);
        this.chartParent = DomHandler.getElement(".rank-chart", this.contentElt);
    }

    public updateProgress(level?: number, points?: number) {

        this.updateInfoElts(this.chartParent, level, points);

        const elts = Array.from(DomHandler.getElements(".rank-chart-progress", this.chartParent));

        if (level) {
            const partialAmount = level % RankCalculator.LEVELS_PER_RANK;
            const fullQuantity = (level - partialAmount) / RankCalculator.LEVELS_PER_RANK;
            const partialPercentage = (partialAmount / RankCalculator.LEVELS_PER_RANK * 100) + "%";

            for (let i = 0; i < elts.length; i ++) {
                const elt = elts[i];
                if (i < fullQuantity) {
                    elt.style.width = "100%";
                } else if (i === fullQuantity) {
                    elt.style.width = partialPercentage;
                } else {
                    elt.style.width = "";
                }
            }
        } else {

            for (const elt of elts) {
                elt.style.width = "";
            }
        }
    }

    public constructRankChart() {
        const container = DomHandler.getElement(".rank-chart-container", this.chartParent);
        const levels = RankCalculator.getLevels();

        let currentRank;
        let currentRankMinimumLevel = 0;
        let currentRankMaximumLevel = 0;
        let currentRankMinimumPoints = 0;

        const levelPoints: Map<number, number> = new Map();

        const rankContainers: HTMLElement[] = [];

        for (let i = 1; i <= levels.length; i ++) {
            const level = levels[i - 1];
            if ("rank" in level) {
                if (currentRank) {
                    rankContainers.push(this.createRankContainer(currentRank, currentRankMinimumLevel, currentRankMaximumLevel, currentRankMinimumPoints, levelPoints));
                    levelPoints.clear();
                }

                currentRank = level.rank;
                currentRankMinimumLevel = i;
                currentRankMinimumPoints = level.points;

                if (i === levels.length) {
                    rankContainers.push(this.createRankContainer(currentRank, currentRankMinimumLevel, -1, currentRankMinimumPoints));
                }

            } else {
                currentRankMaximumLevel = i;
            }
            levelPoints.set(i, level.points);
        }

        fastdom.mutate(() => {
            for (const elt of rankContainers) {
                container.appendChild(elt);
            }
        });

        DomEventHandler.addListener(this, container, "wheel", (event: WheelEvent) => {
            container.scrollLeft += event.deltaY;
        }, {
            passive: true,
        });
    }

    private updateInfoElts(parentElt: HTMLElement, level?: number, points?: number) {
        const currentInfoElt = DomHandler.getElement(".rank-info-current", parentElt);
        const levelInfoElt = DomHandler.getElement(".rank-info-level", parentElt);
        const rankInfoElt = DomHandler.getElement(".rank-info-rank", parentElt);

        if (level && points) {
            currentInfoElt.textContent = "Current: " + points + " points";

            const levels = RankCalculator.getLevels();
            if (level < levels.length) {
                const nextLevelPoints = levels[level].points;
                const levelPointDiff = nextLevelPoints - points;
                levelInfoElt.textContent = "Next Level: " + nextLevelPoints + " points (+" + levelPointDiff + ")";
            } else {
                levelInfoElt.textContent = "Top level achieved!";
            }

            const nextRank = level - (level % RankCalculator.LEVELS_PER_RANK) + RankCalculator.LEVELS_PER_RANK + 1;
            if (nextRank < levels.length) {
                const nextRankPoints = levels[nextRank - 1].points;
                const rankPointDiff = nextRankPoints - points;
                rankInfoElt.textContent = "Next rank: " + nextRankPoints + " points (+" + rankPointDiff + ")";
            } else {
                rankInfoElt.textContent = "Top rank achieved!";
            }

            currentInfoElt.style.display = "block";
            levelInfoElt.style.display = "block";
            rankInfoElt.style.display = "block";

        } else {
            currentInfoElt.style.display = "";
            levelInfoElt.style.display = "";
            rankInfoElt.style.display = "";
        }
    }

    private createRankContainer(rank: string, minLevel: number, maxLevel: number, minPoints: number, levelPoints?: Map<number, number>) {
        const rankContainer = this.createElement("rank-container");

        const titleContainer = this.createElement("rank-chart-title-container");

        const title = this.createElement("rank-chart-title", rank);
        let levelSubtitle;
        if (levelPoints) {
            const subtitle = this.createElement("rank-chart-subtitle", "Levels: " + minLevel + "-" + maxLevel);
            const levels = [];
            for (const [level, points] of levelPoints) {
                levels.push(level + ": " + points + " points");
            }

            levelSubtitle = this.createTooltip(subtitle, levels);
        } else {
            levelSubtitle = this.createElement("rank-chart-subtitle", "Levels: " + minLevel + "+");
            levelSubtitle.style.display = "inline-block";
        }
        const pointsSubtitle = this.createElement("rank-chart-subtitle", "Points required: " + minPoints);

        titleContainer.appendChild(title);
        titleContainer.appendChild(levelSubtitle);
        titleContainer.appendChild(pointsSubtitle);

        const rewardContainer = this.createElement("rank-chart-reward-container");
        rewardContainer.appendChild(this.createElement("rank-chart-reward", "Rewards"));
        rewardContainer.appendChild(this.createElement("rank-chart-reward", "Coming"));
        rewardContainer.appendChild(this.createElement("rank-chart-reward", "Soon!"));

        // TODO: Add rewards to container

        rankContainer.appendChild(titleContainer);
        rankContainer.appendChild(rewardContainer);

        const progressElt = this.createElement("rank-chart-progress");
        const rankContainerParent = this.createElement("rank-container-parent");

        rankContainerParent.appendChild(progressElt);
        rankContainerParent.appendChild(rankContainer);

        return rankContainerParent;
    }

    private createElement(eltClass: string, text?: string) {
        const elt = document.createElement("div");
        if (eltClass) {
            elt.classList.add(eltClass);
        }

        if (text) {
            elt.textContent = text;
        }

        return elt;
    }

    private createTooltip(title: HTMLElement, content: string[]) {
        const tooltip = this.createElement("tooltip");
        tooltip.appendChild(title);
        const tooltipContent = this.createElement("tooltip-text");
        for (const str of content) {
            const elt = this.createElement("", str);
            tooltipContent.appendChild(elt);
        }
        tooltip.appendChild(tooltipContent);
        return tooltip;
    }
}
