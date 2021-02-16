import { makeMessage } from '@my/lib';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return makeMessage();
  }
}
