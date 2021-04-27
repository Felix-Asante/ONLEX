const video = document.getElementById('video')

const model_URI="/models"
let countCapture=0;
let countError=0;
let canvas;

  Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(model_URI),
    faceapi.nets.faceLandmark68Net.loadFromUri(model_URI),
    faceapi.nets.faceRecognitionNet.loadFromUri(model_URI),
    faceapi.nets.faceExpressionNet.loadFromUri(model_URI),
    faceapi.nets.ssdMobilenetv1.loadFromUri(model_URI)
  ]).then(startVideo)


function startVideo() {
  navigator.getUserMedia(
    { video: {} },
    stream =>  video.srcObject = stream ,
    err => console.error(err)
  )
}

let countMatch=0;

video.addEventListener('play', async() => {
    const canvas = faceapi.createCanvasFromMedia(video)
    document.getElementById('face-capture').append(canvas)
    const displaySize = { width: video.width, height: video.height }
    faceapi.matchDimensions(canvas, displaySize)

    let labelFace =[];
    await fetch("/exams/fetchfaces").then(res=>
      {
        return res.json()
      }).then(data=>{
        labelFace=data;
      })

    setInterval(async () => {
      countMatch=0;
      const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptors()
      const FaceMatcher = new faceapi.FaceMatcher(detections)

      if(detections.length==1){
          // console.log( detections)
          
          const resizedDetections = await faceapi.resizeResults(detections, displaySize)
          canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
          faceapi.draw.drawDetections(canvas, resizedDetections)
          faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
          // canvas.getContext('2d')
          //   .drawImage(video, 0, 0, canvas.width, canvas.height);
          
         

              // console.log(labelFace)
              const img1 = document.createElement("img")
              const img2 = document.createElement("img")
              const img3 = document.createElement("img")

              img1.src=labelFace[0].img1;
              img2.src=labelFace[0].img2;
              img3.src=labelFace[0].img3;
              const FaceCandidat =[img1,img2,img3];
              console.log(FaceCandidat)
              for(let image of FaceCandidat){

                // document.body.append(img1)
                const face= await faceapi.detectSingleFace(image, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor()
                // console.log(face)
                const bestMatch =  await FaceMatcher.findBestMatch(face.descriptor)
                // console.log(bestMatch)
                if(bestMatch._distance<=0.4)
                {

                  countMatch++;
                }
              }

              if(countMatch>=2){
                // document.getElementById('btn-success').click()
                console.log('face recognised')
                
              }
              else
              {
                console.log("FACE NON RECONNU")
              }
        }     
        else{
          canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
          countError++;
            alert("Deux visages ont été detectés:Votre session risque d'etre bloqué")
            let session =sessionStorage.getItem('browserChanged')
            if(session!=null)
            sessionStorage.setItem('browserChanged',--session)
      }   

      //if(countError>=3)
      //sessionStorage.setItem('browserChanged',countError)
      //  faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
      
    },800)
  })
