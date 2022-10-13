import React, { Fragment, useState } from "react";
import { NextPage } from "next";
import useUser from "../../libs/useUser";
import useSWR from "swr";

const Users: NextPage = () => {
  const [pageIndex, setPageIndex] = useState(1);
  const { data, error } = useSWR([
    "http://localhost:4444/users",
    { _page: pageIndex, _limit: 10 },
  ]);
  if (error) return <div>faild to load</div>;
  if (!data && !error) return <div>loading ...</div>;
  return (
    <div>
      <h1>유저 리스트</h1>
      <p>info</p>
      {data.map((user: any) => (
        <Fragment key={user.id}>
          <hr />
          <ul>
            <li>{user.id}</li>
            <li>{user.last_name}</li>
            <li>{user.first_name}</li>
            <li>{user.email}</li>
            <li>{user.gender}</li>
            <li>{user.size}</li>
          </ul>
        </Fragment>
      ))}
      <div>
        <button
          disabled={pageIndex === 1}
          onClick={() => setPageIndex(pageIndex - 1)}
        >
          이전
        </button>
        <span>-{pageIndex}-</span>
        <button
          disabled={pageIndex === 10}
          onClick={() => setPageIndex(pageIndex + 1)}
        >
          다음
        </button>
      </div>
    </div>
  );
};

export default Users;
