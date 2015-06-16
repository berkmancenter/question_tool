Meteor.methods({
	getIP: function () {
		return this.connection.clientAddress;
	},
	stdDev: function(array) {
		function standardDeviation(values){
		  var avg = average(values);
  
		  var squareDiffs = values.map(function(value){
		    var diff = value - avg;
		    var sqrDiff = diff * diff;
		    return sqrDiff;
		  });
  
		  var avgSquareDiff = average(squareDiffs);
 
		  var stdDev = Math.sqrt(avgSquareDiff);
		  return stdDev;
		}
		function average(data){
		  var sum = data.reduce(function(sum, value){
		    return sum + value;
		  }, 0);
 
		  var avg = sum / data.length;
		  return avg;
		}
		return standardDeviation(array);
	}
});