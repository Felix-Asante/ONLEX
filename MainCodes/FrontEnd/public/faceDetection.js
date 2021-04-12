const video = document.getElementById('facevideo')
const btnCam = document.getElementById("next-3");
const prevStopCam = document.getElementById('prev-2')

const model_URI="/models"
let countCapture=0;


btnCam.addEventListener("click",()=>{
  Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(model_URI),
    faceapi.nets.faceLandmark68Net.loadFromUri(model_URI),
    faceapi.nets.faceRecognitionNet.loadFromUri(model_URI),
    faceapi.nets.faceExpressionNet.loadFromUri(model_URI)
  ]).then(startVideo)

 
   function startVideo() {
     navigator.getUserMedia(
       { video: {} },
       stream =>  video.srcObject = stream ,
       err => console.error(err)
     )
   }
   
   
 
     video.addEventListener('play', () => {
       const canvas = faceapi.createCanvasFromMedia(video)
       document.querySelector('.face-capture').append(canvas)
       const displaySize = { width: video.width, height: video.height }
       faceapi.matchDimensions(canvas, displaySize)

       setInterval(async () => {
         const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks()        
         const resizedDetections = await faceapi.resizeResults(detections, displaySize)
         canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
         faceapi.draw.drawDetections(canvas, resizedDetections)
         faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
        //  faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
        if(detections.length==1){
          countCapture++;

          if(countCapture<4){
            canvas.getContext('2d')
            .drawImage(video, 0, 0, canvas.width, canvas.height);
            // convert it to a usable data URL
            const dataURL = canvas.toDataURL("image/jpeg");
            console.log(countCapture)
            var data ={
              image:dataURL,
              email:document.getElementById("email").value,
              count:countCapture
          }
      // // SERVER REQUEST
      var xhttp = new XMLHttpRequest();
          xhttp.open("POST",`/membre/facecapture`,true)
          xhttp.setRequestHeader('Content-Type', 'application/json;charset=UTF-8')
          xhttp.send(JSON.stringify(data))
          }
        }
        if(countCapture==10){
          document.getElementById("submit").style.display='block'
          document.getElementById("face-reco-text").style.display="none"
          prevStopCam.style.display="none"
        }
         
       },800)
     })
   
 

}) 
prevStopCam.addEventListener("click",()=>{
  stream = video.srcObject;
// now get all tracks
tracks = stream.getTracks();
// now close each track by having forEach loop
tracks.forEach(function(track) {
   // stopping every track
   track.stop();
});
// assign null to srcObject of video
video.srcObject = null;
// document.getElementById("submit").style.display='none'

})