import { AxiosInstance } from 'axios';
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  User,
  Organization,
  Member,
} from '../types/auth';

export class AuthAPI {
  constructor(private http: AxiosInstance) {}

  async register(data: RegisterRequest): Promise<LoginResponse> {
    const res = await this.http.post<LoginResponse>('/auth/register', data);
    return res.data;
  }

  async login(data: LoginRequest): Promise<LoginResponse> {
    const res = await this.http.post<LoginResponse>('/auth/login', data);
    return res.data;
  }

  async refresh(refreshToken: string): Promise<LoginResponse> {
    const res = await this.http.post<LoginResponse>('/auth/refresh', { refreshToken });
    return res.data;
  }

  async me(): Promise<User> {
    const res = await this.http.get<User>('/auth/me');
    return res.data;
  }

  async updateProfile(data: Partial<Pick<User, 'name' | 'avatarUrl'>>): Promise<User> {
    const res = await this.http.put<User>('/auth/profile', data);
    return res.data;
  }

  async updatePassword(currentPassword: string, newPassword: string): Promise<void> {
    await this.http.put('/auth/password', { currentPassword, newPassword });
  }

  async getOrganizations(): Promise<Organization[]> {
    const res = await this.http.get<Organization[]>('/auth/organizations');
    return res.data;
  }

  async getMembers(organizationId: string): Promise<Member[]> {
    const res = await this.http.get<Member[]>(`/auth/organizations/${organizationId}/members`);
    return res.data;
  }

  async inviteMember(organizationId: string, email: string, role: string): Promise<Member> {
    const res = await this.http.post<Member>(`/auth/organizations/${organizationId}/invite`, { email, role });
    return res.data;
  }
}
