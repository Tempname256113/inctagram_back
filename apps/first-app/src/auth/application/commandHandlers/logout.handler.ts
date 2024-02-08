import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RefreshTokenPayloadType } from '../../types/tokens.models';
import { UnauthorizedException } from '@nestjs/common';
import { TokensService } from '../../utils/tokens.service';
import { UserRepository } from '../../repositories/user.repository';
import { Response } from 'express';

export class LogoutCommand {
  constructor(public readonly data: { refreshToken: string; res: Response }) {}
}

@CommandHandler(LogoutCommand)
export class LogoutHandler implements ICommandHandler<LogoutCommand, void> {
  constructor(
    private readonly tokensService: TokensService,
    private readonly userRepository: UserRepository,
  ) {}
  async execute(command: LogoutCommand): Promise<void> {
    const {
      data: { refreshToken, res },
    } = command;

    const refreshTokenPayload: RefreshTokenPayloadType | null =
      await this.tokensService.verifyRefreshToken(refreshToken);

    if (!refreshTokenPayload) {
      throw new UnauthorizedException('Refresh token is invalid');
    }

    await this.userRepository.deleteSession({
      userId: refreshTokenPayload.userId,
      refreshTokenUuid: refreshTokenPayload.uuid,
    });

    this.tokensService.removeRefreshTokenInCookie(res);
  }
}
