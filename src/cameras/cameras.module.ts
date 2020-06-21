import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CamerasController } from './cameras.controller';
import { CamerasService } from './cameras.service';
import { CameraSchema } from './schemas/camera.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Camera', schema: CameraSchema, collection: 'Cameras' }
    ])
  ],
  controllers: [CamerasController],
  providers: [CamerasService]
})
export class CamerasModule {
}
