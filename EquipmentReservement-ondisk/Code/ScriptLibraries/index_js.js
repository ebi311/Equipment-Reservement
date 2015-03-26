$(document).ready(function() {

    // page is now ready, initialize the calendar...

    $('#calendar').fullCalendar({
    	header: {
    	    left:   'title',
    	    center: '',
    	    right:  'today prev,next, month, agendaWeek, agendaDay'
    	},
    	defaultView: 'agendaDay',
    	allDaySlot : false,
    	firstDay : 1,
    	timeFormat: {
    	    agenda: 'HH:mm{ - HH:mm}',
    	    '': 'HH(:mm)'
    	},
    	dayNames :['日曜日','月曜日','火曜日','水曜日','木曜日','金曜日','土曜日'],
    	dayNamesShort :['日','月','火','水','木','金','土'],
    	monthNames : ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'],
    	monthNamesShort  : ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'],
    	titleFormat :{
    	    month: 'yyyy / M',
    	    week: 'yyyy/M/d { - yyyy/M/d}',
    	    day: 'yyyy/M/d dddd'
    	},
    	columnFormat :{
    	    month: 'ddd',
    	    week: 'M/d ddd',
    	    day: 'M/d dddd'
    	},
    	minTime: 8,
    	maxTime: 20,
    	snapMinutes : 30,
    	slotMinutes : 30,
    	axisFormat : 'HH:mm',
    	slotEventOverlap : false,
    	selectable : true,
    	unselectAuto : false,
    	selectHelper : true,
    	hiddenDays : [0,6],
    	select : calendar.select,
    	editable: true
    });

    //date time picker
    $('#reservatiomModal_date').datetimepicker(calendar.datePickerOption);
    $('#reservatiomModal_startTime').datetimepicker(calendar.timePickerOption);
    $('#reservatiomModal_endTime').datetimepicker(calendar.timePickerOption);
    
    $('#reservatiomModal').on('show.bs.modal', function(e){
    });
    $('#reservatiomModal').on('hide.bs.modal', function(e){
    	$('#calendar').fullCalendar( 'unselect' );
    	//error表示を解除
    	$('.has-error', $('#reservatiomModal')).removeClass('has-error');
    	
    });
    
    calendar.getEvent();
    
    $('#modalForm').on('submit', calendar.postEvent);
    $('#reserve').click(function (){
    	$('#modalForm').submit();
    });
    $('#message').hide();
    //詳細ダイアログの設備選択ドロップリストの選択肢のセット
    calendar.setEquipmentItems();
});
var calendar ={};
calendar.datetimeFormatString = 'yyyy/MM/dd HH:mm';
calendar.dateFormatString = 'yyyy/MM/dd';
calendar.timeFormatString = 'HH:mm';
calendar.datePickerOption = {
	timepicker: false,
	format: 'Y/m/d',
	lang: 'ja'
};
calendar.timePickerOption = {
	datepicker:false,
	format:'H:i',
	lang: 'ja',
	step: 30,
	minTime: '08:00',
	maxTime: '20:00'
};
calendar.select = function select(startDate, endDate, allDay, jsEvent, view){
	$('#reservatiomModal').modal();
	$('#reservatiomModal_equipment').val('-1');
	var dateStr = 
		$.fullCalendar.formatDate( startDate, calendar.dateFormatString);
	$('#reservatiomModal_date').val(dateStr);
	var startTimeStr = 
		$.fullCalendar.formatDate( startDate, calendar.timeFormatString);
	$('#reservatiomModal_startTime').val(startTimeStr);
	var endTimeStr = 
		$.fullCalendar.formatDate( endDate, calendar.timeFormatString);
	$('#reservatiomModal_endTime').val(endTimeStr);
	$('#reservatiomModal_subscriber').val('');
	$('#reservatiomModal_note').val('');
	
};
calendar.getEvent = function getEvent(){
	//現在の月を取得する
	var currentDate = $('#calendar').fullCalendar('getDate');
	var year = $.fullCalendar.formatDate(currentDate, 'yyyy');
	var month = $.fullCalendar.formatDate(currentDate, 'MM');
	//月のすべてのエントリーを取得する
	var url = './api.xsp/reservations?year=' + year + "&month=" + month;
	var events = [];
	$.ajax({
		url: url,
		method: 'GET',
		dataType: 'json',
		success: function complete(data, textStatus, jqXHR){
			$('#calendar').fullCalendar('addEventSource', data);
			$('#calendar').fullCalendar('rerenderEvents');
		}
	});
};
calendar.setEquipmentItems = function setEquipmentItems(){
	$.ajax({
		url : './api.xsp/equipments',
		method: 'GET',
		dataType: 'json',
		success: function(data){
			var equipSelect = $('#reservatiomModal_equipment');
			$.each(data, function(i, item){
				var option = $('<option>');
				option.val(item.id);
				option.html(item.name);
				equipSelect.append(option);
			});
		}
	});
};
calendar.postEvent = function postEvent(e){
	e.preventDefault();
	//error表示を解除
	$('.has-error', this).removeClass('has-error');
	var equipId = $('#reservatiomModal_equipment').val();
	var error = false;
	//選択していない場合はエラー
	if(!equipId || equipId === '' || equipId === '-1'){
		$('#reservatiomModal_equipment')
			.parent()
			.addClass('has-error');
		error = true;
	}
	var subscriber = $('#reservatiomModal_subscriber').val();
	if(!subscriber || subscriber === ''){
		$('#reservatiomModal_subscriber')
			.parent()
			.addClass('has-error');
		error = true;
	}
	
	var note = $('#reservatiomModal_note').val();
	var date = $('#reservatiomModal_date').val();
	var startTime = $('#reservatiomModal_startTime').val();
	var endTime = $('#reservatiomModal_endTime').val();
	//日付を合成
	var start = new Date(date+' '+startTime+':00');
	if(start.getTime() === 0 || isNaN(start.getTime())){
		$('#reservatiomModal_date')
			.parent().parent()
			.addClass('has-error');
		error = true;
	}
	$("#reservatiomModal_start").val(start.getTime());
	var end = new Date(date+' '+endTime+':00');
	if(end.getTime() === 0 || isNaN(end.getTime())){
		$('#reservatiomModal_date')
			.parent().parent()
			.addClass('has-error');
		error = true;
	}
	$("#reservatiomModal_end").val(end.getTime());
	var sendData = $(this).serialize();
	if(error){
		return;
	}
	//送信
	var url = './api.xsp/reservation/';
	
	$.ajax({
		url : url,
		method: 'POST',
		data : sendData,
		dataType: 'json',
		success: function(data){
			$('#calendar').fullCalendar('addEventSource', data);
		},
		complete: function(){
			$('#reservatiomModal').modal('hide');
		}
	});
}