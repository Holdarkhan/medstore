$('body').on("click", ".tdBricks", function() {
	if ($(this).hasClass("brickSelected") === true) {
		$(this).removeClass("brickSelected");
	} else {
		$(this).addClass("brickSelected");
	};
});

$('#button').click(function() {
	if ($('.tdY').hasClass('brickSelected') && $('.tdM').hasClass('brickSelected')) {
		var yValues = {};
		var mValues = {};
		yValues = '';
		mValues = '';
		total = 0;
		$('#Years_bricks').find('.brickSelected').each(function(index) {
			yValues += $(this).text();
			total = index+1;
		});
		POSTyearsData = total+yValues;
		if (total<10) { POSTyearsData = '0'+POSTyearsData; };
		$('#Months_bricks').find('.brickSelected .mBricks_number').each(function(index) {
			mValues += $(this).text();
			total = index+1;
		});
		POSTmonthsData = total+mValues;
		if (total<10) { POSTmonthsData = '0'+POSTmonthsData; };
		$.post('/stat/query', {Years:POSTyearsData, Months:POSTmonthsData}, function(data) {
			$('#redMoney_Doctor_value').text(data.red1Doctor); $('#greenMoney_Doctor_value').text(data.green1Doctor);
			$('#redMoney_Veromed_value').text(data.redVeromed); $('#greenMoney_Veromed_value').text(data.greenVeromed);
			$('#redMoney_Alt_value').text(data.redAlt); $('#greenMoney_Alt_value').text(data.greenAlt);
			$('#redMoney_Dia_value').text(data.redDiagnostika); $('#greenMoney_Dia_value').text(data.greenDiagnostika);
			$('#redMoney_Volodina_value').text(data.redVolodina); $('#greenMoney_Volodina_value').text(data.greenVolodina);
			$('#greenMoney_Patients_value').text(data.greenPatient);
			firmElse_red = data.redAll - (data.red1Doctor+data.redVeromed+data.redAlt+data.redDiagnostika+data.redVolodina);
			firmElse_green = data.greenAll - (data.green1Doctor+data.greenVeromed+data.greenAlt+data.greenDiagnostika+data.greenVolodina+data.greenPatient);
			$('#redMoney_Else_value').text(firmElse_red); $('#greenMoney_Else_value').text(firmElse_green);
			$('#redMoney_Itogo_value').text(data.redAll); $('#greenMoney_Itogo_value').text(data.greenAll); 
		}, "json");
		//console.log(POSTyearsData+' '+POSTmonthsData);
	};

	/*$.post('/edit/ajax_insert_vizov', { Patient:KeyName, Name1:Name11, Name2:Name22, Name3:Name33, Day:selDay, Month:selMonth, Year:selYear }, function(data) {
    		if (data.charAt(0) != '!') {
    			jsonData = jQuery.parseJSON(data);
    			$('<div class="record"><div class="record_this"><ul class="record_left_col"><li class="name1">'+jsonData.Name1+'</li><li class="name2">'+jsonData.Name2+'</li><li class="name3">'+jsonData.Name3+'</li></ul><ul class="record_right_col"><li><input type="text" class="record_greenMoney" value="0"/></li><li><dl class="record_Firms"><dt><span>пациент</span></dt><dd><ul class="records_FirmsList">'+LisfofFirms+'</ul></dd></dl></li><li><input type="text" class="record_redMoney" value="0"/></li></ul></div></div>').insertAfter('#searchResults');
    			update_vizovov_values_in_html_elements(jsonData.vizovov);
    		} else { raiseExeption("something went wrong updating record's firm field : " + data); };
    	}, "text");*/
});