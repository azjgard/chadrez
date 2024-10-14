import React from "react";
import { Redirect, Route, Switch, useLocation } from "wouter";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  useAuth,
  useUser,
} from "@clerk/clerk-react";
import * as http from "./http";

import Game from "./components/Game";
// import Menu from "./components/Menu";

import "./App.css";
import { AxiosError } from "axios";
import AuthWrapper from "./components/AuthWrapper";

export default function App() {
  return (
    <AuthWrapper>
      <div className="App">
        <SignedOut>
          <Switch>
            <Route path="/">
              <h1>Chadrez</h1>
              <SignInButton />
            </Route>
            <Redirect to="/" />
          </Switch>
        </SignedOut>
        <SignedIn>
          <AuthenticatedApp />
        </SignedIn>
      </div>
    </AuthWrapper>
  );
}

type User = {
  id: number;
  clerkId: string | null;
  name: string;
  email: string;
};

function useUserState() {
  const [userState, setUserState] = React.useState<
    { loaded: false } | { loaded: true; data: User }
  >({ loaded: false });

  const clerkUser = useUser();
  const { getToken } = useAuth();

  React.useEffect(() => {
    if (
      !(
        clerkUser &&
        clerkUser.isLoaded &&
        clerkUser.isSignedIn &&
        !userState.loaded
      )
    ) {
      return;
    }

    http.client.interceptors.request.use(async (config) => {
      const token = await getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    async function getOrCreateUser() {
      try {
        return await http.client.get<User>(`/user`).then(({ data }) => data);
      } catch (e) {
        if (e instanceof AxiosError && e.response?.status === 404) {
          return await http.client
            .post<User>("/user", {
              name: clerkUser.user!.fullName,
              email: clerkUser.user!.emailAddresses[0].emailAddress,
            })
            .then(({ data }) => data);
        }

        throw e;
      }
    }

    getOrCreateUser().then((data) => setUserState({ loaded: true, data }));
  }, [userState, setUserState, clerkUser, getToken]);

  return userState;
}

type IUserContext = User;

const UserContext = React.createContext({} as IUserContext);

function AuthenticatedApp() {
  const userState = useUserState();
  const [, setLocation] = useLocation();

  if (!userState.loaded) {
    return <div>Loading...</div>;
  }

  return (
    <UserContext.Provider value={userState.data}>
      <Switch>
        <Route path="/">
          <button onClick={() => setLocation("/game")}>Play</button>
        </Route>
        <Route path="/game">
          <Game />
        </Route>
        <Redirect to="/game" />
      </Switch>
    </UserContext.Provider>
  );
}
