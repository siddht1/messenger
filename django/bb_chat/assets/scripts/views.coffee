Backbone = require 'backbone'
$        = require 'jquery'
_        = require 'lodash'
models   = require './models'

compileTemplate = (name) ->
  _.template require "templates/#{name}.html"

class BaseView extends Backbone.View
  setElement: =>
    super arguments...
    @$el.addClass @className

  render: =>
    @$el.html @template()
    this

  destroy: =>
    @undelegateEvents()
    @stopListening()
    @$el.empty()
    this

class ConversationListView extends BaseView
  className: 'conversations'
  template: compileTemplate 'conversation-list'

  initialize: =>
    @listenTo @collection, 'update', @render
    return

  render: =>
    @$el.html @template
      conversations: @collection
    this

class MessageView extends BaseView
  className: 'message'
  template: compileTemplate 'message'

  initialize: =>
    @listenTo @model, 'change', @render
    return

  render: =>
    @$el.html @template
      message: @model
    this

class MessageListView extends BaseView
  className: 'messages'

  initialize: =>
    @listenTo @collection, 'add', @addMessage
    return

  render: =>
    @collection.each @addMessage
    this

  addMessage: (message) =>
    messageView = new MessageView model: message
    @$el.append messageView.render().el
    this

  scrollToBottom: =>
    @$el.scrollTop @$el.prop 'scrollHeight'
    this

class ChatView extends BaseView
  className: 'chat'
  template: compileTemplate 'chat'
  events:
    'submit .new-message form': 'sendMessage'

  initialize: =>
    @model = new models.Conversation id: @id
    @listenTo @model, 'change', @render
    @model.fetch()
    return

  render: =>
    @$el.html @template
      conversation: @model
    @messageListView = new MessageListView
        collection: @model.messages
        el: @$('.messages')
      .render()
      .scrollToBottom()
    this

  sendMessage: (event) =>
    event.preventDefault()
    data = _.object _.map $(event.target).serializeArray(), _.values
    message = new models.Message text: data.text
    message.url = "/bb/conversations/#{@id}/messages"
    message.save null, success: =>
      @$('textarea') .val ''
      @messageListView.collection.add message
      @messageListView.scrollToBottom()
    this

class NavigationView extends BaseView
  className: 'navigation'
  template: compileTemplate 'navigation'

  initialize: =>
    @render()
    @conversationListView = new ConversationListView
      collection: new models.Conversations
      el: @$('.conversations')
    @conversationListView.collection.fetch()
    return

class AppView extends BaseView
  className: 'app'
  template: compileTemplate 'app'
  events:
    'click a[href]': 'handleLinkClick'

  initialize: (options) =>
    @render()
    @mainView = null
    @navigationView = new NavigationView el: @$('.navigation')

    router = options.router
    @listenTo router, 'route:home', @showHome
    @listenTo router, 'route:conversation', @showConversation
    return

  handleLinkClick: (event) =>
    href = event.target.getAttribute 'href'
    root = Backbone.history.root
    if href.startsWith root
      event.preventDefault()
      Backbone.history.navigate href.substr(root.length), trigger: true
    return

  setMainView: (view) =>
    @mainView?.destroy()
    @mainView = view
    if @mainView?
      @mainView.setElement @$('.main')
    this

  showHome: =>
    @setMainView null

  showConversation: (id) =>
    @setMainView new ChatView id: id

module.exports = {
  ConversationListView
  MessageView
  MessageListView
  ChatView
  NavigationView
  AppView
}
