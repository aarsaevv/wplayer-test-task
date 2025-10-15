import VideoPlayerInstance from '../player-instance';

export class DashVideoPlayerInstance extends VideoPlayerInstance {
    private tech: unknown;

    constructor() {
        super();
    }

    public init(): Promise<void> {
        throw new Error('Method not implemented.');
    }
    public destroy(): Promise<void> {
        throw new Error('Method not implemented.');
    }
    public load(url: string): Promise<void> {
        throw new Error('Method not implemented.');
    }
    public unload(): Promise<void> {
        throw new Error('Method not implemented.');
    }
    public play(): Promise<void> {
        throw new Error('Method not implemented.');
    }
    public pause(): Promise<void> {
        throw new Error('Method not implemented.');
    }
    public seekTo(): Promise<void> {
        throw new Error('Method not implemented.');
    }
    protected registerListeners(): void {
        throw new Error('Method not implemented.');
    }
    protected unregisterListeners(): void {
        throw new Error('Method not implemented.');
    }
}
