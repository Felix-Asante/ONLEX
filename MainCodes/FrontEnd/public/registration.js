
// PAGES
const about = document.getElementById('about-you').style;
const formation = document.getElementById('education').style;
const faceRecognitiom =document.getElementById("face-recognition").style;
const progressLine = document.getElementById("progress")
const educationCircle = document.querySelector(".education")
// BUTTONS next
const btn1 = document.getElementById("next-2");
const btn2 = document.getElementById("next-3");

//BUTTON PREV
const prev1 = document.getElementById('prev-1')
const prev2 = document.getElementById('prev-2')

btn1.addEventListener("click",(e)=>{
   e.preventDefault()
    about.opacity=0;
    about.zIndex=10
    formation.opacity=1;
    formation.zIndex=80
    progressLine.style.width="35.5%"
})

btn2.addEventListener("click",(e)=>{
    e.preventDefault();
    faceRecognitiom.opacity=1;
    faceRecognitiom.zIndex=100;
    formation.opacity=0
    formation.zIndex=1
    progressLine.style.width="71%"
    educationCircle.style.background="#ff4a00"
    educationCircle.style.color="#ffff"
    
})

prev1.addEventListener('click',(e)=>{
    e.preventDefault();
    about.opacity=1;
    formation.opacity=0;
    formation.zIndex=-1
    about.zIndex=100
    progressLine.style.width="0%"

})
prev2.addEventListener('click',(e)=>{
    e.preventDefault();
    formation.opacity=1;
    formation.zIndex=80
    faceRecognitiom.opacity=0
    faceRecognitiom.zIndex=-10
    progressLine.style.width="35.5%"
    educationCircle.style.background="#f0f4f5"
    educationCircle.style.color="#606c72"
})

// CONFIRM EMAIL
const email = document.getElementById("email")
const confirmEmail = document.getElementById("emailConfirm")
const message = document.getElementById('message')

confirmEmail.addEventListener("blur", function(){
    if(email.value !== confirmEmail.value){
       message.style.display="block"
    }
    else{
        message.style.display="none"
    }
})