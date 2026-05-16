import { Timestamp } from "firebase/firestore";

export type User = {
    id: string;
    name: string;
    email: string;
    password: string;
    createdAt: Timestamp;
};

export type UserRole = "admin" | "customer";


