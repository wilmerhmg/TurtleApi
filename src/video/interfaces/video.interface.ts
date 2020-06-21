import { Document } from 'mongoose';
import { IRecTime } from '../../clases/recorder';

export interface IVideo extends Document {
  Id: string;
  Sequence: number;
  FileName: string;
  FilePath: string;
  Time: IRecTime;
}
