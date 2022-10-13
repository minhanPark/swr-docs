import useSWR from "swr";

interface Users {
  gender: string;
  size: string;
}

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
