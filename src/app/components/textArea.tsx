// import { worker } from "../lib/webwoker/webworker_main";
import RecipientUserTitle  from "./recipientInput";
import PrevTexts from "./prevTexts";
import InputBox from "./inputBox";
import { RootState } from "../store";
import { useSelector } from "react-redux";


export default function TextArea() {
  const convInfo = useSelector((state: RootState) => state.convState.currentConv)
  return (
    <div id="TextArea" className='grow flex flex-col min-w-fit items-center h-full justify-items-end '>
      <div id="RecipientTitle" className="flex items-center justify-start p-6 w-full h-[3rem] rounded-tr-lg bg-slate-500">
          {convInfo?.convName}
      </div>
      <PrevTexts />
      <InputBox  />
    </div>
  )
}
