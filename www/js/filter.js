angular.module('starter')
  .filter('unique', function() {
    return function (arr, field) {
      var o = {}, i, l = arr.length, r = [];
      for(i=0; i<l;i+=1) {
        o[arr[i][field]] = arr[i];
      }
      for(i in o) {
        r.push(o[i]);
      }
      return r;
    };
  }).filter('MonthYear', function($filter) {
    return function (input, field) {
      var arr = [];
      for (var i = input.length - 1; i >= 0; i--) {
            if ($filter('date')(input[i].Fecha, "MM-yyyy") == field ){
              arr.push(input[i]);
            }else if (field == null){
              arr.push(input[i]);
            }
      }
      return arr;
    };
  });