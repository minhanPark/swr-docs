import React from "react";
import { NextPage } from "next";
import useUser from "../../libs/useUser";

const Users: NextPage = () => {
  const { user, isError, isLoading } = useUser("1");
  if (isError) return <div>faild to load</div>;
  if (isLoading) return <div>loading ...</div>;
  return (
    <div>
      <h2>hello {user.last_name}</h2>
      <p>your info</p>
      <ul>
        <li>{user.id}</li>
        <li>{user.last_name}</li>
        <li>{user.first_name}</li>
        <li>{user.email}</li>
        <li>{user.gender}</li>
        <li>{user.size}</li>
      </ul>
    </div>
  );
};

export default Users;
