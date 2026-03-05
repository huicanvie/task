import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';
import type {
  CreateDraftRequest,
  CreateDraftResponse,
  DemoRequestCreateRequest,
  DemoRequestCreateResponse,
  FinalizeRegistrationRequest,
  FinalizeRegistrationResponse,
  GenericSuccessResponse,
  HealthResponse,
  LoginRequest,
  LoginResponse,
  SendVerificationRequest,
  SendVerificationResponse,
  TeamInviteRequest,
  TeamInviteResponse,
  TeamMember,
  TeamMemberUpdateRequest,
  TeamMembersResponse,
  VerifyEmailRequest,
  VerifyEmailResponse,
} from '../types';

const API_V1_PREFIX = '/api/v1';

export function useHealth(enabled = false) {
  return useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      const res = await fetch('https://api.larevela.com/health', {
        method: 'GET',
        credentials: 'include',
      });

      if (!res.ok) {
        const body = await res.text();
        throw new Error(body || `HTTP ${res.status}`);
      }

      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        return (await res.json()) as HealthResponse;
      }

      return { message: await res.text() } as HealthResponse;
    },
    enabled,
  });
}

export function useTeamMembers(params?: { limit?: number; offset?: number }, enabled = true) {
  return useQuery({
    queryKey: ['team-members', params],
    queryFn: () => api.get<TeamMembersResponse>(`${API_V1_PREFIX}/teams/members`, { params }),
    enabled,
  });
}

export function useSendVerificationCode() {
  return useMutation({
    mutationFn: (body: SendVerificationRequest) =>
      api.post<SendVerificationResponse>(`${API_V1_PREFIX}/auth/send-verification-code`, body),
  });
}

export function useVerifyEmail() {
  return useMutation({
    mutationFn: (body: VerifyEmailRequest) =>
      api.post<VerifyEmailResponse>(`${API_V1_PREFIX}/auth/verify-email`, body),
  });
}

export function useCreateRegistrationDraft() {
  return useMutation({
    mutationFn: (body: CreateDraftRequest) =>
      api.post<CreateDraftResponse>(`${API_V1_PREFIX}/auth/register/draft`, body),
  });
}

export function useFinalizeRegistration() {
  return useMutation({
    mutationFn: (body: FinalizeRegistrationRequest) =>
      api.post<FinalizeRegistrationResponse>(`${API_V1_PREFIX}/auth/register`, body),
  });
}

export function useLogin() {
  return useMutation({
    mutationFn: (body: LoginRequest) => api.post<LoginResponse>(`${API_V1_PREFIX}/auth/login`, body),
  });
}

export function useCreateDemoRequest() {
  return useMutation({
    mutationFn: (body: DemoRequestCreateRequest) =>
      api.post<DemoRequestCreateResponse>(`${API_V1_PREFIX}/demo-requests`, body),
  });
}

export function useInviteTeamMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: TeamInviteRequest) =>
      api.post<TeamInviteResponse>(`${API_V1_PREFIX}/teams/invite`, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['team-members'] }),
  });
}

export function useUpdateTeamMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ memberId, body }: { memberId: string; body: TeamMemberUpdateRequest }) =>
      api.put<GenericSuccessResponse>(`${API_V1_PREFIX}/teams/members/${memberId}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
    },
  });
}

export function useDeleteTeamMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (memberId: string) =>
      api.delete<GenericSuccessResponse>(`${API_V1_PREFIX}/teams/members/${memberId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['team-members'] }),
  });
}

export function findMemberById(members: TeamMember[] | undefined, memberId: string) {
  if (!members) return null;
  return members.find((member) => member.id === memberId) ?? null;
}
