export class TextData {
    send: boolean = false;
    text: string;

    private delimiter: string = "|"

    constructor(rawText: string, fromStore = false) {
        if (fromStore) {
            let parsedText = rawText.split("|", 2);

            if (parsedText[0] === "send") {
                this.send = true;
            }
            this.text = parsedText[1];
        } else {
            this.text = rawText
            // this.send = true
        }
    }

    toString(): string {
        if (this.send) {
            return "send" + this.delimiter + this.text
        } else {
            return "received" + this.delimiter + this.text
        }
    }
}
