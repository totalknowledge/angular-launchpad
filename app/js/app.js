System.config({
  packages: {
    app: {
      format: 'register',
      defaultExtension: 'js'
    }
  }
});
System.import('app/js/main')
      .then(null, console.error.bind(console));
