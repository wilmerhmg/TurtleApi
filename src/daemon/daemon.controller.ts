import { BadRequestException, Body, Controller, Post, Res } from '@nestjs/common';
import { DaemonService } from './daemon.service';
import { NextHandleFunction } from 'connect';
import { PlayDTO } from './dto/play.dto';
import { VideoService } from '../video/video.service';

@Controller('daemon')
export class DaemonController {
  constructor(
    private readonly Daemon: DaemonService,
    private readonly Video: VideoService
  ) {
  }

  @Post('/CutAndPlay')
  async ShortAndPlay(@Res() res, @Body() playDTO: PlayDTO): Promise<NextHandleFunction> {
    const Cutted: boolean = await this.Daemon.Cut(playDTO.Id);
    if (!Cutted) {
      throw new BadRequestException('The trimming was not successful');
    }
    const UnionMedia: string[] = await this.Video.JoinMedia(playDTO.Id);
    return res.json(UnionMedia);
  }
}
