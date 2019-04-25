import DomHandler from "./DomHandler";

export default class RankCalculator {

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
        const level = Math.floor(Math.pow(points, 1 / Math.E));
        const rankIndex = Math.min(Math.floor(level / 10), RankCalculator.RANKS.length - 1);

        const rank = RankCalculator.RANKS[rankIndex];
        return {
            level: "" + level,
            rank,
        };
    }

    public static getLevels() {
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

    public static constructRankChart() {
        const parentElt = DomHandler.getElement(".rank-chart");
        const progressBar = DomHandler.getElement(".rank-chart-progress", parentElt);
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
                console.log(levelPoints);

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

        return rankContainer;
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
}
/*
<div class="rank-container">
    <div class="rank-chart-title-container">
        <div class="rank-chart-title">Private</div>

        <div class="rank-chart-subtitle">Levels: 1-10</div>
        <div class="rank-chart-subtitle">Points required: 0</div>

    </div>
    <div class="rank-chart-reward-container">
        <span class="rank-chart-reward">Reward 1</span>
    </div>
</div>
*/
