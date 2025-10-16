export default class UnexpectedElementStateError extends Error {
    constructor(elementName: string) {
        super(`Unexpected state of the element: ${elementName}`);
        this.name = 'UnexpectedElementStateError';
    }
}
