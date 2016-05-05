'use strict';

angular.module('googleApp.worldmarkets', ['ngRoute','googleApp'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/worldmarkets', {
    templateUrl: 'worldmarkets/worldmarkets.html',
    controller: 'WorldMarketsCtrl'
  });
}])

.controller('WorldMarketsCtrl', ['$scope','$http',function($scope,$http) {

  //if there's time, this could be stored in a db...otherwise will just leave it like this.
  $scope.marketsObj = {
    "SHA:000001":{"symbol":"SHA:000001","exchange":"SHA","stock":"000001","name":"Shanghai","deviation":""},
    "INDEXNIKKEI:NI225":{"symbol":"INDEXNIKKEI:NI225","exchange":"INDEXNIKKEI","stock":"NI225","name":"Nikkei 225","deviation":""},
    "INDEXHANGSENG:HSI":{"symbol":"INDEXHANGSENG:HSI","exchange":"INDEXHANGSENG","stock":"HSI","name":"Hang Seng Index","deviation":""},
    "TPE:TAIEX":{"symbol":"TPE:TAIEX","exchange":"TPE","stock":"TAIEX","name":"TSEC","deviation":""},
    "INDEXFTSE:UKX":{"symbol":"INDEXFTSE:UKX","exchange":"INDEXFTSE","stock":"UKX","name":"FTSE 100","deviation":""},
    "INDEXSTOXX:SX5E":{"symbol":"INDEXSTOXX:SX5E","exchange":"INDEXSTOXX","stock":"SX5E","name":"EURO STOXX 50","deviation":""},
    "INDEXEURO:PX1":{"symbol":"INDEXEURO:PX1","exchange":"INDEXEURO","stock":"PX1","name":"CAC 40","deviation":""},
    "INDEXTSI:OSPTX":{"symbol":"INDEXTSI:OSPTX","exchange":"INDEXTSI","stock":"OSPTX","name":"S&P TSX","deviation":""},
    "INDEXASX:XJO":{"symbol":"INDEXASX:XJO","exchange":"INDEXASX","stock":"XJO","name":"S&P/ASX 200","deviation":""},
    "INDEXBOM:SENSEX":{"symbol":"INDEXBOM:SENSEX","exchange":"INDEXBOM","stock":"SENSEX","name":"BSE Sensex","deviation":""},
    "TLV:T25":{"symbol":"TLV:T25","exchange":"TLV","stock":"T25","name":"TA25","deviation":""},
    "INDEXSWX:SMI":{"symbol":"INDEXSWX:SMI","exchange":"INDEXSWX","stock":"SMI","name":"SMI","deviation":""},
    "INDEXVIE:ATX":{"symbol":"INDEXVIE:ATX","exchange":"INDEXVIE","stock":"ATX","name":"ATX","deviation":""},
    "INDEXBVMF:IBOV":{"symbol":"INDEXBVMF:IBOV","exchange":"INDEXBVMF","stock":"IBOV","name":"IBOVESPA","deviation":""},
    "INDEXBKK:SET":{"symbol":"INDEXBKK:SET","exchange":"INDEXBKK","stock":"SET","name":"SET","deviation":""},
    "INDEXIST:XU100":{"symbol":"INDEXIST:XU100","exchange":"INDEXIST","stock":"XU100","name":"BIST100","deviation":""},
    "INDEXBME:IB":{"symbol":"INDEXBME:IB","exchange":"INDEXBME","stock":"IB","name":"IBEX","deviation":""},
    "WSE:WIG":{"symbol":"WSE:WIG","exchange":"WSE","stock":"WIG","name":"WIG","deviation":""},
    "TADAWUL:TASI":{"symbol":"TADAWUL:TASI","exchange":"TADAWUL","stock":"TASI","name":"TASI","deviation":""},
    "BCBA:IAR":{"symbol":"BCBA:IAR","exchange":"BCBA","stock":"IAR","name":"MERVAL","deviation":""},
    "INDEXBMV:ME":{"symbol":"INDEXBMV:ME","exchange":"INDEXBMV","stock":"ME","name":"IPC","deviation":""},
    "IDX:COMPOSITE":{"symbol":"IDX:COMPOSITE","exchange":"IDX","stock":"COMPOSITE","name":"IDX Composite","deviation":""}
  }
  
  //return csv of all codes
  $scope.marketsSymbols = $.map($scope.marketsObj,function(e){
    return e['symbol'];
  }).join(',');

  /* CODES FOR FINANCE HISTORY
  http://www.google.com/finance/getprices?q=000001&x=SHA&i=86400&p=40Y&f=d,c,v,k,o,h,l&df=cpct&auto=0&ei=Ef6XUYDfCqSTiAKEMg
  http://www.google.com/finance/getprices
  ?q=000001 (stock symbol)
  &x=SHA (stock exchange symbol)
  &i=86400 (interval size in seconds (86400 = 1 day intervals)
  &p=40Y (period. a number followed by a ‘d’ or ‘y’ e.g. days or years. ex: 40Y = 40 years)
  &f=d,c,v,k,o,h,l (d=date/timestamp,c-close,v=volume,k=cday,o=opening price,h=high,l=low)
  &df=cpct (?)
  &auto=0 (?)
  &ei=Ef6XUYDfCqSTiAKEMg (?)
  *
  */
  
  //each market obj
  $.each($scope.marketsObj,function(key,val){
    var stock =val['stock'];
    var exchange = val['exchange'];
    var symbol = val['symbol']
    
      $http.get('http://www.google.com/finance/getprices?q='+stock+'&x='+exchange+'&i=86400&p=1Y&f=c&df=cpct&auto=0&ei=Ef6XUYDfCqSTiAKEMg').success(function(data){
        var thisHistory = data; 
        
        //looping through lines
        var lines = thisHistory.split('\n');
        
        //remove instructional lines from array
       var deviationTotal = 0;
        var janitor = [];
        $.each(lines,function(key,val){
          if (/^DATA|EXCHANGE|MARKET|INTERVAL|COLUMNS|TIMEZONE*/i.test(this) == false && val != '' ) {
            var newVal = $.isNumeric(parseFloat(val)) ? parseFloat(val) : 0;
            janitor.push(newVal);
            deviationTotal += newVal;
          }
        });
        lines = janitor;
        
        //get line count
        var deviationCount = lines.length;
        
        //find mean
        var mean = deviationTotal/deviationCount; 
        
        //note to self...there's probably a cleaner way to do this
        janitor = [];
        var endSum = 0;
        $.each(lines,function(key,val){
          //minues mean from val
          var updatedVal = val-mean;
          //square each val
          updatedVal = updatedVal*updatedVal;
          //push to janitor
          janitor.push(updatedVal);
          //sum
          endSum+=updatedVal;
        });
        lines=janitor;

        //devide endsum by count of items -1
        var endSum = endSum/(deviationCount-1);
        
        //get sqrt
        var endSum = Math.sqrt(endSum).toFixed(2);
        
        //send value to marketsObj
        $scope.marketsObj[symbol].deviation = endSum;
          
          //get market data
          $http.get('http://www.google.com/finance/info?client=ig&q='+$scope.marketsSymbols).success(function(data){
              $scope.markets = data;
        
                //strip out double slashes
                $scope.markets = $scope.markets.replace(/\/\//g,'');
                
                //parse to clean control characters
                $scope.markets = $.parseJSON($scope.markets);
                
                for(var i=0;i<$scope.markets.length;i++){
                  
                  //add new value of 'name' to markets
                  var targetKey = $scope.markets[i]['e']+':'+$scope.markets[i]['t'];
                  $scope.markets[i].name = $scope.marketsObj[targetKey]['name'];
                  
                  //standard deviation
                  $scope.markets[i].deviation = $scope.marketsObj[targetKey]['deviation'];
                }
                
          });
      });
      
  });

  
  
  
}]);