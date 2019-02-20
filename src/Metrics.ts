import Component from "./component/Component";

export default class Metrics extends Component {

    constructor() {
        super();
    }

    public enable() {
        // do something
    }

    private getOS() {
        let os;
        if (navigator.appVersion.indexOf("Win") !== -1) {
            os = "Windows";
        } else if (navigator.appVersion.indexOf("Mac") !== -1) {
            os = "MacOS";
        } else if (navigator.appVersion.indexOf("X11") !== -1) {
            os = "UNIX";
        } else if (navigator.appVersion.indexOf("Linux") !== -1) {
            os = "Linux";
        } else {
            os = "Other";
        }
    }

    private getBrowser() {
        // const nAgt = navigator.userAgent;
        // let browserName  = navigator.appName;
        // let fullVersion  = "" + parseFloat(navigator.appVersion);
        // let majorVersion = parseInt(navigator.appVersion, 10);
        // let nameOffset;
        // let verOffset;
        // let ix;

        // // In Opera 15+, the true version is after "OPR/"
        // if (verOffset = nAgt.indexOf("OPR/")) { !== -1; }) {
        // browserName = "Opera";
        // fullVersion = nAgt.substring(verOffset + 4);
        // }
        // // In older Opera, the true version is after "Opera" or after "Version"
        // else if ((verOffset = nAgt.indexOf("Opera")) !== -1) {
        // browserName = "Opera";
        // fullVersion = nAgt.substring(verOffset + 6);
        // if ((verOffset = nAgt.indexOf("Version")) !== -1) {
        // fullVersion = nAgt.substring(verOffset + 8);
        // }
        // } else if ((verOffset = nAgt.indexOf("MSIE")) !== -1) {
        // browserName = "Microsoft Internet Explorer";
        // fullVersion = nAgt.substring(verOffset + 5);
        // } else if ((verOffset = nAgt.indexOf("Chrome")) !== -1) {
        // browserName = "Chrome";
        // fullVersion = nAgt.substring(verOffset + 7);
        // } else if ((verOffset = nAgt.indexOf("Safari")) !== -1) {
        // browserName = "Safari";
        // fullVersion = nAgt.substring(verOffset + 7);
        // if ((verOffset = nAgt.indexOf("Version")) !== -1) {
        // fullVersion = nAgt.substring(verOffset + 8);
        // }
        // } else if ((verOffset = nAgt.indexOf("Firefox")) !== -1) {
        // browserName = "Firefox";
        // fullVersion = nAgt.substring(verOffset + 8);
        // } else if ( (nameOffset = nAgt.lastIndexOf(" ") + 1) <
        //         (verOffset = nAgt.lastIndexOf("/")) ) {
        // browserName = nAgt.substring(nameOffset, verOffset);
        // fullVersion = nAgt.substring(verOffset + 1);
        // if (browserName.toLowerCase() === browserName.toUpperCase()) {
        // browserName = navigator.appName;
        // }
        // }
        // // trim the fullVersion string at semicolon/space if present
        // if ((ix = fullVersion.indexOf(";")) !== -1) {
        // fullVersion = fullVersion.substring(0, ix);
        // }
        // if ((ix = fullVersion.indexOf(" ")) !== -1) {
        // fullVersion = fullVersion.substring(0, ix);
        // }

        // majorVersion = parseInt("" + fullVersion, 10);
        // if (isNaN(majorVersion)) {
        // fullVersion  = "" + parseFloat(navigator.appVersion);
        // majorVersion = parseInt(navigator.appVersion, 10);
        // }

        // document.write(""
        // + "Browser name  = " + browserName + "<br>"
        // + "Full version  = " + fullVersion + "<br>"
        // + "Major version = " + majorVersion + "<br>"
        // + "navigator.appName = " + navigator.appName + "<br>"
        // + "navigator.userAgent = " + navigator.userAgent + "<br>",
        // );
    }

}
