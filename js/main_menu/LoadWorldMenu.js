import Component from 'Component';
import EventHandler from 'EventHandler';
import DomHandler from 'DomHandler';


export default class LoadWorldMenu extends Component{

    constructor(mainMenu){
        super();
        this.element = DomHandler.getElement('#sp-menu-load', mainMenu);
        this.loadElt = DomHandler.getElement('#load-opt-load', this.element);
        this.cancelElt = DomHandler.getElement('#load-opt-cancel', this.element);
        this.errorElt = DomHandler.getElement('#load-opt-error', this.element);
        this.fileNameElt = DomHandler.getElement('.menu-file-name', this.element);
        this.fileInputElt = DomHandler.getElement('#load-opt-file', this.element);
        this.fileInputParentElt = DomHandler.getElement('.menu-file-input', this.element);

        this.world = undefined;
    }

    enable = () => {
        this.loadElt.addEventListener('click', this.onLoadClick);
        this.cancelElt.addEventListener('click', this.onCancelClick);
        this.fileInputElt.addEventListener('change', this.onFileChange);

        this.element.style.display = 'block';
    };

    disable = () => {
        this.loadElt.removeEventListener('click', this.onLoadClick);
        this.cancelElt.removeEventListener('click', this.onCancelClick);
        this.fileInputElt.removeEventListener('change', this.onFileChange);

        this.errorElt.textContent = '';
        this.fileNameElt.textContent = '';

        this.world = undefined;

        this.element.style.display = 'none';
    };

    onLoadClick = () => {
        if(this.world){
            //call event
            EventHandler.callEvent(EventHandler.Event.LOADWORLDMENU_LOAD_OPT_CLICK, this.world);
        }else{
            this.errorElt.textContent = 'No File selected';
        }
    };

    onCancelClick = () => {
        EventHandler.callEvent(EventHandler.Event.LOADWORLDMENU_CANCEL_OPT_CLICK);
    };

    onFileChange = () => {
        let files = this.fileInputElt.files;
        if(files.length === 1){
            let file = files[0];
            this.parseFile(file).then((result) => {
                if(result){
                    this.fileNameElt.textContent = file.name;
                }else{
                    this.fileNameElt.textContent = '';
                    this.world = undefined;
                }
            });
        }else{
            this.fileNameElt.textContent = '';
        }
    };

    parseFile = (file) => {
        return new Promise((resolve) => {
            let fr = new FileReader();
            fr.onload = (event) => {
                let parsedResult = event.target.result;
                let json = undefined;
                try{
                    json = JSON.parse(parsedResult);
                }catch(ex){
                    this.errorElt.textContent = 'Invalid or corrupt file';
                    resolve(false);
                    return;
                }
                if(json.title && json.width && json.height && json.blockLocations && json.width > 0 && json.height > 0){
                     this.world = json;
                     resolve(true);
                }else{
                    resolve(false);
                }
            };
            fr.readAsText(file);
        });

    };
}
