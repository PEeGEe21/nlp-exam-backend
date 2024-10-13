import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import axios, { AxiosError } from 'axios';
import OpenAI from "openai";

const openai = new OpenAI({
    organization: "org-wXAbEGeCjCeWojJWWqiEHQMr",
    project: "$PROJECT_ID",
});

@Injectable()
export class AnswerCheckService {
  constructor(private readonly httpService: HttpService) {}

  async checkTheoreticalAnswer(answer: string, hints: any): Promise<any> {
    try {
        //   const response = await this.httpService.post('AI_API_URL', {
        //     answer,
        //     hints,
        //   }).toPromise();

        //   const { data } = await firstValueFrom(
        //     this.httpService.post(process.env.OPENAI_API_URL, {
        //         answer,
        //         hints,
        //     }, {
        //         headers: {
        //             'Content-Type': "application/json",
        //             'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        //             "OpenAI-Organization": org-wXAbEGeCjCeWojJWWqiEHQMr,
        //             "OpenAI-Project": $PROJECT_ID
        //             // 'anthropic-version': `Bearer ${process.env.AI_API_KEY}`,
        //         }
        //     }).pipe(
        //         catchError((error: AxiosError) => {
        //             // this.logger.error(error.response.data);
        //             throw 'An error happened!';
        //         }),
        //         ),
        //     );

        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
              model: 'gpt-4o-mini', // Update the model if needed
              messages: [{ role: 'user', content: 'hello chat' }],
              temperature: 0.7,
            },
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
              },
            }
          );
  

          console.log(response, 'gpt reponse heree');
      // Process the AI response and determine if the answer is correct.
    //   const isCorrect = response.data.isCorrect;

    //   return isCorrect;
    } catch (error) {
        if (error.response && error.response.status === 429) {
            console.log('Rate limit exceeded, retrying after a delay...');
            await new Promise(resolve => setTimeout(resolve, 10000)); // Wait for 10 seconds
            return this.checkTheoreticalAnswer(answer, hints); // Retry the request
        } else {
            throw error;
        }
    //   console.error('Error checking answer:', error);
    //   throw new Error('Failed to check the answer.');
    }
  }
}
