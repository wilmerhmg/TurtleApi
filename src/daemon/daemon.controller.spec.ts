import { Test, TestingModule } from '@nestjs/testing';
import { DaemonController } from './daemon.controller';

describe('Daemon Controller', () => {
  let controller: DaemonController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DaemonController],
    }).compile();

    controller = module.get<DaemonController>(DaemonController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
