import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CamerasModule } from './cameras/cameras.module';
import { MongooseModule } from '@nestjs/mongoose';
import { DaemonModule } from './daemon/daemon.module';
import { VideoModule } from './video/video.module';

@Module({
  imports: [
    CamerasModule,
    MongooseModule.forRoot('mongodb://mongoadmin:secret@localhost:27017', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true
    }),
    DaemonModule,
    VideoModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {
}
