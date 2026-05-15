import { Timestamp } from "firebase/firestore";

export type Products = {
id: string;
name: String;
description: string;
price:number;
categoria?: string;
imgeUrl: string;
stock?: number;
createdAt: Timestamp;
}

