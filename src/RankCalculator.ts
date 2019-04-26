import DomEventHandler from "./DomEventHandler";
import DomHandler from "./DomHandler";

export default class RankCalculator {

    private static readonly LEVELS_PER_RANK = 10;

    private static readonly RANKS = [
        "Recruit",
        "Private",
        "Corporal",
        "Sergeant",
        "Officer",
        "Lieutenant",
        "Commander",
        "Captain",
        "Major",
        "Colonel",
        "General",
    ];

    public static getData(points: number) {
        const level = Math.round(Math.pow(points, 1 / Math.E)) + 1;
        const rankIndex = Math.min(Math.floor(level / RankCalculator.LEVELS_PER_RANK), RankCalculator.RANKS.length - 1);

        const rank = RankCalculator.RANKS[rankIndex];
        return {
            level: "" + level,
            rank,
        };
    }

    public static updateProgress(level?: number, points?: number) {
        const parentElt = DomHandler.getElement(".rank-chart");

        RankCalculator.updateInfoElts(parentElt, level, points);

        const elts = Array.from(DomHandler.getElements(".rank-chart-progress", parentElt));

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

    public static constructRankChart() {
        const parentElt = DomHandler.getElement(".rank-chart");
        const container = DomHandler.getElement(".rank-chart-container", parentElt);
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
                    rankContainers.push(RankCalculator.createRankContainer(currentRank, currentRankMinimumLevel, currentRankMaximumLevel, currentRankMinimumPoints, levelPoints));
                    levelPoints.clear();
                }

                currentRank = level.rank;
                currentRankMinimumLevel = i;
                currentRankMinimumPoints = level.points;

                if (i === levels.length) {
                    rankContainers.push(RankCalculator.createRankContainer(currentRank, currentRankMinimumLevel, -1, currentRankMinimumPoints));
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
        });
    }

    private static updateInfoElts(parentElt: HTMLElement, level?: number, points?: number) {
        const levelInfoElt = DomHandler.getElement(".rank-info-level", parentElt);
        const rankInfoElt = DomHandler.getElement(".rank-info-rank", parentElt);

        if (level && points) {
            const levels = RankCalculator.getLevels();
            if (level < levels.length) {
                const nextLevel = levels[level];
                const levelPointDiff = nextLevel.points - points;
                levelInfoElt.textContent = "Points needed for next level: " + levelPointDiff;
            } else {
                levelInfoElt.textContent = "Top level achieved!";
            }

            const nextRank = level - (level % RankCalculator.LEVELS_PER_RANK) + RankCalculator.LEVELS_PER_RANK + 1;
            if (nextRank < levels.length) {
                const rankPointDiff = levels[nextRank - 1].points - points;
                rankInfoElt.textContent = "Points needed for next rank: " + rankPointDiff;
            } else {
                rankInfoElt.textContent = "Top rank achieved!";
            }

            levelInfoElt.style.display = "block";
            rankInfoElt.style.display = "block";

        } else {
            levelInfoElt.style.display = "";
            rankInfoElt.style.display = "";
        }
    }

    private static createRankContainer(rank: string, minLevel: number, maxLevel: number, minPoints: number, levelPoints?: Map<number, number>) {
        const rankContainer = RankCalculator.createElement("rank-container");

        const titleContainer = RankCalculator.createElement("rank-chart-title-container");

        const title = RankCalculator.createElement("rank-chart-title", rank);
        let levelSubtitle;
        if (levelPoints) {
            const subtitle = RankCalculator.createElement("rank-chart-subtitle", "Levels: " + minLevel + "-" + maxLevel);
            const levels = [];
            for (const [level, points] of levelPoints) {
                levels.push(level + ": " + points + " points");
            }

            levelSubtitle = RankCalculator.createTooltip(subtitle, levels);
        } else {
            levelSubtitle = RankCalculator.createElement("rank-chart-subtitle", "Levels: " + minLevel + "+");
            levelSubtitle.style.display = "inline-block";
        }
        const pointsSubtitle = RankCalculator.createElement("rank-chart-subtitle", "Points required: " + minPoints);

        titleContainer.appendChild(title);
        titleContainer.appendChild(levelSubtitle);
        titleContainer.appendChild(pointsSubtitle);

        const rewardContainer = RankCalculator.createElement("rank-chart-reward-container");
        const rewardCount = Math.floor(Math.random() * 3);
        for (let i = 0; i < rewardCount; i ++) {
            rewardContainer.appendChild(RankCalculator.createElement("rank-chart-reward", "Reward"));
        }
        // TODO: Add rewards to container

        rankContainer.appendChild(titleContainer);
        rankContainer.appendChild(rewardContainer);

        const progressElt = RankCalculator.createElement("rank-chart-progress");
        const rankContainerParent = RankCalculator.createElement("rank-container-parent");

        rankContainerParent.appendChild(progressElt);
        rankContainerParent.appendChild(rankContainer);

        return rankContainerParent;
    }

    private static createElement(eltClass: string, text?: string) {
        const elt = document.createElement("div");
        if (eltClass) {
            elt.classList.add(eltClass);
        }

        if (text) {
            elt.textContent = text;
        }

        return elt;
    }

    private static createTooltip(title: HTMLElement, content: string[]) {
        const tooltip = RankCalculator.createElement("tooltip");
        tooltip.appendChild(title);
        const tooltipContent = RankCalculator.createElement("tooltip-text");
        for (const str of content) {
            const elt = RankCalculator.createElement("", str);
            tooltipContent.appendChild(elt);
        }
        tooltip.appendChild(tooltipContent);
        return tooltip;
    }

    private static getLevels() {
        const levels = [];
        for (let i = 0; i <= 100; i ++) {
            const points = Math.round(Math.pow(i, Math.E));
            const data: any = {
                points,
            };
            if ( i % 10 === 0) {
                data.rank = RankCalculator.RANKS[i / 10];
            }
            levels.push(data);
        }
        return levels;
    }
}
