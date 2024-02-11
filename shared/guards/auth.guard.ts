import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { TokensService } from 'apps/first-app/src/auth/utils/tokens.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly tokensService: TokensService) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const decodeData = await this.tokensService.verifyAccessToken(
      req.get('Authorization'),
    );

    req.user = { userId: +decodeData.userId };

    return true;
  }
}
