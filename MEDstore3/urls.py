from django.conf.urls import patterns, include, url

# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
# admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'MEDstore3.views.home', name='home'),
    # url(r'^MEDstore3/', include('MEDstore3.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    # url(r'^admin/', include(admin.site.urls)),
    url(r'^$', 'MEDview.views.index', name='index'),
    url(r'^m/', 'MEDview.views.mindex', name='mindex'),
    url(r'^edit/', include('MEDview.urls')),
    url(r'^search/', include('MEDview.urls')),
    url(r'^stat/', include('MEDview.urls')),
)