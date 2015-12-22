angular.module('ash', []).directive("ngInfiniteScroll", function ($timeout, Data, Resource) {

  return {
    restrict: 'A',
    scope: {
      options: '=',
      items: '='
    },
    link: function ($scope, element) {
      $scope.lastRemain = undefined;
      $scope.offset = 0;
      $scope.inProcess = false;
      $scope.options = angular.extend({
        limit: 10,
        threshold: 50,
        data: []
      }, $scope.options);
      $scope.hasItems = true;

      if (!$scope.options.resource && !Array.isArray($scope.options.data)) {
        $scope.options.data = [$scope.options.data];
      }
      $scope.strategy = $scope.options.resource ? Resource : Data;
      $scope.strategy.addItems($scope);

      element.bind('scroll', function () {
        var remain = element[0].scrollHeight - (element[0].clientHeight + element[0].scrollTop);

        if (remain < $scope.options.threshold && (!$scope.lastRemain || (remain - $scope.lastRemain) < 0) && $scope.hasItems && !$scope.inProcess) {
          $scope.$apply(function() {
            $scope.strategy.addItems($scope);
          });
        }

        $scope.lastRemain = remain;
      });
    }
  }

});

app.factory('Data', function() {
  return {
    addItems: function($scope) {
      $scope.inProcess = true;

      var from = $scope.offset * $scope.options.limit;
      if (from < $scope.options.data.length) {
        var to = from + $scope.options.limit;
        to = to > $scope.options.data.length ? $scope.options.data.length : to;

        for (var i = from; i < to; i++) {
          $scope.items = $scope.items.concat($scope.options.data[i]);
        }

        $scope.offset++;
      } else {
        $scope.hasItems = false;
      }

      $scope.inProcess = false;
    }
  };
});

app.factory('Resource', function() {
  return {
    addItems: function($scope) {
      $scope.inProcess = true;
      $scope.options.resource.query(
        { offset: $scope.offset * $scope.options.limit, limit: $scope.options.limit },
        function (data) {
          if (data.models.length == 0) {
            $scope.hasItems = false;
          } else {
            for (var i = 0; i < data.models.length; i++) {
              $scope.items = $scope.items.concat(data.models[i]);
            }
          }

          $scope.inProcess = false;
        }
      );

    }
  };
});