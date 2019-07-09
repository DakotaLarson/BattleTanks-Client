import DomHandler from "../DomHandler";
import DOMMutationHandler from "../DOMMutationHandler";

export default class Confirmation {
    private static parentElt = DomHandler.getElement(".confirmation-parent");
    private static titleElt = DomHandler.getElement(".confirmation-title", Confirmation.parentElt);
    private static confirmActionElt = DomHandler.getElement(".confirmation-action-confirm", Confirmation.parentElt);
    private static denyActionElt = DomHandler.getElement(".confirmation-action-deny", Confirmation.parentElt);

    public static confirm(title?: string): Promise<boolean> {

        Confirmation.titleElt.textContent = title || "Are you sure?";

        return new Promise((resolve) => {

            const onClick = (event: MouseEvent) => {
                if (event.target === Confirmation.confirmActionElt) {
                    resolve(true);
                    Confirmation.denyActionElt.removeEventListener("click", onClick);
                    DOMMutationHandler.hide(Confirmation.parentElt);
                } else if (event.target === Confirmation.denyActionElt) {
                    resolve(false);
                    Confirmation.confirmActionElt.removeEventListener("click", onClick);
                    DOMMutationHandler.hide(Confirmation.parentElt);
                }
            };

            Confirmation.confirmActionElt.addEventListener("click", onClick, {
                once: true,
            });
            Confirmation.denyActionElt.addEventListener("click", onClick, {
                once: true,
            });

            DOMMutationHandler.show(Confirmation.parentElt);

        });
    }
}
