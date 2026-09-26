export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      applications: {
        Row: {
          additional_info: string | null
          admin_notes: string | null
          category_id: string | null
          country_of_interest: string
          created_at: string
          cv_name: string | null
          cv_path: string | null
          date_of_birth: string | null
          email: string
          full_name: string
          id: string
          job_category: string | null
          nationality: string
          opportunity_id: string | null
          passport_status: string | null
          phone: string
          qualifications: string | null
          reviewed_at: string | null
          status: Database["public"]["Enums"]["application_status"]
          updated_at: string
          user_id: string
          work_experience: string | null
        }
        Insert: {
          additional_info?: string | null
          admin_notes?: string | null
          category_id?: string | null
          country_of_interest: string
          created_at?: string
          cv_name?: string | null
          cv_path?: string | null
          date_of_birth?: string | null
          email: string
          full_name: string
          id?: string
          job_category?: string | null
          nationality: string
          opportunity_id?: string | null
          passport_status?: string | null
          phone: string
          qualifications?: string | null
          reviewed_at?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
          user_id: string
          work_experience?: string | null
        }
        Update: {
          additional_info?: string | null
          admin_notes?: string | null
          category_id?: string | null
          country_of_interest?: string
          created_at?: string
          cv_name?: string | null
          cv_path?: string | null
          date_of_birth?: string | null
          email?: string
          full_name?: string
          id?: string
          job_category?: string | null
          nationality?: string
          opportunity_id?: string | null
          passport_status?: string | null
          phone?: string
          qualifications?: string | null
          reviewed_at?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
          user_id?: string
          work_experience?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "applications_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          admin_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          new_values: Json | null
          old_values: Json | null
        }
        Insert: {
          action: string
          admin_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
        }
        Update: {
          action?: string
          admin_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          display_order: number
          icon: string | null
          id: string
          image: string | null
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          display_order?: number
          icon?: string | null
          id?: string
          image?: string | null
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          display_order?: number
          icon?: string | null
          id?: string
          image?: string | null
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      companies: {
        Row: {
          address: string | null
          city: string | null
          country: string | null
          created_at: string
          description: string | null
          email: string | null
          id: string
          industry: string | null
          logo: string | null
          name: string
          phone: string | null
          slug: string
          updated_at: string
          verified: boolean
          website: string | null
          whatsapp: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          industry?: string | null
          logo?: string | null
          name: string
          phone?: string | null
          slug: string
          updated_at?: string
          verified?: boolean
          website?: string | null
          whatsapp?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          industry?: string | null
          logo?: string | null
          name?: string
          phone?: string | null
          slug?: string
          updated_at?: string
          verified?: boolean
          website?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      contact_enquiries: {
        Row: {
          admin_notes: string | null
          created_at: string
          email: string
          id: string
          message: string
          name: string
          phone: string | null
          status: string
          subject: string | null
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
          status?: string
          subject?: string | null
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          status?: string
          subject?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      opportunities: {
        Row: {
          application_email: string | null
          application_instructions: string | null
          application_method: string | null
          application_phone: string | null
          application_url: string | null
          application_whatsapp: string | null
          approved_at: string | null
          approved_by: string | null
          benefits: string | null
          category_id: string | null
          certificates: string | null
          city: string | null
          company_id: string | null
          contact_email: string | null
          contact_person: string | null
          contact_phone: string | null
          contact_website: string | null
          contact_whatsapp: string | null
          contract_duration: string | null
          country: string | null
          created_at: string
          created_by: string | null
          currency: string | null
          deadline: string | null
          description: string | null
          drivers_license: string | null
          duration: string | null
          education: string | null
          employment_type: string | null
          experience: string | null
          featured: boolean
          id: string
          languages: string | null
          location: string | null
          max_age: number | null
          min_age: number | null
          other_requirements: string | null
          passport_required: string | null
          permanence: string | null
          physical_requirements: string | null
          probation: string | null
          published_at: string | null
          qualifications: string | null
          rejection_reason: string | null
          required_documents: string | null
          requirements: string | null
          responsibilities: string | null
          salary: string | null
          skills: string | null
          slug: string
          start_date: string | null
          status: string
          title: string
          updated_at: string
          urgent: boolean
          vacancies: number | null
          verified: boolean
          workplace: string | null
        }
        Insert: {
          application_email?: string | null
          application_instructions?: string | null
          application_method?: string | null
          application_phone?: string | null
          application_url?: string | null
          application_whatsapp?: string | null
          approved_at?: string | null
          approved_by?: string | null
          benefits?: string | null
          category_id?: string | null
          certificates?: string | null
          city?: string | null
          company_id?: string | null
          contact_email?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          contact_website?: string | null
          contact_whatsapp?: string | null
          contract_duration?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          deadline?: string | null
          description?: string | null
          drivers_license?: string | null
          duration?: string | null
          education?: string | null
          employment_type?: string | null
          experience?: string | null
          featured?: boolean
          id?: string
          languages?: string | null
          location?: string | null
          max_age?: number | null
          min_age?: number | null
          other_requirements?: string | null
          passport_required?: string | null
          permanence?: string | null
          physical_requirements?: string | null
          probation?: string | null
          published_at?: string | null
          qualifications?: string | null
          rejection_reason?: string | null
          required_documents?: string | null
          requirements?: string | null
          responsibilities?: string | null
          salary?: string | null
          skills?: string | null
          slug: string
          start_date?: string | null
          status?: string
          title: string
          updated_at?: string
          urgent?: boolean
          vacancies?: number | null
          verified?: boolean
          workplace?: string | null
        }
        Update: {
          application_email?: string | null
          application_instructions?: string | null
          application_method?: string | null
          application_phone?: string | null
          application_url?: string | null
          application_whatsapp?: string | null
          approved_at?: string | null
          approved_by?: string | null
          benefits?: string | null
          category_id?: string | null
          certificates?: string | null
          city?: string | null
          company_id?: string | null
          contact_email?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          contact_website?: string | null
          contact_whatsapp?: string | null
          contract_duration?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          deadline?: string | null
          description?: string | null
          drivers_license?: string | null
          duration?: string | null
          education?: string | null
          employment_type?: string | null
          experience?: string | null
          featured?: boolean
          id?: string
          languages?: string | null
          location?: string | null
          max_age?: number | null
          min_age?: number | null
          other_requirements?: string | null
          passport_required?: string | null
          permanence?: string | null
          physical_requirements?: string | null
          probation?: string | null
          published_at?: string | null
          qualifications?: string | null
          rejection_reason?: string | null
          required_documents?: string | null
          requirements?: string | null
          responsibilities?: string | null
          salary?: string | null
          skills?: string | null
          slug?: string
          start_date?: string | null
          status?: string
          title?: string
          updated_at?: string
          urgent?: boolean
          vacancies?: number | null
          verified?: boolean
          workplace?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "opportunities_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunity_images: {
        Row: {
          caption: string | null
          created_at: string
          display_order: number
          id: string
          image_url: string
          is_primary: boolean
          opportunity_id: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          display_order?: number
          id?: string
          image_url: string
          is_primary?: boolean
          opportunity_id: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string
          is_primary?: boolean
          opportunity_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "opportunity_images_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunity_notes: {
        Row: {
          admin_id: string | null
          completed: boolean
          created_at: string
          id: string
          note: string
          opportunity_id: string
          priority: string | null
          updated_at: string
        }
        Insert: {
          admin_id?: string | null
          completed?: boolean
          created_at?: string
          id?: string
          note: string
          opportunity_id: string
          priority?: string | null
          updated_at?: string
        }
        Update: {
          admin_id?: string | null
          completed?: boolean
          created_at?: string
          id?: string
          note?: string
          opportunity_id?: string
          priority?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "opportunity_notes_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          active: boolean
          created_at: string
          email: string | null
          id: string
          name: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          email?: string | null
          id: string
          name?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          about_text: string | null
          address: string | null
          business_hours: string | null
          contact_person: string | null
          email: string | null
          facebook: string | null
          id: string
          instagram: string | null
          linkedin: string | null
          phone: string | null
          site_name: string
          tagline: string | null
          twitter: string | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          about_text?: string | null
          address?: string | null
          business_hours?: string | null
          contact_person?: string | null
          email?: string | null
          facebook?: string | null
          id?: string
          instagram?: string | null
          linkedin?: string | null
          phone?: string | null
          site_name?: string
          tagline?: string | null
          twitter?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          about_text?: string | null
          address?: string | null
          business_hours?: string | null
          contact_person?: string | null
          email?: string | null
          facebook?: string | null
          id?: string
          instagram?: string | null
          linkedin?: string | null
          phone?: string | null
          site_name?: string
          tagline?: string | null
          twitter?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "editor" | "user"
      application_status: "pending" | "under_review" | "approved" | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "editor", "user"],
      application_status: ["pending", "under_review", "approved", "rejected"],
    },
  },
} as const
