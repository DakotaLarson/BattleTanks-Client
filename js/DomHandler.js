import EventHandler from 'EventHandler';

export default class DomHandler{
    static getDisplayDimensions = () =>{
        return displayDimensions;
    };

    static requestPointerLock = () => {
        document.body.requestPointerLock();
    };

    static exitPointerLock = () => {
        nextPointerLockExitInvoked = true;
        document.exitPointerLock();
    };

    static hasPointerLock = () => {
        return document.pointerLockElement !== null;
    };

    static getElement = (query, parent) => {
        if(parent){
            return parent.querySelector(query);
        }else{
            return document.querySelector(query);
        }
    };

    static getMouseCoordinates = () => {
        return mousePosition;
    }
}

let nextPointerLockExitInvoked = false;

const displayDimensions = {
    width: window.innerWidth,
    height: window.innerHeight
};
const mousePosition = {
    x: 0,
    y: 0
};
const eventTitles = {
    'resize': EventHandler.Event.DOM_RESIZE,
    'mousemove': EventHandler.Event.DOM_MOUSEMOVE,
    'click': EventHandler.Event.DOM_CLICK,
    'keydown': EventHandler.Event.DOM_KEYDOWN,
    'keyup': EventHandler.Event.DOM_KEYUP,
    'mousedown': EventHandler.Event.DOM_MOUSEDOWN,
    'mouseup': EventHandler.Event.DOM_MOUSEUP,
    'pointerlockerror': EventHandler.Event.DOM_POINTERLOCKERROR,
    'blur': EventHandler.Event.DOM_BLUR,
    'focus': EventHandler.Event.DOM_FOCUS,
    'wheel': EventHandler.Event.DOM_WHEEL,
    'contextmenu': EventHandler.Event.DOM_CONTEXTMENU,
};
const windowEventTitles = ['resize', 'blur', 'focus', 'click'];


let keys = Object.keys(eventTitles);
for(let i = 0; i < keys.length; i ++){
    let eventTitle = keys[i];
    let eventHandlerEvent = eventTitles[eventTitle];
    if(windowEventTitles.indexOf(eventTitle) > -1){
        window.addEventListener(eventTitle, (event) => {
            EventHandler.callEvent(eventHandlerEvent, event);
        });
    }else{
        document.addEventListener(eventTitle, (event) => {
            EventHandler.callEvent(eventHandlerEvent, event);
        });
    }
}
document.addEventListener('pointerlockchange', () => {
    if(DomHandler.hasPointerLock()){
        EventHandler.callEvent(EventHandler.Event.DOM_POINTERLOCK_ENABLE);
    }else{
        if(nextPointerLockExitInvoked){
            EventHandler.callEvent(EventHandler.Event.DOM_POINTERLOCK_DISABLE_INVOKED);
            nextPointerLockExitInvoked = false;
        }else{
            EventHandler.callEvent(EventHandler.Event.DOM_POINTERLOCK_DISABLE);
        }
    }
});

EventHandler.addListener(EventHandler.Event.DOM_RESIZE, () => {
    displayDimensions.width = window.innerWidth;
    displayDimensions.height = window.innerHeight;
});

EventHandler.addListener(EventHandler.Event.DOM_MOUSEMOVE, (event) => {
    mousePosition.x = event.clientX;
    mousePosition.y = event.clientY;
});

const stopDefaultActions = () => {
    document.oncontextmenu = () => { return false };
    // document.addListener('keydown', (event) => {
    //     event.preventDefault();
    // });
};
stopDefaultActions();
