
/* desc -- 
Enregistrez la liste des Plugins Filepond que nous
 voulons utiliser dans notre projet */

 FilePond.registerPlugin(
    FilePondPluginImagePreview,
    FilePondPluginImageResize,
    FilePondPluginFileEncode,
    FilePondPluginFileValidateSize
  );
  
  /*@desc nous le faisons si vous souhaitez dimensionner une option.
   définir la largeur et la hauteur du champ de saisie */
  
  FilePond.setOptions({
    
    stylePanelAspectRatio: 50 / 100,
    maxFileSize:'100KB',
   
  });
  
  //@desc Transformez tout le champ d'entrée de fichier en entrée de filepond

  // create a FilePond instance at the input element location
  const pond = FilePond.create(document.getElementById('fileUpload'));
  // FilePond.parse(document.getElementById("fileUpload"))
  // encoder le fichier sous la forme d'une chaîne json et l'enregistrer sur le serveur