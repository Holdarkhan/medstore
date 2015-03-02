/*GLOBAL*DOM*VARIABLES************************************/
var panel_of_Years = $('#panel_of_years_wrapper');
var bricks_of_Years = $('.bricks_years');
var panel_of_Months = $('#panel_of_months_wrapper');
var bricks_of_Months = $('.bricks_months');
var table = $('#result_table');
var loading = $('#loading');

var ODoctor_vcounts = $('#OD_vc');
var Veromed_vcounts = $('#Ve_vc');
var Alt_vcounts = $('#Alt_vc');
var Lazarev_vcounts = $('#Laz_vc');
var Volodina_vcounts = $('#Vol_vc');
var Else_vcounts = $('#Else_vc');
var Patients_vcounts = $('#Pat_vc');
var Itogo_vcounts = $('#itogo_vcounts');

var ODoctor_red = $('#OD_red');
var Veromed_red = $('#Ve_red');
var Alt_red = $('#Alt_red');
var Lazarev_red = $('#Laz_red');
var Volodina_red = $('#Vol_red');
var Else_red = $('#Else_red');
var Patients_red = $('#Pat_red');
var Itogo_red = $('#itogo_RED');

var ODoctor_green = $('#OD_green');
var Veromed_green = $('#Ve_green');
var Alt_green = $('#Alt_green');
var Lazarev_green = $('#Laz_green');
var Volodina_green = $('#Vol_green');
var Else_green = $('#Else_green');
var Patients_green = $('#Pat_green');
var Itogo_green = $('#itogo_GREEN');

var Submit_btn = $('#submit');

var Years = []
var Months = []

var sel_color = '#BC0000';
var unsel_color = '#404242';
/***************************************************************/

$(document).ready(function() {
	//
});



//selecting bricks
function bricking(add, el, bricks, slice_len) {
	if (add === true) {
		el.css("background-color", sel_color);
		bricks.push(el.text().substring(0, slice_len));
	} else {
		el.css("background-color", unsel_color);
		for (var i in bricks) {
			if (bricks[i] === el.text().substring(0, slice_len)) {
				bricks.splice(i, 1);
			};
		};
	};
};
//select all months
function brickingAllmonths() {
    console.log('alarm');
    bricks_of_Months.css("background-color", sel_color);
    bricks_of_Months.find('.m_tag').text('1');
    Months = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
};

function MandYbricking(elem, arrayVar, valueLen, elemCSSclass) {
	tag = elem.find(elemCSSclass);
	if (tag.text() === '0') { 
		tag.text('1');
		bricking(true, elem, arrayVar, valueLen);
	} else { 
		tag.text('0');
		bricking(false, elem, arrayVar, valueLen);
	};
};    
bricks_of_Months.on('click', function() {
    MandYbricking($(this), Months, 2, '.m_tag');
});
bricks_of_Years.on('click', function() {
    MandYbricking($(this), Years, 4, '.y_tag');
    console.log(Years);
});

Submit_btn.on('click', function() {
        if (Months.length === 0) { brickingAllmonths(); };
	if (Years.length === 0) { alert('Не выбран год.'); } else {
	    table.hide();
	    loading.show();
	    $.post('/stat/ajax_stat', { Years:Years, Months:Months }, function(data) {
		    ODoctor_vcounts.text(data.count1Doctor); ODoctor_red.text(data.red1Doctor); ODoctor_green.text(data.green1Doctor);
		    Veromed_vcounts.text(data.countVeromed); Veromed_red.text(data.redVeromed); Veromed_green.text(data.greenVeromed);
		    Alt_vcounts.text(data.countAlt); Alt_red.text(data.redAlt); Alt_green.text(data.greenAlt);
		    Lazarev_vcounts.text(data.countDiagnostika); Lazarev_red.text(data.redDiagnostika); Lazarev_green.text(data.greenDiagnostika);
		    Volodina_vcounts.text(data.countVolodina); Volodina_red.text(data.redVolodina); Volodina_green.text(data.greenVolodina);
		    Patients_vcounts.text(data.countPatient); Patients_green.text(data.greenPatient);
		    Else_vcounts.text(data.countElse); Else_red.text(data.redElse); Else_green.text(data.greenElse);
		    Itogo_vcounts.text(data.countAll); Itogo_red.text(data.redAll); Itogo_green.text(data.greenAll);
		    loading.hide();
		    table.show();
	    }, "json");
	};
});
