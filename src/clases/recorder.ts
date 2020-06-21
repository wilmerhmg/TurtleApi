import * as Events from 'events';
import { existsSync, mkdirSync, readdirSync, unlinkSync } from 'fs';
import { extname, join, resolve, sep } from 'path';
import { ChildProcess, spawn, SpawnOptions } from 'child_process';
import { Logger } from '@nestjs/common';

export interface IRecConfig {
  Name: string;
  Protocol: Buffer | string;
  UserName: string;
  Password: string;
  Address: string;
  Port?: number;
  TimeLimit?: number;
  TotalFiles?: number;
  Target?: string;
}

export interface IRecTime {
  StartAt: Date;
  EndAt: Date;
  Duration: number;
}

export interface IProcess extends ChildProcess {
  binded?: boolean;
}

export interface IDropEvent {
  Id: string;
  Sequence: number;
  FileName: string;
}

export interface IShortEvent extends IDropEvent {
  FilePath: string;
  Time: IRecTime;
}

export class Recorder extends Events {
  private DisableStreaming: boolean = false;
  private WriteStream: IProcess = null;
  private Timer: NodeJS.Timeout = null;
  private Sequence: number = 0;
  private Time: IRecTime = {
    StartAt: new Date(),
    EndAt: null,
    Duration: 0
  };
  private Config: IRecConfig;
  private Name: string;
  private readonly Protocol: Buffer | string = 'tcp';
  private readonly UserName: string;
  private readonly Password: string;
  private readonly Address: string;
  private readonly Port: number = 554;
  private readonly TimeLimit: number = 120;
  private readonly TotalFiles: number = 2;
  private readonly Target: string;

  constructor(Config: IRecConfig) {
    super();
    this.Config = Config;
    this.Name = Config.Name;
    this.Protocol = Config.Protocol;
    this.UserName = Config.UserName;
    this.Password = Config.Password;
    this.Address = Config.Address;
    this.Target = Config.Target;
    this.Port = Config.Port ? Config.Port : this.Port;
    this.TimeLimit = Config.TimeLimit ? Config.TimeLimit : this.TimeLimit;
    this.TotalFiles = Config.TotalFiles ? Config.TotalFiles : this.TotalFiles;

    this.CreateDirectories(this.TargetBase);
    this.Sequence = this.ResumeSequence();
  }

  public get Id() {
    return this.Name;
  }

  private get TargetPath(): string {
    return resolve(this.TargetBase);
  }

  private get TargetBase(): string {
    return join(this.Target, this.Id);
  }

  private get BaseName(): string {
    return `${this.Name}-${this.Sequence.toString().padStart(4, '0')}`;
  }

  private get SecondsLimit(): number {
    return this.TimeLimit * 1000;
  }

  private get Source(): string {
    const BaseProtocol: string = this.Protocol instanceof Buffer ? this.Protocol.toString() : this.Protocol;
    return `${BaseProtocol}://${this.UserName}:${this.Password}@${this.Address}:${this.Port}/`;
  }

  private get FileName(): string {
    return `${this.BaseName}.mp4`;
  }

  private get MediaPath(): string {
    return join(this.TargetPath, this.FileName);
  }

  private get MediaArguments(): string[] {
    return ['-acodec', 'copy', '-vcodec', 'copy'];
  }

  private get ChildProcess(): ChildProcess {
    const Args: string[] = ['-i', this.Source, ...this.MediaArguments, this.MediaPath, '-y'];
    const Options: SpawnOptions = {
      detached: false,
      stdio: 'ignore'
    };
    return spawn('ffmpeg', Args, Options);
  }

  private PathOf(FileName: string): string {
    return join(this.TargetPath, FileName);
  }

  EventIsRecording(): boolean {
    const Exists: boolean = existsSync(this.MediaPath);
    super.emit('RecordingStart', this.Config, Exists);
    return Exists;
  }

  StartRecording(): void {
    this.RecordStream();
    setTimeout(this.EventIsRecording.bind(this), 3000);
  }

  StopRecording(): void {
    this.DisableStreaming = true;
    this.Sequence -= -1;
    if (this.Timer) {
      clearTimeout(this.Timer);
      this.Timer = null;
    }
    if (this.WriteStream) {
      this.KillStream(true);
    }
  }

  private RecordStream(): boolean | void {
    const Self: Recorder = this;
    if (this.Timer) {
      clearTimeout(this.Timer);
    }

    if (this.WriteStream && this.WriteStream.binded) {
      return false;
    }
    if (this.WriteStream && this.WriteStream.connected) {
      this.WriteStream.binded = true;
      this.WriteStream.once('exit', () => {
        Self.RecordStream();
      });
      this.KillStream(true);
      return false;
    }

    this.WriteStream = this.ChildProcess;

    this.WriteStream.once('exit', () => {
      if (Self.DisableStreaming) {
        return true;
      }
      Self.RecordStream();
    });

    this.Timer = setTimeout(Self.KillStream.bind(this, true), this.SecondsLimit);
  }

  KillStream(DropLast?: boolean): boolean | void {
    this.WriteStream.kill();
    const Recording = this.EventIsRecording();
    if (!Recording) {
      return false;
    }

    this.Time.EndAt = new Date();
    this.Time.Duration = Math.round((this.Time.EndAt.valueOf() - this.Time.StartAt.valueOf()) / 1000);

    super.emit('SegmentShort', {
      Id: this.Id,
      Sequence: this.Sequence,
      FileName: this.FileName,
      FilePath: this.MediaPath,
      Time: this.Time
    });

    this.Time.StartAt = new Date();
    this.Sequence += 1;

    if (DropLast) {
      this.GarbageCollector();
    }
  }

  private ResumeSequence(): number {
    const Files: string[] = readdirSync(this.TargetPath);
    if (!Files.length) {
      return 0;
    }
    const Last: string = Files.sort().pop();
    const Info: IDropEvent = this.DataOf(Last);
    return Info.Sequence;
  }

  private GarbageCollector(): void {
    const Files: string[] = readdirSync(this.TargetPath);
    const Drop: string[] = Files.sort().slice(0, this.TotalFiles * -1);
    for (const File of Drop) {
      const MetaData: IDropEvent = this.DataOf(File);
      unlinkSync(this.PathOf(File));
      super.emit('DropSegment', MetaData);
    }
  }

  private DataOf(File): IDropEvent {
    const Extension: string = extname(File);
    const BaseSequence: string = File.match(/(?:.(?<!-))+$/gm).join('');
    // tslint:disable-next-line:radix
    const ValueNumber: number = parseInt(BaseSequence.replace(Extension, ''));
    const OriginalName: string = File.match(/((?<=)(.*?)(?=-))+/gm).join('');
    return {
      Id: OriginalName,
      Sequence: ValueNumber,
      FileName: File
    };
  }

  private CreateDirectories(Route: string): void {
    const Separator: string = sep;
    const Folders: string[] = Route.split(Separator);
    let Current: string = '.';
    for (const Folder of Folders) {
      Current += Separator + Folder;
      if (existsSync(Current)) {
        continue;
      }
      mkdirSync(Current);
    }
  }
}
