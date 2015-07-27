$         = require 'jquery'
AppRouter = require './router'
{AppView} = require './views'

$ ->
  router = new AppRouter
  app    = new AppView router: router, el: '.container'
  router.start()
  return

$.ajaxSetup beforeSend: (xhr) ->
  if not this.crossDomain
    xhr.setRequestHeader 'X-CSRFToken', $.cookie 'csrftoken'
  return
