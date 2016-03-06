var System;

System.config({
  packages: {
    app: {
      format: 'register',
      defaultExtension: 'js'
   }
  }
});
System.import('/app/corkboard/corkboard')
      .then(null, console.error.bind(console));
