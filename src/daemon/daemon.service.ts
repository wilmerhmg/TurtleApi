import { Injectable, OnModuleInit, Logger, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { ICamera } from '../cameras/interfaces/ICamera';
import { IDropEvent, IRecConfig, IShortEvent, Recorder } from '../clases/recorder';
import { InjectModel } from '@nestjs/mongoose';
import { IVideo } from '../video/interfaces/video.interface';

@Injectable()
export class DaemonService implements OnModuleInit {
  private Streamers: Recorder[] = [];

  constructor(
    @InjectModel('Camera') private readonly MCamera: Model<ICamera>,
    @InjectModel('Video') private readonly MVideo: Model<IVideo>
  ) {
  }

  async onModuleInit(): Promise<void> {
    const Cameras: ICamera[] = await this.MCamera.find();

    for (const Camera of Cameras) {
      const Config: IRecConfig = {
        Name: Camera.CameraId,
        Protocol: Camera.Protocol,
        UserName: Camera.UserName,
        Password: Camera.Password,
        Address: Camera.Address,
        TimeLimit: 30,
        Target: 'Media'
      };
      const Stream = new Recorder(Config);
      Stream.StartRecording();
      Stream.on('RecordingStart', this.OnRecordingStart.bind(this));
      Stream.on('DropSegment', this.OnDropSegment.bind(this));
      Stream.on('SegmentShort', this.OnSegmentShort.bind(this));
      this.Streamers.push(Stream);
    }
  }

  OnRecordingStart(Config: IRecConfig, Recording: boolean): void {
    Logger.log('Recording ' + Config.Address + ' ' + Recording, 'DaemonService');
  }

  OnDropSegment(MediaDrop: IDropEvent): Promise<boolean> {
    Logger.log(`OnDropSegment Id: ${MediaDrop.Id}, Seq: ${MediaDrop.Sequence}`, 'DaemonService');
    return this.MVideo.deleteOne({
      Id: MediaDrop.Id,
      Sequence: MediaDrop.Sequence
    }).then(
      this.DropVideoSuccess
    ).catch(
      this.DropVideoFail
    );
  }

  OnSegmentShort(MediaShort: IShortEvent) {
    this.MVideo.create(MediaShort);
  }

  DropVideoSuccess(): boolean {
    Logger.log('Deleted Succcess', 'DaemonService');
    return true;
  }

  DropVideoFail(MError: Error): boolean {
    Logger.log('Deleted Fail' + MError.message, 'DaemonService');
    return false;
  }

  async Cut(IdCamera: string): Promise<boolean> {
    const FindById = (rCamera: Recorder): boolean => rCamera.Id === IdCamera;
    const Founds: Recorder[] = this.Streamers.filter(FindById);
    if (!Founds.length) {
      throw new NotFoundException('The StreamId NotFound');
    }
    await Founds[0].KillStream(false);
    return new Promise<boolean>((resolve, reject): void => {
      setTimeout(() => {
        resolve(true);
      }, 1000);
    });
  }
}
