function convertMonths(month) {
	switch (month) {
			case 'Январь': return 1;
			case 'Февраль': return 2;
			case 'Март': return 3;
			case 'Апрель': return 4;
			case 'Май': return 5;
			case 'Июнь': return 6;
			case 'Июль': return 7;
			case 'Август': return 8;
			case 'Сентябрь': return 9;
			case 'Октябрь': return 10;
			case 'Ноябрь': return 11;
			case 'Декабрь': return 12;
		}
}
//GLOBAL SWITCH VARIABLES//
//=======================//
var previous_RecordSelected = ['','','','','','']; //0 - border-bottom ; 1 - background-color ; 2 - DOM element ; 3 - Content.Name1 ; 4 - Content.Name2 ; 5 - Content.Name3;
var previousJSONrecord;
var selectedKeyName = ''; //Selected Record for determine wheter insert new record to db or update existing one;
var previous_DaySelected = ['','']; //0 - background-color ; 1 - DOM element;
var today = new Date();
var selDay = parseInt($("#centerTable_selectedDay").text(), 10);
var selMonth = convertMonths($('#centerTable_monthLabel').text());
var selYear = today.getFullYear(); //parseInt($("#centerTable_yearLabel").text(), 10);
//=======================//
//GLOBAL DOM VARIABLES//
//====================//
var firmsLi = $("#rightTable_Firm dd ul li");
var firmsUl = $("#rightTable_Firm dd ul");
var textarea_Info = $("#textarea_Info");
var textarea_Decease = $("#textarea_Decease");
var textareaLabel_Info = $("#rightTable_Info_switch");
var textareaLabel_Decease = $("#rightTable_Decease_switch");
var calendar_Buttons = $(".calendarBtn");
var calendar_MonthLabel = $("#centerTable_monthLabel");
//====================//

//send data to Django // AJAX
function ajaxFunction(ajaxUrl, ajaxContentType, ajaxData, ajaxDataType, whatToPerform) {
	function redrawCalendar(data) {
		$('#calendarMesh').fadeOut(200, function() {
			$('#calendarMesh').replaceWith(data);
			$('#calendarMesh').fadeIn(200);
		})
	}
	function insertRecord(data) { 
		//
	}
	function updateRecord(data) { 
		//
	}
	function getRecord(data) {
		$('.removableListOfRecords').remove();
		var obj = jQuery.parseJSON(data);
		var tmp = [''];
		var totalGreenMoney = 0
		var totalVizovs = 0
		for (var record in obj) {
			tmp[record] = '<tr class="removableListOfRecords"><td><ul><li>'+obj[record].Name1+'</li><li>'+obj[record].Name2+'</li><li>'+obj[record].Name3+'</li><li></ul></td></tr>';
			$(tmp[record]).insertAfter('#leftTable_insertNewRecord_btn');
			totalGreenMoney = totalGreenMoney + obj[record].GreenMoney;
			totalVizovs = totalVizovs + 1;
		}
		$('#centerTable_daysGreenMoney').text(totalGreenMoney);
		$('#centerTable_daysVizovov').text(totalVizovs);
	}
	function getPatient(data) { 
		var obj = jQuery.parseJSON(data);
		$('#rightTable_namesInput_I').val(obj[0].Name1); $('#rightTable_namesInput_F').val(obj[0].Name2); $('#rightTable_namesInput_O').val(obj[0].Name3); $('#rightTable_ageInput').val(obj[0].Age); $('#rightTable_redMoney').val(obj[0].RedMoney); $('#rightTable_greenMoney').val(obj[0].GreenMoney); $('#rightTable_FromFirm').text(obj[0].Firm); $('#rightTable_Street').val(obj[0].Street); $('#rightTable_Apt').val(obj[0].Apt); $('#rightTable_House').val(obj[0].House); $('#rightTable_Pass').val(obj[0].Passwd); $('#rightTable_Porch').val(obj[0].Porch); $('#rightTable_Floor').val(obj[0].Floor); $('#rightTable_Tel1').val(obj[0].Tel1); $('#rightTable_Tel2').val(obj[0].Tel2); $('#textarea_Info').val(obj[0].Note); $('#textarea_Decease').val(obj[0].Decease);
		console.log(obj[0].RedMoney);
	}
	$.ajax({
		type: 'POST',
		url: ajaxUrl,
		contentType: ajaxContentType,
		data: ajaxData,
		dataType: ajaxDataType,
		async: false,
		success: function(data) {
			if (whatToPerform === 'redrawCalendar') { redrawCalendar(data) }
			if (whatToPerform === 'insertRecord') { insertRecord(data) }
			if (whatToPerform === 'updateRecord') { updateRecord(data) }
			if (whatToPerform === 'getRecords') { getRecord(data) }
			if (whatToPerform === 'getPatient') { getPatient(data) }
		}
	})
	//redrawCalendar(1);
return false;
}

//select day in calendar
$("#calendarMesh_wrapper").on("click", ".days_not_empty" ,function() {
	//highlighting selected day	
	if (previous_DaySelected[1] != '') { previous_DaySelected[1].css("background-color", previous_DaySelected[0]); }
	previous_DaySelected[0] = $(this).css("background-color");
	previous_DaySelected[1] = $(this);
	$(this).css("background-color", "#50B72A");
	$('#centerTable_selectedDay').text($(this).text());
	selDay = parseInt($(this).text());
	//refreshing records according to selected day
	$('#rightTable').fadeOut( "fast");
	ajaxFunction('/edit/ajax_get_records', 'application/x-www-form-urlencoded; charset=UTF-8', {cDay: selDay, cMonth: selMonth, cYear: selYear}, 'text', 'getRecords');
})
//changing month and year in center table
calendar_Buttons.on("click", function() {
	function changeMonthLabel_Back(month) {
		switch (month) {
			case 'Январь': calendar_MonthLabel.text('Декабрь'); selMonth = 12; changeYearLabel_Back(selYear);	break;
			case 'Февраль': calendar_MonthLabel.text('Январь'); selMonth = 1; break;
			case 'Март': calendar_MonthLabel.text('Февраль'); selMonth = 2; break;
			case 'Апрель': calendar_MonthLabel.text('Март'); selMonth = 3; break;
			case 'Май': calendar_MonthLabel.text('Апрель'); selMonth = 4; break;
			case 'Июнь': calendar_MonthLabel.text('Май'); selMonth = 5; break;
			case 'Июль': calendar_MonthLabel.text('Июнь'); selMonth = 6;	 break;
			case 'Август': calendar_MonthLabel.text('Июль'); selMonth = 7; break;
			case 'Сентябрь': calendar_MonthLabel.text('Август'); selMonth = 8; break;
			case 'Октябрь': calendar_MonthLabel.text('Сентябрь'); selMonth = 9; break;
			case 'Ноябрь': calendar_MonthLabel.text('Октябрь'); selMonth = 10; break;
			case 'Декабрь': calendar_MonthLabel.text('Ноябрь'); selMonth = 11; break;
		}
	}
	function changeMonthLabel_Forward(month) {
		switch (month) {
			case 'Январь': calendar_MonthLabel.text('Февраль'); selMonth = 2; break;
			case 'Февраль': calendar_MonthLabel.text('Март'); selMonth = 3; break;
			case 'Март': calendar_MonthLabel.text('Апрель'); selMonth = 4; break;
			case 'Апрель': calendar_MonthLabel.text('Май'); selMonth = 5; break;
			case 'Май': calendar_MonthLabel.text('Июнь'); selMonth = 6; break;
			case 'Июнь': calendar_MonthLabel.text('Июль'); selMonth = 7;	 break;
			case 'Июль': calendar_MonthLabel.text('Август');	selMonth = 8; break;
			case 'Август': calendar_MonthLabel.text('Сентябрь'); selMonth = 9; break;
			case 'Сентябрь': calendar_MonthLabel.text('Октябрь'); selMonth = 10; break;
			case 'Октябрь': calendar_MonthLabel.text('Ноябрь'); selMonth = 11; break;
			case 'Ноябрь': calendar_MonthLabel.text('Декабрь'); selMonth = 12; break;
			case 'Декабрь': calendar_MonthLabel.text('Январь'); selMonth = 1; changeYearLabel_Forward(selYear); break;
		}
	}
	function changeYearLabel_Back(year) {
		var tmp = parseInt(year, 10);
		selYear = tmp - 1;
		$("#centerTable_yearLabel").text(selYear);
	}
	function changeYearLabel_Forward(year) {
		var tmp = parseInt(year, 10);
		selYear = tmp + 1;
		$("#centerTable_yearLabel").text(selYear);
	}
	if ($(this).is($("#centerTable_btnBack_Month"))) {
		changeMonthLabel_Back(calendar_MonthLabel.text()); $('#rightTable').fadeTo( "fast", 0.03); $('#leftTable_Records').fadeTo( "fast", 0.03);
		ajaxFunction('/edit/ajax_change_calendar', 'application/x-www-form-urlencoded; charset=UTF-8', {cMonth: selMonth, cYear: selYear}, 'text', 'redrawCalendar');
	}
	if ($(this).is($("#centerTable_btnForward_Month"))) {
		changeMonthLabel_Forward(calendar_MonthLabel.text()); $('#rightTable').fadeTo( "fast", 0.03); $('#leftTable_Records').fadeTo( "fast", 0.03);
		ajaxFunction('/edit/ajax_change_calendar', 'application/x-www-form-urlencoded; charset=UTF-8', {cMonth: selMonth, cYear: selYear}, 'text', 'redrawCalendar');
	}
	if ($(this).is($("#centerTable_btnBack_Year"))) {
		changeYearLabel_Back(selYear); $('#rightTable').fadeTo( "fast", 0.03); $('#leftTable_Records').fadeTo( "fast", 0.03);
		ajaxFunction('/edit/ajax_change_calendar', 'application/x-www-form-urlencoded; charset=UTF-8', {cMonth: selMonth, cYear: selYear}, 'text', 'redrawCalendar');
	}
	if ($(this).is($("#centerTable_btnForward_Year"))) {
		changeYearLabel_Forward(selYear); $('#rightTable').fadeTo( "fast", 0.03); $('#leftTable_Records').fadeTo( "fast", 0.03);
		ajaxFunction('/edit/ajax_change_calendar', 'application/x-www-form-urlencoded; charset=UTF-8', {cMonth: selMonth, cYear: selYear}, 'text', 'redrawCalendar');
	}
})

//selecting record in left table
$("#leftTable_Records").on("click", "tr" ,function() {
	if ($(this).is('#leftTable_insertNewRecord_btn')) { //inserting new record
	 $('#leftTable_Records').append('<tr class="removableListOfRecords"><td><ul><li><br></li><li><br></li><li><br></li><li></ul></td></tr>');
	} else { //selecting existing record
	 $('.removableListOfRecords').removeAttr('id');
	 $(this).attr('id', 'edit');
	 if (previous_RecordSelected[2] != '') { previous_RecordSelected[2].css("border-bottom", previous_RecordSelected[0]).css("background-color", previous_RecordSelected[1]) }
	 previous_RecordSelected[0] = $(this).css("border-bottom");
	 previous_RecordSelected[1] = $(this).css("background-color");
	 previous_RecordSelected[2] = $(this);
	 $(this).css("border-bottom", "5px solid #D16515").css("background-color", "#E6E4D7");
	 if ($(this).text() != '') {
	  ajaxFunction('/edit/ajax_get_patient', 'application/x-www-form-urlencoded; charset=UTF-8', {KeyName: $(this).text()}, 'text', 'getPatient');
	  $('#rightTable').fadeIn( "fast");
	 } else { //if this is new records just created
	  $('#rightTable_namesInput_I').val(''); $('#rightTable_namesInput_F').val(''); $('#rightTable_namesInput_O').val(''); $('#rightTable_ageInput').val(''); $('#rightTable_redMoney').val(''); $('#rightTable_greenMoney').val(''); $('#rightTable_Street').val(''); $('#rightTable_Apt').val(''); $('#rightTable_House').val(''); $('#rightTable_Pass').val(''); $('#rightTable_Porch').val(''); $('#rightTable_Floor').val(''); $('#rightTable_Pass').val(''); $('#rightTable_Tel1').val(''); $('#rightTable_Tel2').val(''); $('#textarea_Info').val(''); $('#textarea_Decease').val('');
	  $('#rightTable').fadeIn( "fast");
	 };
	selectedKeyName = $('#edit').text();
	};
})

//saving or updating record
$("#centerTable_saveBtn").click(function() {
	//collecting data from right table
	var jSONrecord = {'Name1':$('#rightTable_namesInput_I').val(),'Name2':$('#rightTable_namesInput_F').val(),'Name3':$('#rightTable_namesInput_O').val(),'KeyName':'','Age':$('#rightTable_ageInput').val(),'Street':$('#rightTable_Street').val(),'House':$('#rightTable_House').val(),'Passwd':$('#rightTable_Pass').val(),'Porch':$('#rightTable_Porch').val(),'Floor':$('#rightTable_Floor').val(),'Apt':$('#rightTable_Apt').val(),'Tel1':$('#rightTable_Tel1').val(),'Tel2':$('#rightTable_Tel2').val(),'Info':$('#textarea_Info').val(),'Decease':$('#textarea_Decease').val(),'MoneyGreen':$('#rightTable_greenMoney').val(),'MoneyRed':$('#rightTable_redMoney').val(),'Day':selDay, 'Month':selMonth,'Year':selYear}
	jSONrecord.KeyName = jSONrecord.Name1+''+jSONrecord.Name2+''+jSONrecord.Name3;
	jSONrecord.Firm = $('#rightTable_FromFirm').text();
    if (jSONrecord.MoneyRed == '') {jSONrecord.MoneyRed = '0'};
    if (jSONrecord.MoneyGreen == '') {jSONrecord.MoneyGreen = '0'};
    if (jSONrecord.Age == '') {jSONrecord.Age = '0'};
    if (jSONrecord.Apt == '') {jSONrecord.Apt = '0'};
    if (jSONrecord.Porch == '') {jSONrecord.Porch = '0'};
    if (jSONrecord.Floor == '') {jSONrecord.Floor = '0'};
    $('#edit td ul li:nth-child(1)').text(jSONrecord.Name1); $('#edit td ul li:nth-child(2)').text(jSONrecord.Name2); $('#edit td ul li:nth-child(3)').text(jSONrecord.Name3);
    if (selectedKeyName === '') { 
     ajaxFunction('/edit/ajax_record_insert', 'application/json; charset=utf-8', JSON.stringify(jSONrecord), 'json', 'insertRecord'); 
    } else {
     jSONrecord.previousKeyName = selectedKeyName;
     ajaxFunction('/edit/ajax_record_update', 'application/json; charset=utf-8', JSON.stringify(jSONrecord), 'json', 'updateRecord');
    };
})

//dropdown list of firms
$("#rightTable_Firm span").click(function() {
    firmsUl.toggle("fast");
})
firmsLi.click(function() {
    var tmp = $(this).text();
    $("#rightTable_Firm dt span").text(tmp);
    firmsUl.hide("fast");
})

//textarea toggle
textareaLabel_Info.click(function() {
	textarea_Decease.slideUp("fast", function() {
		textarea_Info.slideDown("fast");
	})
	$(this).css("border-bottom", "5px solid #8667AC").css("background-color", "#9573BF");
	textareaLabel_Decease.css("border-bottom", "5px solid #857466").css("background-color", "#948172");
})
textareaLabel_Decease.click(function() {
	textarea_Info.slideUp("fast", function() {
		textarea_Decease.slideDown("fast");
	})
	$(this).css("border-bottom", "5px solid #8667AC").css("background-color", "#9573BF");
	textareaLabel_Info.css("border-bottom", "5px solid #857466").css("background-color", "#948172");
})

//calculate numbers of vizovs and amount of green money for selected day
function days_Vizovs_and_Money() {
	var total = {};	total.Sum = 0; total.Viz = 0;
	$('#leftTable_Records .leftTable_Record_greenMoney').each(function() {
		total.Sum = total.Sum + parseInt($(this).text());
		total.Viz = total.Viz + 1;
	})
	return total;
}

//run on page loading
$(document).ready(function() {
	firmsUl.toggle();
	textarea_Info.css("display","none");
	textarea_Decease.css("display","none");
	$('#centerTable_selectedDay').text(selDay);
	var totals = days_Vizovs_and_Money();
	$('#centerTable_daysVizovov').text(totals.Viz);
	$('#centerTable_daysGreenMoney').text(totals.Sum);
	$('#rightTable').hide();
	ajaxFunction('/edit/ajax_get_records', 'application/x-www-form-urlencoded; charset=UTF-8', {cDay: selDay, cMonth: selMonth, cYear: selYear}, 'text', 'getRecords');
})