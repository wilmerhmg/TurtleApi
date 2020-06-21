import { Module } from '@nestjs/common';
import { DaemonService } from './daemon.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CameraSchema } from '../cameras/schemas/camera.schema';
import { VideoSchema } from '../video/schemas/video.schema';
import { DaemonController } from './daemon.controller';
import { VideoService } from '../video/video.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Camera', schema: CameraSchema, collection: 'Cameras' },
      { name: 'Video', schema: VideoSchema, collection: 'Videos' }
    ])
  ],
  providers: [DaemonService, VideoService],
  controllers: [DaemonController]
})
export class DaemonModule {
}
