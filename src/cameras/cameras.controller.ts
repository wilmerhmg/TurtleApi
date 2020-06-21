import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Res } from '@nestjs/common';
import { ResponseOK } from './interfaces/responses';
import { CameraDTO } from './dto/camera.dto';
import { NextHandleFunction } from 'connect';
import { CamerasService } from './cameras.service';
import { ICamera } from './interfaces/ICamera';

@Controller('cameras')
export class CamerasController {
  constructor(private cameraService: CamerasService) {

  }

  @Get('/search')
  async Search(@Res() res, @Body() cameraDTO: CameraDTO): Promise<NextHandleFunction> {
    const Finder: CameraDTO = cameraDTO;
    const Cameras: ICamera[] = await this.cameraService.getAll(Finder);

    const Response: ResponseOK = {
      statusCode: HttpStatus.OK,
      dataOutput: Cameras
    };

    return res.status(
      Response.statusCode
    ).json(
      Response
    );
  }

  @Get('/:CameraId')
  async ViewCamera(
    @Res() res, @Body() cameraDTO: CameraDTO,
    @Param('CameraId') CameraId: string
  ): Promise<NextHandleFunction> {
    const FoundCamera: ICamera = await this.cameraService.GetOne(CameraId);
    const Response: ResponseOK = {
      statusCode: HttpStatus.OK,
      dataOutput: FoundCamera
    };
    return res.status(
      Response.statusCode
    ).json(
      Response
    );
  }

  @Post('/')
  async Create(
    @Res() res, @Body() Request: CameraDTO
  ): Promise<NextHandleFunction> {
    const NewCamera: ICamera = await this.cameraService.Create(Request);
    const Response: ResponseOK = {
      statusCode: HttpStatus.OK,
      dataOutput: NewCamera
    };
    return res.status(
      Response.statusCode
    ).json(
      Response
    );
  }

  @Put('/:CameraId')
  async Update(
    @Res() res, @Body() cameraDTO: CameraDTO,
    @Param('CameraId') CameraId: string
  ): Promise<NextHandleFunction> {
    const UpdatedCamera: ICamera = await this.cameraService.Update(cameraDTO, CameraId);
    const Response: ResponseOK = {
      statusCode: HttpStatus.OK,
      dataOutput: UpdatedCamera
    };
    return res.status(
      Response.statusCode
    ).json(
      Response
    );
  }

  @Delete('/:CameraId')
  async DeleteCamera(
    @Res() res, @Param('CameraId') CameraId: string
  ): Promise<NextHandleFunction> {
    const Deleted: boolean = await this.cameraService.Delete(CameraId);
    const Response: ResponseOK = {
      statusCode: HttpStatus.OK,
      dataOutput: Deleted
    };
    return res.status(
      Response.statusCode
    ).json(
      Response
    );
  }

}
