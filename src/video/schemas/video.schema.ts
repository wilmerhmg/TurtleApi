import { Schema } from 'mongoose';

export const VideoSchema: Schema = new Schema({
  Id: {
    type: String
  },
  Sequence: {
    type: Number
  },
  FileName: {
    type: String
  },
  FilePath: {
    type: String
  },
  Time: {
    StartAt: {
      type: Date
    },
    EndAt: {
      type: Date
    },
    Duration: {
      type: Number
    }
  }
});
