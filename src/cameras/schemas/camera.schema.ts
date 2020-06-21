import { Schema } from 'mongoose';

export const CameraSchema: Schema = new Schema({
  MesaId: {
    type: Number,
    required: true
  },
  CameraId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    index: true
  },
  Address: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    index: true
  },
  Port: {
    type: Number,
    default: 554,
    required: true
  },
  UserName: {
    type: String,
    required: true
  },
  Password: {
    type: String,
    required: true
  },
  Protocol: {
    type: Buffer,
    default: Buffer.from([0b1110010, 0b1110100, 0b1110011, 0b1110000]),
    required: true
  }
});
