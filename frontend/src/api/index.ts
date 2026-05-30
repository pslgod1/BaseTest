import axios from 'axios';
import type {
  LoginRequest,
  LoginResponse,
  RegisterCodeRequest,
  RegistrationResponse,
  VerifyRegisterRequest,
  UserDTO,
  TestDTO,
  UserTestDTO,
  UserAnswerDTO,
} from '../types';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth
export const login = (data: LoginRequest) =>
  api.post<LoginResponse>('/auth/login', data);

export const logout = () =>
  api.post('/auth/logout');

export const sendRegistrationCode = (data: RegisterCodeRequest) =>
  api.post<RegistrationResponse>('/auth/register/send-code', data);

export const verifyRegistration = (data: VerifyRegisterRequest) =>
  api.post('/auth/register/verify', data);

export const resendVerificationCode = (registrationId: string) =>
  api.post('/auth/register/resend-code', null, { params: { registrationId } });

export const forgotPassword = (email: string) =>
  api.post('/auth/password/forgot', null, { params: { email } });

export const verifyResetCode = (resetId: string, code: string) =>
  api.post('/auth/password/verify', null, { params: { resetId, code } });

export const resetPassword = (resetId: string, newPassword: string) =>
    api.post('/auth/password/reset', null, { params: { resetId, newPassword } });

// Users
export const getMe = () =>
  api.get<UserDTO>('/users/me');

// Tests
export const getTests = () =>
  api.get<TestDTO[]>('/tests');

export const getTest = (id: number) =>
  api.get<TestDTO>(`/tests/${id}`);

// User Tests
export const getUserTests = () =>
  api.get<UserTestDTO[]>('/user-test');

export const getUserTest = (id: number) =>
  api.get<UserTestDTO>(`/user-test/${id}`);

export const createUserTestAttempt = (testId: number) =>
  api.post<UserTestDTO>(`/user-test/${testId}`);

export const completeUserTest = (id: number) =>
  api.post<UserTestDTO>(`/user-test/${id}/completed`);

// User Answers
export const submitAnswer = (data: { userTestId: number; questionId: number; selectedAnswerIndex: number }) =>
  api.post<UserAnswerDTO>('/user-answer', data);

export default api;
