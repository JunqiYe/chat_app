export function isIDValid(id: string) : boolean {
    if (id.length < 4 || id.length > 20) return false

    var numberAndLetters = /^[A-Za-z0-9_!]*$/
    return numberAndLetters.test(id)
}
