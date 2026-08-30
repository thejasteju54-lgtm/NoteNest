import { repositories } from '@/repositories';
import { createStaticAcademicPdf } from '@/utils/samplePdfs';

export class SeedDataService {
  /**
   * Initializes realistic academic subjects and notes for new demo users.
   */
  async seedDemoUserData(userId: string): Promise<void> {
    if (!userId) return;

    // Check if user already has subjects
    const existingSubjects = await repositories.subjectRepo.getAll(userId);
    if (existingSubjects.length > 0) return;

    // 1. Mathematics
    const math = await repositories.subjectRepo.create({
      userId,
      name: 'Mathematics',
      colorId: 'sage',
      description: 'Calculus, Linear Algebra, and Differential Equations',
    });

    const mathPdf1 = createStaticAcademicPdf(
      'Unit 1 Calculus Notes',
      'Mathematics',
      ['Limits, continuity, derivatives, and applications of differential calculus.']
    );
    await repositories.noteRepo.create(
      {
        userId,
        subjectId: math.id,
        title: 'Unit 1 Calculus Notes',
        fileName: 'Unit 1 Calculus Notes.pdf',
        fileSize: mathPdf1.size,
        fileType: 'application/pdf',
      },
      mathPdf1
    );

    const mathPdf2 = createStaticAcademicPdf(
      'Important Formulas Cheat Sheet',
      'Mathematics',
      ['Integration tables, Laplace transforms, and trigonometric identities.']
    );
    await repositories.noteRepo.create(
      {
        userId,
        subjectId: math.id,
        title: 'Important Formulas Cheat Sheet',
        fileName: 'Important Formulas Cheat Sheet.pdf',
        fileSize: mathPdf2.size,
        fileType: 'application/pdf',
      },
      mathPdf2
    );

    // 2. Physics
    const physics = await repositories.subjectRepo.create({
      userId,
      name: 'Physics',
      colorId: 'blue',
      description: 'Mechanics, Electromagnetism, and Optics',
    });

    const physicsPdf1 = createStaticAcademicPdf(
      'Mechanics & Dynamics Lecture Notes',
      'Physics',
      ['Newtonian mechanics, rotational kinematics, and conservation laws.']
    );
    await repositories.noteRepo.create(
      {
        userId,
        subjectId: physics.id,
        title: 'Mechanics & Dynamics Lecture Notes',
        fileName: 'Mechanics & Dynamics.pdf',
        fileSize: physicsPdf1.size,
        fileType: 'application/pdf',
      },
      physicsPdf1
    );

    // 3. Electrical Engineering
    const ee = await repositories.subjectRepo.create({
      userId,
      name: 'Electrical Engineering',
      colorId: 'sand',
      description: 'Circuit Analysis, AC/DC Networks, and Transformers',
    });

    const eePdf1 = createStaticAcademicPdf(
      'Circuit Theory Unit 1',
      'Electrical Engineering',
      ['Kirchhoff laws, Thevenin and Norton theorems, and nodal analysis.']
    );
    await repositories.noteRepo.create(
      {
        userId,
        subjectId: ee.id,
        title: 'Circuit Theory Unit 1',
        fileName: 'Circuit Theory Unit 1.pdf',
        fileSize: eePdf1.size,
        fileType: 'application/pdf',
      },
      eePdf1
    );

    // 4. Programming
    const prog = await repositories.subjectRepo.create({
      userId,
      name: 'Programming',
      colorId: 'lavender',
      description: 'C Programming, Data Structures, and Lab Manuals',
    });

    const progPdf1 = createStaticAcademicPdf(
      'C Programming & Pointers Guide',
      'Programming',
      ['Pointers, dynamic memory allocation, structs, and file handling in C.']
    );
    await repositories.noteRepo.create(
      {
        userId,
        subjectId: prog.id,
        title: 'C Programming & Pointers Guide',
        fileName: 'C Programming Guide.pdf',
        fileSize: progPdf1.size,
        fileType: 'application/pdf',
      },
      progPdf1
    );

    const progPdf2 = createStaticAcademicPdf(
      'Computer Science Lab Manual',
      'Programming',
      ['Laboratory assignments, algorithm benchmarks, and debugging tips.']
    );
    await repositories.noteRepo.create(
      {
        userId,
        subjectId: prog.id,
        title: 'Computer Science Lab Manual',
        fileName: 'Lab Manual 2026.pdf',
        fileSize: progPdf2.size,
        fileType: 'application/pdf',
      },
      progPdf2
    );
  }
}

export const seedDataService = new SeedDataService();
