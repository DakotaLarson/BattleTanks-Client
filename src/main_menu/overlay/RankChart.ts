import DomEventHandler from "../../DomEventHandler";
import DomHandler from "../../DomHandler";
import RankCalculator from "../../RankCalculator";
import Overlay from "./Overlay";

export default class RankChart extends Overlay {

    private static readonly REWARDS_BY_RANK: Map<string, string[]> = new Map([
        ["Recruit", [
            "Lvl 0: BeefChief",
            "Lvl 6: Snowplow",
        ]],
        ["Private", [
            "Lvl 11: Dunebug",
            "Lvl 16: Lightning",
        ]],
        ["Corporal", [
            "Lvl 21: Jarhead",
            "Lvl 26: Tankette",
        ]],
        ["Sergeant", [
            "Lvl 31: Bullseye",
            "Lvl 36: Challenger",
        ]],
        ["Officer", [
            "Lvl 41: Schnoz",
            "Lvl 46: Hornet",
        ]],
        ["Lieutenant", [
            "Lvl 51: Centurion",
            "Lvl 56: Ogimatok",
        ]],
        ["Commander", [
            "Rewards",
            "Coming Soon!",
        ]],
        ["Captain", [
            "Rewards",
            "Coming Soon!",
        ]],
        ["Major", [
            "Rewards",
            "Coming Soon!",
        ]],
        ["Colonel", [
            "Rewards",
            "Coming Soon!",
        ]],
        ["General", [
            "Rewards",
            "Coming Soon!",
        ]],
    ]);

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

        for (const elt of rankContainers) {
            container.appendChild(elt);
        }

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
            currentInfoElt.textContent = "Current: " + points + " points (Level " + level + ")";

            const levels = RankCalculator.getLevels();
            if (level < levels.length) {
                const nextLevelPoints = levels[level].points;
                const levelPointDiff = nextLevelPoints - points;
                levelInfoElt.textContent = "Next Level: " + nextLevelPoints + " points (+" + levelPointDiff + ")";
            } else {
                levelInfoElt.textContent = "Top level achieved!";
            }

            const nextRankLevel = level - (level % RankCalculator.LEVELS_PER_RANK || RankCalculator.LEVELS_PER_RANK) + RankCalculator.LEVELS_PER_RANK + 1;
            if (nextRankLevel < levels.length) {
                const nextRankPoints = levels[nextRankLevel - 1].points;
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
        const titleColor = RankCalculator.getRankColor(rank);
        title.style.color = titleColor!;

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

        const rewards = RankChart.REWARDS_BY_RANK.get(rank);
        if (rewards) {
            for (const reward of rewards) {
                rewardContainer.appendChild(this.createElement("rank-chart-reward", reward));
            }
        }

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
        title.classList.add("tooltip-title");
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
