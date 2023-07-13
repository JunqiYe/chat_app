export interface chatStorageService {
    storeText(index: string, text: string): void

    getText(userID:string, index: string): string | null

    removeText(index: string): void

    removeAll(): void
}
