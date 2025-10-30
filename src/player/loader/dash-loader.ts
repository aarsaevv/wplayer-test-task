import UnexpectedLoadError from './unexpected-loader-error';

export function loadDashModule() {
    if (!window.dashjs) {
        throw new UnexpectedLoadError('dashjs');
    }

    return window.dashjs.MediaPlayer().create();
}
