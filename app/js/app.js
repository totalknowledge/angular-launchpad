'use strict'

var myApp = angular.module('rpApp', [])
  .factory('rpFactory', ['$http', '$q', '$log',
    function($http, $q, $log) {
      return {
        mmmm: 'value'
      }
    }
  ])
  .controller('rpController', ['$log', '$scope', '$http',
    function($log, $scope, $http) {
      $scope.values = {};
      $scope.values.banner = "This is a Value";
      $scope.right = 8;
	  $scope.left = 4;
      
      $scope.resizeLeft = function (direction) {
		  if (direction == 'minus' && $scope.left>1) {
			$scope.left--;
			$scope.right++;
		  } else if (direction == 'plus' && $scope.left<11) {
			  $scope.right--;
			  $scope.left++;
		  }
	  }
	  $scope.sum = function (a, b) {
		  return a + b;
	  }
	  $scope.addone = angular.bind(self, $scope.sum, 1);
    }
  ])
  .filter('displayname', ['$log',
    function($log) {
      return function(returnValue, matrix) {
        return _.find(matrix, {id:returnValue}).name;
      };
    }
  ])
