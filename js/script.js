jQuery.expr[':'].contains = function(a, i, m) {
	return jQuery(a).text().toUpperCase().indexOf(m[3].toUpperCase()) >= 0;
};

function getYear(year) {
	// form the database data date to year
	if(year) {
		return year.match(/[\d]{4}/); // This is regex: https://en.wikipedia.org/wiki/Regular_expression
	}
}

function getDate(date) {
	// form the database data to date(yyyy-mm-dd)
	if(date) {
		return date.match(/^\d{4}-\d{2}-\d{2}/);
	}
}

function countDay(date1, date2) {
	// count the day between date1 and date2
	var date3 = JSON.stringify(date1)
	// form date1(database date) to string
	date3 = date3.substring(2, date3.length - 2)
	var y1=date3.split("-")[0];
	var m1=date3.split("-")[1];
	var d1=date3.split("-")[2];
	var time1=new Date(y1,m1,d1);
	var y2=date2.split("-")[0];
	var m2=date2.split("-")[1];
	var d2=date2.split("-")[2];
	var time2=new Date(y2,m2,d2);
	return Math.abs((time2 - time1) / 1000 / 60 / 60 / 24)
}

function showUserImg(result) {
	// show the upload image in show page
	var file = result;
	var reader = new FileReader();
	reader.onloadend = function () {
		$("#imgUser").append(
			$('<img height="200">').attr("src", reader.result)
		);
	}
	if (file) {
		reader.readAsDataURL(file);
	}
}

function showUserImgBk(result) {
	// show the user image in compare page(wait for compare)
	var file = result;
	var reader = new FileReader();

	reader.onloadend = function () {
		// var img_url = '../images/ggif.gif';
		// var img = new Image()
		// img.onload = function() {
		// 	var height = img.height;
		// }
		$('#loading').append(
			$('<img height="600">').attr("src", reader.result)
		)
	}

	if (file) {
		reader.readAsDataURL(file);
	}
}


function iterateRecords(results) {

	console.log(results);

	dataTree = new Map()
	var result = (window.opener.$('#img01').prop('files'))[0];
	showUserImg(result)
	var index = 0;
	var recordTemplate = $(".record-template");

	$.each(results.result.records, function(recordID, recordValue) {
		// get the database data and for each row get key and value
		var recordTitle = recordValue["Title of image"];
		var recordYear = getYear(recordValue["Temporal"]);
		var recordDate = getDate(recordValue['Temporal']);
		// console.log(recordDate)
		var recordImage = recordValue["Medium resolution image"];
		var recordImageLarge = recordValue["High resolution image"];
		var recordDescription = recordValue["Provenance"];
		var countTime = 1;
		var rate;
		// recode the variable

		if(recordTitle && recordYear && recordImage && recordDescription) {

			var clonedRecordTemplate = recordTemplate.clone();
			// clonedRecordTemplate.attr("id", "record-" + recordID).removeClass("record-template");
			// clonedRecordTemplate.appendTo("#records");
			// getdate_event(recordDate, recordImage)

			let url = 'https://api-us.faceplusplus.com/facepp/v3/compare';
			// var files01 = $('#img01').prop('files');
			var image_url2 = recordImage;
			// console.log(image_url2)
			var data = new FormData();
			data.append('api_key', "jqYYM-EGAe404c6xPSKxNMr-hbYtgffY");
			data.append('api_secret', "Hm7ZQMzFUmb1kNn18k_WVnafJc5WPXtS");
			data.append('image_file1', result);
			data.append('image_url2', image_url2);

			$.ajax({
				// access face plus plus api
				url: url,
				type: 'post',
				data: data,
				cache: false,
				async: true,
				processData: false,
				contentType: false,
				success(data) {
					console.log(data);
					rate = data.confidence;

					// get rate if access api success

					if (rate >= 30 && index < 1){
						// oprate get_event function when rate >= 30
						get_event(clonedRecordTemplate, recordID, recordTitle, recordDate, recordImage, recordImageLarge, rate, recordDescription);
						index ++;
						dataTree.set(index,rate);
						printTree(dataTree);
						// $("#record-count strong").text($(".record:visible").length);
						//
						// $("#filter-text").keyup(function() {
						//
						// 	var searchTerm = $(this).val();
						// 	console.log(searchTerm);
						//
						// 	$(".record").hide();
						// 	$(".record:contains('" + searchTerm + "')").show();
						//
						// 	$("#record-count strong").text($(".record:visible").length);
						//
						// });
					}
					// console.log(rate)
					// return rate
					// $('#resultRate').html(data.confidence + '%')
				}
			})
			// clonedRecordTemplate.attr("id", "record-" + recordID).removeClass("record-template");
			// clonedRecordTemplate.appendTo("#records");
			//
			//
			// $("#record-" + recordID + " h3").html(recordTitle);
			// $("#record-" + recordID + " .year").html(recordDate);
			// $("#record-" + recordID + " .description").html(recordDescription);
			// $("#record-" + recordID + " img").attr("src", recordImage);
			// $("#record-" + recordID + " img").attr("data-strip-caption", recordTitle);
			// $("#record-" + recordID + " a").attr("href", recordImageLarge);
			//
			// $("#record-" + recordID + " a").click(function(event) {
			// 	Strip.show({
			// 		url: recordImageLarge,
			// 		caption: recordTitle
			// 	});
			// 	event.preventDefault();
			// });

			$("#filter-text").keyup(function() {
				// record the keyword input in input id = filter-text

				var searchTerm = $(this).val();
				console.log(searchTerm);

				$(".record").hide();
				$(".record:contains('" + searchTerm + "')").show();

				$("#record-count strong").text($(".record:visible").length);
				// display the information match the input keyword

			});
		}

	});



	setTimeout(function() {
		$("body").addClass("loaded");
	}, 6000); // 6 second delay

}


function printTree(tree) {
	// get the number of information card and display in p id = record-count
	var length  = tree.size;
	$("#record-count strong").text(length);
	console.log(length)
	console.log(tree);
}

function get_event(clonedRecordTemplate, recordID, recordTitle, date, recordImage, recordImageLarge, rate, recordDescription) {
	// function for display information in each information card
	$.getJSON("1914-1916_match.json", function (data) {
		// read JSON file( event in WW1)
		console.log(data);
		$.each(data.records, function (recordKey, recordValue) {
			// for each row in json file get key and value
			// console.log(recordValue["date"]);
			var recordEvent = recordValue['event'];
			var recordDate = recordValue['date'];
			var recordDetail = recordValue['detail'];
			// record event date and detail
			if (recordEvent && recordDate && recordDetail){
				console.log("rate",rate)
				console.log(date)
				console.log(recordDate)
				if (date == recordDate) {
					// console.log("=")
					// if the date of event happened in WW1 == soldier photo date
					if (rate > 80) {
						console.log(recordTitle, date, recordDescription, recordImage, recordImageLarge,recordTitle, recordEvent,recordDetail)
						// clonedRecordTemplate.attr("id", "record-" + recordID).removeClass("record-template");
						clonedRecordTemplate.appendTo("#records");
						$("#record-" + recordID + " h3").html(recordTitle);
						$("#record-" + recordID + " .year").html(date);
						$("#record-" + recordID + " .description").html(recordDescription);
						$("#record-" + recordID + " img").attr("src", recordImage);
						$("#record-" + recordID + " img").attr("data-strip-caption", recordTitle);
						$("#record-" + recordID + " a").attr("href", recordImageLarge);
						$("#record-" + recordID + " a").click(function(event) {
							//stripjs api to display photo and event
							Strip.show({
								url: recordImageLarge,
								caption: 'Event: '+recordEvent + '<br>' + 'Detail: '+ recordDetail,
								options:{
									side: 'top'
								}
							});
							event.preventDefault();
						});
						$("#record-" + recordID + " .like").html("Rate : "+rate + "%");
						$("#record-" + recordID + " .event_date").html("Closest event in " + recordDate + ". Read More>>>");
						// paste the information in web page
						// $("#record-" + recordID + " .event").html(recordEvent);
						// $("#record-" + recordID + " .detail").html(recordDetail);

						return false;
					}
					else if (rate > 50) {
						// console.log(recordTitle, date, recordDescription, recordImage, recordImageLarge,recordTitle, recordEvent,recordDetail)
						clonedRecordTemplate.attr("id", "record-" + recordID).removeClass("record-template");
						clonedRecordTemplate.appendTo("#records");

						$("#record-" + recordID + " h3").html(recordTitle);
						$("#record-" + recordID + " .year").html(date);
						$("#record-" + recordID + " .description").html(recordDescription);
						$("#record-" + recordID + " img").attr("src", recordImage);
						$("#record-" + recordID + " img").attr("data-strip-caption", recordTitle);
						$("#record-" + recordID + " a").attr("href", recordImageLarge);
						$("#record-" + recordID + " a").click(function(event) {
							Strip.show({
								//stripjs api to display photo and event
								url: recordImageLarge,
								caption: 'Event: '+recordEvent + '<br>' + 'Detail: '+ recordDetail,
								options:{
									side: 'top'
								}
							});
							event.preventDefault();
						});
						$("#record-" + recordID + " .like").html("Rate : "+rate + 5 + "%");
						$("#record-" + recordID + " .event_date").html("Closest event in " + recordDate + ". Read More>>>");
						// paste the information in web page
						// $("#record-" + recordID + " .event").html(recordEvent);
						// $("#record-" + recordID + " .detail").html(recordDetail);
						return false;
					}
					else {
						// console.log(recordTitle, date, recordDescription, recordImage, recordImageLarge,recordTitle, recordEvent,recordDetail)
						clonedRecordTemplate.attr("id", "record-" + recordID).removeClass("record-template");
						clonedRecordTemplate.appendTo("#records");
						$("#record-" + recordID + " h3").html(recordTitle);
						$("#record-" + recordID + " .year").html(date);
						$("#record-" + recordID + " .description").html(recordDescription);
						$("#record-" + recordID + " img").attr("src", recordImage);
						$("#record-" + recordID + " img").attr("data-strip-caption", recordTitle);
						$("#record-" + recordID + " a").attr("href", recordImageLarge);
						$("#record-" + recordID + " a").click(function(event) {
							Strip.show({
								//stripjs api to display photo and event
								url: recordImageLarge,
								caption: 'Event: '+recordEvent + '<br>' + 'Detail: '+ recordDetail,
								options:{
									side: 'top'
								}
							});
							event.preventDefault();
						});
						$("#record-" + recordID + " .like").html("Rate : "+rate + 15 + "%");
						$("#record-" + recordID + " .event_date").html("Closest event in " + recordDate + ". Read More>>>");
						// paste the information in web page
						// $("#record-" + recordID + " .event").html(recordEvent);
						// $("#record-" + recordID + " .detail").html(recordDetail);
						return false;
					}
				}
				else if (countDay(date, recordDate) <= 3) {
					// console.log("<>")
					// if the date of soldier photo is close(in 3 days) the date of WW1 event
					if (rate > 80) {
						// console.log(recordTitle, date, recordDescription, recordImage, recordImageLarge,recordTitle, recordEvent,recordDetail)
						clonedRecordTemplate.attr("id", "record-" + recordID).removeClass("record-template");
						clonedRecordTemplate.appendTo("#records");
						$("#record-" + recordID + " h3").html(recordTitle);
						$("#record-" + recordID + " .year").html(date);
						$("#record-" + recordID + " .description").html(recordDescription);
						$("#record-" + recordID + " img").attr("src", recordImage);
						$("#record-" + recordID + " img").attr("data-strip-caption", recordTitle);
						$("#record-" + recordID + " a").attr("href", recordImageLarge);
						$("#record-" + recordID + " a").click(function(event) {
							Strip.show({
								//stripjs api to display photo and event
								url: recordImageLarge,
								caption: 'Event: '+recordEvent + '<br>' + 'Detail: '+ recordDetail,
								options:{
									side: 'top'
								}
							});
							event.preventDefault();
						});
						$("#record-" + recordID + " .like").html("Rate : "+rate + "%");
						$("#record-" + recordID + " .event_date").html("Closest event in " + recordDate + ". Read More>>>");
						// paste the information in web page
						// $("#record-" + recordID + " .event").html(recordEvent);
						// $("#record-" + recordID + " .detail").html(recordDetail);
						return false;
					}
					else if (rate > 50) {
						// console.log(recordTitle, date, recordDescription, recordImage, recordImageLarge,recordTitle, recordEvent,recordDetail)
						clonedRecordTemplate.attr("id", "record-" + recordID).removeClass("record-template");
						clonedRecordTemplate.appendTo("#records");
						$("#record-" + recordID + " h3").html(recordTitle);
						$("#record-" + recordID + " .year").html(date);
						$("#record-" + recordID + " .description").html(recordDescription);
						$("#record-" + recordID + " img").attr("src", recordImage);
						$("#record-" + recordID + " img").attr("data-strip-caption", recordTitle);
						$("#record-" + recordID + " a").attr("href", recordImageLarge);

						$("#record-" + recordID + " a").click(function(event) {
							Strip.show({
								//stripjs api to display photo and event
								url: recordImageLarge,
								caption: 'Event: '+recordEvent + '<br>' + 'Detail: '+ recordDetail,
								options:{
									side: 'top'
								}
							});
							event.preventDefault();
						});
						$("#record-" + recordID + " .like").html("Rate : "+rate + 5 + "%");
						$("#record-" + recordID + " .event_date").html("Closest event in " + recordDate + ". Read More>>>");
						// paste the information in web page

						// $("#record-" + recordID + " .event").html(recordEvent);
						// $("#record-" + recordID + " .detail").html(recordDetail);
						return false;
					}
					else {
						// console.log(recordTitle, date, recordDescription, recordImage, recordImageLarge,recordTitle, recordEvent,recordDetail)
						clonedRecordTemplate.attr("id", "record-" + recordID).removeClass("record-template");
						clonedRecordTemplate.appendTo("#records");

						$("#record-" + recordID + " h3").html(recordTitle);
						$("#record-" + recordID + " .year").html(date);
						$("#record-" + recordID + " .description").html(recordDescription);
						$("#record-" + recordID + " img").attr("src", recordImage);
						$("#record-" + recordID + " img").attr("data-strip-caption", recordTitle);
						$("#record-" + recordID + " a").attr("href", recordImageLarge);
						$("#record-" + recordID + " a").click(function(event) {
							//stripjs api to display photo and event
							Strip.show({
								url: recordImageLarge,
								caption: 'Event: '+recordEvent + '<br>' + 'Detail: '+ recordDetail,
								options:{
									side: 'top'
								}
							});
							event.preventDefault();
						});
						$("#record-" + recordID + " .like").html("Rate : "+rate + 15 + "%");
						$("#record-" + recordID + " .event_date").html("Closest event in " + recordDate + ". Read More>>>");
						// paste the information in web page
						// $("#record-" + recordID + " .event").html(recordEvent);
						// $("#record-" + recordID + " .detail").html(recordDetail);
						return false;
					}
				}
			}

		})

	})
}

$(document).ready(function() {

	//oprate the function when page start
	var result = (window.opener.$('#img01').prop('files'))[0];

	showUserImgBk(result)

	//access data from database
	var data = {
		resource_id: "a46b4d2b-243f-41f9-9a61-a231f1d1b6d0",
		limit: 20
	}

	$.ajax({
		url: "https://data.qld.gov.au/api/3/action/datastore_search",
		data: data,
		dataType: "jsonp", // We use "jsonp" to ensure AJAX works correctly locally (otherwise it'll be blocked due to cross-site scripting).
		cache: true,
		success: function(results) {
			// return the data when success access the api
			iterateRecords(results);
		}
	});

});