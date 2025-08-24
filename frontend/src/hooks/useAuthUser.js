import { useQuery } from "@tanstack/react-query";
import { getAuthUser } from "../lib/api";

const useAuthUser = () => {
  const query = useQuery({
    queryKey: ["authUser"],
    queryFn: getAuthUser,
    retry: false,
  });

  return {
    isLoading: query.isLoading,
    authUser: query.data?.user,
    isError: query.isError,
    error: query.error,
  };
};

export default useAuthUser;
