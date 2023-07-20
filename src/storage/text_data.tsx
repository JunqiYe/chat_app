export class TextData {
    send: boolean = false;
    text: string;
    timestamp: Number
    // convID: Number


    private delimiter: string = "|"

    constructor(rawText: string, fromStore = false) {
        if (fromStore) {
            let parsedText = rawText.split("|", 3);

            if (parsedText[0] === "send") {
                this.send = true
            }
            this.timestamp = Number(parsedText[1])
            this.text = parsedText[2];
        } else {
            this.text = rawText
            // this.send = true
            this.timestamp = Date.now();
        }

    }

    toString(): string {
        if (this.send) {
            return "send" + this.delimiter + this.timestamp + this.delimiter + this.text
        } else {
            return "received" + this.delimiter + this.timestamp + this.delimiter + this.text
        }
    }

    toJson(convID: string, senderID: string, counter: Number): string {
        return (JSON.stringify({
            type: "transmit",
            ConvID: convID,
            Counter: counter,
            SenderID: senderID,
            MsgData: this.text
          })
        )
    }
}
