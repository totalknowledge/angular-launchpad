System.config({
  packages: {
    app: {
      format: 'register',
      defaultExtension: 'js'
    }
  }
});
System.import('/app/main/main.js')
      .then(null, console.error.bind(console));
