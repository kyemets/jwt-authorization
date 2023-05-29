import React, {FC, useContext, useEffect, useState} from 'react';
import './App.css';
import LoginForm from './components/LoginForm';
import { Context } from '.';
import { observer } from 'mobx-react-lite';
import { IUser } from './models/IUser';
import UserService from './services/UserService';

const App: FC = () => {
  const {store} = useContext(Context)
  const [users, setUsers] = useState<IUser[]>([]);

  useEffect(() => {
    if(localStorage.getItem('token')) {
      store.checkAuth()
    }
  }, [store])

  async function getUsers() {
    try {
      const response = await UserService.fetchUsers();
      setUsers(response.data)
    } catch (e) {
      console.log(e);
    }
  }

  if (store.isLoading) {
    return <div>Loading...</div>
  }

  if (!store.isAuth) {
    return (
      <div>
        <LoginForm />
        <button onClick={getUsers}>Get users</button>
      </div>
    )
  }

  return (
    <div>
      <h1>{store.isAuth 
        ? `User is authorized ${store.user.email}` 
        : `Please authorize!`}
      </h1>
      <h1>{store.user.isActivated ? `Account is activated by email` : `Activate account please!`}</h1>
      <button onClick={() => store.logout()}>Logout</button>
      <div>
        <button onClick={getUsers}>Get users</button>
      </div>
      {users.map(user =>
          <div key={user.email}>{user.email}</div>
        )}
    </div>
  );
}

export default observer(App);
