import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { TextData } from "../lib/storage/text_data";
import { prevMsgContext, mainAppContext } from "./context";
// import { worker } from "../lib/webwoker/webworker_main";
import RecipientUserTitle  from "./recipientInput";
import PrevTexts from "./prevTexts";
import InputBox from "./inputBox";
import { handler } from "../page";



export default function TextArea() {
    const ctx = useContext(mainAppContext)

    return (
      <div id="TextArea" className='grow flex flex-col min-w-fit items-center h-full justify-items-end '>
        <div className="flex items-center justify-start p-6 w-full h-[3rem] rounded-tr-lg bg-slate-500">
            {ctx.recipientID}
        </div>
        <PrevTexts />
        <InputBox  />
      </div>
    )
  }
