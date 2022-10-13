import React from "react";
import { NextPage } from "next";
import { useRouter } from "next/router";
import useUser from "../../libs/useUser";
import Link from "next/link";
import useUsers from "../../libs/useUsers";

const Detail: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  // 타입이 애매한 부분이 있음.
  const { user, isError, isLoading } = useUser(id as string);
  const {
    users,
    isError: usersError,
    isLoading: usersLoading,
  } = useUsers({ gender: user?.gender, size: user?.size });
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
      <div>
        {usersError && <h2>친구 불러오는데 에러 발생</h2>}
        {usersLoading && <h2>친구 불러오는 중</h2>}
        {users && <h2>{users.length} 명의 친구가 있습니다.</h2>}
      </div>
      <div>
        {id !== "1" && (
          <Link href={`/users/${Number(id) - 1}`}>
            <a>이전 보기</a>
          </Link>
        )}
        {id !== "100" && (
          <Link href={`/users/${Number(id) + 1}`}>
            <a>다음 보기</a>
          </Link>
        )}
      </div>
    </div>
  );
};

export default Detail;
