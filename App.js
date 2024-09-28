/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { ContextProvider } from "./globalState";
import Auth_state from "./screens/auth/Auth_state";

function App() {
  return (
    <ContextProvider>
      <Auth_state/>
    </ContextProvider>
  );
}

export default App;