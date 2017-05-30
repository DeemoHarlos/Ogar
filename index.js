$(function(){
	$.ajax( {
		url: 'http://192.168.1.71:1337',
		data: 156,
		type: 'POST',
		success: function(items) {
			/* do something with items here */
			// You will likely want a template so you don't have to format the string by hand
			for( var item in items ) {
				$('#results').append('<div>'+item.interestingField+'</div>');
			}
		}
	});
});