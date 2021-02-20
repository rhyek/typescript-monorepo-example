import { capitalize } from '@my/lib';
import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AppService {
  getMyHello(): string {
    return capitalize('hello');
  }

  async getInternalApiHello(): Promise<string> {
    const { data } = await axios.get<string>(
      `http://localhost:${process.env.INTERNAL_API_PORT}`,
    );
    return data;
  }
}
