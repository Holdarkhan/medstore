/*GLOBAL*/
var html_Street = '<span class="label">адрес</span>';
var html_House = '<span class="label">дом</span>';
var html_KC = '<span class="label">к/с</span>';
var html_Porch = '<span class="label">под.</span>';
var html_Passwd = '<span class="label">код</span>';
var html_Floor = '<span class="label">этаж</span>';
var html_Apt = '<span class="label">кв.</span>';
var html_Tel = '<span class="label">телефон</span>';
var html_val_open = '<span class="label_value">';
var html_val_close = '</span>';

var searchInputElement = $('#search_input');
var activeBG = '#F36825';

var SearchOtherFields_switcher = 'Names';
var switcher_Names = 'Active';
var switcher_Others = 'Deactive';

/****************************************************/
function highlighting(str, searched) {
	var re = new RegExp(searched, 'g');
	return str.replace(re, '<span class="searched_str">'+searched+'</span>');
};

$('#search_input_switcher_Names').click(function() {
	if (switcher_Names != 'Active') {
		switcher_Names = 'Active';
		$(this).css("background-color", activeBG);
	} else {
		switcher_Names = 'Deactive';
		$(this).css("background-color", 'gray');
	};
});
$('#search_input_switcher_Address').click(function() {
	if (switcher_Others != 'Active') {
		switcher_Others = 'Active';
		$(this).css("background-color", activeBG);
	} else {
		switcher_Others = 'Deactive';
		$(this).css("background-color", 'gray');
	};
});

$('#search_input').keyup(function() {
 if ($(this).val().length < 3) { $('.search_result_wrapper').remove(); };
 if ($(this).val().length > 3) {
	$('.search_result_wrapper').remove();
	if ($(this).val() != '') {
	if (switcher_Names === 'Active' && switcher_Others === 'Deactive') { SearchOtherFields_switcher = 'Names'; };
	if (switcher_Names === 'Active' && switcher_Others === 'Active') { SearchOtherFields_switcher = 'All'; };
	if (switcher_Names === 'Deactive' && switcher_Others === 'Active') { SearchOtherFields_switcher = 'Fields'; };
	if (switcher_Names === 'Deactive' && switcher_Others === 'Deactive') { SearchOtherFields_switcher = 'None'; };
	$.post('/search/ajax_search', { Search:$(this).val(), SearchOtherFields:SearchOtherFields_switcher }, function(data) {
		for (var record in data) {
			data[record].Name1 = highlighting(data[record].Name1, searchInputElement.val());
			data[record].Name2 = highlighting(data[record].Name2, searchInputElement.val());
			data[record].Name3 = highlighting(data[record].Name3, searchInputElement.val());
			data[record].Street = highlighting(data[record].Street, searchInputElement.val());
			data[record].Tel1 = highlighting(data[record].Tel1, searchInputElement.val());
			data[record].Tel2 = highlighting(data[record].Tel2, searchInputElement.val());
			data[record].Note = highlighting(data[record].Note, searchInputElement.val());
			data[record].Decease = highlighting(data[record].Decease, searchInputElement.val());
			if (data[record].KC === null) { data[record].KC = ''; };
			if (data[record].Passwd === null) { data[record].Passwd = ''; };
			if (data[record].Floor === null) { data[record].Floor = ''; };

			var html_result_par1 = '<div class="search_result_wrapper"><table class="patient_result"><tr><td class="patient_namesColumn nameValue">'+data[record].Name1+'</td><td>';
			if (data[record].Street != '') { var html_result_par2 = html_Street+html_val_open+data[record].Street+html_val_close; } else { var html_result_par2 = ''; };
			if (data[record].House != '') { var html_result_par3 = html_House+html_val_open+data[record].House+html_val_close; } else { var html_result_par3 = ''; };
			var html_result_par4 = '</td><td class="patient_Info" rowspan="3"><textarea rows="3">'+data[record].Note+'</textarea></td><td class="patient_Decease" rowspan="3"><textarea rows="3">'+data[record].Decease+'</textarea></td></tr>';
			var html_result_par5 = '<tr><td class="patient_namesColumn nameValue">'+data[record].Name2+'</td><td>';
			if (data[record].KC != '') { var html_result_par6 = html_KC+html_val_open+data[record].KC+html_val_close; } else { var html_result_par6 = ''; };
			if (data[record].Porch != '') { var html_result_par7 = html_Porch+html_val_open+data[record].Porch+html_val_close; } else { var html_result_par7 = ''; };
			if (data[record].Passwd != '') { var html_result_par8 = html_Passwd+html_val_open+data[record].Passwd+html_val_close; } else { var html_result_par8 = ''; };
			if (data[record].Floor != '') { var html_result_par9 = html_Floor+html_val_open+data[record].Floor+html_val_close; } else { var html_result_par9 = ''; };
			if (data[record].Apt != '') { var html_result_par10 = html_Apt+html_val_open+data[record].Apt+html_val_close; } else { var html_result_par10 = ''; };
			var html_result_par11 = '</td></tr><tr><td class="patient_namesColumn"><span class="nameValue">'+data[record].Name3+'</span><span class="label">В</span>'+data[record].Age+'</td><td>';
			if (data[record].Tel1 != '') { var html_result_par12 = html_Tel+html_val_open+data[record].Tel1+html_val_close; } else { var html_result_par12 = ''; };
			if (data[record].Tel2 != '') { var html_result_par13 = html_Tel+html_val_open+data[record].Tel2+html_val_close; } else { var html_result_par13 = ''; };
			var html_result_par14 = '</td></tr></table><div class="btn_down">история вызовов</div></div>';
			var html_result = html_result_par1+html_result_par2+html_result_par3+html_result_par4+html_result_par5+html_result_par6+html_result_par7+html_result_par8+html_result_par9+html_result_par10+html_result_par11+html_result_par12+html_result_par13+html_result_par14;
			$('<br><br>'+html_result).insertAfter('#search_input_switcher_Address');
		};
	}, "json");
	};
 };
});

$('body').on("click", ".btn_down", function() {
	var KeyName = $(this).parents('.search_result_wrapper').find('.nameValue').text();
	elem = $(this);
	var html_str_day = '';
	var html_str_month = '';
	$.post('/search/ajax_search_detailed', { Patient:KeyName }, function(data) {
		/*rowspan = 0;
		for (obj in data) {
			record = data[obj];
			$.each(record, function(Year, Year_val) {
				$.each(Year_val, function(temp_key, temp_val) {
					Month_record = Year_val[temp_key];
					$.each(Month_record, function(month_key, month_val) {
						for (d in month_val) {
							//console.log(Year+'-'+month_key+'-'+month_val[d].Day);
							html_str_day = html_str_day+'<td class="col_Day">'+month_val[d].Day+'</td><td class="col_Detail"><div class="greenMoney">'+month_val[d].GreenMoney+'</div><span class="firm">'+month_val[d].Firm+'</span><div class="redMoney">'+month_val[d].RedMoney+'</div></td>';
						};
						rowspan = parseInt(d) + 1;
						html_str_month = '<td class="col_Month" rowspan="'+rowspan+'">'+month_key+'</td>';
					});
				});
			});
		};*/
	}, "json");
});

$(document).ready(function() {
	$('#search_input').val('');
});