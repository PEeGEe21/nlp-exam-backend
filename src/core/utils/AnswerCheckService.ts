import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class AnswerCheckService {
  constructor(private readonly httpService: HttpService) {}

  async checkTheoreticalAnswer(answer: string, hints: any): Promise<any> {
    try {
        //   const response = await this.httpService.post('AI_API_URL', {
        //     answer,
        //     hints,
        //   }).toPromise();

      const { data } = await firstValueFrom(
        this.httpService.post(process.env.AI_API_URL, {
            answer,
            hints,
        }).pipe(
            catchError((error: AxiosError) => {
                // this.logger.error(error.response.data);
                throw 'An error happened!';
            }),
            ),
        );
  

      // Process the AI response and determine if the answer is correct.
      const isCorrect = data.data.isCorrect;

      return isCorrect;
    } catch (error) {
      console.error('Error checking answer:', error);
      throw new Error('Failed to check the answer.');
    }
  }
}
