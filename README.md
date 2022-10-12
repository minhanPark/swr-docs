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
