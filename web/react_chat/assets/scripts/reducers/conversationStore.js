import findIndex from 'lodash/array/findIndex';
import { handleActions } from 'redux-actions';

const initialState = {
  entries: null,
  currentConversationId: null,
  currentMessages: null,
};

const reducer = handleActions({

  RECEIVE_CONVERSATIONS: (state, action) => {
    return {
      ...state,
      entries: action.payload.conversations,
    };
  },

  SELECT_CONVERSATION: (state, action) => {
    if (action.payload.conversationId === state.currentConversationId) {
      return state;
    }
    return {
      ...state,
      currentConversationId: action.payload.conversationId,
    };
  },

  REQUEST_MESSAGES: (state) => {
    return {
      ...state,
      currentMessages: null,
    };
  },

  RECEIVE_MESSAGES: (state, action) => {
    if (action.payload.conversationId !== state.currentConversationId) {
      return state;
    }
    return {
      ...state,
      currentMessages: action.payload.messages,
    };
  },

  RECEIVE_MESSAGE: (state, action) => {
    const { conversationId, message } = action.payload;

    const entries = bubbleUp(state.entries, { id: conversationId });

    let currentMessages;
    if (conversationId === state.currentConversationId) {
      currentMessages = [...state.currentMessages, message];
    } else {
      currentMessages = state.currentMessages;
    }

    return {
      ...state,
      entries,
      currentMessages,
    };
  },
}, initialState);

export default reducer;

function bubbleUp(items, predicate) {
  const index = findIndex(items, predicate);
  if (index === -1) {
    return items;
  }
  return [
    items[index],
    ...items.slice(0, index),
    ...items.slice(index + 1),
  ];
}