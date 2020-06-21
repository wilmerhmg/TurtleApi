import { Document } from 'mongoose';

export interface ICamera extends Document {
  MesaId: number;
  CameraId: string;
  Address: string;
  Port: number;
  UserName: string;
  Password: string;
  Protocol: Buffer;
}
