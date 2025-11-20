export default class UnexpectedLoadError extends Error {
    constructor(libraryName: string) {
        super(`Unexpected state of the library: ${libraryName}`);
        this.name = 'UnexpectedLoadError';
    }
}
