import UnexpectedLoadError from './unexpected-load-error';

export function loadDashModule() {
    if (!window.dashjs) {
        throw new UnexpectedLoadError('dashjs');
    }

    return window.dashjs.MediaPlayer().create();
}
