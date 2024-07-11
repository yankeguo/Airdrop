import type { FetchError } from "ofetch";

export async function invokeAPI<T>(
  path: string,
  opts?: Parameters<typeof $fetch>[1],
): Promise<T> {
  const toast = useToast();
  try {
    return await $fetch<T>("https://drop-api.yankeguo.com" + path, {
      ...opts,
      credentials: "include",
    });
  } catch (_e) {
    const e = _e as FetchError;
    if (e.data?.message) {
      toast.add({
        title: "Error",
        description: e.data.message,
        timeout: 0,
        color: "red",
      });
    } else {
      toast.add({
        title: "Error",
        description: e.message,
        timeout: 0,
        color: "red",
      });
    }
    throw _e;
  }
}
