import {chatStorageService} from "./interface_chat_storage"
import {TextData} from "./text_data"

export class ChatStorage implements chatStorageService{
    convDelimiter: string = "->"

    private helper_translateConversationID(userID: string, targetID: string): string {
        return userID+this.convDelimiter+targetID
    }

    private helper_translateConversationCounter(convID: string, counter: number): string {
        return convID + ":" + String(counter)
    }

    private initConversation(convID : string) : number{
        localStorage.setItem(convID, "0");
        return 0
    }

    private getConvCounter(convID: string) : number {
        return Number(localStorage.getItem(convID));
    }

    private updateConvCounter(convID : string, counter: number) {
        localStorage.setItem(convID, String(counter));
    }

    private getConvText(convID: string) : TextData {
        return new TextData("")
        // return Number(localStorage.getItem(convID));
    }

    private storeConvText(convID : string, counter: number, text: TextData) {
        // localStorage.setItem(convID, String(counter));
        localStorage.setItem(this.helper_translateConversationCounter(convID, counter), text.toString());
    }

    storeText(userID: string, targetID:string, text: TextData, socket: WebSocket) {
        let convID = this.helper_translateConversationID(userID, targetID)

        var counter = this.getConvCounter(convID)
        if (Number.isNaN(counter)) {
            counter = this.initConversation(convID)
        }

        counter = counter + 1
        this.updateConvCounter(convID, counter)

        this.storeConvText(convID, counter, text)
        // localStorage.setItem(convID + ":" + counter, text);

        console.log("text json", text.toJson(convID, userID, counter))
        socket.send(text.toJson(convID, userID, counter));
    }

    getText(convID:string, counter: number): TextData | null {
        let rst = null
        let rawData = localStorage.getItem(this.helper_translateConversationCounter(convID, counter));

        if (rawData != null) {
            rst = new TextData(rawData, true)
        }

        return rst
    }

    getPrevTexts(userID: string | null, targetID: string, count: number): TextData[] {
        if (userID == null) {
            return []
        }
        let convID = this.helper_translateConversationID(userID, targetID)

        let rst:TextData[] = []
        let convTextCount = this.getConvCounter(convID)
        while (count > 0 && convTextCount >= 0) {
            var text = this.getText(convID, convTextCount)
            if (text != null) {
                rst.push(text)
            }
            convTextCount -= 1
            count -= 1
        }
        return rst
    }

    removeText(index: string) {
        localStorage.removeItem(index);
    }

    removeAll() {
        localStorage.clear();
    }

}
