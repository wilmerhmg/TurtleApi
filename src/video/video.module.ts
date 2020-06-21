import { Module } from '@nestjs/common';
import { VideoService } from './video.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CameraSchema } from '../cameras/schemas/camera.schema';
import { VideoSchema } from './schemas/video.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Camera', schema: CameraSchema, collection: 'Cameras' },
      { name: 'Video', schema: VideoSchema, collection: 'Videos' }
    ])
  ],
  providers: [VideoService]
})
export class VideoModule {}
