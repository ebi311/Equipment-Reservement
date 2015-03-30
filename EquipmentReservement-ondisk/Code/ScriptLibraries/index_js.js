$(document).ready( function() {

	// page is now ready, initialize the calendar...

		$('#calendar').fullCalendar(
				{
					header : {
						left : 'title',
						center : '',
						right : 'today prev,next, month, agendaWeek, agendaDay'
					},
					defaultView : 'agendaDay',
					allDaySlot : false,
					firstDay : 1,
					timeFormat : {
						agenda : 'HH:mm{ - HH:mm}',
						'' : 'HH:mm'
					},
					dayNames : [ '日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日',
							'土曜日' ],
					dayNamesShort : [ '日', '月', '火', '水', '木', '金', '土' ],
					monthNames : [ '1月', '2月', '3月', '4月', '5月', '6月', '7月',
							'8月', '9月', '10月', '11月', '12月' ],
					monthNamesShort : [ '1月', '2月', '3月', '4月', '5月', '6月',
							'7月', '8月', '9月', '10月', '11月', '12月' ],
					titleFormat : {
						month : 'yyyy / M',
						week : 'yyyy/M/d { - yyyy/M/d}',
						day : 'yyyy/M/d dddd'
					},
					columnFormat : {
						month : 'ddd',
						week : 'M/d ddd',
						day : 'M/d dddd'
					},
					minTime : 8,
					maxTime : 20,
					snapMinutes : 30,
					slotMinutes : 30,
					axisFormat : 'HH:mm',
					slotEventOverlap : false,
					selectable : true,
					unselectAuto : false,
					selectHelper : true,
					editable : true,
					select : calendar.select,
					eventClick : calendar.eventClick,
					eventResize : calendar.dragOrResize,
					eventDrop : calendar.dragOrResize,
					viewRender : calendar.getEvents
				});

		// date time picker
		$('#reservatiomModal_date').datetimepicker(calendar.datePickerOption);
		$('#reservatiomModal_startTime').datetimepicker(
				calendar.timePickerOption);
		$('#reservatiomModal_endTime')
				.datetimepicker(calendar.timePickerOption);

		$('#reservatiomModal').on('show.bs.modal', function(e) {
		});
		$('#reservatiomModal').on(
				'hide.bs.modal',
				function(e) {
					$('#calendar').fullCalendar('unselect');
					// error表示を解除
					$('.has-error', $('#reservatiomModal')).removeClass(
							'has-error');

				});
		// 保存ボタンをおした時の処理
		$('#modalForm').on('submit', calendar.modifyReservation);
		$('#reserve').click( function() {
			calendar.method = 'POST';
			$('#modalForm').submit();
		});
		$('#update').click( function() {
			calendar.method = 'PUT';
			$('#modalForm').submit();
		});
		$('#remove').click( function() {
			calendar.method = 'DELETE';
			$('#modalForm').submit();
		});
		$('#message').hide();
		// 詳細ダイアログの設備選択ドロップリストの選択肢のセット
		calendar.setEquipmentItems();
	});
var calendar = {};
calendar.method;
calendar.datetimeFormatString = 'yyyy/MM/dd HH:mm';
calendar.dateFormatString = 'yyyy/MM/dd';
calendar.timeFormatString = 'HH:mm';
calendar.datePickerOption = {
	timepicker : false,
	format : 'Y/m/d',
	lang : 'ja'
};
calendar.timePickerOption = {
	datepicker : false,
	format : 'H:i',
	lang : 'ja',
	step : 30,
	minTime : '08:00',
	maxTime : '20:00'
};
calendar.select = function select(startDate, endDate, allDay, jsEvent, view) {
	$('#reservatiomModal').modal();
	$('#reservatiomModal_equipment').val('-1');
	var dateStr = $.fullCalendar.formatDate(startDate,
			calendar.dateFormatString);
	$('#reservatiomModal_date').val(dateStr);
	var startTimeStr = $.fullCalendar.formatDate(startDate,
			calendar.timeFormatString);
	$('#reservatiomModal_startTime').val(startTimeStr);
	var endTimeStr = $.fullCalendar.formatDate(endDate,
			calendar.timeFormatString);
	$('#reservatiomModal_endTime').val(endTimeStr);
	$('#reservatiomModal_subscriber').val('');
	$('#reservatiomModal_note').val('');
	$('#update').hide();
	$('#remove').hide();
	$('#reserve').show();
};
calendar.currentEvent = null;
calendar.eventClick = function eventClick(event, jsEvent, view) {
	calendar.currentEvent = event;
	$('#reservatiomModal').modal();
	$('#reservatiomModal_equipment').val(event.equipmentId);
	var dateStr = $.fullCalendar.formatDate(event.start,
			calendar.dateFormatString);
	$('#reservatiomModal_date').val(dateStr);
	var startTimeStr = $.fullCalendar.formatDate(event.start,
			calendar.timeFormatString);
	$('#reservatiomModal_startTime').val(startTimeStr);
	var endTimeStr = $.fullCalendar.formatDate(event.end,
			calendar.timeFormatString);
	$('#reservatiomModal_endTime').val(endTimeStr);
	$('#reservatiomModal_subscriber').val(event.subscriber);
	$('#reservatiomModal_note').val(event.note);
	$('#reservatiomModal_id').val(event.id);
	$('#update').show();
	$('#remove').show();
	$('#reserve').hide();
};
calendar.getEvents = function getEvents(calendarView, element) {
	//現在表示している範囲のイベントデータを取得する
	//var calendarView = $('#calendar').fullCalendar('getView');
	var start = calendarView.visStart.getTime();
	var end = calendarView.visEnd.getTime();
	var url = './api.xsp/reservations?start=' + start + "&end=" + end;
	var events = [];
	$.ajax( {
		url : url,
		method : 'GET',
		dataType : 'json',
		success : function complete(data, textStatus, jqXHR) {
			$('#calendar').fullCalendar('removeEvents');
			$('#calendar').fullCalendar('addEventSource', data);
			$('#calendar').fullCalendar('rerenderEvents');
		}
	});
};
calendar.setEquipmentItems = function setEquipmentItems() {
	$.ajax( {
		url : './api.xsp/equipments',
		method : 'GET',
		dataType : 'json',
		success : function(data) {
			var equipSelect = $('#reservatiomModal_equipment');
			$.each(data, function(i, item) {
				var option = $('<option>');
				option.val(item.id);
				option.html(item.name);
				equipSelect.append(option);
			});
		}
	});
};
//イベントをドラッグしたり、リサイズした時の更新処理
calendar.dragOrResize = function dragOrResize(event) {
	calendar.method = 'PUT';
	var sendData =
		'equipmentId=' + encodeURIComponent(event.equipmentId) +
		'&start=' + encodeURIComponent(event.start.getTime()) +
		'&end=' + encodeURIComponent(event.end.getTime()) +
		'&subscriber=' + encodeURIComponent(event.subscriber) +
		'&note=' + encodeURIComponent(event.note) +
		'&id=' + encodeURIComponent(event.id);
	calendar._send(sendData);
};
calendar.modifyReservation = function modifyReservation(e) {
	e.preventDefault();
	// error表示を解除
	$('.has-error', this).removeClass('has-error');
//	var id = $('#reservatiomModal_id').val();
	var error = false;
	var equipId = $('#reservatiomModal_equipment').val();
	// 選択していない場合はエラー
	if (!equipId || equipId === '' || equipId === '-1') {
		$('#reservatiomModal_equipment').parent().addClass('has-error');
		error = true;
	}
	var subscriber = $('#reservatiomModal_subscriber').val();
	if (!subscriber || subscriber === '') {
		$('#reservatiomModal_subscriber').parent().addClass('has-error');
		error = true;
	}

	var note = $('#reservatiomModal_note').val();
	var date = $('#reservatiomModal_date').val();
	var startTime = $('#reservatiomModal_startTime').val();
	var endTime = $('#reservatiomModal_endTime').val();
	// 日付を合成
	var start = new Date(date + ' ' + startTime + ':00');
	if (start.getTime() === 0 || isNaN(start.getTime())) {
		$('#reservatiomModal_date').parent().parent().addClass('has-error');
		error = true;
	}
	$("#reservatiomModal_start").val(start.getTime());
	var end = new Date(date + ' ' + endTime + ':00');
	if (end.getTime() === 0 || isNaN(end.getTime())) {
		$('#reservatiomModal_date').parent().parent().addClass('has-error');
		error = true;
	}
	// start < end のチェック
	if (end <= start) {
		$('#reservatiomModal_date').parent().parent().addClass('has-error');
		error = true;
	}
	$("#reservatiomModal_end").val(end.getTime());
	var sendData = $(this).serialize();
	if (error) {
		return;
	}
	// 送信
	calendar._send(sendData);
};
calendar._send = function _send(sendData){
	var url = './api.xsp/reservation/?method=' + calendar.method;

	$.ajax( {
		url : url,
		method : 'POST',
		data : sendData,
		dataType : 'json',
		success : function(data) {
			switch(calendar.method){
			case 'POST':
				$('#calendar').fullCalendar('addEventSource', [ data ]);
				break;
			case 'PUT':
				$('#calendar').fullCalendar('removeEvents', data.id);
				$('#calendar').fullCalendar('addEventSource', [ data ]);
				break;
			case 'DELETE':
				$('#calendar').fullCalendar('removeEvents', data.id);
				break;
			}
		},
		complete : function() {
			$('#reservatiomModal').modal('hide');
		}
	});
}