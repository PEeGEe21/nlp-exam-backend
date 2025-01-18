import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DifficultyTypesService } from 'src/difficulty-types/services/difficulty-types.service';
import { OptionTypesService } from 'src/option-types/services/option-types.service';
import { Answer } from 'src/typeorm/entities/Answer';
import { DifficultyType } from 'src/typeorm/entities/DifficultyType';
import { OptionType } from 'src/typeorm/entities/OptionType';
import { Question } from 'src/typeorm/entities/Question';
import { QuestionTest } from 'src/typeorm/entities/QuestionTest';
import { Result } from 'src/typeorm/entities/Result';
import { Student } from 'src/typeorm/entities/Student';
import { Test } from 'src/typeorm/entities/Test';
import { User } from 'src/typeorm/entities/User';
import { ResultsScore } from 'src/typeorm/entities/ResultsScore';
import { UsersService } from 'src/users/services/users.service';
import { Repository } from 'typeorm';
import { AuthService } from 'src/auth/services/auth.service';

@Injectable()
export class SeederService {
  constructor(

    // export the service
    private usersService: UsersService,
    private authService: AuthService,
    private difficultyService: DifficultyTypesService,
    private optionService: OptionTypesService,

    @InjectRepository(DifficultyType) private readonly difficultyRepository: Repository<DifficultyType>,
    @InjectRepository(OptionType) private readonly optionTypeRepository: Repository<OptionType>,
    @InjectRepository(Question) private readonly questionRepository: Repository<Question>,
    @InjectRepository(Answer) private readonly answerRepository: Repository<Answer>,
    @InjectRepository(Test) private readonly testRepository: Repository<Test>,
    @InjectRepository(Student) private readonly studentRepository: Repository<Student>,
    @InjectRepository(Result) private readonly resultRepository: Repository<Result>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(QuestionTest) private readonly questionTestRepository: Repository<QuestionTest>,
    @InjectRepository(ResultsScore) private readonly resultsScoreRepository: Repository<ResultsScore>,


  ) {}

  async seedAdmin() {
    // await this.userRepository.delete(13);

    const users = [
      { 
        fname: process.env.SUPER_FIRSTNAME, 
        lname: process.env.SUPER_LASTNAME, 
        username: process.env.SUPER_USERNAME, 
        email: process.env.SUPER_EMAIL, 
        password: process.env.SUPER_PASSWORD, 
        cpassword: process.env.SUPER_PASSWORD,
        user_role: process.env.SUPER_SIGNUP
      },      
    ];

    for (const user of users) {
      const existingUser = await this.userRepository.findOne({ where: { email: user.email } });
      if(existingUser){
        return;
      }
      const savedData = await this.authService.signUpAsAdmin(user);
      if(savedData.success == 'success'){
        const data = {
            success: 'success',
            message: 'User created successfully',
        }
        return data
      }
    }

    console.log('Admin seeding completed');
  }

  async seedOptionTypes() {
    const questionTypes = [
      {
          description: "An option type where you can choose on in the list of options", 
          id: 1, 
          title: "Multiple Choice Single Answer"
      },
      // {
      //     description: "An option type where explanations are required as answer.", 
      //     id: 2, 
      //     title: "Subjective Question"
      // },
      {
          description: "An option type where one can give their own answer", 
          id: 3, 
          title: "Theoretical Question"
      },
    ]

    for (const questionType of questionTypes) {
      const existingQuestionType = await this.optionTypeRepository.findOne({ where: { id: questionType.id } });
      if (!existingQuestionType) {
        const newQuestionType = this.optionTypeRepository.create({
          ...questionType,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        await this.optionTypeRepository.save(newQuestionType);
        // console.log(`Difficulty ${difficulty.title} has been seeded`);
      }
    }

    // console.log('Difficulties seeding completed');
  }

  async seedDifficulties() {
    const difficulties = [
      { id: 1, title: 'EASY', description: null },
      { id: 2, title: 'MEDIUM', description: null },
      { id: 3, title: 'INTERMEDIATE', description: null },
      { id: 4, title: 'ADVANCED', description: null },
      { id: 5, title: 'HARD', description: null },
    ];

    for (const difficulty of difficulties) {
      const existingDifficulty = await this.difficultyRepository.findOne({ where: { id: difficulty.id } });
      if (!existingDifficulty) {
        const newDifficulty = this.difficultyRepository.create({
          ...difficulty,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        await this.difficultyRepository.save(newDifficulty);
        // console.log(`Difficulty ${difficulty.title} has been seeded`);
      }
    }

    // console.log('Difficulties seeding completed');
  }

  async seedQuestions() {
    const questions = [
      {
        id: 1,
        userId: 2,
        difficultyId: 3,
        optionTypeId: 1,
        question: "What is the capital of France?",
        answers: [
          { id: 1, content: "Paris", isCorrect: true },
          { id: 2, content: "London", isCorrect: false },
          { id: 3, content: "Berlin", isCorrect: false },
          { id: 4, content: "Madrid", isCorrect: false }
        ]
      },
      {
        id: 2,
        userId: 1,
        difficultyId: 3,
        optionTypeId: 1,
        question: "The Earth is flat.",
        answers: [
          { id: 1, content: "True", isCorrect: false },
          { id: 2, content: "False", isCorrect: true }
        ]
      },
      {
        id: 3,
        userId: 2,
        difficultyId: 4,
        optionTypeId: 1,
        question: "Which planet is known as the Red Planet?",
        answers: [
          { id: 1, content: "Mars", isCorrect: true },
          { id: 2, content: "Jupiter", isCorrect: false },
          { id: 3, content: "Saturn", isCorrect: false },
          { id: 4, content: "Venus", isCorrect: false }
        ]
      },
    ];

    // console.log(questions, 'questions')

    for (const question of questions) {
      console.log(question, 'ooon')
      const existingQuestion = await this.questionRepository.findOne({ where: { id: question.id } });

      const user = await this.usersService.getUserAccountById(question.userId)
      
      const difficultyType = await this.difficultyService.getDifficultyById(question.difficultyId)

      // const optionType = null;
      const optionType = await this.optionService.getOptionTypeById(question.optionTypeId)

      // console.log(difficultyType.project.id, existingQuestion, optionType, difficultyType, 'exists')
      if (!existingQuestion) {
        const newQuestion = this.questionRepository.create({
          userId: user.id,
          difficultyId: difficultyType.project.id,
          optionTypeId: optionType.project.id,
          isEditor: null,
          question: question.question,
          questionPlain: null,
          marks: Number(0),
          instruction: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        // console.log(newQuestion, 'newQuestion')

        const newNewQuestion = await this.questionRepository.save(newQuestion);

      //   console.log(newNewQuestion, 'knn')
        await this.createAnswers(question, newNewQuestion);

        console.log(`Question ${question.question} has been seeded`);
      }
    }

    // console.log('Questions seeding completed');
  }

  async createAnswers(question, newQuestion){
    for (const answer of question.answers) {
      // const existingAnswer = await this.answerRepository.findOne({ where: { id: answer.id } });
      // if (!existingAnswer) {
        const newAnswer = this.answerRepository.create({
          question: newQuestion,
          isCorrect: answer.isCorrect ? 1 : 0,
          content: answer.content,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
          
        await this.answerRepository.save(newAnswer);
      // }
    }
  }

  async seedTests() {
    const tests = [
      {
        id: 1,
        userId: 3,
        title: "Introduction to React",
        code: "REACT101",
        questionMark: 50,
        description: "A basic introduction to React and its core concepts.",
        startDateTime: { date: "2024-09-20", time: "09:00" },
        endDateTime: { date: "2024-09-20", time: "12:00" },
        duration: { hour: 3, min: 0 }
      },
      {
        id: 2,
        userId: 3,
        title: "Advanced JavaScript",
        code: "JS202",
        questionMark: 70,
        description: "Deep dive into advanced JavaScript topics including closures, promises, and async/await.",
        startDateTime: { date: "2024-10-05", time: "14:00" },
        endDateTime: { date: "2024-10-05", time: "15:00" },
        duration: { hour: 3, min: 0 }
      },
      {
        id: 3,
        userId: 2,
        title: "Database Management",
        code: "DB301",
        questionMark: 40,
        description: "Understanding relational databases, SQL queries, and database design principles.",
        startDateTime: { date: "2024-11-01", time: "10:00" },
        endDateTime: { date: "2024-11-01", time: "13:00" },
        duration: { hour: 3, min: 0 }
      },
      {
        id: 4,
        userId: 3,
        title: "Introduction to Python",
        code: "PYTHON101",
        questionMark: 60,
        description: "An introduction to Python programming including syntax, data structures, and basic algorithms.",
        startDateTime: { date: "2024-12-15", time: "08:00" },
        endDateTime: { date: "2024-12-15", time: "11:00" },
        duration: { hour: 3, min: 0 }
      }
    ];

    for (const testData of tests) {
      const existingTest = await this.testRepository.findOne({ where: { id: testData.id } });
      const user = await this.usersService.getUserAccountById(testData.userId)

      if (!existingTest) {
        const newTest = this.testRepository.create({
          userId: user.id,
          title: testData.title,
          code: testData.code,
          totalMarks: testData.questionMark,
          instructions: testData.description,
          startDate: new Date(`${testData.startDateTime.date}T${testData.startDateTime.time}:00Z`),
          endDate: new Date(`${testData.endDateTime.date}T${testData.endDateTime.time}:00Z`),
          durationHours: testData.duration.hour,
          durationMinutes: testData.duration.min,
        });

        await this.testRepository.save(newTest);
        console.log(`Test ${testData.title} has been seeded`);
      } else {
        console.log(`Test ${testData.title} already exists`);
      }
    }

    console.log('Test seeding completed');
  }

  async seedResults() {
    const results = [
      {
        studentId: 1,
        testId: 1,
        startDate: new Date('2024-09-20T09:00:00Z'),
        endDate: new Date('2024-09-20T12:00:00Z'),
        serverEndDate: new Date('2024-09-20T12:05:00Z'),
        duration: 180, // 3 hours in minutes
        totalScored: 45,
        manualLock: 0,
        totalCount: 50,
        totalMarks: 50,
        // questionTestIds: ['QT101', 'QT102', 'QT103'],
        userId: 3, // Link to the user (instructor/teacher)
      },
      {
        studentId: 1,
        testId: 2,
        startDate: new Date('2024-10-05T14:00:00Z'),
        endDate: new Date('2024-10-05T15:00:00Z'),
        serverEndDate: new Date('2024-10-05T15:05:00Z'),
        duration: 60, // 1 hour in minutes
        totalScored: 60,
        manualLock: 0,
        totalCount: 70,
        totalMarks: 70,
        // questionTestIds: [1, 2, 'QT203'],
        userId: 3, // Link to the user (instructor/teacher)
      },
      // Add more results as needed
    ];

    for (const resultData of results) {
      const studentCheck = await this.studentRepository.findOne({ where: { id: resultData.studentId } });
        console.log(studentCheck)
      const testCheck = await this.testRepository.findOne({ where: { id: resultData.testId } });
        

      const existingResult = await this.resultRepository.findOne({
        where: { student: studentCheck, test: testCheck },
      });

      console.log(!existingResult && studentCheck && testCheck)
      if (!existingResult && studentCheck && testCheck) {
        
        const user = await this.userRepository.findOne({ where: { id: resultData.userId } });

        const questions = await this.questionTestRepository.find({ where: { testId: testCheck.id } });

        const questionTestIds = questions.map((question) => question.id);

        if (user && testCheck) {
          const newResult = this.resultRepository.create({
            student: studentCheck,
            testId: testCheck.id,
            startDate: resultData.startDate,
            endDate: resultData.endDate,
            serverEndDate: resultData.serverEndDate,
            duration: resultData.duration,
            totalScored: resultData.totalScored,
            manualLock: resultData.manualLock,
            totalCount: resultData.totalCount,
            totalMarks: resultData.totalMarks,
            questionTestIds: questionTestIds,
            user,
            test: testCheck,
          });

          await this.resultRepository.save(newResult);
          console.log(`Result for student ${resultData.studentId} in test ${testCheck.title} has been seeded`);
        }
      } else {
        console.log(`Result for student ${resultData.studentId} in test ${resultData.testId} already exists`);
      }
    }

    console.log('Result seeding completed');
  }

  async seedResultsScores() {
    const results = await this.resultRepository.find({relations: ['test']});
    
    for (const result of results) {
      // const testCheck = await this.testRepository.findOne({ where: {id: result.test.id}});
      // console.log(testCheck, result.test, 'ssdsd')
      const questions = await this.questionTestRepository.find({ where: { testId: result.test.id } });

      // console.log( result.test, questions, 'questions')

      for (const question of questions) {
        // console.log(question, 'question')
        const existingScore = await this.resultsScoreRepository.findOne({
          where: { resultId: result.id, questionTest: question },
        });

        // console.log(existingScore, result.test, 'sdsd');

        if (!existingScore && result.test) {
          const newScore = this.resultsScoreRepository.create({
            resultId: result.id,
            result: result,
            test: result.test,
            questionId: question.questionId,
            score: '0',
            scored: false,
            state: 0,
            questionTest: question,
            time: 0,
            isCorrect: false,
          });

          await this.resultsScoreRepository.save(newScore);
          console.log(`ResultsScore for result ${result.id} and question ${question.id} has been seeded`);
        }
      }
    }

    // console.log('ResultsScore seeding completed');
  }

}
