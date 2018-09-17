import EventHandler from './EventHandler';
import Component from './component/ChildComponent';

export default class GameStatusHandler extends Component{

    constructor(){
        super();
    }

    enable(){
        EventHandler.addListener(this, EventHandler.Event.GAME_STATUS_UPDATE, this.onGameStatusUpdate);
    }

    disable(){
        EventHandler.removeListener(this, EventHandler.Event.GAME_STATUS_UPDATE, this.onGameStatusUpdate);

    }

    onGameStatusUpdate(status: number){
        switch(status){
            case GameStatus.WAITING:
                console.log('Waiting GameStatus');
                EventHandler.callEvent(EventHandler.Event.GAME_STATUS_WAITING);
                break;
            case GameStatus.PREPARING:
                console.log('Preparing GameStatus');
                EventHandler.callEvent(EventHandler.Event.GAME_STATUS_PREPARING);
                break;
            case GameStatus.RUNNING:
                console.log('Running GameStatus');
                EventHandler.callEvent(EventHandler.Event.GAME_STATUS_RUNNING);
                break;
            case GameStatus.FINISHING:
                console.log('Finishing GameStatus');
                EventHandler.callEvent(EventHandler.Event.GAME_STATUS_FINISHING);
                break;
        }
    }
}

enum GameStatus{
    WAITING,
    PREPARING,
    RUNNING,
    FINISHING
};