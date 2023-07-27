

export var worker: Worker | null = null

export function newWorker() {
    worker = new Worker(
        new URL("./webworker_thread.tsx", import.meta.url)
    );
}

export function workerSendInit(userID: string) {
    if (worker == null) throw new Error('worker not initialized')

    console.log("[MAIN]: new worker,", worker)
    worker.postMessage({
      connectionStatus: "init",
      userID: userID
    });
}

export function workerNewRecipient(recipientID: string) {
  if (worker == null) throw new Error('worker not initialized')

  worker.postMessage({
    connectionStatus: "newRecipient",
    recipientID: recipientID
  })
}

export function workerSendNewMsg(msg: string) {
    if (worker == null) throw new Error('worker not initialized')

    console.log("[main] send new message:" + msg)
    worker.postMessage({
      connectionStatus: "newOutboundMsg",
      data: msg
    })
}

export function workerTerminate() {
    // if (worker == null) throw new Error('worker not initialized')
    if (worker != null) {
        worker.terminate();
      }
}
