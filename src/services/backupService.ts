import { repositories } from '@/repositories';
import { Subject } from '@/types/subject';
import { Note } from '@/types/note';

export interface BackupArchive {
  version: number;
  exportedAt: string;
  user: {
    name: string;
    email: string;
  };
  subjects: Subject[];
  notes: (Note & { base64Data: string })[];
}

export class BackupService {
  async exportBackup(userId: string, userName: string, userEmail: string): Promise<void> {
    const subjects = await repositories.subjectRepo.getAll(userId);
    const notes = await repositories.noteRepo.getAll(userId);

    const notesWithData = await Promise.all(
      notes.map(async (note) => {
        const blob = await repositories.noteRepo.getFileBlob(note.id, userId);
        let base64Data = '';
        if (blob) {
          base64Data = await this.blobToBase64(blob);
        }
        return {
          ...note,
          base64Data,
        };
      })
    );

    const archive: BackupArchive = {
      version: 1,
      exportedAt: new Date().toISOString(),
      user: { name: userName, email: userEmail },
      subjects,
      notes: notesWithData,
    };

    const jsonString = JSON.stringify(archive, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `NoteNest-Backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async importBackup(userId: string, jsonFile: File): Promise<{ subjectsCount: number; notesCount: number }> {
    const text = await jsonFile.text();
    let archive: BackupArchive;

    try {
      archive = JSON.parse(text) as BackupArchive;
    } catch {
      throw new Error('Invalid backup file. JSON parsing failed.');
    }

    if (!archive.subjects || !archive.notes) {
      throw new Error('Invalid NoteNest backup structure.');
    }

    let subjectsCount = 0;
    let notesCount = 0;

    // Map old subject IDs to new subject IDs
    const subjectIdMap = new Map<string, string>();

    for (const oldSubj of archive.subjects) {
      const created = await repositories.subjectRepo.create({
        userId,
        name: oldSubj.name,
        colorId: oldSubj.colorId,
        description: oldSubj.description,
      });
      subjectIdMap.set(oldSubj.id, created.id);
      subjectsCount++;
    }

    for (const oldNote of archive.notes) {
      const newSubjectId = subjectIdMap.get(oldNote.subjectId);
      if (!newSubjectId) continue;

      let blob: Blob;
      if (oldNote.base64Data) {
        blob = this.base64ToBlob(oldNote.base64Data, oldNote.fileType || 'application/pdf');
      } else {
        // Fallback placeholder blob
        blob = new Blob(['%PDF-1.4\n%NoteNest backup placeholder'], { type: 'application/pdf' });
      }

      await repositories.noteRepo.create(
        {
          userId,
          subjectId: newSubjectId,
          title: oldNote.title,
          fileName: oldNote.fileName,
          fileSize: oldNote.fileSize || blob.size,
          fileType: oldNote.fileType || 'application/pdf',
        },
        blob
      );
      notesCount++;
    }

    return { subjectsCount, notesCount };
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1] || '');
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  private base64ToBlob(base64: string, mimeType: string): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  }
}

export const backupService = new BackupService();
