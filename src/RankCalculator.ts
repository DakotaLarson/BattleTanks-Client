export default class RankCalculator {

private static ranks = [
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

    public static getLevel(points: number) {
        const level = Math.floor(Math.pow(points, 1 / Math.E));
        const rank = RankCalculator.ranks[Math.floor(level / 10)];
        return {
            level,
            rank,
        };
    }

    public static getLevels() {
        const levels = [];
        for (let i = 0; i <= 100; i ++) {
            const pts = Math.round(Math.pow(i, Math.E));
            levels.push(pts);
        }
        return levels;
    }
}
