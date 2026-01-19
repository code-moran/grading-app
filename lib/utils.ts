import { type ClassValue, clsx } from "clsx";
import { BulkStudentUpload, BulkGradeExport, Student, Grade } from './types';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

export function parseCSV(csvText: string): BulkStudentUpload[] {
  const lines = csvText.split('\n').filter(line => line.trim());
  const students: BulkStudentUpload[] = [];
  
  // Skip header row if it exists
  const startIndex = lines[0]?.toLowerCase().includes('registration') ? 1 : 0;
  
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const columns = line.split(',').map(col => col.trim().replace(/"/g, ''));
    
    if (columns.length >= 2) {
      students.push({
        registrationNumber: columns[0],
        name: columns[1],
        cohortName: columns[2] || undefined // Optional third column for cohort name
      });
    }
  }
  
  return students;
}

export function convertStudentsToCSV(students: Student[]): string {
  const headers = ['Registration Number', 'Name', 'Email', 'Cohort'];
  const rows = students.map(student => [
    student.registrationNumber,
    student.name,
    student.email || '',
    student.cohort?.name || ''
  ]);
  
  return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
}

export function convertGradesToCSV(grades: BulkGradeExport[]): string {
  const headers = [
    'Registration Number',
    'Student Name',
    'Best Grade (%)',
    'Best Letter Grade',
    'Total Exercises',
    'Completed Exercises',
    'Average Grade (%)',
    'Grades Detail'
  ];
  
  const rows = grades.map(grade => [
    grade.registrationNumber,
    grade.studentName,
    grade.bestPercentage.toString(),
    grade.bestLetterGrade,
    grade.totalExercises.toString(),
    grade.completedExercises.toString(),
    grade.averageGrade.toString(),
    grade.grades.map(g => `${g.lessonTitle}: ${g.percentage}%`).join('; ')
  ]);
  
  return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
}

export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export function calculateBestGrade(grades: Grade[]): {
  bestGrade: number;
  bestPercentage: number;
  bestLetterGrade: string;
  averageGrade: number;
} {
  if (grades.length === 0) {
    return {
      bestGrade: 0,
      bestPercentage: 0,
      bestLetterGrade: 'F',
      averageGrade: 0
    };
  }
  
  const percentages = grades.map(grade => grade.percentage);
  const bestPercentage = Math.max(...percentages);
  const averageGrade = Math.round(percentages.reduce((sum, p) => sum + p, 0) / percentages.length);
  
  const getLetterGrade = (percentage: number) => {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  };
  
  return {
    bestGrade: bestPercentage,
    bestPercentage,
    bestLetterGrade: getLetterGrade(bestPercentage),
    averageGrade
  };
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function formatDateTime(date: Date): string {
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
