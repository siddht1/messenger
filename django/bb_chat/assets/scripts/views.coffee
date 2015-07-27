Backbone    = require('backbone')
$           = require('jquery')
_           = require('lodash')
models      = require('./models')

class ConversationListView extends Backbone.View
  template: _.template $('#conversation-list-view').html()

  initialize: ->
    @listenTo @collection, 'update', @render
    return

  render: =>
    @$el.html @template
      conversations: @collection
    this

class MessageItemView extends Backbone.View
  className: 'message'
  template: _.template $('#message-item-view').html()

  initialize: ->
    @listenTo @model, 'change', @render
    return

  render: =>
    @$el.html @template
      message: @model
    this

class MessageListView extends Backbone.View
  className: 'messages'

  initialize: ->
    @listenTo @collection, 'add', @addMessage
    return

  render: =>
    @collection.each @addMessage
    this

  addMessage: (message) =>
    messageView = new MessageItemView model: message
    @$el.append messageView.render().el

  scrollToBottom: ->
    @$el.scrollTop @$el.prop 'scrollHeight'

class ChatView extends Backbone.View
  template: _.template $('#chat-view').html()
  events:
    'submit .new-message form': 'sendMessage'

  initialize: ->
    @model = new models.Conversation id: @id
    @listenTo @model, 'change', @render
    @model.fetch()
    return

  render: =>
    @$el.html @template
    @messageListView = new MessageListView collection: @model.messages
    @messageListView.setElement @.$('.messages')
    @messageListView.render()
    @messageListView.scrollToBottom()
    this

  sendMessage: (event) =>
    event.preventDefault()
    data = _.object _.map $(event.target).serializeArray(), _.values
    message = new models.Message text: data.text
    message.url = "/bb/conversations/#{@id}/messages"
    message.save null,
      beforeSend: (xhr) ->
        xhr.setRequestHeader 'X-CSRFToken', data.csrfmiddlewaretoken
      success: =>
        @.$('textarea') .val ''
        @messageListView.collection.add message
        @messageListView.scrollToBottom()

class NavigationView extends Backbone.View
  template: _.template $('#navigation-view').html()

  initialize: ->
    @conversationListView = new ConversationListView
      collection: new models.Conversations
    @conversationListView.collection.fetch()
    @render()
    return

  render: =>
    @$el.html @template()
    @conversationListView.setElement @.$('.conversations')
    this

class AppView extends Backbone.View
  el: '.container'
  template: _.template $('#app-view').html()

  initialize: (options) ->
    @mainView = null
    @navigationView = new NavigationView
    @render()
    @$el.on 'click', 'a[href]', (event) ->
      href = this.getAttribute 'href'
      root = Backbone.history.root
      if href.startsWith root
        event.preventDefault()
        Backbone.history.navigate href.substr(root.length), trigger: true
      return

    router = options.router
    @listenTo router, 'route:conversation', @showConversation
    return

  render: =>
    @$el.html @template()
    if @mainView?
      @mainView.setElement @.$('.main')
      @mainView.render()
    @navigationView.setElement @.$('.navigation')
    @navigationView.render()
    this

  showConversation: (id) =>
    @mainView = new ChatView id: id
    @mainView.setElement @.$('.main')
    return

module.exports = {
  ConversationListView
  MessageItemView
  MessageListView
  ChatView
  NavigationView
  AppView
}