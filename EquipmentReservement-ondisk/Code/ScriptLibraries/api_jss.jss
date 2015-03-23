var api = {};
api.getEvents = function getEvents(year, month){
	var keys = new java.util.Vector();
	keys.add(year);
	keys.add(month);
	var resView = database.getView('Reservations');
	var entries = resView.getAllEntriesByKey(keys, true);
	var entry:NotesViewEntry = entries.getFirstEntry();
	var ret = [], event;
	while(!!entry){
		print(entry.getDocument().getItemValueDateTimeArray('startDatetime')[0].toJavaDate().getTimezoneOffset());
		event = {
			id : entry.getDocument().getUniversalID(),
			title: entry.getDocument().getItemValueString('equipmentId').substr(0,8),
			start: entry.getDocument().getItemValueDateTimeArray('startDatetime')[0].toJavaDate().getTime(),
			end: entry.getDocument().getItemValueDateTimeArray('endDatetime')[0].toJavaDate().getTime()
		}
		ret.push(event);
		entry = entries.getNextEntry();
	}
	return ret;
};