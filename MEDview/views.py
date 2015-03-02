# Create your views here.
# -*- coding: utf-8 -*-
from array import *
from django.db.models import Max, Sum, Q
from django.http import HttpResponse
from django.core import serializers
from django.core.exceptions import ObjectDoesNotExist
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.cache import never_cache
from django.shortcuts import render, render_to_response
from MEDview.models import Patients, Vizov

import django.utils.simplejson as json
import locale
import datetime, time
import calendar
import json
import re

locale.setlocale(locale.LC_ALL, 'ru_RU.UTF-8')
#<<<Building calendar HTML
def calendar_days_define(cMonth, cYear):
	MyCalendar = []
	tmp = []
	day = []
	elInx = 0
	calendarMatrix = calendar.monthcalendar(cYear, cMonth)
	for element in calendarMatrix:
		elInx += 1
		MyCalendar.append('<tr class="calendar_daysRow">')
		weekday = 0
		for i in element:
			weekday += 1 
			vizovov = Vizov.objects.filter(Day=i, Month=cMonth, Year=cYear).count()
			if weekday > 5:
				if i > 0:
					if vizovov == 0:
						MyCalendar.append('<td class="days_Weekends_days days_not_empty"><div class="day_vizovov_hidden"><br></div><div class="day_work">{0}</div><div class="day_money_hidden"><br></div></td>'.format(i))
					else:
						money = Vizov.objects.filter(Day=i, Month=cMonth, Year=cYear).aggregate(Sum('GreenMoney'))
						MyCalendar.append('<td class="days_Weekends_days days_not_empty"><div class="day_vizovov">{0}</div><div class="day_work">{2}</div><div class="day_money">{1}</div></td>'.format(vizovov, money['GreenMoney__sum'], i))
				else:
					MyCalendar.append('<td class="days_Weekends_days days_empty"></td>')
			else:
				if i > 0:
					if vizovov == 0:
						MyCalendar.append('<td class="days_Works_days days_not_empty"><div class="day_vizovov_hidden"><br></div><div class="day_work">{0}</div><div class="day_money_hidden"><br></div></td>'.format(i))
					else:
						money = Vizov.objects.filter(Day=i, Month=cMonth, Year=cYear).aggregate(Sum('GreenMoney'))
						MyCalendar.append('<td class="days_Works_days days_not_empty"><div class="day_vizovov">{0}</div><div class="day_work">{2}</div><div class="day_money">{1}</div></td>'.format(vizovov, money['GreenMoney__sum'], i))
				else:
					MyCalendar.append('<td class="days_Works_days days_empty"></td>')
		MyCalendar.append('</tr>')
	DoneCalendar = ''.join(MyCalendar)
	DoneCalendar = '<table id="calendarMesh"><tr id="calendar_weeksRow"><td>п</td><td>в</td><td>с</td><td>ч</td><td>п</td><td>с</td><td>в</td></tr>{0}</table>'.format(DoneCalendar)
	return DoneCalendar
#>>>
@csrf_exempt
def changeCalendar(request):
	calendar = calendar_days_define(int(request.POST.get('Month')), int(request.POST.get('Year')))
	month = {1:'Январь', 2:'Февраль', 3:'Март', 4:'Апрель', 5:'Май', 6:'Июнь', 7:'Июль', 8:'Август', 9:'Сентябрь', 10:'Октябрь', 11:'Ноябрь', 12:'Декабрь'}.get(int(request.POST.get('Month'))),
	response = {'calendar':calendar, 'month':month ,'year':request.POST.get('Year')}
	return HttpResponse(json.dumps(response), content_type="application/json")
#<<<Generating content for edit index pages
def index_page_context():
	lastYear = Vizov.objects.all().aggregate(Max('Year'))
	lastMonth = Vizov.objects.all().filter(Year__exact=lastYear['Year__max']).aggregate(Max('Month'))
	lastDay = Vizov.objects.all().filter(Month__exact=lastMonth['Month__max'], Year__exact=lastYear['Year__max']).aggregate(Max('Day'))
	money = Vizov.objects.all().filter(Day__exact=lastDay['Day__max'], Month__exact=lastMonth['Month__max'], Year__exact=lastYear['Year__max']).aggregate(Sum('GreenMoney'))
	records = Vizov.objects.filter(Day=lastDay['Day__max'], Month=lastMonth['Month__max'], Year=lastYear['Year__max'])
	vizovov = Vizov.objects.filter(Day=lastDay['Day__max'], Month=lastMonth['Month__max'], Year=lastYear['Year__max']).count()
	context = {
	'Day': lastDay['Day__max'],
	'Month': {1:'Январь', 2:'Февраль', 3:'Март', 4:'Апрель', 5:'Май', 6:'Июнь', 7:'Июль', 8:'Август', 9:'Сентябрь', 10:'Октябрь', 11:'Ноябрь', 12:'Декабрь'}.get(lastMonth['Month__max']),
	'Year': lastYear['Year__max'],
	'Vizovov': vizovov,
	'Money': money['GreenMoney__sum'],
	'defineCalendar': calendar_days_define(lastMonth['Month__max'], lastYear['Year__max']),
	}
	context['Records'] = records
	return context
#>>>
#full index page	
@never_cache
def index(request): 
	return render(request, 'MEDview/m-Edit.html', index_page_context())
#mobile index page
@never_cache
def mindex(request):
	return render(request, 'MEDview/m-Edit.html', index_page_context())
#<<<live patient search in main page
@csrf_exempt
def searchPatients(request): #live search patients, exept for current day
	if request.POST.get('KeyName') != '':
		try:
			patients_for_today = Vizov.objects.filter(Day=request.POST.get('Day'), Month=request.POST.get('Month'), Year=request.POST.get('Year'))
			today_patients = []
			for patient in patients_for_today:
				today_patients.append(patient.KeyName)
			patients = Vizov.objects.filter(KeyName_id__KeyName__icontains=request.POST.get('KeyName')).exclude(KeyName_id__in=today_patients).order_by('KeyName').distinct('KeyName')
			response = []
			for patient in patients:
				tmpvar = {}
				tmpvar = { 'KeyName':patient.KeyName.KeyName, 'Name1':patient.KeyName.Name1, 'Name2':patient.KeyName.Name2, 'Name3':patient.KeyName.Name3 }
				response.append(tmpvar)
		except Exception as e:
			response = '! : {0} [{1}] '.format(e.message, type(e))
	else:
		response = ''
	return HttpResponse(json.dumps(response), content_type="application/json")
#>>>
#<<<live street search in input
@csrf_exempt
def searchStreet(request):
	if request.POST.get('Street') != '':
		try:
			query = Patients.objects.filter(Street__icontains=request.POST.get('Street')).order_by('Street').distinct('Street')
			response = []
			for street in query:
				tmpvar = {}
				tmpvar = { 'Street':street.Street }
				response.append(street.Street)
		except Exception as e:
			response = '! : {0} [{1}] '.format(e.message, type(e))
	else:
		response = ''
	return HttpResponse(json.dumps(response), content_type="application/json")
#>>>
#<<< Get all vizovs for date
@csrf_exempt
def getVizovs(request):
	try:
		responsejSON = []
		money = Vizov.objects.filter(Day=request.POST.get('Day'), Month=request.POST.get('Month'), Year=request.POST.get('Year')).aggregate(Sum('GreenMoney'))
		vizovs_count = Vizov.objects.filter(Day=request.POST.get('Day'), Month=request.POST.get('Month'), Year=request.POST.get('Year')).count()
		vizovs = Vizov.objects.filter(Day=request.POST.get('Day'), Month=request.POST.get('Month'), Year=request.POST.get('Year'))
		for v in vizovs:
			tmp = {}
			tmp = {'KeyName':v.KeyName_id, 'Name1':v.KeyName.Name1, 'Name2':v.KeyName.Name2, 'Name3':v.KeyName.Name3, 'Firm':v.Firm, 'GreenMoney':v.GreenMoney, 'RedMoney':v.RedMoney, 'Age':v.Age, 'Street':v.KeyName.Street, 'House':v.KeyName.House, 'Apt':v.KeyName.Apt, 'KC':v.KeyName.KC, 'Porch':v.KeyName.Porch, 'Floor':v.KeyName.Floor, 'Passwd':v.KeyName.Passwd, 'Tel1':v.KeyName.Tel1, 'Tel2':v.KeyName.Tel2, 'Note':v.Note, 'Decease':v.Decease};
			responsejSON.append(tmp)
	except Exception as e:
		response = {'Status': 'Error', 'Detail': '{0} [{1}] '.format(e.message, type(e))}
	return HttpResponse(json.dumps(responsejSON), mimetype="application/json")
#>>>
#<<< Updating or inserting new records
def records_Inserting_Updating(MODE, KN, Day, Month, Year, N1='', N2='', N3='', Firm='пациент', RED='0', GREEN='0', Age='', Street='', House='', KC='', Porch='', Passwd='', Floor='', Apt='', Tel1='', Tel2='', Note='', Decease=''):
	if MODE == 'insert_v_with_newPat':
		try:
			newVizov = Vizov(KeyName_id=KN, Firm=Firm, RedMoney=RED, GreenMoney=GREEN, Day=Day, Month=Month, Year=Year, Age=Age, Note=Note, Decease=Decease)
			newPatient = Patients(KeyName=KN, Name1=N1, Name2=N2, Name3=N3, Street=Street, House=House, KC=KC, Porch=Porch, Passwd=Passwd, Floor=Floor, Apt=Apt, Tel1=Tel1, Tel2=Tel2)
			newPatient.save()
			newVizov.save()
			response = 'OK'
		except Exception as e:
			response = '! : {0} [{1}] '.format(e.message, type(e))
	if MODE == 'insert_v_with_existPat':
		try:
                        latestVizov = Vizov.objects.filter(KeyName_id=KN).order_by('id').reverse()[0]
                        late_Decease = latestVizov.Decease
                        late_Note = latestVizov.Note
			newVizov = Vizov(KeyName_id=KN, Firm=Firm, RedMoney=RED, GreenMoney=GREEN, Day=Day, Month=Month, Year=Year, Age=Age, Note=late_Note, Decease=late_Decease)
			newVizov.save()
			response = 'OK'
		except Exception as e:
			response = '! : {0} [{1}] '.format(e.message, type(e))
	if MODE == 'update_vANDp_exist':
		try:
			patient = Vizov.objects.filter(KeyName_id=KN, Day=Day, Month=Month, Year=Year)
			for p in patient:
				p.Firm = Firm
				p.RedMoney = RED
				p.GreenMoney = GREEN
				p.KeyName.Name1 = N1
				p.KeyName.Name2 = N2
				p.KeyName.Name3 = N3
				p.Age = Age
				p.KeyName.Street = Street
				p.KeyName.House = House
				p.KeyName.KC = KC
				p.KeyName.Porch = Porch
				p.KeyName.Passwd = Passwd
				p.KeyName.Floor = Floor
				p.KeyName.Apt = Apt
				p.KeyName.Tel1 = Tel1
				p.KeyName.Tel2 = Tel2
				p.Note = Note
				p.Decease = Decease
				p.KeyName.KeyName = u'{0}{1}{2}'.format(N1, N2, N3)
				p.KeyName.save()
				p.KeyName_id = u'{0}{1}{2}'.format(N1, N2, N3)
				p.save()
			response = 'OK'
		except Exception as e:
			response = '! : {0} [{1}] '.format(e.message, type(e))
	return response
#>>>
#<<< Insert a new vizov with existing patient
@csrf_exempt
def insertVizov(request):
	response = records_Inserting_Updating(MODE='insert_v_with_existPat', KN=request.POST.get('Patient'), Firm='пациент', Day=request.POST.get('Day'), Month=request.POST.get('Month'), Year=request.POST.get('Year'))
	return HttpResponse(response, content_type='text/plain')
#>>>
#<<< Update vizov/patient information
@csrf_exempt
def updateVizov_patient(request):
	if request.POST.get('MODE') == 'anew':
		response = records_Inserting_Updating(MODE='insert_v_with_newPat', KN=request.POST.get('Patient'), Day=request.POST.get('Day'), Month=request.POST.get('Month'), Year=request.POST.get('Year'), N1=request.POST.get('Name1'), N2=request.POST.get('Name2'), N3=request.POST.get('Name3'), Firm=request.POST.get('Firm'), RED=request.POST.get('RedMoney'), GREEN=request.POST.get('GreenMoney'), Age=request.POST.get('Age'), Street=request.POST.get('Street'), House=request.POST.get('House'), KC=request.POST.get('KC'), Porch=request.POST.get('Porch'), Passwd=request.POST.get('Passwd'), Floor=request.POST.get('Floor'), Apt=request.POST.get('Apt'), Tel1=request.POST.get('Tel1'), Tel2=request.POST.get('Tel2'), Note=request.POST.get('Note'), Decease=request.POST.get('Decease'))
	else:
		response = records_Inserting_Updating(MODE='update_vANDp_exist', KN=request.POST.get('Patient_old'), Day=request.POST.get('Day'), Month=request.POST.get('Month'), Year=request.POST.get('Year'), N1=request.POST.get('Name1'), N2=request.POST.get('Name2'), N3=request.POST.get('Name3'), Firm=request.POST.get('Firm'), RED=request.POST.get('RedMoney'), GREEN=request.POST.get('GreenMoney'), Age=request.POST.get('Age'), Street=request.POST.get('Street'), House=request.POST.get('House'), KC=request.POST.get('KC'), Porch=request.POST.get('Porch'), Passwd=request.POST.get('Passwd'), Floor=request.POST.get('Floor'), Apt=request.POST.get('Apt'), Tel1=request.POST.get('Tel1'), Tel2=request.POST.get('Tel2'), Note=request.POST.get('Note'), Decease=request.POST.get('Decease'))
	return HttpResponse(response, content_type='text/plain')
#>>>	

# # SEARCH PAGE # #

def IndexPageForSearch(request):
	return render(request, 'MEDview/m-Search.html')

#<<< Search global
@csrf_exempt
def globalSearch(request):
	search = request.POST.get('TEXT')
	responsejSON = []
	query = Vizov.objects.filter(Q(KeyName_id__KeyName__icontains=search) | Q(KeyName_id__Street__icontains=search) | Q(KeyName_id__Tel1__icontains=search) | Q(KeyName_id__Tel2__icontains=search)).order_by('KeyName').distinct('KeyName')
	for r in query:
		tmp = {}
		KN = u'{0}{1}{2}'.format(r.KeyName.Name1,r.KeyName.Name2,r.KeyName.Name3)
		v_query = Vizov.objects.filter(KeyName_id=KN).order_by('Year')
		vizovs = Vizov.objects.filter(KeyName_id=KN).count()
		details = []
		for q in v_query:
			vizs = {}
			Month = {1:'Январь', 2:'Февраль', 3:'Март', 4:'Апрель', 5:'Май', 6:'Июнь', 7:'Июль', 8:'Август', 9:'Сентябрь', 10:'Октябрь', 11:'Ноябрь', 12:'Декабрь'}.get(q.Month)
			vizs = {'Year':q.Year, 'Month':Month, 'Day':q.Day, 'Firm':q.Firm, 'Age':q.Age, 'Note':q.Note, 'Decease':q.Decease, 'GREEN':q.GreenMoney, 'RED':q.RedMoney}
			details.append(vizs)
		tmp = { 'Name1':r.KeyName.Name1, 'Name2':r.KeyName.Name2, 'Name3':r.KeyName.Name3, 'Street':r.KeyName.Street, 'House':r.KeyName.House, 'Apt':r.KeyName.Apt, 'KC':r.KeyName.KC, 'Porch':r.KeyName.Porch, 'Floor':r.KeyName.Floor, 'Passwd':r.KeyName.Passwd, 'Tel1':r.KeyName.Tel1, 'Tel2':r.KeyName.Tel2, 'CountDetails':vizovs, 'Details':details }
		responsejSON.append(tmp)
	return HttpResponse(json.dumps(responsejSON), mimetype="application/json")
#>>>
#<<< Search global detailed	
#@csrf_exempt
#def globalSearch_deatailed(request):
#	patient = request.POST.get('TEXT')
#	monthName = {1:'Январь', 2:'Февраль', 3:'Март', 4:'Апрель', 5:'Май', 6:'Июнь', 7:'Июль', 8:'Август', 9:'Сентябрь', 10:'Октябрь', 11:'Ноябрь', 12:'Декабрь'}
#	responsejSON = []
#	query = Vizov.objects.filter(KeyName_id=patient).order_by('Year')
#	for q in query:
#		tmp = {}
#		Month = {1:'Январь', 2:'Февраль', 3:'Март', 4:'Апрель', 5:'Май', 6:'Июнь', 7:'Июль', 8:'Август', 9:'Сентябрь', 10:'Октябрь', 11:'Ноябрь', 12:'Декабрь'}.get(q.Month)
#		tmp = {'Year':q.Year, 'Month':Month, 'Day':q.Day, 'Firm':q.Firm, 'Age':q.Age, 'Note':q.Note, 'Decease':q.Decease, 'GREEN':q.GreenMoney, 'RED':q.RedMoney}
#		responsejSON.append(tmp)
#	return HttpResponse(json.dumps(responsejSON), mimetype="application/json")
#>>>

# # STATISTIC PAGE # #

def IndexPageForStat(request):
	Years = Vizov.objects.order_by('Year').distinct('Year')
	context = {}
	context['Years'] = Years
	return render(request, 'MEDview/m-Statistic.html', context)

#<<< Statistic result
@csrf_exempt
def SatisticQuery(request):
	Years = request.POST.getlist('Years[]')
	Months = request.POST.getlist('Months[]')
	responsejSON = {}
	responsejSON['red1Doctor'] = 0
	responsejSON['green1Doctor'] = 0
	responsejSON['count1Doctor'] = 0
	responsejSON['redVeromed'] = 0
	responsejSON['greenVeromed'] = 0
	responsejSON['countVeromed'] = 0
	responsejSON['redAlt'] = 0
	responsejSON['greenAlt'] = 0
	responsejSON['countAlt'] = 0
	responsejSON['redDiagnostika'] = 0
	responsejSON['greenDiagnostika'] = 0
	responsejSON['countDiagnostika'] = 0
	responsejSON['redVolodina'] = 0
	responsejSON['greenVolodina'] = 0
	responsejSON['countVolodina'] = 0
	responsejSON['greenPatient'] = 0
	responsejSON['countPatient'] = 0

	firm_1Doctor_count = Vizov.objects.filter(Firm__icontains='1', Year__in=Years, Month__in=Months).count()
	if firm_1Doctor_count > 0:
		responsejSON['count1Doctor'] = firm_1Doctor_count
		firm_1Doctor_redMoney = Vizov.objects.filter(Firm__icontains='1', Year__in=Years, Month__in=Months).aggregate(Sum('RedMoney'))
		responsejSON['red1Doctor'] = firm_1Doctor_redMoney['RedMoney__sum']
		firm_1Doctor_greenMoney = Vizov.objects.filter(Firm__icontains='1', Year__in=Years, Month__in=Months).aggregate(Sum('GreenMoney'))
		responsejSON['green1Doctor'] = firm_1Doctor_greenMoney['GreenMoney__sum']
	firm_Veromed_count = Vizov.objects.filter(Firm__icontains='веромед', Year__in=Years, Month__in=Months).count()
	if firm_Veromed_count > 0:
		responsejSON['countVeromed'] = firm_Veromed_count
		firm_Veromed_redMoney = Vizov.objects.filter(Firm__icontains='веромед', Year__in=Years, Month__in=Months).aggregate(Sum('RedMoney'))
		responsejSON['redVeromed'] = firm_Veromed_redMoney['RedMoney__sum']
		firm_Veromed_greenMoney = Vizov.objects.filter(Firm__icontains='веромед', Year__in=Years, Month__in=Months).aggregate(Sum('GreenMoney'))
		responsejSON['greenVeromed'] = firm_Veromed_greenMoney['GreenMoney__sum']
	firm_Altmedika_count = Vizov.objects.filter(Firm__icontains='альтмедика', Year__in=Years, Month__in=Months).count()
	if firm_Altmedika_count > 0:
		responsejSON['countAlt'] = firm_Altmedika_count
		firm_Altmedika_redMoney = Vizov.objects.filter(Firm__icontains='альтмедика', Year__in=Years, Month__in=Months).aggregate(Sum('RedMoney'))
		responsejSON['redAlt'] = firm_Altmedika_redMoney['RedMoney__sum']
		firm_Altmedika_greenMoney = Vizov.objects.filter(Firm__icontains='альтмедика', Year__in=Years, Month__in=Months).aggregate(Sum('GreenMoney'))
		responsejSON['greenAlt'] = firm_Altmedika_greenMoney['GreenMoney__sum']
	firm_Diagnostika_count = Vizov.objects.filter(Q(Firm__icontains='лечение') | Q(Firm__icontains='лазар'), Year__in=Years, Month__in=Months).count()
	if firm_Diagnostika_count > 0:
		responsejSON['countDiagnostika'] = firm_Diagnostika_count
		firm_Diagnostika_redMoney = Vizov.objects.filter(Q(Firm__icontains='лечение') | Q(Firm__icontains='лазар'), Year__in=Years, Month__in=Months).aggregate(Sum('RedMoney'))
		responsejSON['redDiagnostika'] = firm_Diagnostika_redMoney['RedMoney__sum']
		firm_Diagnostika_greenMoney = Vizov.objects.filter(Q(Firm__icontains='лечение') | Q(Firm__icontains='лазар'), Year__in=Years, Month__in=Months).aggregate(Sum('GreenMoney'))
		responsejSON['greenDiagnostika'] = firm_Diagnostika_greenMoney['GreenMoney__sum']
	firm_Volodina_count = Vizov.objects.filter(Q(Firm__icontains='володина') | Q(Firm__icontains='геннад'), Year__in=Years, Month__in=Months).count()
	if firm_Volodina_count > 0:
		responsejSON['countVolodina'] = firm_Volodina_count
		firm_Volodina_redMoney = Vizov.objects.filter(Q(Firm__icontains='володина') | Q(Firm__icontains='геннад'), Year__in=Years, Month__in=Months).aggregate(Sum('RedMoney'))
		responsejSON['redVolodina'] = firm_Volodina_redMoney['RedMoney__sum']
		firm_Volodina_greenMoney = Vizov.objects.filter(Q(Firm__icontains='володина') | Q(Firm__icontains='геннад'), Year__in=Years, Month__in=Months).aggregate(Sum('GreenMoney'))
		responsejSON['greenVolodina'] = firm_Volodina_greenMoney['GreenMoney__sum']
	firm_Patient_count = Vizov.objects.filter(Firm__icontains='пациент', Year__in=Years, Month__in=Months).count()
	if firm_Patient_count > 0:
		responsejSON['countPatient'] = firm_Patient_count
		firm_Patient_greenMoney = Vizov.objects.filter(Firm__icontains='пациент', Year__in=Years, Month__in=Months).aggregate(Sum('GreenMoney'))
		responsejSON['greenPatient'] = firm_Patient_greenMoney['GreenMoney__sum']
	firm_All_count = Vizov.objects.filter(Year__in=Years, Month__in=Months).count();
	if firm_All_count > 0:
		responsejSON['countAll'] = firm_All_count
		firm_All_redMoney = Vizov.objects.filter(Year__in=Years, Month__in=Months).aggregate(Sum('RedMoney'))
		responsejSON['redAll'] = firm_All_redMoney['RedMoney__sum']
		firm_All_greenMoney = Vizov.objects.filter(Year__in=Years, Month__in=Months).aggregate(Sum('GreenMoney'))
		responsejSON['greenAll'] = firm_All_greenMoney['GreenMoney__sum']
	
	responsejSON['countElse'] = responsejSON['countAll'] - responsejSON['count1Doctor'] - responsejSON['countVeromed'] - responsejSON['countAlt'] - responsejSON['countDiagnostika'] - responsejSON['countVolodina'] - responsejSON['countPatient']
	responsejSON['redElse'] = responsejSON['redAll'] - responsejSON['red1Doctor'] - responsejSON['redVeromed'] - responsejSON['redAlt'] - responsejSON['redDiagnostika'] - responsejSON['redVolodina']
	responsejSON['greenElse'] = responsejSON['greenAll'] - responsejSON['green1Doctor'] - responsejSON['greenVeromed'] - responsejSON['greenAlt'] - responsejSON['greenDiagnostika'] - responsejSON['greenVolodina'] - responsejSON['greenPatient']

	return HttpResponse(json.dumps(responsejSON), mimetype="application/json")
#>>>

#<<< OLD CODE (unused)
# @csrf_exempt
# def globalSearch(request):
# 	responsejSON = []
# 	if request.POST.get('SearchOtherFields') == 'Names':
# 		record = Vizov.objects.filter(KeyName_id__KeyName__icontains=request.POST.get('Search')).order_by('KeyName').distinct('KeyName')
# 	elif request.POST.get('SearchOtherFields') == 'All':
# 		search = request.POST.get('Search')
# 		record = Vizov.objects.filter(Q(KeyName_id__KeyName__icontains=search) | Q(KeyName_id__Street__icontains=search) | Q(KeyName_id__Tel1__icontains=search) | Q(KeyName_id__Tel2__icontains=search) | Q(KeyName_id__Note__icontains=search) | Q(KeyName_id__Decease__icontains=search)).order_by('KeyName').distinct('KeyName')
# 	elif request.POST.get('SearchOtherFields') == 'Fields':	
# 		search = request.POST.get('Search')
# 		record = Vizov.objects.filter(Q(KeyName_id__Street__icontains=search) | Q(KeyName_id__Tel1__icontains=search) | Q(KeyName_id__Tel2__icontains=search) | Q(KeyName_id__Note__icontains=search) | Q(KeyName_id__Decease__icontains=search)).order_by('KeyName').distinct('KeyName')		
# 	for r in record:
# 		tmp = {}
# 		tmp = { 'Name1':r.KeyName.Name1, 'Name2':r.KeyName.Name2, 'Name3':r.KeyName.Name3, 'Age':r.KeyName.Age, 'Street':r.KeyName.Street, 'House':r.KeyName.House, 'Apt':r.KeyName.Apt, 'KC':r.KeyName.KC, 'Porch':r.KeyName.Porch, 'Floor':r.KeyName.Floor, 'Passwd':r.KeyName.Passwd, 'Tel1':r.KeyName.Tel1, 'Tel2':r.KeyName.Tel2, 'Note':r.KeyName.Note, 'Decease':r.KeyName.Decease }
# 		responsejSON.append(tmp)
# 	return HttpResponse(json.dumps(responsejSON), mimetype="application/json")

# @csrf_exempt
# def globalSearch_deatailed(request):
# 	monthName = {1:'Январь', 2:'Февраль', 3:'Март', 4:'Апрель', 5:'Май', 6:'Июнь', 7:'Июль', 8:'Август', 9:'Сентябрь', 10:'Октябрь', 11:'Ноябрь', 12:'Декабрь'}
# 	responsejSON = []
# 	#get list of used years:
# 	yearsQuery = Vizov.objects.filter(KeyName_id=request.POST.get('Patient')).order_by('Year').distinct('Year')
# 	for yQ in yearsQuery:
# 		monthQuery = Vizov.objects.filter(KeyName_id=request.POST.get('Patient'), Year=yQ.Year).order_by('Month').distinct('Month')
# 		list_months = []
# 		for mQ in monthQuery:
# 			dayQuery = Vizov.objects.filter(KeyName_id=request.POST.get('Patient'), Year=yQ.Year, Month=mQ.Month).order_by('Day')
# 			list_days = []
# 			for dQ in dayQuery:
# 				dic_day = {}
# 				dic_day = {'Day':dQ.Day, 'Firm':dQ.Firm, 'GreenMoney':dQ.GreenMoney, 'RedMoney':dQ.RedMoney}
# 				list_days.append(dic_day)
# 			dic_month = {}
# 			dic_month = {str(monthName.get(mQ.Month)):list_days}
# 			list_months.append(dic_month)
# 		dic_year = {}
# 		dic_year = {str(yQ.Year):list_months}
# 		responsejSON.append(dic_year)
# 	return HttpResponse(json.dumps(responsejSON), mimetype="application/json")

# # STATISTIC #


# def IndexPageForStat(request):
# 	todayYear = time.strftime('%Y')
# 	todayMonth = time.strftime('%m')
# 	Years = Vizov.objects.order_by('Year').distinct('Year')
# 	Firms = Vizov.objects.order_by('Firm').distinct('Firm')
# 	Total_GMoney = Vizov.objects.filter(Year=todayYear, Month=todayMonth).aggregate(Sum('GreenMoney'))
# 	Total_RMoney = Vizov.objects.filter(Year=todayYear, Month=todayMonth).aggregate(Sum('RedMoney'))
# 	Money = []
# 	for record in Firms:
# 		gM = Vizov.objects.filter(Year=todayYear, Month=todayMonth, Firm=record.Firm).aggregate(Sum('GreenMoney'))
# 		rM = Vizov.objects.filter(Year=todayYear, Month=todayMonth, Firm=record.Firm).aggregate(Sum('RedMoney'))
# 		tmp = {}
# 		tmp = { record.Firm: [{ 'GreenMoney':gM['GreenMoney__sum'], 'RedMoney':rM['RedMoney__sum'] }] }
# 		Money.append(tmp)
# 	context = {}
# 	context['curYear'] = time.strftime('%Y')
# 	context['curMonth'] = time.strftime('%B')
# 	context['Years'] = Years
# 	context['Firms'] = Firms
# 	return render(request, 'MEDview/statistic.html', context)

# @csrf_exempt
# def SatisticQuery(request):
# 	responsejSON = {}
# 	totalYears = request.POST.get('Years')[:2]
# 	totalMonths = request.POST.get('Months')[:2]
# 	years = []
# 	months = []
# 	for i in range(2, int(totalYears)*5, 4):
# 		tmp = request.POST.get('Years')[i:i+4]
# 		if tmp != '':
# 			years.append(int(tmp))
# 	for i in range(2, int(totalMonths)*3, 2):
# 		tmp = request.POST.get('Months')[i:i+2]
# 		if tmp != '':
# 			months.append(int(tmp))
# 	firm_All_redMoney = Vizov.objects.filter(Year__in=years, Month__in=months).aggregate(Sum('RedMoney'))
# 	firm_1Doctor_redMoney = Vizov.objects.filter(Firm__icontains='1', Year__in=years, Month__in=months).aggregate(Sum('RedMoney'))
# 	firm_Veromed_redMoney = Vizov.objects.filter(Firm__icontains='веромед', Year__in=years, Month__in=months).aggregate(Sum('RedMoney'))
# 	firm_Altmedika_redMoney = Vizov.objects.filter(Firm__icontains='альтмедика', Year__in=years, Month__in=months).aggregate(Sum('RedMoney'))
# 	firm_Diagnostika_redMoney = Vizov.objects.filter(Q(Firm__icontains='лечение') | Q(Firm__icontains='лазар'), Year__in=years, Month__in=months).aggregate(Sum('RedMoney'))
# 	firm_Volodina_redMoney = Vizov.objects.filter(Q(Firm__icontains='володина') | Q(Firm__icontains='геннад'), Year__in=years, Month__in=months).aggregate(Sum('RedMoney'))

# 	firm_All_greenMoney = Vizov.objects.filter(Year__in=years, Month__in=months).aggregate(Sum('GreenMoney'))
# 	firm_1Doctor_greenMoney = Vizov.objects.filter(Firm__icontains='1', Year__in=years, Month__in=months).aggregate(Sum('GreenMoney'))
# 	firm_Veromed_greenMoney = Vizov.objects.filter(Firm__icontains='веромед', Year__in=years, Month__in=months).aggregate(Sum('GreenMoney'))
# 	firm_Altmedika_greenMoney = Vizov.objects.filter(Firm__icontains='альтмедика', Year__in=years, Month__in=months).aggregate(Sum('GreenMoney'))
# 	firm_Diagnostika_greenMoney = Vizov.objects.filter(Q(Firm__icontains='лечение') | Q(Firm__icontains='лазар'), Year__in=years, Month__in=months).aggregate(Sum('GreenMoney'))
# 	firm_Volodina_greenMoney = Vizov.objects.filter(Q(Firm__icontains='володина') | Q(Firm__icontains='геннад'), Year__in=years, Month__in=months).aggregate(Sum('GreenMoney'))
# 	firm_Patient_greenMoney = Vizov.objects.filter(Firm__icontains='пациент', Year__in=years, Month__in=months).aggregate(Sum('GreenMoney'))

# 	responsejSON['redAll'] = firm_All_redMoney['RedMoney__sum']
# 	responsejSON['red1Doctor'] = firm_1Doctor_redMoney['RedMoney__sum']
# 	responsejSON['redVeromed'] = firm_Veromed_redMoney['RedMoney__sum']
# 	responsejSON['redAlt'] = firm_Altmedika_redMoney['RedMoney__sum']
# 	responsejSON['redDiagnostika'] = firm_Diagnostika_redMoney['RedMoney__sum']
# 	responsejSON['redVolodina'] = firm_Volodina_redMoney['RedMoney__sum']
	
# 	responsejSON['greenAll'] = firm_All_greenMoney['GreenMoney__sum']
# 	responsejSON['green1Doctor'] = firm_1Doctor_greenMoney['GreenMoney__sum']
# 	responsejSON['greenVeromed'] = firm_Veromed_greenMoney['GreenMoney__sum']
# 	responsejSON['greenAlt'] = firm_Altmedika_greenMoney['GreenMoney__sum']
# 	responsejSON['greenDiagnostika'] = firm_Diagnostika_greenMoney['GreenMoney__sum']
# 	responsejSON['greenVolodina'] = firm_Volodina_greenMoney['GreenMoney__sum']
# 	responsejSON['greenPatient'] = firm_Patient_greenMoney['GreenMoney__sum']

# 	return HttpResponse(json.dumps(responsejSON), mimetype="application/json")
#>>>
