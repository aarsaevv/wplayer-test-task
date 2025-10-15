import VideoPlayerInstance from '../player-instance';

export class HlsVideoPlayerInstance extends VideoPlayerInstance {
    private tech: typeof Hls;

    constructor() {
        super();
    }

    public init() {
        // TODO: Инициализацию плееров вынести в функцию
        const hls = new Hls();
        this.tech = hls;

        this.registerListeners();
    }

    public destroy() {
        this.tech.stopLoad();
        this.tech.detachMedia();
        this.tech.destroy();

        this.unregisterListeners();
    }

    public load(url: string): void {
        this.tech.loadSource(url);
    }

    public unload(): Promise<void> {
        throw new Error('Method not implemented.');
    }

    public play(): Promise<void> {
        return this.videoEl.play();
    }

    public pause(): void {
        return this.videoEl.pause();
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
