import Component from "./component/ChildComponent";
import EventHandler from "./EventHandler";

export default class GameStatusHandler extends Component {

    constructor() {
        super();
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.GAME_STATUS_UPDATE, this.onGameStatusUpdate);
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.GAME_STATUS_UPDATE, this.onGameStatusUpdate);

    }

    public onGameStatusUpdate(status: number) {
        switch (status) {
            case GameStatus.WAITING:
                EventHandler.callEvent(EventHandler.Event.GAME_STATUS_WAITING);
                break;
            case GameStatus.STARTING:
                EventHandler.callEvent(EventHandler.Event.GAME_STATUS_STARTING);
                break;
            case GameStatus.RUNNING:
                EventHandler.callEvent(EventHandler.Event.GAME_STATUS_RUNNING);
                EventHandler.callEvent(EventHandler.Event.BACKGROUND_AUDIO_LIVE);
                break;
        }
    }
}

enum GameStatus {
    WAITING,
    STARTING,
    RUNNING,
}
