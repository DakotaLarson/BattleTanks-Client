import Component from '../Component';
import EventHandler from '../EventHandler';
import DomHandler from '../DomHandler';
import DomEventHandler from '../DomEventHandler';


export default class LoadWorldMenu extends Component{

    element: HTMLElement;
    loadElt: HTMLElement;
    cancelElt: HTMLElement;
    errorElt: HTMLElement;
    fileNameElt: HTMLElement;
    fileInputElt: HTMLInputElement;
    fileInputParentElt: HTMLElement;
    world: Object;

    constructor(mainMenu: HTMLElement){
        super();
        this.element = DomHandler.getElement('#sp-menu-load', mainMenu);
        this.loadElt = DomHandler.getElement('#load-opt-load', this.element);
        this.cancelElt = DomHandler.getElement('#load-opt-cancel', this.element);
        this.errorElt = DomHandler.getElement('#load-opt-error', this.element);
        this.fileNameElt = DomHandler.getElement('.menu-file-name', this.element);
        this.fileInputElt = DomHandler.getElement('#load-opt-file', this.element) as HTMLInputElement;
        this.fileInputParentElt = DomHandler.getElement('.menu-file-input', this.element);

        this.world = undefined;
    }

    enable(){
        DomEventHandler.addListener(this, this.loadElt, 'click', this.onLoadClick);
        DomEventHandler.addListener(this, this.cancelElt, 'click', this.onCancelClick);
        DomEventHandler.addListener(this, this.fileInputElt, 'change', this.onFileChange);

        this.element.style.display = 'block';
    }

    disable(){
        DomEventHandler.removeListener(this, this.loadElt, 'click', this.onLoadClick);
        DomEventHandler.removeListener(this, this.cancelElt, 'click', this.onCancelClick);
        DomEventHandler.removeListener(this, this.fileInputElt, 'change', this.onFileChange);

        this.errorElt.textContent = '';
        this.fileNameElt.textContent = '';

        this.world = undefined;

        this.element.style.display = 'none';
    }

    onLoadClick(){
        if(this.world){
            //call event
            EventHandler.callEvent(EventHandler.Event.LOADWORLDMENU_LOAD_OPT_CLICK, this.world);
        }else{
            this.errorElt.textContent = 'No File selected';
        }
    }

    onCancelClick(){
        EventHandler.callEvent(EventHandler.Event.LOADWORLDMENU_CANCEL_OPT_CLICK);
    }

    onFileChange(){
        let files = this.fileInputElt.files;
        if(files.length === 1){
            let file = files[0];
            this.parseFile(file).then(() => {
                this.fileNameElt.textContent = file.name;
            }).catch(() => {
                this.fileNameElt.textContent = '';
                this.world = undefined;
            });
        }else{
            this.fileNameElt.textContent = '';
        }
    }

    parseFile(file){
        return new Promise((resolve, reject) => {
            let fr = new FileReader();
            fr.onload = (event: ProgressEvent) => {
                // @ts-ignore can use fr.result, however, requires ArrayBuffer check.
                let parsedResult = event.target.result;
                let json = undefined;
                try{
                    json = JSON.parse(parsedResult);
                }catch(ex){
                    this.errorElt.textContent = 'Invalid or corrupt file';
                    reject();
                    return;
                }
                if(json.title && json.width && json.height && json.blockLocations && json.width > 0 && json.height > 0){
                     this.world = json;
                     resolve();
                }else{
                    this.errorElt.textContent = 'Invalid or corrupt file';
                    reject();
                }
            };
            fr.readAsText(file);
        });

    }
}
