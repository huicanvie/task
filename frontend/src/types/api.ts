export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

export interface ValidationError {
  loc: Array<string | number>;
  msg: string;
  type: string;
}

export interface HttpValidationError {
  detail?: ValidationError[];
}

export interface TeamMember {
  id: string;
  name?: string | null;
  email: string;
  role: string;
  two_factor_enabled: boolean;
  last_active_at?: string | null;
  status: string;
}

export interface TeamMembersResponse {
  success: boolean;
  data: TeamMember[];
  pagination: Record<string, number | boolean>;
  error?: Record<string, string> | null;
}

export interface TeamInviteRequest {
  email: string;
  role: string;
  message?: string | null;
  require_2fa?: boolean;
}

export interface TeamInviteResponse {
  success: boolean;
  data: Record<string, string>;
  error?: Record<string, string> | null;
}

export interface TeamMemberUpdateRequest {
  role?: string | null;
  status?: string | null;
}

export interface GenericSuccessResponse {
  success: boolean;
  data?: Record<string, string | boolean> | null;
  error?: Record<string, string> | null;
}

export interface SendVerificationRequest {
  email: string;
  plan: string;
}

export interface SendVerificationResponse {
  success: boolean;
  data: {
    verification_id: string;
    expires_at: string;
  };
  error?: Record<string, string> | null;
}

export interface VerifyEmailRequest {
  email: string;
  verification_id: string;
  verification_code: string;
}

export interface VerifyEmailResponse {
  success: boolean;
  data: {
    verification_token: string;
    expires_at: string;
  };
  error?: Record<string, string> | null;
}

export interface CreateDraftRequest {
  verification_token: string;
  full_name: string;
}

export interface CreateDraftResponse {
  success: boolean;
  data: {
    draft_id: string;
    verification_token?: string | null;
  };
  error?: Record<string, string> | null;
}

export interface FinalizeRegistrationRequest {
  verification_token: string;
  password: string;
  accept_terms: boolean;
}

export interface FinalizeRegistrationResponse {
  success: boolean;
  data: Record<string, unknown>;
  error?: Record<string, string> | null;
}

export interface LoginRequest {
  email: string;
  password: string;
  remember_me?: boolean;
  device_label?: string;
}

export interface LoginResponse {
  success: boolean;
  data: Record<string, unknown>;
  error?: Record<string, string> | null;
}

export interface DemoRequestCreateRequest {
  name: string;
  company_name: string;
  email: string;
  website?: string | null;
  monthly_visitors?: string | null;
  vertical?: string | null;
  contact_number?: string | null;
  business_description?: string | null;
}

export interface DemoRequestCreateResponse {
  success: boolean;
  data: {
    id: string;
  };
  error?: Record<string, string> | null;
}

export interface HealthResponse {
  [key: string]: unknown;
}
