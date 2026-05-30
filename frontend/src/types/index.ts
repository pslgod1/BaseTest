export type Role = 'USER' | 'ADMIN';

export type CompetencyType = 'LITERACY' | 'COMMUNICATIONS' | 'SAFETY' | 'CONSUMPTION';

export interface UserDTO {
  id: number;
  name: string;
  email: string;
  password: string;
  createAt: string;
  role: Role;
}

export interface QuestionDTO {
  id: number;
  question: string;
  answers: string[];
  correctAnswerIndex: number;
  type: CompetencyType;
}

export interface TestDTO {
  id: number;
  title: string;
  description: string;
  timeLimitMinutes: number;
  createAt: string;
  questions: QuestionDTO[];
  admin: UserDTO;
}

export interface UserAnswerDTO {
  id: number;
  questionDTO: QuestionDTO;
  selectedAnswerIndex: number;
  isCorrect: boolean;
  answerAt: string;
}

export interface UserTestDTO {
  id: number;
  user: UserDTO;
  test: TestDTO;
  startAt: string;
  completedAt: string;
  percentage: number;
  answers: UserAnswerDTO[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  redirectUrl: string;
}

export interface RegisterCodeRequest {
  email: string;
  password: string;
  name: string;
}

export interface RegistrationResponse {
  success: boolean;
  message: string;
  registrationId: string;
}

export interface VerifyRegisterRequest {
  registrationId: string;
  code: string;
}

export interface ErrorResponse {
  message: string;
  errorMessage: string;
  errorTime: string;
}
