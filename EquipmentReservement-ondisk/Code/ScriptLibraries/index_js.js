$(document).ready(function() {

    // page is now ready, initialize the calendar...

    $('#calendar').fullCalendar({
    	header: {
    	    left:   'title',
    	    center: '',
    	    right:  'today prev,next, month, agendaWeek, agendaDay'
    	},
    	defaultView: "agendaDay",
    	firstDay : 1,
    	timeFormat: {
    	    agenda: 'HH:mm{ - HH:mm}', // 5:00 - 6:30
    	    '': 'HH(:mm)'            // 7p
    	},
    	dayNames :["日曜日","月曜日","火曜日","水曜日","木曜日","金曜日","土曜日"],
    	dayNamesShort :["日","月","火","水","木","金","土"],
    	monthNames : ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"],
    	monthNamesShort  : ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"],
    	titleFormat :{
    	    month: 'yyyy / M',
    	    week: "yyyy/M/d { '&#8212;'yyyy/M/d}",
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
    	axisFormat : "HH:mm",
    	slotEventOverlap : false,
    	selectable : true,
    	selectHelper : true
    })

});