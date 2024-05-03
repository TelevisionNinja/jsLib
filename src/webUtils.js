function isWebGLAvailable() {
    try {
        const canvas = document.createElement('canvas');
        return Boolean(window.WebGLRenderingContext) && (Boolean(canvas.getContext('webgl')) || Boolean(canvas.getContext('experimental-webgl')));
    }
    catch(e) {
        return false;
    }
}
