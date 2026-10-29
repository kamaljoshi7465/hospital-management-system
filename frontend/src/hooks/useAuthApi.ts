import { useMutation, useQuery } from "@tanstack/react-query";
import { authApi } from "../api/auth";
import { getAccessToken } from "../api/client";

export const authQueryKeys = { profile: ["auth", "profile"] as const };
export const useAuthProfileQuery = (enabled = true) => useQuery({ queryKey: authQueryKeys.profile, queryFn: authApi.me, enabled: enabled && Boolean(getAccessToken()), retry: false });
export const useLoginMutation = () => useMutation({ mutationFn: ({ email, password }: { email: string; password: string }) => authApi.login(email, password) });
export const useSignupMutation = () => useMutation({ mutationFn: authApi.signup });
export const useLogoutMutation = () => useMutation({ mutationFn: authApi.logout });
