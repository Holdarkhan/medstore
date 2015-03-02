/*GLOBAL*VARIABLES*/
var checkbox_fio = $('#checkbox_fio');
var checkbox_else = $('#checkbox_else');
var search_input = $('#search_input');
var Panel_Global_search_results_wrapper = $('#search_results_wrapper');
var Panel_loading = $('#loading_panel');

var opt_FIO = 1;
var opt_ELSE = 0;
var color_On = '#F05F3B';
var color_Off = '#404242';

var opt_show = 'hide';
var Years;
var timeoutId;
/*********************************************************************/
//{{{Loading functions
function Loading(s_OR_h) {
	if (s_OR_h === 'show') { Panel_loading.show(); } else {	Panel_loading.hide(); };
};

function showORhide_vizovs(s_or_h, el) {
	if (s_or_h === 'show') {
		el.parent('.search_result').find('.patient_details_vizovs_wrapper').show();
	} else {
		el.parent('.search_result').find('.patient_details_vizovs_wrapper').hide();
	};
};
function showORhide(s_or_h, el) {
	if (s_or_h === 'show') {
		if (el === 'all') {
			Panel_Global_search_results_wrapper.find('.patient_details_address_wrapper').show();
			Panel_Global_search_results_wrapper.find('.patient_details_phones_wrapper').show();
		} else {
			el.parent('.search_result').find('.patient_details_address_wrapper').show();
			el.parent('.search_result').find('.patient_details_phones_wrapper').show();
		};
		opt_show = 'hide';
	} else {
		if (el == 'all') {
			Panel_Global_search_results_wrapper.find('.patient_details_address_wrapper').hide();
			Panel_Global_search_results_wrapper.find('.patient_details_phones_wrapper').hide();
		} else {
			el.parent('.search_result').find('.patient_details_address_wrapper').hide();
			el.parent('.search_result').find('.patient_details_phones_wrapper').hide();
		};
		opt_show = 'show';
	};
};
//}}}
//{{{Generating resulting HTML
function generate_html_result(N1,N2,N3,Street,House,KC,Porch,Passwd,Floor,Apt,Tel1,Tel2,vizovs) {
	if (N1 != '') { html_N1 = '<li>'+N1+'</li>'; } else { html_N1 = ''; };
	if (N2 != '') { html_N2 = '<li>'+N2+'</li>'; } else { html_N2 = ''; };
	if (N3 != '') { html_N3 = '<li>'+N3+'</li>'; } else { html_N3 = ''; };
	if (Street != '' && Street != null) { html_Street = '<div class="patient_details_label">адрес<span class="patient_details_val">'+Street+'</span></div>'; } else { html_Street = ''; };
	if (House != '' && House != null) { html_House = '<div class="patient_details_label">дом<span class="patient_details_val">'+House+'</span></div>'; } else { html_House = ''; };
	if (KC != '' && KC != null) { html_KC = '<div class="patient_details_label">корпус/строение<span class="patient_details_val">'+KC+'</span></div>'; } else { html_KC = ''; };
	if (Porch != '' && Porch != null) { html_Porch = '<div class="patient_details_label">подъезд<span class="patient_details_val">'+Porch+'</span></div>'; } else { html_Porch = ''; };
	if (Passwd != '' && Passwd != null) { html_Passwd = '<div class="patient_details_label">код<span class="patient_details_val">'+Passwd+'</span></div>'; } else { html_Passwd = ''; };
	if (Floor != '' && Floor != null) { html_Floor = '<div class="patient_details_label">этаж<span class="patient_details_val">'+Floor+'</span></div>'; } else { html_Floor = ''; };
	if (Apt != '' && Apt != null) { html_Apt = '<div class="patient_details_label">квартира<span class="patient_details_val">'+Apt+'</span></div>'; } else { html_Apt = ''; };
	if (Tel1 != '' || Tel2 != '') {
		if (Tel1 != '') { html_Tel1 = '<div class="patient_detail_phone_val">'+Tel1+'</div>'; } else { html_Tel1 = ''; };
		if (Tel2 != '') { html_Tel2 = '<div class="patient_detail_phone_val">'+Tel2+'</div>'; } else { html_Tel2 = ''; };
		html_tels = '<div class="patient_details_phones_wrapper"><div class="patient_detail_else_label">телефоны</div>'+html_Tel1+html_Tel2+'</div>';
	} else { html_tels = ''; };
	html='\
		<div class="search_result">\
			<ul class="patient_fio">'+html_N2+html_N1+html_N3+'</ul>\
			<div class="patient_details_address_wrapper">'+html_Street+html_House+' '+html_KC+' '+html_Porch+' '+html_Passwd+' '+html_Floor+' '+html_Apt+'</div>'+html_tels+'\
			<div class="patient_detail_vizovs_label">вызовы</div><div class="patient_details_vizovs_wrapper"><table class="vizovi">'+vizovs+'</table></div>\
		</div>\
	';
	return html;
};
//}}}
function search_FIO(text) {
	opt_show = 'hide';
	$.post('/search/ajax_search', { TEXT:text }, function(data) {
		if (data.Error != 'Something went wrong') {
			for (record in data) {
				N1 = data[record].Name1;
				N2 = data[record].Name2;
				N3 = data[record].Name3;
				var str = new RegExp('('+text+')', 'gi');
				N1 = N1.replace(str, '<span class="highlighted">$1</span>');
				N2 = N2.replace(str, '<span class="highlighted">$1</span>');
				N3 = N3.replace(str, '<span class="highlighted">$1</span>');
				Street = data[record].Street;
				Street = Street.replace(str, '<span class="highlighted">$1</span>');
				House = data[record].House;
				KC = data[record].KC;
				Porch = data[record].Porch;
				Passwd = data[record].Passwd;
				Floor = data[record].Floor;
				Apt = data[record].Apt;
				Tel1 = data[record].Tel1;
				Tel2 = data[record].Tel2;
				Tel1 = Tel1.replace(str, '<span class="highlighted">$1</span>');
				Tel2 = Tel2.replace(str, '<span class="highlighted">$1</span>');
				vizovs = '';
				html = '';
				for (var i=0; i<data[record].CountDetails; i++) {
					if (data[record].Details[i].RED === 0) { RED_val = ''; } else { RED_val = '</span><span class="brick_red">'+data[record].Details[i].RED+'</span>'; };
					html = html + '<tr><td class="bricks_left"><span class="brick_date">'+data[record].Details[i].Year+'</span><span class="brick_date">'+data[record].Details[i].Month+'</span><span class="brick_date">'+data[record].Details[i].Day+'</span></td>\
					<td class="bricks_right"><span class="brick_date">'+data[record].Details[i].Firm+'</span>'+RED_val+'<span class="brick_green">'+data[record].Details[i].GREEN+'</span></td></tr>\
					<tr><td><textarea readonly>'+data[record].Details[i].Note+'</textarea></td><td><textarea readonly>'+data[record].Details[i].Decease+'</textarea></td></tr>';
				};
				vizovs = html;
				Panel_Global_search_results_wrapper.append(generate_html_result(N1,N2,N3,Street,House,KC,Porch,Passwd,Floor,Apt,Tel1,Tel2,vizovs));
				showORhide(opt_show, 'all');
			};
		} else { alert('Something went wrong'); };
		Loading('hide');
	}, "json");
};

search_input.on('keyup', function() {
	var curVal = $(this).val();
	clearTimeout(timeoutId);
	if (curVal.length > 3) {
		Panel_Global_search_results_wrapper.find('*').remove();
		Loading('show');
		timeoutId = setTimeout(function() {
			search_FIO(curVal);
		}, 2000);
	} else {
		Panel_Global_search_results_wrapper.find('*').remove();
	};
});

//checkbox_fio.on('click', function() {
//	if (opt_FIO === 0) {
//		opt_FIO = 1;
//		$(this).css("background-color", color_On);
//	} else {
//		opt_FIO = 0;
//		$(this).css("background-color", color_Off);
//	};
//});
//checkbox_else.on('click', function() {
//	if (opt_ELSE === 0) {
//		opt_ELSE = 1;
//		$(this).css("background-color", color_On);
//	} else {
//		opt_ELSE = 0;
//		$(this).css("background-color", color_Off);
//	};
//});

Panel_Global_search_results_wrapper.on('click', '.patient_fio', function() {
	if ($(this).parent('.search_result').children('.patient_details_address_wrapper').is(":visible")) {
		showORhide('hide', $(this));
	} else {
		showORhide('show', $(this));
	};
});

Panel_Global_search_results_wrapper.on('click', '.patient_detail_vizovs_label', function() {
	if ($(this).parent('.search_result').children('.patient_details_vizovs_wrapper').is(":visible")) {
		showORhide_vizovs('hide', $(this));
	} else {
		showORhide_vizovs('show', $(this));
	};
});

$(document).ready(function() {
	search_input.val('');
	//showORhide('show');
});

