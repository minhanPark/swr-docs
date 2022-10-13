# SWR 공식 문서 보고 따라하기

## fetcher 함수

```js
const fetcher = (...args) => fetch(...args).then((res) => res.json());
```

기본적으로 fetcher함수가 필요하다. 타입스크립트로 따라할 시 경고를 받았는데,  
앞에 args에는 **Rest parameter 'args' implicitly has an 'any[]' type**라는 경고를 받았고, 여기에 any[]라는 타입을 줘도 경고가 풀리지 않았다.  
검색해보니 fetch는 적어도 한개의 인수가 필요한데 rest로 받아서 풀어버리니 인수를 안넣는 경우도 있을 수 있기때문에 에러가 발생하는 거라고 한다.  
[스택오버플로우 참고](https://stackoverflow.com/questions/63313799/typescript-argument-cant-use-any-in-fetch)

여기에서 수정하는 방법은 두가지 방법이 있다. 하나는 ars분리해서 하나 이상은 간다는 것을 전달해주는것.

```ts
const fetcher = (arg: any, ...args: any) =>
  fetch(arg, ...args).then((res) => res.json());
```

또 하나는 Parameters 기능을 활용하는것

```ts
const fetcher = (...args: Parameters<typeof fetch>) =>
  fetch(...args).then((res) => res.json());
```

## 요청상태

리액트 쿼리와 다르게 isLoading이라는 상태를 제공하지 않는다.

> 일반적으로, 세가지 요청 상태가 가능합니다. "loading", "ready", "error". data와 error값을 사용해 현재 요청의 상태를 알아내고, 해당하는 ui를 반환할 수 있습니다.

즉 data, error를 받고 로딩은 (!data && !error)으로 만들어주면됨

```js
const { data, error } = useSWR(`/api/users/${id}`, fetcher);

return {
  user: data,
  isLoading: !error && !data,
  isError: error,
};
```

## 옵션

```js
const { data, error, isValidating, mutate } = useSWR(key, fetcher, options);
```

기본적으로 위와 같은 상태이다.  
반환값중에 isValidating(요청이나 갱신 로딩의 여부)는 사용해본적이 없어서 잘 모르겠음.  
확실히 옵션에 넣을 수 있는 것들도 리액트 쿼리에 비해서 적다.  
onSuccess나 onError는 존재함.

## 데이터 가져오기

fetcher는 swr의 key를 받고 데이터를 반환하는 비동기 함수.  
기본적으로 **데이터 가져오기를 다루는 어떠한 라이브러리도 사용이 가능**하다.

```js
import fetch from "unfetch";

const fetcher = (url) => fetch(url).then((r) => r.json());

function App() {
  const { data, error } = useSWR("/api/data", fetcher);
  // ...
}
```

Next.js를 사용한다면 폴리필을 사용할 필요가 없고 간편하게 사용가능하다.

```js
import axios from "axios";

const fetcher = (url) => axios.get(url).then((res) => res.data);

function App() {
  const { data, error } = useSWR("/api/data", fetcher);
  // ...
}
```

axios도 간단히 사용가능하다.  
하지만 둘 중에 누가 더 활용도가 높을까?  
기본적으로 다중 인자를 넣어야 하는 상황이 오면 axios가 더 깔끔하게 처리가 가능하다고 생각한다. 리액트 쿼리에서처럼 params는 받아서 그대로 전달해줄 수 있으니까.

```ts
const fetcher = (url: string, params: any) =>
  axios
    .get(url, {
      params,
    })
    .then((res) => res.data);
```

그래서 위처럼 fetcher를 작성하면 키를 배열로만 전달하면 된다.

### 옵션 전달

만약 fetcher를 위와 같이 SWRConfig를 통해 전역적으로 사용하면 옵션은 어떻게 전달하면 될까?  
각 자리에 fetcher자리에 옵션을 넣어주면 작동한다.

```js
const { data, error } = useSWR(
  id ? [`http://localhost:4444/users/${id}`] : null,
  { onSuccess: () => {} }
);
```

위와 같은 형태다

```ts
export default function useUser(id: string | undefined) {
  const { data, error } = useSWR(
    id ? [`http://localhost:4444/users/${id}`] : null
  );

  return {
    user: data,
    isLoading: !error && !data,
    isError: error,
  };
}
```

해당 훅은 params를 전달하진 않고, **[`http://localhost:4444/users/${id}`]**처럼 배열에 문자열만 전달했다.

## 조건부 가져오기

null을 사용하거나 함수를 key로 전달하여 데이터를 조건부로 가져올 수 있다. 함수가 falsy 값을 던지거나 반환하면 swr은 요청을 시작하지 않는다.

```js
// 조건부 가져오기
const { data } = useSWR(shouldFetch ? "/api/data" : null, fetcher);

// ...또는 falsy 값 반환
const { data } = useSWR(() => (shouldFetch ? "/api/data" : null), fetcher);

// 다중 인자일 경우는 아래처럼 처리가능하다

const { data } = useSWR(shouldFetch ? ["/api/data", args] : null, fetcher);

// ...또는 user.id가 정의되지 않았을 때 에러 throw
const { data } = useSWR(() => "/api/data?uid=" + user.id, fetcher);
```

## 의존

swr도 다른 데이터에 의존하는 데이터를 가져올 수 있다.

```js
function MyProjects() {
  const { data: user } = useSWR("/api/user");
  const { data: projects } = useSWR(() => "/api/projects?uid=" + user.id);
  // 함수를 전달할 때, SWR은 반환 값을 `key`로 사용합니다.
  // 함수가 falsy를 던지거나 반환한다면,
  // SWR은 일부 의존성이 준비되지 않은 것을 알게 됩니다.
  // 이 예시의 경우 `user.id`는 `user`가 로드되지 않았을 때
  // 에러를 던집니다.
  // ----> 이 부분이 이해가 되지 않음. 에러를 던지면 error에 담겼다가 데이터가 들어왔을 때 생기는 것인가?

  if (!projects) return "loading...";
  return "You have " + projects.length + " projects";
}
```

아직 함수 형태가 익숙하지는 않아서 아래처럼 훅을 만들어봄

```ts
export default function useUsers({ gender, size }: Users) {
  const { data, error } = useSWR(
    gender && size ? ["http://localhost:4444/users", { gender, size }] : null
  );
  return {
    users: data,
    isLoading: !error && !data,
    isError: error,
  };
}
```

의존 데이터가 undefined일 때는 null을 넣어줘서 의존 형태로 구성했고 잘 작동함.

## 전역 에러 처리

컴포넌트 내에서 반응적으로 error객체를 얻을 수 있지만 토스트, 스낵바나 centry 같이 어딘가에 기록하기 위해 에러를 전역으로 처리해야 할 경우 SWRConfig에 onError를 사용하면 된다.

```js
<SWRConfig
  value={{
    onError: (error, key) => {
      if (error.status !== 403 && error.status !== 404) {
        // Sentry로 에러를 보내거나,
        // 알림 UI를 보여줄 수 있습니다.
      }
    },
  }}
>
  <MyApp />
</SWRConfig>
```

## 페이지네이션

```js
const [pageIndex, setPageIndex] = useState(1);
const { data, error } = useSWR([
  "http://localhost:4444/users",
  { _page: pageIndex, _limit: 10 },
]);
// 페이지와 거기에 맞게 key를 수정한다.

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
</div>;
// 버튼에 setPageIndex를 줘서 state가 바뀌도록 해주면 페이지네이션 처리가 된다.
```

state가 바뀌면 거기에 맞게 swr을 새롭게 요청해서 페이징처리가 된다.
