import useSWR from "swr";

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
