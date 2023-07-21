export class TextData {
    receivedFromServer: boolean = false;
    text: string;
    timestamp: Number
    // convID: Number


    private delimiter: string = "|"

    constructor(rawText: string, fromStore = false, fromServer = false) {
        this.receivedFromServer = fromServer
        if (fromStore) {
            let parsedText = rawText.split("|", 3);

            if (parsedText[0] === "send") {
                this.receivedFromServer = true
            }
            this.timestamp = Number(parsedText[1])
            this.text = parsedText[2];
        } else {
            this.text = rawText
            // this.receivedFromServer = true
            this.timestamp = Date.now();
        }

    }

    toString(): string {
        if (this.receivedFromServer) {
            return "send" + this.delimiter + this.timestamp + this.delimiter + this.text
        } else {
            return "received" + this.delimiter + this.timestamp + this.delimiter + this.text
        }
    }

    toJson(convID: string, senderID: string, receipientID:string, counter: Number): string {
        return (JSON.stringify({
            type: "transmit",
            convID: convID,
            counter: counter,
            senderID: senderID,
            receipientID: receipientID,
            msgData: this.text
          })
        )
    }
}
