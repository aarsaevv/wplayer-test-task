import { loadDashModule } from '../../loaders/dash-loader';
import VideoPlayerInstance from '../instance';

export class DashVideoPlayerInstance extends VideoPlayerInstance {
    private tech: typeof dashjs.MediaPlayerClass;

    constructor() {
        super();
    }

    public init() {
        this.tech = loadDashModule();

        this.registerListeners();
    }

    public destroy() {
        this.detachMedia();
        this.tech.destroy();

        this.unregisterListeners();
    }

    public load(url: string) {
        this.tech.initialize(this.videoEl, url);
    }

    public play(): Promise<void> {
        return this.tech.play();
    }

    public pause() {
        return this.tech.pause();
    }

    public seekTo(): Promise<void> {
        throw new Error('Method not implemented.');
    }
    protected registerListeners() {
        throw new Error('Method not implemented.');
    }
    protected unregisterListeners() {
        throw new Error('Method not implemented.');
    }
}
