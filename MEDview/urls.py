from django.conf.urls import patterns, url
from MEDview import views

urlpatterns = patterns('',
	# url(r'^ajax_record_insert$', views.recordInsert, name='ajax_record_insert'),
	# url(r'^ajax_record_update$', views.recordUpdate, name='ajax_record_update'),
	# url(r'^ajax_get_records$', views.pullRecords, name='ajax_get_records'),
	# url(r'^ajax_get_patient$', views.pullPatient, name='ajax_get_patient'),
#
	url(r'^ajax_search_patients$', views.searchPatients, name='ajax_search_patients'),
	#url(r'^ajax_update_vizov_firm$', views.updateVizov_firm, name='ajax_update_vizov_firm'),
	#url(r'^ajax_update_vizov_money$', views.updateVizov_money, name='ajax_update_vizov_money'),
	url(r'^ajax_update_vizov_patient$', views.updateVizov_patient, name='ajax_update_vizov_patient'),
	url(r'^ajax_insert_vizov$', views.insertVizov, name='ajax_insert_vizov'),
	url(r'^ajax_pull_vizovs$', views.getVizovs, name='ajax_pull_vizovs'),
	#url(r'^ajax_pull_patient_details$', views.getPatientInfo, name='ajax_pull_patient_details'),
	url(r'^ajax_calendar_change$', views.changeCalendar, name='ajax_calendar_change'),

	url(r'^$', views.IndexPageForSearch),
	url(r'^ajax_search_street$', views.searchStreet, name='ajax_search_street'),
	url(r'^ajax_search$', views.globalSearch, name='ajax_search'),
	#url(r'^ajax_search_detailed$', views.globalSearch_deatailed, name='ajax_search_detailed'),

	url(r'^stat$', views.IndexPageForStat),
	url(r'^ajax_stat$', views.SatisticQuery, name='ajax_stat')
)
