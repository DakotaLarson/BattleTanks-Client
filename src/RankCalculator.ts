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

    private static readonly SHORT_RANKS: Map<string, string> = new Map([
        ["Recruit", "RCT"],
        ["Private", "PVT"],
        ["Corporal", "CPL"],
        ["Sergeant", "SGT"],
        ["Officer", "OFR"],
        ["Lieutenant", "LUT"],
        ["Commander", "CMD"],
        ["Captain", "CPT"],
        ["Major", "MAJ"],
        ["Colonel", "CNL"],
        ["General", "GEN"],

    ]);

    private static readonly RANK_COLORS: Map<string, string> = new Map([
        ["Recruit", "#ffffff"],
        ["Private", "#00ff80"],
        ["Corporal", "#ffff00"],
        ["Sergeant", "#00ffff"],
        ["Officer", "#ff8000"],
        ["Lieutenant", "#80ff00"],
        ["Commander", "#804000"],
        ["Captain", "#ff0080"],
        ["Major", "#0080ff"],
        ["Colonel", "#ff00ff"],
        ["General", "#8000ff"],

    ]);

    public static getData(points: number) {
        const level = Math.max(Math.ceil(Math.pow(points, 1 / Math.E)), 1);
        const rankIndex = Math.min(Math.floor((level - 1) / RankCalculator.LEVELS_PER_RANK), RankCalculator.RANKS.length - 1);

        const rank = RankCalculator.RANKS[rankIndex];
        return {
            level: "" + level,
            rank,
        };
    }

    public static getLevels() {
        const levels = [];
        for (let i = 0; i <= 100; i ++) {
            const points = Math.ceil(Math.pow(i, Math.E));
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

    public static getShortRank(rank: string) {
        return RankCalculator.SHORT_RANKS.get(rank);
    }

    public static getRankColor(rank: string) {
        return RankCalculator.RANK_COLORS.get(rank);
    }
}
