/**GLOBAL*VARIABLES************************************/
var btn_newRecord_Search = $('#btn_newRecord_search');
var input_newRecord_Search = $('#newRecord_inputSearch');
var selDay = parseInt($('#selectedDay').text());
var selMonth_name = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
var selMonth = 1 + selMonth_name.indexOf($('#selMonth').text());
var selYear = parseInt($('#selYear').text());
LisfofFirms = '<li>1 доктор</li><li>альтмедика</li><li>веромед</li><li>союз врачей</li>';
//**SWITCHES*******************************************/
var oldFirm;
var oldPatient;
var previousElement = '';
var previousDayElement = '';
var selectedPatient = '';
var selectedPatient_text = '';
/**CALL*FUNCTIONS**************************************/

function raiseExeption(note) {
	alert(note);
};

function empty_right_column_with_patients_info() {
	$('.patient_Names').val('');
	$('.textarea_Info').val('');
	$('.textarea_Decease').val('');
};

function update_money_values_in_html_elements(money) {
	$('#global_green_money').text('выручка '+money);
	if (previousDayElement != '') {	previousDayElement.find('.day_money').text(money); };
};
function update_vizovov_values_in_html_elements(vizovov) {
	$('#global_vizovov_count').text('вызовов '+vizovov);
	if (previousDayElement != '') {	previousDayElement.find('.day_vizovov').text(vizovov); };
};

function calendarChange(Month, Year) {
	$.post('/edit/ajax_calendar_change', { Month:Month, Year:Year }, function(data) {
		jsonData = jQuery.parseJSON(data);
		$('#calendarMesh').replaceWith(jsonData.calendar);
		$('#selYear').text(jsonData.year);
		$('#selMonth').text(jsonData.month);
	}, "text");
};

function create_div_for_NewRecord(KeyName, Name11, Name22, Name33) {
	if (KeyName === 'createNewPatient') {
		$('<div class="record"><div class="record_this"><ul class="record_left_col"><li class="name1"> </li><li class="name2"> </li><li class="name3"> </li></ul><ul class="record_right_col"><li><input type="text" class="record_greenMoney" value="0"/></li><li><dl class="record_Firms"><dt><span>пациент</span></dt><dd><ul class="records_FirmsList">'+LisfofFirms+'</ul></dd></dl></li><li><input type="text" class="record_redMoney" value="0"/></li></ul></div></div>').insertAfter('#searchResults');
	} else {
		$.post('/edit/ajax_insert_vizov', { Patient:KeyName, Name1:Name11, Name2:Name22, Name3:Name33, Day:selDay, Month:selMonth, Year:selYear }, function(data) {
    		if (data.charAt(0) != '!') {
    			jsonData = jQuery.parseJSON(data);
    			$('<div class="record"><div class="record_this"><ul class="record_left_col"><li class="name1">'+jsonData.Name1+'</li><li class="name2">'+jsonData.Name2+'</li><li class="name3">'+jsonData.Name3+'</li></ul><ul class="record_right_col"><li><input type="text" class="record_greenMoney" value="0"/></li><li><dl class="record_Firms"><dt><span>пациент</span></dt><dd><ul class="records_FirmsList">'+LisfofFirms+'</ul></dd></dl></li><li><input type="text" class="record_redMoney" value="0"/></li></ul></div></div>').insertAfter('#searchResults');
    			update_vizovov_values_in_html_elements(jsonData.vizovov);
    		} else { raiseExeption("something went wrong updating record's firm field : " + data); };
    	}, "text");
	};
};

function updateMoney(money_color, money, element) { //operations regarding changing money fields
	$.post('/edit/ajax_update_vizov_money', { Patient:oldPatient, colorMoney:money_color, Money:money, Day:selDay, Month:selMonth, Year:selYear }, function(data) {
    	if (data.charAt(0) != '!') { 
    		element.val(money);
    		update_money_values_in_html_elements(data);
    	} else { raiseExeption("something went wrong updating record's firm field : " + data) };
    }, "text");
};
$('#mainColumn2').on("blur", ".record_greenMoney", (function() { 
	oldPatient = $(this).parents('.record_this').find('.record_left_col').text().replace(/(\r\n|\n|\r|\s)/g, "");
	if (oldPatient != '') { updateMoney('green', $(this).val(), $(this)); };
}) );
$('#mainColumn2').on("blur", ".record_redMoney", (function() { 
	oldPatient = $(this).parents('.record_this').find('.record_left_col').text().replace(/(\r\n|\n|\r|\s)/g, "");
	if (oldPatient != '') { updateMoney('red', $(this).val(), $(this)); };
}) );

/**CLICK*EVENTS****************************************/

$('#mainColumn2').on("click", ".record .record_right_col dl dd ul li", function() { //operations regarding selecting firms
	if ($(this).parents('.record_this').find('.record_left_col').text().replace(/(\r\n|\n|\r|\s)/g, "") != '') {
		newFirm = $(this).text();
		selectedElement = $(this);
    	$.post('/edit/ajax_update_vizov_firm', { Patient:oldPatient, oldFirm:oldFirm, newFirm:newFirm, Day:selDay, Month:selMonth, Year:selYear }, function(data) {
    		if (data.charAt(0) != '!') { 
    			selectedElement.parents('.record_Firms').find('dt span').text(data);
    		} else { raiseExeption("something went wrong updating record's firm field : " + data) };
    	}, "text");
    	$('.record_Firms dd ul').hide("fast");
    };
});
$('#mainColumn2').on("click", ".record .record_right_col dl dt span", function() { //show dropdown list of firms
	if ($(this).parents('.record_this').find('.record_left_col').text().replace(/(\r\n|\n|\r|\s)/g, "") != '') {
		oldFirm = $(this).text();
		oldPatient = $(this).parents('.record_this').find('.record_left_col').text().replace(/(\r\n|\n|\r|\s)/g, "");
		$('.record_Firms dd ul').hide("fast");
		$(this).parents('.record_Firms').find('dd ul').show("fast");
	};
});

btn_newRecord_Search.on("click", function() { //show search bar
	input_newRecord_Search.val('');
	input_newRecord_Search.slideDown("fast");
});
input_newRecord_Search.keyup(function() { //live search for patients
 if ($(this).val().length > 3) {
	$.post('/edit/ajax_search_patients', { KeyName: $(this).val(), Day:selDay, Month:selMonth, Year:selYear }, function(data) {
		$('#searchResults ul li').remove();
		$('#searchResults').show();
		for (var patient in data) {
			$('#searchResults ul').append('<li><span class="search_Name1">'+data[patient].Name1+'</span> <span class="search_Name2">'+data[patient].Name2+'</span> <span class="search_Name3">'+data[patient].Name3+'</span></li>');
		}
	}, "json");
 } else { $('#searchResults ul li').remove(); };
	//console.log($(this).val());
});
$('#searchResults ul').on("click", "li" ,function() { //create div for new record for existing patients
	var KeyName = $(this).text().replace(/(\r\n|\n|\r|\s)/g, "");
	Name1 = $(this).find('.search_Name1').text();
	Name2 = $(this).find('.search_Name2').text();
	Name3 = $(this).find('.search_Name3').text();
	create_div_for_NewRecord(KeyName, Name1, Name2, Name3);
	$('#searchResults').hide();
	$('#newRecord_inputSearch').hide();
});
$('#btn_newRecord_add').click(function () {//create div for new record
	create_div_for_NewRecord('createNewPatient', 'createNewPatient', 'createNewPatient', 'createNewPatient');
});

$('#mainColumn2').on("click", ".record_left_col", function() { //selecting record
	$('#mainColumn3').css("visibility", "visible");
	$('#mainColumn3').show();
	if (previousElement != '') { previousElement.css("background-color", "#424242"); };
	previousElement = $(this).parents('.record_this');
	$(this).parents('.record_this').css("background-color", "#835885");
	empty_right_column_with_patients_info();
	KeyName = $(this).text().replace(/(\r\n|\n|\r|\s)/g, "");
	selectedPatient_text = KeyName;
	selectedPatient = $(this);
	$.post('/edit/ajax_pull_patient_details', { Patient:KeyName }, function(data) {
		$('#patient_Name1').val(data.Name1); $('#patient_Name2').val(data.Name2); $('#patient_Name3').val(data.Name3); $('#patient_Age').val(data.Age); $('#patient_Street').val(data.Street); $('#patient_House').val(data.House); $('#patient_Apt').val(data.Apt); $('#patient_Porch').val(data.Porch); $('#patient_Floor').val(data.Floor); $('#patient_Passwd').val(data.Passwd); $('#patient_KC').val(data.KC); $('#patient_Tel1').val(data.Tel1); $('#patient_Tel2').val(data.Tel2); $('#textarea_Info').val(data.Note); $('#textarea_Decease').val(data.Decease);
	}, "json");
});

$('#btn_save_info').click(function() { //saving patient's details
	patient = $('#patient_Name1').val()+''+$('#patient_Name2').val()+''+$('#patient_Name3').val();
	oldPatient = selectedPatient_text;
	$.post('/edit/ajax_update_vizov_patient', { Patient:oldPatient, KeyName:patient, Name1:$('#patient_Name1').val(), Name2:$('#patient_Name2').val(), Name3:$('#patient_Name3').val(), Age:$('#patient_Age').val(), Street:$('#patient_Street').val(), Apt:$('#patient_Apt').val(), House:$('#patient_House').val(), Porch:$('#patient_Porch').val(), Passwd:$('#patient_Passwd').val(), Floor:$('#patient_Floor').val(), KC:$('#patient_KC').val(), Tel1:$('#patient_Tel1').val(), Tel2:$('#patient_Tel2').val(), Info:$('#textarea_Info').val(), Decease:$('#textarea_Decease').val(), Day:selDay, Month:selMonth, Year:selYear } ,function(data) {
		if (data.charAt(0) != '!') { 
    		selectedPatient.find('.name1').text($('#patient_Name1').val());
    		selectedPatient.find('.name2').text($('#patient_Name2').val());
    		selectedPatient.find('.name3').text($('#patient_Name3').val());
    		if (data != 'OK') { update_vizovov_values_in_html_elements(data); };
    	} else { raiseExeption("something went wrong updating record's patient info : " + data) };
	}, "text");
	//$('#patient_Name1').val(data.Name1); $('#patient_Name2').val(data.Name2); $('#patient_Name3').val(data.Name3); $('#patient_Age').val(data.Age); $('#patient_Street').val(data.Street); $('#patient_House').val(data.House); $('#patient_Apt').val(data.Apt); $('#patient_Porch').val(data.Porch); $('#patient_Floor').val(data.Floor); $('#patient_Passwd').val(data.Passwd); $('#patient_KC').val(data.KC); $('#patient_Tel1').val(data.Tel1); $('#patient_Tel2').val(data.Tel2); $('#textarea_Info').val(data.Note); $('#textarea_Decease').val(data.Decease);
});

$('#mainColumn1').on("click", "#calendarMesh .days_not_empty", function() {//selecting day in calendar
	$('.record').remove();
	$('#mainColumn2').show();
	$('#mainColumn3').hide();
	if (previousDayElement != '') { previousDayElement.css("background-color", previousDayElementBG); };
	previousDayElement = $(this);
	previousDayElementBG = $(this).css("background-color");
	$(this).css("background-color", "#242424");
	selDay = parseInt($(this).find('.day_work').text());
	$.post('/edit/ajax_pull_vizovs', { Day:selDay, Month:selMonth, Year:selYear }, function(data) {
		money = 0; vizovov = 0;
		for (var patient in data) {
			money = money + data[patient].GreenMoney;
			vizovov = vizovov + 1;
			$('<div class="record"><div class="record_this"><ul class="record_left_col"><li class="name1">'+data[patient].Name1+'</li><li class="name2">'+data[patient].Name2+'</li><li class="name3">'+data[patient].Name3+'</li></ul><ul class="record_right_col"><li><input type="text" class="record_greenMoney" value="'+data[patient].GreenMoney+'"/></li><li><dl class="record_Firms"><dt><span>'+data[patient].Firm+'</span></dt><dd><ul class="records_FirmsList">'+LisfofFirms+'</ul></dd></dl></li><li><input type="text" class="record_redMoney" value="'+data[patient].RedMoney+'"/></li></ul></div></div>').insertAfter('#searchResults');
		};
		$('#selectedDay').text(selDay);
		update_money_values_in_html_elements(money);
		update_vizovov_values_in_html_elements(vizovov);
	}, "json");

});



$('#year_back_btn').click(function() {
	selYear = selYear - 1;
	calendarChange(selMonth, selYear);
	$('#mainColumn2').hide();
});
$('#year_forward_btn').click(function() {
	selYear = selYear + 1;
	calendarChange(selMonth, selYear);
	$('#mainColumn2').hide();
});
$('#month_back_btn').click(function() {
	if (selMonth === 1) { selMonth = 12; selYear = selYear - 1; } else { selMonth = selMonth - 1; };
	calendarChange(selMonth, selYear);
	$('#mainColumn2').hide();
});
$('#month_forward_btn').click(function() {
	if (selMonth === 12) { selMonth = 1; selYear = selYear + 1; } else { selMonth = selMonth + 1; };
	calendarChange(selMonth, selYear);
	$('#mainColumn2').hide();
});

$('#label_patient_info').click(function() {
	$('#label_patient_info').css("background-color", "#50B72A");
	$('#label_patient_decease').css("background-color", "#F36825");
	$('#textarea_Info').show();
	$('#textarea_Decease').hide();
});
$('#label_patient_decease').click(function() {
	$('#label_patient_decease').css("background-color", "#50B72A");
	$('#label_patient_info').css("background-color", "#F36825");
	$('#textarea_Decease').show();
	$('#textarea_Info').hide();
});

$(document).ready(function() {
	$('#mainColumn2').hide();
});