export default class Utils {

    public static copy(text: string) {
        document.addEventListener("copy", (event: ClipboardEvent) => {
            event.clipboardData!.setData("text/plain", text);
            event.preventDefault();
        }, {
            once: true,
        });

        document.execCommand("copy");
    }
}
