import {chatStorageService} from "./interface_chat_storage"
import {TextData} from "./text_data"

export class ChatStorage implements chatStorageService{

    private helper_translateConversationCounter(convID: string, counter: number): string {
        return convID + ":" + String(counter)
    }

    private initConversation(convID : string) : number{
        localStorage.setItem(convID, "0");
        return 0
    }

    getConvCounter(convID: string) : number {
        return Number(localStorage.getItem(convID));
    }

    updateConvCounter(convID : string, counter: number) {
        localStorage.setItem(convID, String(counter));
    }

    // private getConvText(convID: string) : TextData {
    //     return 
    //     // return Number(localStorage.getItem(convID));
    // }


    private parseRawStorageData(rawData: string): TextData{
        let json = JSON.parse(rawData)

        return new TextData(json.senderId, json.recipientId, json.convID, json.counter, json.msgData, json.receivedFromServer)
    }


    storeText(text: TextData) {
        // let convID = this.helper_translateConversationID(userID, targetID)

        var counter = this.getConvCounter(text.convID)
        if (Number.isNaN(counter)) {
            counter = this.initConversation(text.convID)
        }

        counter = counter + 1
        this.updateConvCounter(text.convID, counter)

        localStorage.setItem(
            this.helper_translateConversationCounter(text.convID, text.counter),
            text.toJson());
    }

    getText(convID:string, counter: number): TextData | null {
        let msg = null
        let rawData = localStorage.getItem(this.helper_translateConversationCounter(convID, counter));

        if (rawData != null) {
            msg = this.parseRawStorageData(rawData)
        }

        return msg
    }

    getPrevTexts(convID: string, count: number): TextData[] {
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
