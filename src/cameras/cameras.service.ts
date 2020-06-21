import { GoneException, HttpStatus, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ICamera } from './interfaces/ICamera';
import { CameraDTO } from './dto/camera.dto';
import { EntityDeleted, EntityUpdated } from './interfaces/responses';

@Injectable()
export class CamerasService {
  constructor(@InjectModel('Camera') private readonly cameraModel: Model<ICamera>) {
  }

  async getAll(Conditions: CameraDTO): Promise<ICamera[]> {
    const Cameras = await this.cameraModel.find(Conditions);
    if (!Cameras.length) {
      throw new NotFoundException('The query does not results');
    }
    return Cameras;
  }

  async GetOne(CameraId: string): Promise<ICamera> {
    const FoundCamera: ICamera = await this.cameraModel.findOne({ CameraId });
    if (!FoundCamera) {
      throw new NotFoundException('Camera does not exist');
    }
    return FoundCamera;
  }

  async Create(DataInput: CameraDTO): Promise<ICamera> {
    const CameraModel: ICamera = new this.cameraModel(DataInput);
    try {
      return await CameraModel.save();
    } catch (Exception) {
      throw new UnprocessableEntityException(Exception.message, Exception.code);
    }
  }

  async Update(DataInput: CameraDTO, CameraId: string): Promise<ICamera> {
    try {
      const UpdateResult: EntityUpdated = await this.cameraModel.updateOne(
        { CameraId }, DataInput, { runValidators: true }
      );
      if (!UpdateResult.ok || !UpdateResult.n) {
        throw new NotFoundException('The entity is not updated');
      }
      const UpdatedCamera: ICamera = await this.cameraModel.findOne({ CameraId });

      return UpdatedCamera;
    } catch (Exception) {
      if (Exception instanceof NotFoundException) {
        throw new NotFoundException(Exception.message);
      } else {
        throw new UnprocessableEntityException(Exception.message, Exception.code);
      }
    }
  }

  async Delete(CameraId: string): Promise<boolean> {
    try {
      const DeleteResult: EntityDeleted = await this.cameraModel.deleteOne({ CameraId });
      if (!DeleteResult.ok || !DeleteResult.deletedCount) {
        throw new NotFoundException('The entity is not deleted');
      }
      return true;
    } catch (Exception) {
      if (Exception instanceof NotFoundException) {
        throw new NotFoundException(Exception.message);
      } else {
        throw new UnprocessableEntityException(Exception.message, Exception.code);
      }
    }
  }
}
