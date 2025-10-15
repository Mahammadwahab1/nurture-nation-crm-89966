// Mock authentication and user storage
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'counselor';
}

const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'Mahammad Wahab',
    email: 'gundluru.mahammadwahab@nxtwave.co.in',
    role: 'admin',
  },
  {
    id: '2',
    name: 'Angupriya Bharaththangam',
    email: 'angupriya.bharaththangam@nxtwave.co.in',
    role: 'admin',
  },
  {
    id: '3',
    name: 'John Counselor',
    email: 'counselor@example.com',
    role: 'counselor',
  },
];

const MOCK_PASSWORD = 'Nxtwave@1234';

export const mockLogin = (email: string, password: string): User | null => {
  if (password !== MOCK_PASSWORD) {
    return null;
  }

  const user = MOCK_USERS.find((u) => u.email === email);
  return user || null;
};

export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

export const setCurrentUser = (user: User): void => {
  localStorage.setItem('user', JSON.stringify(user));
};

export const logout = (): void => {
  localStorage.removeItem('user');
};
