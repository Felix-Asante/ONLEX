const alertMessage = document.querySelector(".attention")
window.history.forward();

let browserChanged;
window.addEventListener('blur',()=>{

   if(sessionStorage.getItem('browserChanged')==null){
       console.log('null')
       sessionStorage.setItem('browserChanged',1)
       alert('Votre session risque d\'etre bloquee, Evitez d\'ouvrir des nouvelles onglets')
   }
   else{
       console.log('found')
       browserChanged =sessionStorage.getItem('browserChanged')
       sessionStorage.setItem('browserChanged',++browserChanged)
       alert('Votre session risque d\'etre bloquee, Evitez d\'ouvrir des nouvelles onglets')

       if(sessionStorage.getItem('browserChanged')>=3){
           
           window.location.replace('/exams/sessionbloque')
       }
   }
   
})