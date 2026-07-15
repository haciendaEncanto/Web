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
      booking_events: {
        Row: {
          actor_id: string | null
          booking_id: string
          created_at: string
          event_type: string
          id: string
          notes: string | null
        }
        Insert: {
          actor_id?: string | null
          booking_id: string
          created_at?: string
          event_type: string
          id?: string
          notes?: string | null
        }
        Update: {
          actor_id?: string | null
          booking_id?: string
          created_at?: string
          event_type?: string
          id?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_events_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_events_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_packages: {
        Row: {
          booking_id: string
          created_at: string
          id: string
          package_id: string
          quantity: number
          unit_price: number
        }
        Insert: {
          booking_id: string
          created_at?: string
          id?: string
          package_id: string
          quantity?: number
          unit_price: number
        }
        Update: {
          booking_id?: string
          created_at?: string
          id?: string
          package_id?: string
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "booking_packages_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_packages_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          client_id: string
          created_at: string
          event_date: string
          event_end_time: string
          event_start_time: string
          event_type: string
          guest_count: number
          id: string
          notes: string | null
          service_order_approved: boolean | null
          service_order_approved_at: string | null
          service_order_elaborated_by: string | null
          space_id: string
          status: Database["public"]["Enums"]["booking_status"]
          total_amount: number
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          event_date: string
          event_end_time: string
          event_start_time: string
          event_type: string
          guest_count?: number
          id?: string
          notes?: string | null
          service_order_approved?: boolean | null
          service_order_approved_at?: string | null
          service_order_elaborated_by?: string | null
          space_id: string
          status?: Database["public"]["Enums"]["booking_status"]
          total_amount?: number
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          event_date?: string
          event_end_time?: string
          event_start_time?: string
          event_type?: string
          guest_count?: number
          id?: string
          notes?: string | null
          service_order_approved?: boolean | null
          service_order_approved_at?: string | null
          service_order_elaborated_by?: string | null
          space_id?: string
          status?: Database["public"]["Enums"]["booking_status"]
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_events: {
        Row: {
          booking_id: string | null
          client_name: string
          created_at: string
          created_by: string | null
          end_time: string
          event_type: string
          guest_count: number | null
          id: string
          notes: string | null
          start_time: string
          updated_at: string
        }
        Insert: {
          booking_id?: string | null
          client_name: string
          created_at?: string
          created_by?: string | null
          end_time: string
          event_type: string
          guest_count?: number | null
          id?: string
          notes?: string | null
          start_time: string
          updated_at?: string
        }
        Update: {
          booking_id?: string | null
          client_name?: string
          created_at?: string
          created_by?: string | null
          end_time?: string
          event_type?: string
          guest_count?: number | null
          id?: string
          notes?: string | null
          start_time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      client_activities: {
        Row: {
          activity_date: string
          activity_time: string | null
          booking_id: string
          created_at: string
          created_by: string | null
          id: string
          location: string | null
          notes: string | null
          title: string
        }
        Insert: {
          activity_date: string
          activity_time?: string | null
          booking_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          title: string
        }
        Update: {
          activity_date?: string
          activity_time?: string | null
          booking_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_activities_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_activities_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          phone: string | null
          status: Database["public"]["Enums"]["contact_status"]
          subject: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
          status?: Database["public"]["Enums"]["contact_status"]
          subject?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          status?: Database["public"]["Enums"]["contact_status"]
          subject?: string | null
        }
        Relationships: []
      }
      documents: {
        Row: {
          booking_id: string
          created_at: string
          created_by: string | null
          file_url: string | null
          id: string
          signed_at: string | null
          title: string
          type: Database["public"]["Enums"]["document_type"]
          updated_at: string
        }
        Insert: {
          booking_id: string
          created_at?: string
          created_by?: string | null
          file_url?: string | null
          id?: string
          signed_at?: string | null
          title: string
          type?: Database["public"]["Enums"]["document_type"]
          updated_at?: string
        }
        Update: {
          booking_id?: string
          created_at?: string
          created_by?: string | null
          file_url?: string | null
          id?: string
          signed_at?: string | null
          title?: string
          type?: Database["public"]["Enums"]["document_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery_images: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          is_published: boolean
          sort_order: number
          title: string | null
          updated_at: string
          url: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean
          sort_order?: number
          title?: string | null
          updated_at?: string
          url: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean
          sort_order?: number
          title?: string | null
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      guest_tables: {
        Row: {
          booking_id: string
          created_at: string
          file_url: string | null
          id: string
          notes: string | null
          updated_at: string
          uploaded_at: string
        }
        Insert: {
          booking_id: string
          created_at?: string
          file_url?: string | null
          id?: string
          notes?: string | null
          updated_at?: string
          uploaded_at?: string
        }
        Update: {
          booking_id?: string
          created_at?: string
          file_url?: string | null
          id?: string
          notes?: string | null
          updated_at?: string
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "guest_tables_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      hero_videos: {
        Row: {
          created_at: string
          event_type: string | null
          id: string
          is_active: boolean
          sort_order: number
          thumbnail_url: string | null
          title: string | null
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          event_type?: string | null
          id?: string
          is_active?: boolean
          sort_order?: number
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          event_type?: string | null
          id?: string
          is_active?: boolean
          sort_order?: number
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          booking_id: string | null
          content: string
          created_at: string
          id: string
          is_read: boolean
          receiver_id: string
          sender_id: string
        }
        Insert: {
          booking_id?: string | null
          content: string
          created_at?: string
          id?: string
          is_read?: boolean
          receiver_id: string
          sender_id: string
        }
        Update: {
          booking_id?: string | null
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean
          receiver_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          data: Json
          id: string
          is_read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          data?: Json
          id?: string
          is_read?: boolean
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          data?: Json
          id?: string
          is_read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      packages: {
        Row: {
          created_at: string
          description: string | null
          event_type: string | null
          id: string
          includes: Json
          is_active: boolean
          name: string
          price: number
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          event_type?: string | null
          id?: string
          includes?: Json
          is_active?: boolean
          name: string
          price?: number
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          event_type?: string | null
          id?: string
          includes?: Json
          is_active?: boolean
          name?: string
          price?: number
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          booking_id: string
          created_at: string
          id: string
          notes: string | null
          payment_date: string
          payment_method: Database["public"]["Enums"]["payment_method_type"]
          receipt_url: string | null
          recorded_by: string | null
          reference_number: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          booking_id: string
          created_at?: string
          id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: Database["public"]["Enums"]["payment_method_type"]
          receipt_url?: string | null
          recorded_by?: string | null
          reference_number?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          booking_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: Database["public"]["Enums"]["payment_method_type"]
          receipt_url?: string | null
          recorded_by?: string | null
          reference_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      playlists: {
        Row: {
          booking_id: string
          created_at: string
          id: string
          no_aplica: boolean
          section: Database["public"]["Enums"]["playlist_section"]
          song_name: string | null
          song_url: string | null
          updated_at: string
        }
        Insert: {
          booking_id: string
          created_at?: string
          id?: string
          no_aplica?: boolean
          section: Database["public"]["Enums"]["playlist_section"]
          song_name?: string | null
          song_url?: string | null
          updated_at?: string
        }
        Update: {
          booking_id?: string
          created_at?: string
          id?: string
          no_aplica?: boolean
          section?: Database["public"]["Enums"]["playlist_section"]
          song_name?: string | null
          song_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "playlists_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          is_active: boolean
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          is_active?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      service_order_items: {
        Row: {
          created_at: string
          filled_by: string
          id: string
          item_type: string
          label: string
          notes: string | null
          options: Json
          section_id: string
          sort_order: number
          updated_at: string
          value: string | null
        }
        Insert: {
          created_at?: string
          filled_by?: string
          id?: string
          item_type?: string
          label: string
          notes?: string | null
          options?: Json
          section_id: string
          sort_order?: number
          updated_at?: string
          value?: string | null
        }
        Update: {
          created_at?: string
          filled_by?: string
          id?: string
          item_type?: string
          label?: string
          notes?: string | null
          options?: Json
          section_id?: string
          sort_order?: number
          updated_at?: string
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_order_items_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "service_order_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      service_order_sections: {
        Row: {
          booking_id: string
          created_at: string
          id: string
          name: string
          notes: string | null
          sort_order: number
          status: Database["public"]["Enums"]["service_order_status"]
          updated_at: string
        }
        Insert: {
          booking_id: string
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          sort_order?: number
          status?: Database["public"]["Enums"]["service_order_status"]
          updated_at?: string
        }
        Update: {
          booking_id?: string
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          sort_order?: number
          status?: Database["public"]["Enums"]["service_order_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_order_sections_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      service_order_templates: {
        Row: {
          created_at: string
          event_type: string
          filled_by: string
          id: string
          item_label: string
          item_sort: number
          item_type: string
          notes: string | null
          options: Json
          section_name: string
          section_sort: number
        }
        Insert: {
          created_at?: string
          event_type: string
          filled_by?: string
          id?: string
          item_label: string
          item_sort?: number
          item_type?: string
          notes?: string | null
          options?: Json
          section_name: string
          section_sort?: number
        }
        Update: {
          created_at?: string
          event_type?: string
          filled_by?: string
          id?: string
          item_label?: string
          item_sort?: number
          item_type?: string
          notes?: string | null
          options?: Json
          section_name?: string
          section_sort?: number
        }
        Relationships: []
      }
      service_orders: {
        Row: {
          booking_id: string
          created_at: string
          id: string
          notes: string | null
          quantity: number
          service_category: string | null
          service_name: string
          status: Database["public"]["Enums"]["service_order_status"]
          total_price: number | null
          unit: string | null
          unit_price: number
          updated_at: string
        }
        Insert: {
          booking_id: string
          created_at?: string
          id?: string
          notes?: string | null
          quantity?: number
          service_category?: string | null
          service_name: string
          status?: Database["public"]["Enums"]["service_order_status"]
          total_price?: number | null
          unit?: string | null
          unit_price?: number
          updated_at?: string
        }
        Update: {
          booking_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          quantity?: number
          service_category?: string | null
          service_name?: string
          status?: Database["public"]["Enums"]["service_order_status"]
          total_price?: number | null
          unit?: string | null
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_orders_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      site_content: {
        Row: {
          content: string | null
          created_at: string
          data: Json
          id: string
          key: string
          title: string | null
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          data?: Json
          id?: string
          key: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          data?: Json
          id?: string
          key?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      spaces: {
        Row: {
          amenities: Json
          area_m2: number | null
          base_price: number | null
          capacity_max: number | null
          capacity_min: number | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          amenities?: Json
          area_m2?: number | null
          base_price?: number | null
          capacity_max?: number | null
          capacity_min?: number | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          amenities?: Json
          area_m2?: number | null
          base_price?: number | null
          capacity_max?: number | null
          capacity_min?: number | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          client_name: string
          content: string
          created_at: string
          event_type: string | null
          id: string
          is_published: boolean
          photo_url: string | null
          rating: number | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          client_name: string
          content: string
          created_at?: string
          event_type?: string | null
          id?: string
          is_published?: boolean
          photo_url?: string | null
          rating?: number | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          client_name?: string
          content?: string
          created_at?: string
          event_type?: string | null
          id?: string
          is_published?: boolean
          photo_url?: string | null
          rating?: number | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      initialize_service_order: {
        Args: { p_booking_id: string }
        Returns: undefined
      }
      is_admin: { Args: never; Returns: boolean }
      is_any_staff: { Args: never; Returns: boolean }
      is_editor: { Args: never; Returns: boolean }
      is_planner_or_admin: { Args: never; Returns: boolean }
      is_staff_or_admin: { Args: never; Returns: boolean }
      sync_completed_bookings: { Args: never; Returns: undefined }
    }
    Enums: {
      booking_status: "pending" | "confirmed" | "cancelled" | "completed"
      contact_status: "unread" | "read" | "replied"
      document_type: "contrato"
      payment_method_type: "transferencia" | "efectivo" | "cheque" | "otro"
      playlist_section:
        | "entrada_novio"
        | "entrada_novia"
        | "salida_recien_casados"
        | "entrada_salon"
        | "vals_pareja"
        | "vals_padres_novia"
        | "vals_padres_novio"
        | "playlist_cena"
        | "playlist_rumba"
        | "entrada_zona_verde"
        | "acompanamiento_zona_verde"
      service_order_status:
        | "pending"
        | "confirmed"
        | "in_progress"
        | "completed"
        | "cancelled"
      user_role:
        | "client"
        | "staff"
        | "admin"
        | "wedding_planner"
        | "asesor_comercial"
        | "asesor_logistica"
        | "editor"
        | "gerente"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
      booking_status: ["pending", "confirmed", "cancelled", "completed"],
      contact_status: ["unread", "read", "replied"],
      document_type: ["contrato"],
      payment_method_type: ["transferencia", "efectivo", "cheque", "otro"],
      playlist_section: [
        "entrada_novio",
        "entrada_novia",
        "salida_recien_casados",
        "entrada_salon",
        "vals_pareja",
        "vals_padres_novia",
        "vals_padres_novio",
        "playlist_cena",
        "playlist_rumba",
        "entrada_zona_verde",
        "acompanamiento_zona_verde",
      ],
      service_order_status: [
        "pending",
        "confirmed",
        "in_progress",
        "completed",
        "cancelled",
      ],
      user_role: [
        "client",
        "staff",
        "admin",
        "wedding_planner",
        "asesor_comercial",
        "asesor_logistica",
        "editor",
        "gerente",
      ],
    },
  },
} as const
