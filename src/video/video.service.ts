import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IVideo } from './interfaces/video.interface';
import { copyFileSync, existsSync, mkdirSync } from 'fs';
import { basename, resolve } from 'path';
import { Guid } from 'guid-typescript';

@Injectable()
export class VideoService {
  constructor(
    @InjectModel('Video') private readonly MVideo: Model<IVideo>
  ) {
  }

  AvailableSources(IdCamera: string): Promise<IVideo[]> {
    return this.MVideo.find({
      Id: IdCamera
    }).catch(
      this.QueryFail
    );
  }

  QueryFail(MError: Error): IVideo[] {
    return [];
  }

  async JoinMedia(IdCamera: string) {
    const Sources: IVideo[] = await this.AvailableSources(IdCamera);
    const Operation: Guid = Guid.create();
    const Videos: string[] = [];
    for (const Video of Sources) {
      const Copied: string = this.CopyToSecurePath(Video.FilePath, Operation);
      Videos.push(Copied);
    }
    return Videos;
  }

  CopyToSecurePath(Path: string, Random: Guid): string {
    const FileName: string = basename(Path);
    const Base: string = `Media/${Random}`;
    const Destination: string = `${Base}/${FileName}`;
    if (!existsSync(Base)) {
      mkdirSync(Base);
    }
    copyFileSync(Path, Destination);
    return Destination;
  }
}
