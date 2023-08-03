export class TextData {
    readonly userID: string
    readonly recipientID: string
    readonly convID: string
    readonly counter: number
    readonly timestamp: number
    readonly receivedFromServer: boolean = false;
    readonly text: string;

    readonly delimiter: string = "|"


    constructor(userID: string,
                recipientID: string,
                convID: string,
                counter: number,
                rawText: string,
                fromServer?:boolean,
                timestamp?: number) {

        this.userID = userID
        this.recipientID = recipientID
        this.convID = convID
        this.counter = counter

        if (fromServer) {
            this.receivedFromServer = fromServer
        }

        if (timestamp == undefined) {
            this.timestamp = Date.now();
        } else {
            this.timestamp = timestamp
        }

        this.text = rawText
    }

    toJson(): string {
        return (JSON.stringify({
            type: "transmit",
            convID: this.convID,
            counter: this.counter,
            senderID: this.userID,
            recipientID: this.recipientID,
            msgData: this.text,
            receivedFromServer: this.receivedFromServer,
            timestamp: this.timestamp
          })
        )
    }

}
