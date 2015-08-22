import { combineReducers } from 'redux';
import contains from 'lodash/collection/includes';
import { moveItemToFront } from 'app/utils';
import { createKeyedReducer, createPaginationReducer } from 'app/utils/reducers';

const reducer = combineReducers({
  conversations: createPaginationReducer([
    'REQUEST_CONVERSATIONS',
    'RECEIVE_CONVERSATIONS_SUCCESS',
    'RECEIVE_CONVERSATIONS_FAILURE',
  ], {
    RECEIVE_MESSAGE: (state, action) => {
      const { conversationId } = action.payload;
      return {
        ...state,
        ids: moveItemToFront(state.ids, id => id === conversationId),
      };
    },
  }),
  messagesByConversation: createKeyedReducer(
    action => contains(['REQUEST_MESSAGES', 'RECEIVE_MESSAGES_SUCCESS', 'RECEIVE_MESSAGES_FAILURE', 'RECEIVE_MESSAGE'], action.type)
              && String(action.payload.conversationId), // TODO: refactor
    createPaginationReducer([
      'REQUEST_MESSAGES',
      'RECEIVE_MESSAGES_SUCCESS',
      'RECEIVE_MESSAGES_FAILURE',
    ], {
      RECEIVE_MESSAGE: (state, action) => {
        const { message } = action.payload;
        return {
          ...state,
          ids: [...state.ids, message.id],
        };
      },
    }),
  ),
});

export default reducer;
