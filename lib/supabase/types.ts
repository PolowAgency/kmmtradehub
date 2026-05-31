export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          role: "student" | "admin";
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["profiles"]["Row"], "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      modules: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          level: "debutant" | "intermediaire" | "avance" | null;
          duration_minutes: number;
          thumbnail_url: string | null;
          order_index: number;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["modules"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["modules"]["Insert"]>;
      };
      lessons: {
        Row: {
          id: string;
          module_id: string;
          title: string;
          content: string | null;
          order_index: number;
          duration_minutes: number;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["lessons"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["lessons"]["Insert"]>;
      };
      lesson_resources: {
        Row: {
          id: string;
          lesson_id: string;
          title: string;
          type: "pdf" | "audio" | "video" | "link";
          url: string;
          file_size: number | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["lesson_resources"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["lesson_resources"]["Insert"]>;
      };
      quizzes: {
        Row: {
          id: string;
          lesson_id: string | null;
          module_id: string | null;
          title: string;
          description: string | null;
          passing_score: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["quizzes"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["quizzes"]["Insert"]>;
      };
      quiz_questions: {
        Row: {
          id: string;
          quiz_id: string;
          question: string;
          order_index: number;
          explanation: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["quiz_questions"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["quiz_questions"]["Insert"]>;
      };
      quiz_answers: {
        Row: {
          id: string;
          question_id: string;
          answer: string;
          is_correct: boolean;
          order_index: number;
        };
        Insert: Omit<Database["public"]["Tables"]["quiz_answers"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["quiz_answers"]["Insert"]>;
      };
      student_progress: {
        Row: {
          id: string;
          student_id: string;
          lesson_id: string;
          completed: boolean;
          completed_at: string | null;
          last_accessed_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["student_progress"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["student_progress"]["Insert"]>;
      };
      quiz_results: {
        Row: {
          id: string;
          student_id: string;
          quiz_id: string;
          score: number;
          passed: boolean;
          completed_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["quiz_results"]["Row"], "id" | "completed_at">;
        Update: Partial<Database["public"]["Tables"]["quiz_results"]["Insert"]>;
      };
      badges: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          icon: string;
          condition_type: "lessons_completed" | "streak_days" | "quiz_passed" | "module_completed" | null;
          condition_value: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["badges"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["badges"]["Insert"]>;
      };
      student_badges: {
        Row: {
          id: string;
          student_id: string;
          badge_id: string;
          earned_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["student_badges"]["Row"], "id" | "earned_at">;
        Update: Partial<Database["public"]["Tables"]["student_badges"]["Insert"]>;
      };
      streaks: {
        Row: {
          id: string;
          student_id: string;
          current_streak: number;
          longest_streak: number;
          last_activity_date: string | null;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["streaks"]["Row"], "id" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["streaks"]["Insert"]>;
      };
    };
  };
};
