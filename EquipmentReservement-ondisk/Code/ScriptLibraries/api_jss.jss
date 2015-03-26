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
		var resDoc:NotesDocument = entry.getDocument();
		event = api._createCallendarEvent(resDoc);
		ret.push(event);
		entry = entries.getNextEntry();
	}
	return ret;
};
api.getReservation = function getReservation(unid){
	var targetDoc:NotesDocument = database.getDocumentByUNID(unid);
	var ret = {};
	if(!!targetDoc){
		ret = api._createCallendarEvent(targetDoc);
	}
	return ret;
};
api.createReservation = function createReservation(obj){
	var resDoc = database.createDocument();
	resDoc.replaceItemValue('form', 'Reservation');
	resDoc.replaceItemValue('equipmentId', obj.equipmentId);
	resDoc.replaceItemValue('subscriber', obj.subscriber);
	resDoc.replaceItemValue('startDatetime', api._unixTimeToNotesDate(obj.start));
	resDoc.replaceItemValue('endDatetime', api._unixTimeToNotesDate(obj.end));
	resDoc.replaceItemValue('note', obj.note);
	
	resDoc.save(false,false);
	
	return api._createCallendarEvent(resDoc);
};
api.getEquipments = function getEquipments(){
	var ret = [];
	var eqView:NotesView = api._getEquipView();
	var entries = eqView.getAllEntries();
	var entry = entries.getFirstEntry();
	while(!!entry){
		var doc:NotesDocument = entry.getDocument();
		ret.push({
			id: doc.getItemValueString('equipmentId'),
			name: doc.getItemValueString('equipmentName')
		});
		entry = entries.getNextEntry();
	}
	return ret;
};
api._unixTimeToNotesDate = function _unixTimeToNotesDate(unixTime){
	var date = new Date();
	date.setTime(+unixTime);
	var notesDate = session.createDateTime(date);
	return notesDate;
	
};
api._createCallendarEvent = function _createCallendarEvent(doc){
	var event = {
			id : doc.getUniversalID(),
			title: api._createTitle(doc),
			start: doc.getItemValueDateTimeArray('startDatetime')[0].toJavaDate().getTime() / 1000,
			end: doc.getItemValueDateTimeArray('endDatetime')[0].toJavaDate().getTime() / 1000,
			note: doc.getItemValueString('note'),
			subscriber: doc.getItemValueString('subscriber'),
			allDay: false
		}
	return event;
}
api._createTitle = function _createTitle(doc){
	var equipView = api._getEquipView();
	var equipId = doc.getItemValueString('equipmentId');
	var equipDoc = equipView.getDocumentByKey(equipId);
	var equipName = !!equipDoc ? equipDoc.getItemValueString('equipmentName') : '(none)';
	var subscriber = doc.getItemValueString('subscriber');
	return equipName + '[' + subscriber + ']';
};
api._getEquipMangerDb = function _getEquipMangerDb(){
	var equipDb = requestScope.get('equipDb');
	if(!equipDb){
		equipDb = session.getDatabase(null, 'EquipmentManager.nsf');
		requestScope.put('equipDb', equipDb);
	}
	return equipDb;
};
api._getEquipView = function _getEquipView(){
	var equipView = requestScope.get('equipView');
	if(!equipView){
		equipView = (api._getEquipMangerDb()).getView('Equipments');
		requestScope.put('equipView', equipView);
	}
	return equipView;
};
