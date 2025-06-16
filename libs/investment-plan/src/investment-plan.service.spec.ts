import { Test, TestingModule } from '@nestjs/testing';
import { InvestmentPlanService } from './investment-plan.service';

describe('InvestmentPlanService', () => {
  let service: InvestmentPlanService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InvestmentPlanService],
    }).compile();

    service = module.get<InvestmentPlanService>(InvestmentPlanService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
