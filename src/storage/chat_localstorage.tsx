import {chatStorageService} from "./interface_chat_storage"

export class ChatStorage implements chatStorageService{

    initUser(userID: string) : string{
        localStorage.setItem(userID, "0");
        return "0"
    }

    getUserTextCounter(userID: string) : number {
        return Number(localStorage.getItem(userID));
    }

    updateUserTextCounter(userID: string, counter: string) {
        localStorage.setItem(userID, counter);
    }

    storeText(userID: string, text: string) {
        var counter = localStorage.getItem(userID)
        if (counter == null) {
            counter = this.initUser(userID)
        }

        counter = String(+counter + 1)
        this.updateUserTextCounter(userID, counter)
        localStorage.setItem(userID + ":" + counter, text);
    }

    getText(userID:string, index: string): string | null {
        return localStorage.getItem(userID + ":" + index);
    }

    getPrevTexts(userID: string, count: number): string[] {
        let rst:string[] = []
        let userTextCount = this.getUserTextCounter(userID)
        while (count > 0 && userTextCount >= 0) {
            var text = this.getText(userID, String(userTextCount))
            if (text != null) {
                rst.push(text)
            }
            userTextCount -= 1
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
