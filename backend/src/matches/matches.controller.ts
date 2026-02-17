import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { MatchFiltersDto } from './dto/match-filters.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { SubscriptionGuard } from '../common/guards/subscription.guard';
import { RequireSubscription } from '../common/decorators/subscription.decorator';

@Controller('matches')
@UseGuards(JwtAuthGuard)
export class MatchesController {
  constructor(private matchesService: MatchesService) {}

  @Get()
  async findMatches(@CurrentUser('id') userId: string, @Query() filters: MatchFiltersDto) {
    return this.matchesService.findMatches(userId, filters);
  }

  @Get('score/:targetUserId')
  getMatchScore(@CurrentUser('id') userId: string, @Param('targetUserId') targetUserId: string) {
    return this.matchesService.getMatchScore(userId, targetUserId);
  }
}