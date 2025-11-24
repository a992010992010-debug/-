export enum DurationUnit {
  MINUTES = 'دقائق',
  HOURS = 'ساعات',
  DAYS = 'أيام',
  MONTHS = 'شهور'
}

export type ViewMode = 'reminder' | 'summarizer';

export interface StudySession {
  id: string;
  topic: string;
  notes: string;
  durationValue: number;
  durationUnit: DurationUnit;
  createdAt: number; // Timestamp
  scheduledFor: number; // Timestamp
  notified: boolean; 
}

export interface StudySessionPrefill {
  topic: string;
  notes: string;
}

export interface LessonSummaryRequest {
  lessonName: string;
  subject: string;
  gradeLevel: string;
}

export interface LessonSummaryResponse {
  title: string;
  introduction: string;
  keyConcepts: {
    concept: string;
    explanation: string;
  }[];
  terminology: { term: string; definition: string }[];
  studyTips: string[];
}