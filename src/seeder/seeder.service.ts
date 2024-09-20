import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DifficultyType } from 'src/typeorm/entities/DifficultyType';
import { Repository } from 'typeorm';

@Injectable()
export class SeederService {
  constructor(
    @InjectRepository(DifficultyType)
    private readonly difficultyRepository: Repository<DifficultyType>,
  ) {}

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
        console.log(`Difficulty ${difficulty.title} has been seeded`);
      }
    }

    console.log('Difficulties seeding completed');
  }
}
