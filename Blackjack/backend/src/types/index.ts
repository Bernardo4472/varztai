// /backend/types/index.ts
export interface User {
    id: number;
    username: string;
    email: string;
    password: string;
    balance: number;
    created_at: Date;
  }
  
  export interface Game {
    id: number;
    player_id: number;
    bet_amount: number;
    result: string;
    created_at: Date;
  }