import ChildComponent from "../component/ChildComponent";
import DomHandler from "../DomHandler";
import DOMMutationHandler from "../DOMMutationHandler";
import EventHandler from "../EventHandler";
import PacketSender from "../PacketSender";

export default class VoteHandler extends ChildComponent {

    private static VOTING_OPTION_PREFIX = "voting-option-";

    private voteCountElts: HTMLElement[];

    private parentElt: HTMLElement;

    constructor(menuElt: HTMLElement) {
        super();
        this.parentElt = DomHandler.getElement(".voting-option-container", menuElt);
        this.voteCountElts = [];
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.VOTE_LIST_UPDATE, this.onVoteListUpdate);
        EventHandler.addListener(this, EventHandler.Event.VOTE_UPDATE, this.onVoteUpdate);
        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK, this.onClick);
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.VOTE_LIST_UPDATE, this.onVoteListUpdate);
        EventHandler.removeListener(this, EventHandler.Event.VOTE_UPDATE, this.onVoteUpdate);
        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK, this.onClick);
    }

    private onVoteListUpdate(voteList: any[]) {
        this.createVotingList(voteList);
    }

    private onVoteUpdate(voteCounts: number[]) {

        for (let i = 0; i < voteCounts.length; i++) {
            const voteCount = voteCounts[i];
            const voteCountElt = this.voteCountElts[i];

            voteCountElt.textContent = "Votes: " + voteCount;
        }
    }

    private onClick(event: MouseEvent) {
        const target = event.target as HTMLElement;
        if (target.id.startsWith(VoteHandler.VOTING_OPTION_PREFIX)) {
            const voteIndex = parseInt(target.id.substr(VoteHandler.VOTING_OPTION_PREFIX.length), 10);
            PacketSender.sendVote(voteIndex);
        }
    }

    private createVotingList(voteList: any[]) {
        DOMMutationHandler.clear(this.parentElt);
        this.voteCountElts = [];
        for (let i = 0; i < voteList.length; i++) {
            const elt = this.createVotingOption(voteList[i], i);
            DOMMutationHandler.add(elt, this.parentElt);
        }
    }

    private createVotingOption(option: any, index: number) {
        const title = option.title;
        const author = option.author;
        const voteCount = option.voteCount;

        const parentElt = DomHandler.createElement("div", ["voting-option"], undefined, VoteHandler.VOTING_OPTION_PREFIX + index);
        parentElt.style.backgroundImage = "url(./res/arena_images/Original.png)";

        const overlayElt = DomHandler.createElement("div", ["voting-option-overlay"]);

        const titleElt = DomHandler.createElement("span", ["voting-option-title"], title);
        const countElt = DomHandler.createElement("span", ["voting-option-count"], "Votes: " + voteCount);

        parentElt.appendChild(overlayElt);

        parentElt.appendChild(titleElt);

        if (author) {
            const authorElt = DomHandler.createElement("span", ["voting-option-author"], "Author: " + author);
            parentElt.appendChild(authorElt);

        }

        parentElt.appendChild(countElt);
        this.voteCountElts.push(countElt);

        return parentElt;
    }
}
