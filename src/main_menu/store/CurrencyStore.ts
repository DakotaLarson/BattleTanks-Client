import Component from "../../component/Component";
import DomHandler from "../../DomHandler";
import EventHandler from "../../EventHandler";
import Globals from "../../Globals";
import MultiplayerConnection from "../../MultiplayerConnection";

export default class CurrencyStore extends Component {

    private static readonly DEV_CLIENT_ID =  "Aewej6sIM4EIrsQev3vgeZ2N8Cv7mJrJeQP0bF2YGkOcCHGPxmdQd2yCQy27QEYBpN-yGPJ823iYoG3w";
    private static readonly PROD_CLIENT_ID = "ATiu6GOho7fPRXu2yUjjSusga6_wtFuIJXh23E5dOVemkeABKS0QOBuTqtYBOqg3MMc5eRNMDzcKGaBS";

    private static readonly COINBASE_SCRIPT_SRC = "https://commerce.coinbase.com/v1/checkout.js?version=201807";
    private static readonly PAYPAL_SCRIPT_SRC = "https://www.paypalobjects.com/api/checkout.js";

    private static PROD_PAYPAL_CREATE_ENDPOINT = "https://na.battletanks.app/payment/create/paypal/";
    private static DEV_PAYPAL_CREATE_ENDPOINT = "https://na.battletanks.app/dev/payment/create/paypal/";

    private containerElt: HTMLElement;
    private closeBtn: HTMLElement;

    private paymentSuccessElt: HTMLElement;
    private paymentSuccessPaypalElt: HTMLElement;
    private paymentSuccessCrypoElt: HTMLElement;

    private processorsByElements: Map<HTMLElement, any>;

    private successVisible: boolean;

    constructor() {
        super();

        this.containerElt = DomHandler.getElement(".currency-store-container");
        this.closeBtn = DomHandler.getElement(".currency-store-close", this.containerElt);

        this.paymentSuccessElt = DomHandler.getElement(".payment-success");
        this.paymentSuccessPaypalElt = DomHandler.getElement(".payment-success-paypal", this.paymentSuccessElt);
        this.paymentSuccessCrypoElt = DomHandler.getElement(".payment-success-crypto", this.paymentSuccessElt);

        this.processorsByElements = new Map();

        this.successVisible = false;
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.CURRENCY_STORE_REQUEST, this.show);
        EventHandler.addListener(this, EventHandler.Event.SIGN_IN, this.onSignIn);
        EventHandler.addListener(this, EventHandler.Event.SIGN_OUT, this.onSignOut);

        this.loadScripts();
    }

    private onClick(event: MouseEvent) {
        if (this.successVisible) {
            this.hideSuccess();
        }
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
                const env = Globals.getGlobal(Globals.Global.IS_PROD) ? "prod" : "dev";
                cryptoElt.setAttribute("data-custom", playerId + ":" + env);
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

    private onCryptoSuccess(event: any) {
        console.log(event);
        this.updatePlayerCurrency(event.code);
    }

    private onCryptoProcessing(event: any) {
        console.log(event);
        this.showSuccess(false);
    }

    private onCryptoError(event: any) {
        console.error(event);
    }

    private showSuccess(showPaypal: boolean) {
        this.paymentSuccessElt.style.display = "block";
        if (showPaypal) {
            this.paymentSuccessPaypalElt.style.display = "block";
        } else {
            this.paymentSuccessCrypoElt.style.display = "block";
        }

        this.successVisible = true;
    }

    private hideSuccess() {
        this.paymentSuccessElt.style.display = "";
        this.paymentSuccessPaypalElt.style.display = "";
        this.paymentSuccessCrypoElt.style.display = "";

        this.successVisible = false;
    }

    private show() {
        this.containerElt.style.display = "block";
        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK_PRIMARY, this.onClick);
    }

    private hide() {
        this.containerElt.style.display = "";
        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK_PRIMARY, this.onClick);
    }

    private createPaypalButton(price: string, playerId: string, containerId: string) {
        // @ts-ignore
        const Paypal: any = window.paypal;

        Paypal.Button.render({
            env: Globals.getGlobal(Globals.Global.IS_PROD) ? "production" : "sandbox",
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
                            actions.payment.execute().then(() => {
                                console.log("Successful payment!");
                                this.showSuccess(true);
                                this.updatePlayerCurrency(createdPaymentDetails.id);
                            });
                        } else {
                            console.error("Server not notified.");
                            window.alert("Unable to notify BattleTanks of transaction. Please send an email to ");
                        }
                    });
                });
            },
            onError: (err: any) => {
                console.error(err);
                window.alert("Error reported by PayPal. Consider reporting this: " + err);
            },
        }, "#" + containerId);
    }

    private loadScripts() {
        this.createScriptElt(CurrencyStore.COINBASE_SCRIPT_SRC, () => {
            // @ts-ignore
            const BuyWithCrypto: any = window.BuyWithCrypto;

            BuyWithCrypto.registerCallback("onSuccess", this.onCryptoSuccess.bind(this));
            BuyWithCrypto.registerCallback("onFailure", this.onCryptoError.bind(this));
            BuyWithCrypto.registerCallback("onPaymentDetected", this.onCryptoProcessing.bind(this));
        });
        this.createScriptElt(CurrencyStore.PAYPAL_SCRIPT_SRC);
    }

    private createScriptElt(src: string, callback?: () => void) {
        const script = document.createElement("script");
        script.setAttribute("async", "");
        script.setAttribute("defer", "");

        script.setAttribute("src", src);

        if (callback) {
            script.onload = callback;
        }

        document.body.appendChild(script);
    }

    private updatePlayerCurrency(payment: string) {
        let isProcessed = false;
        const token = Globals.getGlobal(Globals.Global.AUTH_TOKEN);

        const payload = {
            token,
            payment,
        };

        const timerId = setInterval(async () => {
            if (isProcessed) {
                clearInterval(timerId);
            } else {
                const result = await MultiplayerConnection.fetchJson("/payment", payload);
                if (result.complete) {
                    EventHandler.callEvent(EventHandler.Event.PAYMENT_CURRENCY_UPDATE, result.currency);
                    isProcessed = true;
                    console.log("Payment procfessing confirmed.");
                }
            }
        }, 3000);
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

            let endpoint = CurrencyStore.DEV_PAYPAL_CREATE_ENDPOINT;
            if (Globals.getGlobal(Globals.Global.IS_PROD)) {
                endpoint = CurrencyStore.PROD_PAYPAL_CREATE_ENDPOINT;
            }

            const response = await fetch(endpoint, requestInit);
            return response.ok;
        } catch (err) {
            console.error(err);
            return false;
        }
    }
}
