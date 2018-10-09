import { LOGIN, LOGOUT } from '../types';

const initialState = {
  isLoggedIn: true,
  userId: "123",
  name: "Vova",
};

const handleLogin = (state, { userId, name }) => ({
  isLoggedIn: true,
  userId,
  name,
});

const handleLogout = () => initialState;

const handlers = {
  [LOGIN]: handleLogin,
  [LOGOUT]: handleLogout,
};

export default (state = initialState, action) => {
  const handler = handlers[action.type];
  return handler ? handler(state, action.payload) : state;
};
