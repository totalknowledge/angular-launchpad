'use strict'

var hwApp = angular.module('hwApp', [])
  .factory('hwFactory', ['$http', '$q', '$log',
    function($http, $q, $log) {
      return {
        mmmm: 'value'
      }
    }
  ])
  .controller('hwController', ['$log', '$scope', '$http',
    function($log, $scope, $http) {
      $scope.values = {hw:"World"};

    }
  ])
  .directive('hwDirective', [
  
  ])
  .filter('hwFilter', ['$log',
    function($log) {
      return function(returnValue, matrix) {
        return _.find(matrix, {id:returnValue}).name;
      };
    }
  ])
