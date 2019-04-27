export default class RankCalculator {

    public static readonly LEVELS_PER_RANK = 10;

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
        const level = Math.round(Math.pow(points, 1 / Math.E));
        const rankIndex = Math.min(Math.floor(level / RankCalculator.LEVELS_PER_RANK), RankCalculator.RANKS.length - 1);

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
}
