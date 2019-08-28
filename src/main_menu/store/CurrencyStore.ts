import Component from "../../component/Component";
import DomHandler from "../../DomHandler";
import EventHandler from "../../EventHandler";
import Globals from "../../Globals";

export default class CurrencyStore extends Component {

    private static readonly DEV_CLIENT_ID =  "Aewej6sIM4EIrsQev3vgeZ2N8Cv7mJrJeQP0bF2YGkOcCHGPxmdQd2yCQy27QEYBpN-yGPJ823iYoG3w";
    private static readonly PROD_CLIENT_ID = "ATiu6GOho7fPRXu2yUjjSusga6_wtFuIJXh23E5dOVemkeABKS0QOBuTqtYBOqg3MMc5eRNMDzcKGaBS";

    private static readonly COINBASE_SCRIPT_SRC = "https://commerce.coinbase.com/v1/checkout.js?version=201807";
    private static readonly PAYPAL_SCRIPT_SRC_BASE = "https://www.paypal.com/sdk/js?client-id=";

    private containerElt: HTMLElement;
    private closeBtn: HTMLElement;

    private processorsByElements: Map<HTMLElement, any>;

    private playerId: string | undefined;

    constructor() {
        super();

        this.containerElt = DomHandler.getElement(".currency-store-container");
        this.closeBtn = DomHandler.getElement(".currency-store-close", this.containerElt);

        this.processorsByElements = new Map();
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.CURRENCY_STORE_REQUEST, this.show);
        EventHandler.addListener(this, EventHandler.Event.SIGN_IN, this.onSignIn);
        EventHandler.addListener(this, EventHandler.Event.SIGN_OUT, this.onSignOut);

        this.loadScripts();
    }

    private onClick(event: MouseEvent) {
        if (event.target === this.closeBtn || event.target === this.containerElt) {
            this.hide();
        }
    }

    private onSignIn() {
        const playerId = Globals.getGlobal(Globals.Global.PLAYER_ID);
        if (playerId) {
            const paypalButtonContainers = Array.from(DomHandler.getElements(".buy-with-paypal"));
            for (const container of paypalButtonContainers) {
                if (container.id.endsWith("250")) {
                    this.createPaypalButton("0.99", "250", playerId, container.id);
                } else if (container.id.endsWith("1500")) {
                    this.createPaypalButton("4.99", "1500", playerId, container.id);
                } else if (container.id.endsWith("6000")) {
                    this.createPaypalButton("14.99", "6000", playerId, container.id);
                }
            }

            // @ts-ignore
            const BuyWithCrypto: any = window.BuyWithCrypto;

            const cryptoElts = Array.from(DomHandler.getElements(".buy-with-crypto", this.containerElt));
            for (const cryptoElt of cryptoElts) {
                if (cryptoElt.id.endsWith("250")) {
                    cryptoElt.setAttribute("data-custom", "{playerId:" + playerId + ",quantity:250}");
                } else if (cryptoElt.id.endsWith("1500")) {
                    cryptoElt.setAttribute("data-custom", "{playerId:" + playerId + ",quantity:1500}");
                } else if (cryptoElt.id.endsWith("6000")) {
                    cryptoElt.setAttribute("data-custom", "{playerId:" + playerId + ",quantity:6000}");
                } else {
                    console.log("Unknown element.");
                    continue;
                }
                const processor = new BuyWithCrypto();
                processor.install(cryptoElt);
                this.processorsByElements.set(cryptoElt, processor);
            }
        }
    }

    private onSignOut() {
        const paypalButtonContainers = Array.from(DomHandler.getElements(".buy-with-paypal"));
        for (const container of paypalButtonContainers) {
            while (container.firstChild) {
                container.removeChild(container.firstChild);
            }
        }

        const cryptoElts = Array.from(DomHandler.getElements(".buy-with-crypto", this.containerElt));
        for (const cryptoElt of cryptoElts) {
            const processor = this.processorsByElements.get(cryptoElt);
            if (processor) {
                processor.uninstall(cryptoElt);
            }
        }
    }

    private show() {
        this.containerElt.style.display = "block";
        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK_PRIMARY, this.onClick);
    }

    private hide() {
        this.containerElt.style.display = "";
    }

    private loadScripts() {
        this.createScriptElt(CurrencyStore.COINBASE_SCRIPT_SRC);

        let paypalSrc;
        if (location.hostname === "battletanks.app") {
            paypalSrc = CurrencyStore.PAYPAL_SCRIPT_SRC_BASE + CurrencyStore.DEV_CLIENT_ID;
        } else {
            paypalSrc = CurrencyStore.PAYPAL_SCRIPT_SRC_BASE + CurrencyStore.PROD_CLIENT_ID;
        }
        this.createScriptElt(paypalSrc);
    }

    private createPaypalButton(price: string, quantity: string, playerId: string, containerId: string) {
        // @ts-ignore
        const Paypal: any = window.paypal;

        Paypal.Buttons({
            style: {
                layout: "horizontal",
                tagline: false,
                height: 40,
            },
            createOrder: (data: any, actions: any) => {
                console.log(data, actions);
                return actions.order.create({
                    purchase_units: [
                        {
                            amount: {
                                value: price,
                            },
                        },
                    ],
                    metadata: [
                        {
                            name: "playerId",
                            value: playerId,
                        },
                        {
                            name: "quantity",
                            value: quantity,
                        },

                    ],
                });
            },
        }).render("#" + containerId);
    }

    private createScriptElt(src: string) {
        const script = document.createElement("script");
        script.setAttribute("async", "");
        script.setAttribute("defer", "");

        script.setAttribute("src", src);
        document.body.appendChild(script);
    }
}
