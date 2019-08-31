import { create } from "domain";
import Component from "../../component/Component";
import DomHandler from "../../DomHandler";
import EventHandler from "../../EventHandler";
import Globals from "../../Globals";

export default class CurrencyStore extends Component {

    private static readonly DEV_CLIENT_ID =  "Aewej6sIM4EIrsQev3vgeZ2N8Cv7mJrJeQP0bF2YGkOcCHGPxmdQd2yCQy27QEYBpN-yGPJ823iYoG3w";
    private static readonly PROD_CLIENT_ID = "ATiu6GOho7fPRXu2yUjjSusga6_wtFuIJXh23E5dOVemkeABKS0QOBuTqtYBOqg3MMc5eRNMDzcKGaBS";

    private static readonly COINBASE_SCRIPT_SRC = "https://commerce.coinbase.com/v1/checkout.js?version=201807";
    // private static readonly PAYPAL_SCRIPT_SRC_BASE = "https://www.paypal.com/sdk/js?client-id=";
    private static readonly PAYPAL_SCRIPT_SRC = "https://www.paypalobjects.com/api/checkout.js";

    private static PAYPAL_CREATE_ENDPOINT = "https://na.battletanks.app/payment/create/paypal/";

    private containerElt: HTMLElement;
    private closeBtn: HTMLElement;

    private processorsByElements: Map<HTMLElement, any>;

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
                    this.createPaypalButton("0.99", playerId, container.id);
                } else if (container.id.endsWith("1500")) {
                    this.createPaypalButton("4.99", playerId, container.id);
                } else if (container.id.endsWith("6000")) {
                    this.createPaypalButton("13.99", playerId, container.id);
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

    private createPaypalButton(price: string, playerId: string, containerId: string) {
        // @ts-ignore
        const Paypal: any = window.paypal;

        Paypal.Button.render({
            env: location.hostname === "battletanks.app" ? "production" : "sandbox",
            client: {
                sandbox: CurrencyStore.DEV_CLIENT_ID,
                production: CurrencyStore.PROD_CLIENT_ID,
            },
            commit: true,
            style: {
                shape: "rect",
                label: "buynow",
                branding: true,
                tagline: false,
                height: 40,
            },
            payment: (data: any, actions: any) => {
                return actions.payment.create({
                    payment: {
                        transactions: [
                            {
                                amount: {
                                    total: price,
                                    currency: "USD",
                                },
                            },
                        ],
                    },
                    experience: {
                        input_fields: {
                            no_shipping: 1,
                        },
                    },
                });
            },
            onAuthorize: (data: any, actions: any) => {
                return actions.payment.get().then((createdPaymentDetails: any) => {
                    this.informServer(createdPaymentDetails.id, playerId).then((isInformed) => {
                        if (isInformed) {
                            actions.payment.execute().then((completedPaymentDetails: any) => {
                                console.log("Successful payment!");
                                // Alert player "You will be notified as soon as payment is processed";
                            });
                        } else {
                            console.error("Server not notified.");
                            // alert player
                        }
                    });
                });
            },
            onError: (err: any) => {
                console.error(err);
                // alert player;
            },
        }, "#" + containerId);

    }

    private loadScripts() {
        this.createScriptElt(CurrencyStore.COINBASE_SCRIPT_SRC);
        this.createScriptElt(CurrencyStore.PAYPAL_SCRIPT_SRC);

        // let paypalSrc;
        // if (location.hostname === "battletanks.app") {
        //     paypalSrc = CurrencyStore.PAYPAL_SCRIPT_SRC_BASE + CurrencyStore.PROD_CLIENT_ID;
        // } else {
        //     paypalSrc = CurrencyStore.PAYPAL_SCRIPT_SRC_BASE + CurrencyStore.DEV_CLIENT_ID;
        // }
        // this.createScriptElt(paypalSrc);
    }

    private createScriptElt(src: string) {
        const script = document.createElement("script");
        script.setAttribute("async", "");
        script.setAttribute("defer", "");

        script.setAttribute("src", src);
        document.body.appendChild(script);
    }

    private async informServer(paymentId: string, playerId: string): Promise<boolean> {
        try {
            if (!paymentId || !playerId) {
                return false;
            }
            const requestInit: RequestInit = {
                method: "post",
                mode: "cors",
                credentials: "omit",
                headers: {
                    "content-type": "application/json",
                },
                body: JSON.stringify({
                    paymentId,
                    playerId,
                }),
            };

            const response = await fetch(CurrencyStore.PAYPAL_CREATE_ENDPOINT, requestInit);
            return response.ok;
        } catch (err) {
            console.error(err);
            return false;
        }
    }
}
