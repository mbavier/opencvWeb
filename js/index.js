let utils = new Utils('errorMessage');


//utils.loadCode('indexCode', 'codeEditor');

let streaming = false;
let videoInput = document.getElementById('videoInput');
let startAndStop = document.getElementById('startAndStop');
let canvasOutput = document.getElementById('canvasOutput');
let canvasContext = canvasOutput.getContext('2d');

startAndStop.addEventListener('click', () => {
    if (!streaming) {
        utils.clearError();
        utils.startCamera('qvga', onVideoStarted, 'videoInput');
    } else {
        utils.stopCamera();
        onVideoStopped();
    }
});

function onVideoStarted() {
    streaming = true;
    startAndStop.innerText = 'Stop';
    videoInput.width = videoInput.videoWidth;
    videoInput.height = videoInput.videoHeight;


    startVideoProcess();
}

function onVideoStopped() {
    streaming = false;
    canvasContext.clearRect(0, 0, canvasOutput.width, canvasOutput.height);
    startAndStop.innerText = 'Start';
}

utils.loadOpenCv(() => {
    startAndStop.removeAttribute('disabled');
});

let video, src, dst, gray, cap, classifier, faces, mat;

function startVideoProcess() {
  video = document.getElementById('videoInput');
  src = new cv.Mat(video.height, video.width, cv.CV_8UC4);
  dst = new cv.Mat(video.height, video.width, cv.CV_8UC4);
  gray = new cv.Mat();
  cap = new cv.VideoCapture(video);
  faces = new cv.RectVector();
  classifier = new cv.CascadeClassifier();
  let imgElement = document.getElementById("rainbowNoise");
  mat = cv.imread(imgElement);
  classifier.load('haarcascade_frontalface_default.xml');
  setTimeout(processFaceVideo, 0);
}
const FPS = 30;

function greyProcessVideo() {
    try {
        if (!streaming) {
            // clean and stop.
            src.delete();
            dst.delete();
            return;
        }
        let begin = Date.now();
        // start processing.
        cap.read(src);
        cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);
        cv.imshow('canvasOutput', dst);
        // schedule the next one.
        let delay = 1000/FPS - (Date.now() - begin);
        setTimeout(greyProcessVideo, delay);
    } catch (err) {
        utils.printError(err);
    }
};

let x, y, faceWidth, faceHeight;


  

function processFaceVideo() {
    try {
        if (!streaming) {
            // clean and stop.
            src.delete();
            dst.delete();
            gray.delete();
            faces.delete();
            classifier.delete();
            return;
        }
        
        let begin = Date.now();
        // start processing.
        cap.read(src);
        //src.copyTo(dst);
        let ksize = new cv.Size(3, 3);
        // You can try more different parameters
        cv.GaussianBlur(src, dst, ksize, 0, 0, cv.BORDER_DEFAULT);

        cv.cvtColor(dst, gray, cv.COLOR_RGB2GRAY);

        let grad_x = new cv.Mat();

        cv.Sobel(gray, grad_x, cv.CV_8U, 1, 0);

        cv.resize(mat, mat, grad_x.size(), 0, 0, cv.INTER_AREA);

        cv.cvtColor(grad_x, grad_x, cv.COLOR_GRAY2RGBA);
        

        console.log('image width: ' + grad_x.cols + '\n' +
            'image height: ' + grad_x.rows + '\n' +
            'image size: ' + grad_x.size().width + '*' + grad_x.size().height + '\n' +
            'image depth: ' + grad_x.depth() + '\n' +
            'image channels ' + grad_x.channels() + '\n' +
            'image type: ' + grad_x.type() + '\n');

        console.log('image width: ' + mat.cols + '\n' +
            'image height: ' + mat.rows + '\n' +
            'image size: ' + mat.size().width + '*' + mat.size().height + '\n' +
            'image depth: ' + mat.depth() + '\n' +
            'image channels ' + mat.channels() + '\n' +
            'image type: ' + mat.type() + '\n');

        cv.multiply(mat, grad_x, dst)

        
        //cv.cvtColor(dst, gray, cv.COLOR_RGBA2GRAY, 0);
        cv.imshow('canvasOutput', dst);
        // schedule the next one.
        
        let delay = 1000/FPS - (Date.now() - begin);
        grad_x.delete();
        //dst.delete();
        //src.delete();
        setTimeout(processFaceVideo, delay);
    } catch (err) {
        utils.printError(err);
    }
};