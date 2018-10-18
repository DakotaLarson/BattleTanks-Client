import EventHandler from "./EventHandler";

const gameCanvas = document.querySelector("#game-canvas") as HTMLElement;

export default class DomHandler {
    public static getDisplayDimensions() {
        return displayDimensions;
    }

    public static requestPointerLock() {
        if (gameCanvas) {
            gameCanvas.requestPointerLock();
        } else {
            document.body.requestPointerLock();
        }
    }

    public static exitPointerLock() {
        nextPointerLockExitInvoked = true;
        document.exitPointerLock();
    }

    public static hasPointerLock() {
        return document.pointerLockElement !== null;
    }

    public static getElement(query: string, parent?: HTMLElement): HTMLElement {
        let elt: HTMLElement;

        if (parent) {
            elt = parent.querySelector(query) as HTMLElement;
        } else {
            elt = document.querySelector(query) as HTMLElement;
        }
        return elt;
    }
    public static getElements(query: string, parent?: HTMLElement): NodeListOf<HTMLElement> {
        if (parent) {
            return parent.querySelectorAll(query);
        } else {
            return document.querySelectorAll(query);
        }
    }

    public static getMouseCoordinates() {
        return mousePosition;
    }
}

let nextPointerLockExitInvoked = false;

const displayDimensions = {
    width: window.innerWidth,
    height: window.innerHeight,
};

const mousePosition = {
    x: 0,
    y: 0,
};

const eventTitles = new Map([
    ["resize", EventHandler.Event.DOM_RESIZE],
    ["mousemove", EventHandler.Event.DOM_MOUSEMOVE],
    ["click", EventHandler.Event.DOM_CLICK],
    ["keydown", EventHandler.Event.DOM_KEYDOWN],
    ["keyup", EventHandler.Event.DOM_KEYUP],
    ["mousedown", EventHandler.Event.DOM_MOUSEDOWN],
    ["mouseup", EventHandler.Event.DOM_MOUSEUP],
    ["pointerlockerror", EventHandler.Event.DOM_POINTERLOCKERROR],
    ["blur", EventHandler.Event.DOM_BLUR],
    ["focus", EventHandler.Event.DOM_FOCUS],
    ["wheel", EventHandler.Event.DOM_WHEEL],
    ["contextmenu", EventHandler.Event.DOM_CONTEXTMENU],
]);

const windowEventTitles = ["resize", "blur", "focus", "click"];

const iterator = eventTitles.entries();
let next = iterator.next();

while (!next.done) {
    const eventTitle = next.value[0];
    const eventHandlerEvent = next.value[1];

    if (windowEventTitles.indexOf(eventTitle) > -1) {
        window.addEventListener(eventTitle, (event) => {
            EventHandler.callEvent(eventHandlerEvent, event);
        });
    } else {
        document.addEventListener(eventTitle, (event) => {
            EventHandler.callEvent(eventHandlerEvent, event);
        });
    }
    next = iterator.next();
}

document.addEventListener("pointerlockchange", () => {
    if (DomHandler.hasPointerLock()) {
        EventHandler.callEvent(EventHandler.Event.DOM_POINTERLOCK_ENABLE);
    } else {
        if (nextPointerLockExitInvoked) {
            EventHandler.callEvent(EventHandler.Event.DOM_POINTERLOCK_DISABLE_INVOKED);
            nextPointerLockExitInvoked = false;
        } else {
            EventHandler.callEvent(EventHandler.Event.DOM_POINTERLOCK_DISABLE);
        }
    }
});

EventHandler.addListener(undefined, EventHandler.Event.DOM_RESIZE, () => {
    displayDimensions.width = window.innerWidth;
    displayDimensions.height = window.innerHeight;
}, EventHandler.Level.LOW);

EventHandler.addListener(undefined, EventHandler.Event.DOM_MOUSEMOVE, (event) => {
    mousePosition.x = event.clientX;
    mousePosition.y = event.clientY;
});

const stopDefaultActions = () => {
    document.oncontextmenu = () => false;
    // document.addListener(this, 'keydown', (event) => {
    //     event.preventDefault();
    // });
};
stopDefaultActions();
