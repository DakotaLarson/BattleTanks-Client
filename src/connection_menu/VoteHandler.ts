import ChildComponent from "../component/ChildComponent";
import EventHandler from "../EventHandler";

export default class VoteHandler extends ChildComponent {

    constructor() {
        super();
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.VOTE_LIST_UPDATE, this.onVoteListUpdate);
        EventHandler.addListener(this, EventHandler.Event.VOTE_UPDATE, this.onVoteUpdate);
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.VOTE_LIST_UPDATE, this.onVoteListUpdate);
        EventHandler.removeListener(this, EventHandler.Event.VOTE_UPDATE, this.onVoteUpdate);
    }

    private onVoteListUpdate(voteList: any[]) {
        console.log(voteList);
    }

    private onVoteUpdate(event: any) {
        const voteIndex = event.voteIndex;
        const voteCount = event.voteCount;

        console.log(voteIndex, voteCount);
    }
}
