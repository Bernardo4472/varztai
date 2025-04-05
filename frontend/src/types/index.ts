// src/types/index.ts
export interface User {
    id: number;
    username: string;
    email: string;
    balance: number;
  }
  
  export interface LoginFormData {
    email: string;
    password: string;
  }
  
  export interface RegisterFormData {
    username: string;
    email: string;
    password: string;
  }