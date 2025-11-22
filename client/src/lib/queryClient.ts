import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwOnNonOkStatus(response: Response) {
  if (!response.ok) {
    let message = `${response.status}: ${response.statusText}`;
    try {
      const body = await response.json();
      if (body.message) {
        message = body.message;
      }
    } catch {}
    throw new Error(message);
  }
}

export async function apiRequest(
  url: string,
  options?: RequestInit
): Promise<Response> {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    credentials: "include",
  });
  await throwOnNonOkStatus(response);
  return response;
}

const defaultQueryFn: QueryFunction = async ({ queryKey }) => {
  const response = await apiRequest(queryKey[0] as string);
  return response.json();
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: defaultQueryFn,
      staleTime: 1000 * 60,
      refetchOnWindowFocus: false,
    },
  },
});
